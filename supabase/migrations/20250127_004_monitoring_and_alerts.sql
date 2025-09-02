-- Migration: 004_monitoring_and_alerts.sql
-- Descripción: Sistema de monitoreo y alertas para la integración con ElevenLabs

-- 1. Tabla para configuración de alertas
CREATE TABLE IF NOT EXISTS public.elevenlabs_alerts_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('usage_threshold', 'error_rate', 'api_failure')),
  threshold_value numeric NOT NULL,
  threshold_type text CHECK (threshold_type IN ('percentage', 'absolute')),
  notification_channels text[] DEFAULT ARRAY['email'],
  is_active boolean DEFAULT true,
  last_triggered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, alert_type)
);

-- 2. Tabla para registro de alertas enviadas
CREATE TABLE IF NOT EXISTS public.elevenlabs_alerts_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  alert_type text NOT NULL,
  alert_config_id uuid REFERENCES public.elevenlabs_alerts_config(id),
  title text NOT NULL,
  message text NOT NULL,
  severity text CHECK (severity IN ('info', 'warning', 'critical')),
  current_value numeric,
  threshold_value numeric,
  metadata jsonb DEFAULT '{}',
  sent_at timestamptz DEFAULT now()
);

-- 3. Vista de health check del sistema
CREATE OR REPLACE VIEW elevenlabs_system_health AS
WITH recent_stats AS (
  SELECT 
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 hour') as requests_last_hour,
    COUNT(*) FILTER (WHERE status = 'failed' AND created_at >= NOW() - INTERVAL '1 hour') as failed_last_hour,
    AVG(EXTRACT(EPOCH FROM (processed_at - created_at))) FILTER (WHERE processed_at IS NOT NULL) as avg_processing_time,
    COUNT(*) FILTER (WHERE status = 'pending' OR status = 'processing') as pending_requests
  FROM tts_requests
  WHERE created_at >= NOW() - INTERVAL '24 hours'
),
conversation_stats AS (
  SELECT 
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 hour') as conversations_last_hour,
    AVG(duration_seconds) FILTER (WHERE status = 'completed') as avg_duration,
    COUNT(*) FILTER (WHERE status = 'failed' AND created_at >= NOW() - INTERVAL '24 hours') as failed_conversations_24h
  FROM elevenlabs_conversations
  WHERE created_at >= NOW() - INTERVAL '24 hours'
),
webhook_stats AS (
  SELECT 
    COUNT(*) as total_webhooks_24h,
    COUNT(*) FILTER (WHERE retry_count > 0) as webhooks_with_retries,
    MAX(retry_count) as max_retry_count
  FROM elevenlabs_webhook_events
  WHERE processed_at >= NOW() - INTERVAL '24 hours'
)
SELECT 
  NOW() as check_time,
  r.requests_last_hour,
  r.failed_last_hour,
  ROUND(r.avg_processing_time::numeric, 2) as avg_processing_seconds,
  r.pending_requests,
  c.conversations_last_hour,
  ROUND(c.avg_duration::numeric, 2) as avg_conversation_seconds,
  c.failed_conversations_24h,
  w.total_webhooks_24h,
  w.webhooks_with_retries,
  w.max_retry_count,
  CASE 
    WHEN r.failed_last_hour > 10 OR c.failed_conversations_24h > 5 THEN 'critical'
    WHEN r.failed_last_hour > 5 OR r.pending_requests > 20 THEN 'warning'
    ELSE 'healthy'
  END as system_status
FROM recent_stats r, conversation_stats c, webhook_stats w;

-- 4. Función para verificar y enviar alertas de uso
CREATE OR REPLACE FUNCTION check_usage_alerts()
RETURNS TABLE(user_id uuid, alert_type text, should_alert boolean, usage_percentage numeric)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH current_usage AS (
    SELECT 
      u.user_id,
      u.tts_characters_used,
      u.tts_characters_limit,
      u.conversation_minutes_used,
      u.conversation_minutes_limit,
      u.total_credits_used,
      u.alert_sent_at
    FROM elevenlabs_usage u
    WHERE u.month_year = date_trunc('month', CURRENT_DATE)::date
      AND (u.tts_characters_limit IS NOT NULL OR u.conversation_minutes_limit IS NOT NULL)
  ),
  usage_percentages AS (
    SELECT 
      cu.user_id,
      GREATEST(
        COALESCE((cu.tts_characters_used::float / NULLIF(cu.tts_characters_limit, 0) * 100), 0),
        COALESCE((cu.conversation_minutes_used::float / NULLIF(cu.conversation_minutes_limit, 0) * 100), 0)
      ) as usage_pct,
      cu.alert_sent_at
    FROM current_usage cu
  ),
  alert_configs AS (
    SELECT 
      ac.user_id,
      ac.threshold_value,
      ac.last_triggered_at
    FROM elevenlabs_alerts_config ac
    WHERE ac.alert_type = 'usage_threshold'
      AND ac.is_active = true
  )
  SELECT 
    up.user_id,
    'usage_threshold'::text,
    CASE 
      WHEN up.usage_pct >= ac.threshold_value 
        AND (ac.last_triggered_at IS NULL OR ac.last_triggered_at < NOW() - INTERVAL '24 hours')
        AND (up.alert_sent_at IS NULL OR up.alert_sent_at < NOW() - INTERVAL '24 hours')
      THEN true
      ELSE false
    END as should_alert,
    ROUND(up.usage_pct::numeric, 2) as usage_percentage
  FROM usage_percentages up
  JOIN alert_configs ac ON ac.user_id = up.user_id
  WHERE up.usage_pct >= ac.threshold_value;
END;
$$;

-- 5. Función para procesar y enviar alertas
CREATE OR REPLACE FUNCTION process_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_alert record;
  v_user_email text;
BEGIN
  -- Procesar alertas de uso
  FOR v_alert IN SELECT * FROM check_usage_alerts() WHERE should_alert = true
  LOOP
    -- Obtener email del usuario
    SELECT email INTO v_user_email 
    FROM auth.users 
    WHERE id = v_alert.user_id;
    
    -- Registrar alerta
    INSERT INTO elevenlabs_alerts_log (
      user_id,
      alert_type,
      title,
      message,
      severity,
      current_value,
      threshold_value
    ) VALUES (
      v_alert.user_id,
      v_alert.alert_type,
      'ElevenLabs Usage Alert',
      format('Your usage has reached %s%% of your monthly limit', v_alert.usage_percentage),
      CASE 
        WHEN v_alert.usage_percentage >= 95 THEN 'critical'
        WHEN v_alert.usage_percentage >= 80 THEN 'warning'
        ELSE 'info'
      END,
      v_alert.usage_percentage,
      80 -- Default threshold
    );
    
    -- Actualizar última alerta enviada
    UPDATE elevenlabs_usage 
    SET alert_sent_at = NOW()
    WHERE user_id = v_alert.user_id 
      AND month_year = date_trunc('month', CURRENT_DATE)::date;
    
    UPDATE elevenlabs_alerts_config
    SET last_triggered_at = NOW()
    WHERE user_id = v_alert.user_id 
      AND alert_type = 'usage_threshold';
    
    -- Aquí podrías integrar con un servicio de email
    -- Por ejemplo, llamar a una Edge Function que envíe emails
    RAISE NOTICE 'Alert sent to user % (%) - Usage at %%', 
      v_alert.user_id, v_user_email, v_alert.usage_percentage;
  END LOOP;
END;
$$;

-- 6. Vista para dashboard de usuario
CREATE OR REPLACE VIEW elevenlabs_user_dashboard AS
SELECT 
  u.user_id,
  u.month_year,
  -- TTS Stats
  u.tts_characters_used,
  u.tts_characters_limit,
  CASE 
    WHEN u.tts_characters_limit > 0 
    THEN ROUND((u.tts_characters_used::float / u.tts_characters_limit * 100)::numeric, 2)
    ELSE 0
  END as tts_usage_percentage,
  u.tts_requests_count,
  -- Conversation Stats
  u.conversation_minutes_used,
  u.conversation_minutes_limit,
  CASE 
    WHEN u.conversation_minutes_limit > 0 
    THEN ROUND((u.conversation_minutes_used::float / u.conversation_minutes_limit * 100)::numeric, 2)
    ELSE 0
  END as conversation_usage_percentage,
  u.conversation_count,
  -- Credits
  u.total_credits_used,
  -- Recent Activity
  (
    SELECT COUNT(*) 
    FROM tts_requests tr 
    WHERE tr.user_id = u.user_id 
      AND tr.created_at >= NOW() - INTERVAL '24 hours'
  ) as tts_requests_24h,
  (
    SELECT COUNT(*) 
    FROM elevenlabs_conversations ec 
    WHERE ec.user_id = u.user_id 
      AND ec.created_at >= NOW() - INTERVAL '24 hours'
  ) as conversations_24h,
  -- Status
  CASE 
    WHEN u.tts_characters_limit IS NOT NULL 
      AND u.tts_characters_used >= u.tts_characters_limit THEN 'limit_reached'
    WHEN u.conversation_minutes_limit IS NOT NULL 
      AND u.conversation_minutes_used >= u.conversation_minutes_limit THEN 'limit_reached'
    WHEN (u.tts_characters_used::float / NULLIF(u.tts_characters_limit, 0) * 100) >= 90
      OR (u.conversation_minutes_used::float / NULLIF(u.conversation_minutes_limit, 0) * 100) >= 90 THEN 'near_limit'
    ELSE 'active'
  END as account_status
FROM elevenlabs_usage u
WHERE u.month_year = date_trunc('month', CURRENT_DATE)::date;

-- 7. Función para limpiar datos antiguos
CREATE OR REPLACE FUNCTION cleanup_old_elevenlabs_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Eliminar webhooks procesados de más de 30 días
  DELETE FROM elevenlabs_webhook_events
  WHERE processed_at < NOW() - INTERVAL '30 days';
  
  -- Eliminar logs de alertas de más de 90 días
  DELETE FROM elevenlabs_alerts_log
  WHERE sent_at < NOW() - INTERVAL '90 days';
  
  -- Eliminar requests TTS no accedidos en 180 días
  DELETE FROM tts_requests
  WHERE last_accessed_at < NOW() - INTERVAL '180 days'
    OR (last_accessed_at IS NULL AND created_at < NOW() - INTERVAL '180 days');
  
  -- Limpiar archivos de audio huérfanos
  DELETE FROM storage.objects
  WHERE bucket_id = 'elevenlabs-audio'
    AND created_at < NOW() - INTERVAL '180 days'
    AND name NOT IN (
      SELECT audio_file_path 
      FROM tts_requests 
      WHERE audio_file_path IS NOT NULL
    );
  
  RAISE NOTICE 'Cleanup completed at %', NOW();
END;
$$;

-- 8. Programar tareas con pg_cron (si está disponible)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Verificar alertas cada hora
    PERFORM cron.schedule(
      'check-elevenlabs-alerts',
      '0 * * * *',
      'SELECT process_alerts();'
    );
    
    -- Limpiar datos antiguos cada domingo a las 3 AM
    PERFORM cron.schedule(
      'cleanup-elevenlabs-data',
      '0 3 * * 0',
      'SELECT cleanup_old_elevenlabs_data();'
    );
  ELSE
    RAISE NOTICE 'pg_cron not available. Manual scheduling required for monitoring tasks.';
  END IF;
END $$;

-- 9. Configurar alertas por defecto para usuarios existentes
INSERT INTO elevenlabs_alerts_config (user_id, alert_type, threshold_value, threshold_type)
SELECT DISTINCT 
  user_id,
  'usage_threshold',
  80, -- 80% threshold
  'percentage'
FROM elevenlabs_usage
ON CONFLICT (user_id, alert_type) DO NOTHING;

-- 10. RLS para nuevas tablas
ALTER TABLE public.elevenlabs_alerts_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elevenlabs_alerts_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own alerts config" ON public.elevenlabs_alerts_config
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own alerts log" ON public.elevenlabs_alerts_log
  FOR SELECT USING (auth.uid() = user_id);

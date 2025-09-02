-- Migration: 003_migrate_existing_data.sql
-- Descripción: Migración segura de datos existentes con validaciones

-- 1. Crear función de logging para la migración
CREATE OR REPLACE FUNCTION log_migration_step(
  step_name text,
  records_affected integer,
  status text DEFAULT 'success',
  error_message text DEFAULT NULL
) RETURNS void AS $$
BEGIN
  RAISE NOTICE 'Migration Step: % | Records: % | Status: % | Error: %', 
    step_name, records_affected, status, error_message;
END;
$$ LANGUAGE plpgsql;

-- 2. Migrar agent_user_mapping a elevenlabs_agents
DO $$
DECLARE
  v_count integer;
  v_errors integer := 0;
BEGIN
  -- Contar registros a migrar
  SELECT COUNT(*) INTO v_count FROM agent_user_mapping;
  
  -- Migrar con manejo de errores
  BEGIN
    INSERT INTO public.elevenlabs_agents (
      agent_id,
      user_id,
      name,
      phone_number,
      is_active,
      created_at,
      updated_at
    )
    SELECT 
      agent_id,
      user_id,
      COALESCE(agent_name, 'Migrated Agent'),
      phone_number,
      is_active,
      created_at,
      updated_at
    FROM public.agent_user_mapping
    ON CONFLICT (agent_id) DO UPDATE
    SET 
      name = EXCLUDED.name,
      phone_number = EXCLUDED.phone_number,
      is_active = EXCLUDED.is_active,
      updated_at = NOW();
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    PERFORM log_migration_step('agent_user_mapping -> elevenlabs_agents', v_count);
    
  EXCEPTION WHEN OTHERS THEN
    v_errors := v_errors + 1;
    PERFORM log_migration_step('agent_user_mapping -> elevenlabs_agents', 0, 'error', SQLERRM);
  END;
END $$;

-- 3. Migrar agent_calls a elevenlabs_conversations con validaciones
DO $$
DECLARE
  v_record record;
  v_migrated integer := 0;
  v_skipped integer := 0;
  v_errors integer := 0;
  v_new_agent_id uuid;
  v_duration integer;
  v_ended_at timestamptz;
BEGIN
  -- Procesar cada llamada individualmente para mejor control
  FOR v_record IN 
    SELECT 
      ac.*,
      ea.id as new_agent_id
    FROM agent_calls ac
    LEFT JOIN elevenlabs_agents ea ON ea.agent_id = ac.agent_id
    ORDER BY ac.created_at
  LOOP
    BEGIN
      -- Validar que tengamos el agente migrado
      IF v_record.new_agent_id IS NULL THEN
        v_skipped := v_skipped + 1;
        CONTINUE;
      END IF;
      
      -- Validar y calcular duración
      v_duration := v_record.duration_seconds;
      IF v_duration IS NULL OR v_duration < 0 THEN
        v_duration := 0;
      END IF;
      
      -- Calcular ended_at solo si tenemos duración válida
      v_ended_at := NULL;
      IF v_duration > 0 AND v_record.started_at IS NOT NULL THEN
        v_ended_at := v_record.started_at + (v_duration || ' seconds')::interval;
      END IF;
      
      -- Insertar conversación
      INSERT INTO public.elevenlabs_conversations (
        conversation_id,
        agent_id,
        user_id,
        started_at,
        ended_at,
        duration_seconds,
        status,
        metadata,
        credits_used,
        created_at
      ) VALUES (
        v_record.conversation_id,
        v_record.new_agent_id,
        v_record.user_id,
        v_record.started_at,
        v_ended_at,
        v_duration,
        CASE 
          WHEN v_record.status::text = 'done' THEN 'completed'
          WHEN v_record.status::text = 'failed' THEN 'failed'
          WHEN v_record.status::text = 'in-progress' THEN 'in-progress'
          ELSE 'initiated'
        END,
        COALESCE(v_record.raw_metadata, '{}'::jsonb),
        GREATEST(CEIL(v_duration / 60.0), 0),
        v_record.created_at
      )
      ON CONFLICT (conversation_id) DO NOTHING;
      
      v_migrated := v_migrated + 1;
      
    EXCEPTION WHEN OTHERS THEN
      v_errors := v_errors + 1;
      RAISE WARNING 'Error migrating conversation %: %', v_record.conversation_id, SQLERRM;
    END;
  END LOOP;
  
  PERFORM log_migration_step(
    'agent_calls -> elevenlabs_conversations', 
    v_migrated,
    CASE WHEN v_errors > 0 THEN 'partial' ELSE 'success' END,
    format('Migrated: %s, Skipped: %s, Errors: %s', v_migrated, v_skipped, v_errors)
  );
END $$;

-- 4. Crear registros de uso histórico con validaciones
DO $$
DECLARE
  v_count integer;
  v_month record;
BEGIN
  -- Procesar por mes para evitar problemas de memoria
  FOR v_month IN 
    SELECT DISTINCT date_trunc('month', started_at)::date as month_year
    FROM agent_calls
    WHERE started_at IS NOT NULL
    ORDER BY month_year
  LOOP
    BEGIN
      INSERT INTO public.elevenlabs_usage (
        user_id,
        month_year,
        conversation_minutes_used,
        conversation_count,
        total_credits_used,
        created_at
      )
      SELECT 
        user_id,
        v_month.month_year,
        ROUND(SUM(GREATEST(COALESCE(duration_seconds, 0), 0)) / 60.0, 2) as conversation_minutes_used,
        COUNT(*) as conversation_count,
        CEIL(SUM(GREATEST(COALESCE(duration_seconds, 0), 0)) / 60.0) as total_credits_used,
        MIN(created_at) as created_at
      FROM public.agent_calls
      WHERE status::text = 'done'
        AND date_trunc('month', started_at)::date = v_month.month_year
        AND started_at IS NOT NULL
      GROUP BY user_id
      ON CONFLICT (user_id, month_year) DO UPDATE
      SET 
        conversation_minutes_used = EXCLUDED.conversation_minutes_used,
        conversation_count = EXCLUDED.conversation_count,
        total_credits_used = EXCLUDED.total_credits_used,
        updated_at = NOW();
      
      GET DIAGNOSTICS v_count = ROW_COUNT;
      
      PERFORM log_migration_step(
        format('usage for month %s', v_month.month_year),
        v_count
      );
      
    EXCEPTION WHEN OTHERS THEN
      PERFORM log_migration_step(
        format('usage for month %s', v_month.month_year),
        0,
        'error',
        SQLERRM
      );
    END;
  END LOOP;
END $$;

-- 5. Sincronizar voces predeterminadas de ElevenLabs
INSERT INTO public.elevenlabs_voices (voice_id, name, category, is_custom, is_active) VALUES
  ('21m00Tcm4TlvDq8ikWAM', 'Rachel', 'default', false, true),
  ('AZnzlk1XvdvUeBnXmlld', 'Domi', 'default', false, true),
  ('EXAVITQu4vr4xnSDxMaL', 'Bella', 'default', false, true),
  ('ErXwobaYiN019PkySvjV', 'Antoni', 'default', false, true),
  ('MF3mGyEYCl7XYWbV9V6O', 'Elli', 'default', false, true),
  ('TxGEqnHWrfWFTfGW9XjX', 'Josh', 'default', false, true),
  ('VR6AewLTigWG4xSOukaG', 'Arnold', 'default', false, true),
  ('pNInz6obpgDQGcFmaJgB', 'Adam', 'default', false, true),
  ('yoZ06aMxZJJ28mfd3POQ', 'Sam', 'default', false, true)
ON CONFLICT (voice_id) DO UPDATE
SET 
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 6. Crear trigger de sincronización temporal para nuevos registros
CREATE OR REPLACE FUNCTION sync_legacy_agent_calls()
RETURNS trigger AS $$
DECLARE
  v_agent_id uuid;
BEGIN
  -- Solo procesar inserciones
  IF TG_OP = 'INSERT' THEN
    -- Buscar el agente en la nueva estructura
    SELECT id INTO v_agent_id
    FROM public.elevenlabs_agents
    WHERE agent_id = NEW.agent_id;
    
    -- Si no existe el agente, intentar crearlo
    IF v_agent_id IS NULL THEN
      INSERT INTO public.elevenlabs_agents (agent_id, user_id, name)
      VALUES (NEW.agent_id, NEW.user_id, COALESCE(NEW.agent_name, 'Auto-created Agent'))
      ON CONFLICT (agent_id) DO NOTHING
      RETURNING id INTO v_agent_id;
    END IF;
    
    -- Si tenemos el agente, crear la conversación
    IF v_agent_id IS NOT NULL THEN
      INSERT INTO public.elevenlabs_conversations (
        conversation_id,
        agent_id,
        user_id,
        started_at,
        ended_at,
        duration_seconds,
        status,
        metadata,
        credits_used
      ) VALUES (
        NEW.conversation_id,
        v_agent_id,
        NEW.user_id,
        NEW.started_at,
        CASE 
          WHEN NEW.duration_seconds > 0 
          THEN NEW.started_at + (NEW.duration_seconds || ' seconds')::interval
          ELSE NULL
        END,
        COALESCE(NEW.duration_seconds, 0),
        CASE 
          WHEN NEW.status::text = 'done' THEN 'completed'
          ELSE NEW.status::text
        END,
        COALESCE(NEW.raw_metadata, '{}'::jsonb),
        GREATEST(CEIL(COALESCE(NEW.duration_seconds, 0) / 60.0), 0)
      )
      ON CONFLICT (conversation_id) DO UPDATE
      SET
        duration_seconds = EXCLUDED.duration_seconds,
        status = EXCLUDED.status,
        ended_at = EXCLUDED.ended_at,
        metadata = EXCLUDED.metadata;
      
      -- Actualizar uso si la llamada está completa
      IF NEW.status::text = 'done' AND NEW.duration_seconds > 0 THEN
        PERFORM increment_usage(
          NEW.user_id,
          date_trunc('month', NEW.started_at)::date,
          0, -- No TTS characters
          0, -- No TTS requests
          NEW.duration_seconds / 60.0, -- Minutos
          1  -- Una conversación
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger solo si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'sync_agent_calls_to_new_table'
  ) THEN
    CREATE TRIGGER sync_agent_calls_to_new_table
    AFTER INSERT ON public.agent_calls
    FOR EACH ROW
    EXECUTE FUNCTION sync_legacy_agent_calls();
  END IF;
END $$;

-- 7. Crear vista de verificación
CREATE OR REPLACE VIEW migration_verification AS
SELECT 
  'agent_user_mapping' as source_table,
  COUNT(*) as source_count,
  (SELECT COUNT(*) FROM elevenlabs_agents) as target_count,
  CASE 
    WHEN COUNT(*) = (SELECT COUNT(*) FROM elevenlabs_agents) 
    THEN 'Complete'
    ELSE 'Partial'
  END as status
FROM agent_user_mapping
UNION ALL
SELECT 
  'agent_calls',
  COUNT(*),
  (SELECT COUNT(*) FROM elevenlabs_conversations),
  CASE 
    WHEN COUNT(*) = (SELECT COUNT(*) FROM elevenlabs_conversations) 
    THEN 'Complete'
    ELSE 'Partial'
  END
FROM agent_calls;

-- 8. Limpiar función temporal
DROP FUNCTION IF EXISTS log_migration_step(text, integer, text, text);

-- Mostrar resumen de migración
SELECT * FROM migration_verification;

-- Migration: 001_elevenlabs_schema_improved.sql
-- Descripción: Esquema completo para integración con ElevenLabs con validaciones mejoradas

-- 1. Tabla principal de solicitudes TTS con deduplicación y límites
CREATE TABLE IF NOT EXISTS public.tts_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  text text NOT NULL,
  text_length integer GENERATED ALWAYS AS (char_length(text)) STORED, -- Para tracking preciso
  text_hash text NOT NULL,
  voice_id text NOT NULL,
  voice_settings jsonb DEFAULT '{}',
  request_hash text UNIQUE NOT NULL, -- Hash para deduplicación
  audio_file_path text,
  audio_duration_seconds numeric,
  status text NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'chunked')), -- Agregado 'chunked'
  chunk_info jsonb, -- Para manejar textos largos divididos
  error_message text,
  elevenlabs_request_id text,
  credits_used integer DEFAULT 0,
  actual_characters_processed integer, -- Caracteres reales procesados por ElevenLabs
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  last_accessed_at timestamptz,
  retry_count integer DEFAULT 0, -- Para tracking de reintentos
  
  -- Validación para prevenir textos excesivamente largos
  CONSTRAINT text_length_limit CHECK (char_length(text) <= 5000)
);

-- 2. Tabla de voces con información extendida
CREATE TABLE IF NOT EXISTS public.elevenlabs_voices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voice_id text UNIQUE NOT NULL,
  name text NOT NULL,
  category text,
  labels jsonb DEFAULT '{}',
  description text,
  preview_url text,
  is_custom boolean DEFAULT false,
  owner_user_id uuid REFERENCES auth.users(id),
  is_active boolean DEFAULT true,
  settings_defaults jsonb DEFAULT '{"stability": 0.5, "similarity_boost": 0.75}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_synced_at timestamptz -- Para sincronización con ElevenLabs
);

-- 3. Tabla de agentes conversacionales mejorada
CREATE TABLE IF NOT EXISTS public.elevenlabs_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  description text,
  voice_id text REFERENCES public.elevenlabs_voices(voice_id),
  first_message text,
  system_prompt text,
  language text DEFAULT 'es',
  phone_number text,
  webhook_url text,
  config jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  monthly_minute_limit integer, -- Límite opcional por agente
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Tabla de conversaciones con validaciones mejoradas
CREATE TABLE IF NOT EXISTS public.elevenlabs_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id text UNIQUE NOT NULL,
  agent_id uuid REFERENCES public.elevenlabs_agents(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  duration_seconds integer CHECK (duration_seconds >= 0),
  status text NOT NULL DEFAULT 'initiated' 
    CHECK (status IN ('initiated', 'in-progress', 'completed', 'failed', 'timeout')),
  transcript jsonb,
  analysis jsonb,
  metadata jsonb DEFAULT '{}',
  credits_used integer DEFAULT 0,
  webhook_received_at timestamptz, -- Para tracking de webhooks
  created_at timestamptz DEFAULT now(),
  
  -- Validación de consistencia temporal
  CONSTRAINT valid_duration CHECK (
    ended_at IS NULL OR ended_at >= started_at
  )
);

-- 5. Tabla de uso con límites y alertas
CREATE TABLE IF NOT EXISTS public.elevenlabs_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  month_year date NOT NULL,
  tts_characters_used bigint DEFAULT 0,
  tts_characters_limit bigint, -- Límite mensual opcional
  tts_requests_count integer DEFAULT 0,
  conversation_minutes_used numeric DEFAULT 0,
  conversation_minutes_limit numeric, -- Límite mensual opcional
  conversation_count integer DEFAULT 0,
  total_credits_used integer DEFAULT 0,
  alert_sent_at timestamptz, -- Para evitar spam de alertas
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- 6. Tabla para tracking de webhooks (idempotencia)
CREATE TABLE IF NOT EXISTS public.elevenlabs_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text UNIQUE NOT NULL, -- ID único del evento de ElevenLabs
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed_at timestamptz DEFAULT now(),
  retry_count integer DEFAULT 0
);

-- 7. Tabla para batch processing
CREATE TABLE IF NOT EXISTS public.tts_batch_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  original_text text NOT NULL,
  chunks jsonb NOT NULL, -- Array de chunks con sus request_ids
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  total_chunks integer NOT NULL,
  completed_chunks integer DEFAULT 0,
  merged_audio_path text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- 8. Índices optimizados
CREATE INDEX IF NOT EXISTS idx_tts_requests_user_id ON public.tts_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_tts_requests_request_hash ON public.tts_requests(request_hash);
CREATE INDEX IF NOT EXISTS idx_tts_requests_status ON public.tts_requests(status) WHERE status != 'completed';
CREATE INDEX IF NOT EXISTS idx_tts_requests_created_at ON public.tts_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.elevenlabs_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_agent_id ON public.elevenlabs_conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.elevenlabs_conversations(status);
CREATE INDEX IF NOT EXISTS idx_usage_user_month ON public.elevenlabs_usage(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON public.elevenlabs_webhook_events(event_type);

-- 9. Habilitar RLS en todas las tablas
ALTER TABLE public.tts_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elevenlabs_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elevenlabs_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elevenlabs_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elevenlabs_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tts_batch_jobs ENABLE ROW LEVEL SECURITY;

-- 10. Políticas RLS
-- TTS Requests
CREATE POLICY "Users can view own TTS requests" ON public.tts_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own TTS requests" ON public.tts_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own TTS requests" ON public.tts_requests
  FOR UPDATE USING (auth.uid() = user_id);

-- Voices (públicas para lectura, privadas para escritura)
CREATE POLICY "Anyone can view active voices" ON public.elevenlabs_voices
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage custom voices" ON public.elevenlabs_voices
  FOR ALL USING (auth.uid() = owner_user_id);

-- Agents
CREATE POLICY "Users can manage own agents" ON public.elevenlabs_agents
  FOR ALL USING (auth.uid() = user_id);

-- Conversations
CREATE POLICY "Users can view own conversations" ON public.elevenlabs_conversations
  FOR SELECT USING (auth.uid() = user_id);

-- Usage
CREATE POLICY "Users can view own usage" ON public.elevenlabs_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Batch Jobs
CREATE POLICY "Users can manage own batch jobs" ON public.tts_batch_jobs
  FOR ALL USING (auth.uid() = user_id);

-- 11. Funciones auxiliares mejoradas
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id uuid,
  p_month_year date,
  p_tts_characters bigint DEFAULT 0,
  p_tts_requests integer DEFAULT 0,
  p_conversation_minutes numeric DEFAULT 0,
  p_conversation_count integer DEFAULT 0
)
RETURNS TABLE(exceeded_limits boolean, usage_percentage numeric) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_characters bigint;
  v_new_minutes numeric;
  v_char_limit bigint;
  v_min_limit numeric;
  v_exceeded boolean := false;
  v_usage_pct numeric := 0;
BEGIN
  -- Insertar o actualizar uso
  INSERT INTO elevenlabs_usage (
    user_id,
    month_year,
    tts_characters_used,
    tts_requests_count,
    conversation_minutes_used,
    conversation_count,
    total_credits_used
  ) VALUES (
    p_user_id,
    p_month_year,
    p_tts_characters,
    p_tts_requests,
    p_conversation_minutes,
    p_conversation_count,
    CEIL(p_tts_characters / 1000.0) + CEIL(p_conversation_minutes)
  )
  ON CONFLICT (user_id, month_year) DO UPDATE
  SET 
    tts_characters_used = elevenlabs_usage.tts_characters_used + EXCLUDED.tts_characters_used,
    tts_requests_count = elevenlabs_usage.tts_requests_count + EXCLUDED.tts_requests_count,
    conversation_minutes_used = elevenlabs_usage.conversation_minutes_used + EXCLUDED.conversation_minutes_used,
    conversation_count = elevenlabs_usage.conversation_count + EXCLUDED.conversation_count,
    total_credits_used = elevenlabs_usage.total_credits_used + EXCLUDED.total_credits_used,
    updated_at = NOW()
  RETURNING 
    tts_characters_used, 
    conversation_minutes_used,
    tts_characters_limit,
    conversation_minutes_limit
  INTO v_new_characters, v_new_minutes, v_char_limit, v_min_limit;

  -- Verificar límites
  IF v_char_limit IS NOT NULL AND v_new_characters >= v_char_limit THEN
    v_exceeded := true;
    v_usage_pct := (v_new_characters::numeric / v_char_limit) * 100;
  ELSIF v_min_limit IS NOT NULL AND v_new_minutes >= v_min_limit THEN
    v_exceeded := true;
    v_usage_pct := (v_new_minutes / v_min_limit) * 100;
  END IF;

  RETURN QUERY SELECT v_exceeded, v_usage_pct;
END;
$$;

-- 12. Función para verificar límites antes de procesar
CREATE OR REPLACE FUNCTION check_usage_limits(p_user_id uuid, p_characters integer DEFAULT 0, p_minutes numeric DEFAULT 0)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_usage record;
BEGIN
  SELECT * INTO v_current_usage
  FROM elevenlabs_usage
  WHERE user_id = p_user_id 
    AND month_year = date_trunc('month', CURRENT_DATE)::date;

  IF NOT FOUND THEN
    RETURN true; -- Sin registros = sin límites
  END IF;

  -- Verificar caracteres
  IF v_current_usage.tts_characters_limit IS NOT NULL 
    AND (v_current_usage.tts_characters_used + p_characters) > v_current_usage.tts_characters_limit THEN
    RETURN false;
  END IF;

  -- Verificar minutos
  IF v_current_usage.conversation_minutes_limit IS NOT NULL 
    AND (v_current_usage.conversation_minutes_used + p_minutes) > v_current_usage.conversation_minutes_limit THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

-- 13. Trigger para actualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_elevenlabs_voices_updated_at BEFORE UPDATE ON elevenlabs_voices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_elevenlabs_agents_updated_at BEFORE UPDATE ON elevenlabs_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_elevenlabs_usage_updated_at BEFORE UPDATE ON elevenlabs_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

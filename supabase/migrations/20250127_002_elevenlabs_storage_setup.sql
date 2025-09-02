-- Migration: 002_elevenlabs_storage_setup.sql
-- Descripción: Configuración de Storage para audio de ElevenLabs

-- 1. Crear bucket para audio (si no existe)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'elevenlabs-audio',
  'elevenlabs-audio',
  false, -- Privado por defecto
  52428800, -- 50MB límite
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/mp4']
) 
ON CONFLICT (id) DO UPDATE
SET 
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/mp4'];

-- 2. Políticas de Storage para audio

-- Permitir a usuarios subir audio en su carpeta
CREATE POLICY "Users can upload own audio files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'elevenlabs-audio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir a usuarios ver sus propios archivos de audio
CREATE POLICY "Users can view own audio files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'elevenlabs-audio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir a usuarios actualizar sus propios archivos
CREATE POLICY "Users can update own audio files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'elevenlabs-audio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir a usuarios eliminar sus propios archivos
CREATE POLICY "Users can delete own audio files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'elevenlabs-audio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 3. Crear bucket para archivos temporales de chunks (para batch processing)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'elevenlabs-temp',
  'elevenlabs-temp',
  false,
  10485760, -- 10MB límite para chunks
  ARRAY['audio/mpeg', 'audio/mp3']
)
ON CONFLICT (id) DO UPDATE
SET 
  file_size_limit = 10485760;

-- 4. Políticas para bucket temporal
CREATE POLICY "Users can manage temp audio chunks" ON storage.objects
  FOR ALL USING (
    bucket_id = 'elevenlabs-temp' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 5. Función para limpiar archivos temporales antiguos
CREATE OR REPLACE FUNCTION cleanup_old_temp_files()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Eliminar archivos temporales de más de 24 horas
  DELETE FROM storage.objects
  WHERE bucket_id = 'elevenlabs-temp'
    AND created_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- 6. Programar limpieza diaria (requiere pg_cron extension)
-- Nota: Asegúrate de habilitar pg_cron en Supabase Dashboard primero
DO $$
BEGIN
  -- Solo crear el job si pg_cron está disponible
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'cleanup-elevenlabs-temp-files',
      '0 2 * * *', -- 2 AM todos los días
      'SELECT cleanup_old_temp_files();'
    );
  END IF;
END
$$;

-- Migration: Backup de tablas legacy antes de eliminar
-- Date: 2025-10-16
-- Description: Crea backups condicionales de tablas legacy que tengan datos
-- Estas tablas se eliminarán en la próxima migración

-- IMPORTANTE: Este backup es por seguridad
-- Si las tablas están vacías o no existen, no se crea backup

-- 1. Backup de tabla 'media' (si existe y tiene datos)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'media') THEN
    IF (SELECT COUNT(*) FROM media) > 0 THEN
      RAISE NOTICE 'Backing up media table (% rows)', (SELECT COUNT(*) FROM media);
      CREATE TABLE IF NOT EXISTS _backup_20251016_media AS SELECT * FROM media;
    ELSE
      RAISE NOTICE 'media table is empty, skipping backup';
    END IF;
  ELSE
    RAISE NOTICE 'media table does not exist, skipping backup';
  END IF;
END $$;

-- 2. Backup de tabla 'property_documents' (si existe y tiene datos)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'property_documents') THEN
    IF (SELECT COUNT(*) FROM property_documents) > 0 THEN
      RAISE NOTICE 'Backing up property_documents table (% rows)', (SELECT COUNT(*) FROM property_documents);
      CREATE TABLE IF NOT EXISTS _backup_20251016_property_documents AS SELECT * FROM property_documents;
    ELSE
      RAISE NOTICE 'property_documents table is empty, skipping backup';
    END IF;
  ELSE
    RAISE NOTICE 'property_documents table does not exist, skipping backup';
  END IF;
END $$;

-- 3. Backup de tabla 'property_images' (si existe y tiene datos)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'property_images') THEN
    IF (SELECT COUNT(*) FROM property_images) > 0 THEN
      RAISE NOTICE 'Backing up property_images table (% rows)', (SELECT COUNT(*) FROM property_images);
      CREATE TABLE IF NOT EXISTS _backup_20251016_property_images AS SELECT * FROM property_images;
    ELSE
      RAISE NOTICE 'property_images table is empty, skipping backup';
    END IF;
  ELSE
    RAISE NOTICE 'property_images table does not exist, skipping backup';
  END IF;
END $$;

-- 4. Backup de sistema ElevenLabs (si existe y tiene datos)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tts_requests') THEN
    IF (SELECT COUNT(*) FROM tts_requests) > 0 THEN
      RAISE NOTICE 'Backing up ElevenLabs tables';
      CREATE TABLE IF NOT EXISTS _backup_20251016_tts_requests AS SELECT * FROM tts_requests;
      CREATE TABLE IF NOT EXISTS _backup_20251016_elevenlabs_voices AS SELECT * FROM elevenlabs_voices;
      CREATE TABLE IF NOT EXISTS _backup_20251016_elevenlabs_agents AS SELECT * FROM elevenlabs_agents;
      CREATE TABLE IF NOT EXISTS _backup_20251016_elevenlabs_conversations AS SELECT * FROM elevenlabs_conversations;
      CREATE TABLE IF NOT EXISTS _backup_20251016_elevenlabs_usage AS SELECT * FROM elevenlabs_usage;
      CREATE TABLE IF NOT EXISTS _backup_20251016_elevenlabs_webhook_events AS SELECT * FROM elevenlabs_webhook_events;
      CREATE TABLE IF NOT EXISTS _backup_20251016_tts_batch_jobs AS SELECT * FROM tts_batch_jobs;
    ELSE
      RAISE NOTICE 'ElevenLabs tables are empty, skipping backup';
    END IF;
  ELSE
    RAISE NOTICE 'ElevenLabs tables do not exist, skipping backup';
  END IF;
END $$;

-- 5. Log de backup
COMMENT ON SCHEMA public IS 'Backup legacy tables: 2025-10-16 - Backups creados con prefijo _backup_20251016_';

-- Nota: Los backups se pueden eliminar manualmente después de verificar que todo funciona
-- DROP TABLE IF EXISTS _backup_20251016_media CASCADE;
-- DROP TABLE IF EXISTS _backup_20251016_property_documents CASCADE;
-- etc.


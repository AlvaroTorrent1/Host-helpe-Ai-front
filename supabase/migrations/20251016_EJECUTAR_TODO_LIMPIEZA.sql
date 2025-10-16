-- ============================================================================
-- LIMPIEZA COMPLETA DE TABLAS LEGACY - EJECUTAR TODO EN UNA VEZ
-- ============================================================================
-- Fecha: 2025-10-16
-- Descripción: Script consolidado que ejecuta backup + limpieza + verificación
-- Tiempo estimado: 2-3 minutos
-- IMPORTANTE: Copiar TODO este archivo y ejecutar en Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- PASO 1: BACKUP DE SEGURIDAD
-- ============================================================================
-- Crea backups condicionales de tablas legacy que tengan datos

-- 1. Backup de tabla 'media' (si existe y tiene datos)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'media') THEN
    IF (SELECT COUNT(*) FROM media) > 0 THEN
      RAISE NOTICE '📦 Backing up media table (% rows)', (SELECT COUNT(*) FROM media);
      CREATE TABLE IF NOT EXISTS _backup_20251016_media AS SELECT * FROM media;
    ELSE
      RAISE NOTICE '✅ media table is empty, skipping backup';
    END IF;
  ELSE
    RAISE NOTICE '✅ media table does not exist, skipping backup';
  END IF;
END $$;

-- 2. Backup de tabla 'property_documents' (si existe y tiene datos)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'property_documents') THEN
    IF (SELECT COUNT(*) FROM property_documents) > 0 THEN
      RAISE NOTICE '📦 Backing up property_documents table (% rows)', (SELECT COUNT(*) FROM property_documents);
      CREATE TABLE IF NOT EXISTS _backup_20251016_property_documents AS SELECT * FROM property_documents;
    ELSE
      RAISE NOTICE '✅ property_documents table is empty, skipping backup';
    END IF;
  ELSE
    RAISE NOTICE '✅ property_documents table does not exist, skipping backup';
  END IF;
END $$;

-- 3. Backup de tabla 'property_images' (si existe y tiene datos)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'property_images') THEN
    IF (SELECT COUNT(*) FROM property_images) > 0 THEN
      RAISE NOTICE '📦 Backing up property_images table (% rows)', (SELECT COUNT(*) FROM property_images);
      CREATE TABLE IF NOT EXISTS _backup_20251016_property_images AS SELECT * FROM property_images;
    ELSE
      RAISE NOTICE '✅ property_images table is empty, skipping backup';
    END IF;
  ELSE
    RAISE NOTICE '✅ property_images table does not exist, skipping backup';
  END IF;
END $$;

-- 4. Backup de sistema ElevenLabs (si existe y tiene datos)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tts_requests') THEN
    IF (SELECT COUNT(*) FROM tts_requests) > 0 THEN
      RAISE NOTICE '📦 Backing up ElevenLabs tables';
      CREATE TABLE IF NOT EXISTS _backup_20251016_tts_requests AS SELECT * FROM tts_requests;
      CREATE TABLE IF NOT EXISTS _backup_20251016_elevenlabs_voices AS SELECT * FROM elevenlabs_voices;
      CREATE TABLE IF NOT EXISTS _backup_20251016_elevenlabs_agents AS SELECT * FROM elevenlabs_agents;
      CREATE TABLE IF NOT EXISTS _backup_20251016_elevenlabs_conversations AS SELECT * FROM elevenlabs_conversations;
      CREATE TABLE IF NOT EXISTS _backup_20251016_elevenlabs_usage AS SELECT * FROM elevenlabs_usage;
      CREATE TABLE IF NOT EXISTS _backup_20251016_elevenlabs_webhook_events AS SELECT * FROM elevenlabs_webhook_events;
      CREATE TABLE IF NOT EXISTS _backup_20251016_tts_batch_jobs AS SELECT * FROM tts_batch_jobs;
    ELSE
      RAISE NOTICE '✅ ElevenLabs tables are empty, skipping backup';
    END IF;
  ELSE
    RAISE NOTICE '✅ ElevenLabs tables do not exist, skipping backup';
  END IF;
END $$;

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ PASO 1 COMPLETADO: Backups creados (si había datos)';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- PASO 2: LIMPIEZA DE TABLAS LEGACY
-- ============================================================================

DO $$ BEGIN
  RAISE NOTICE '🧹 INICIANDO LIMPIEZA...';
  RAISE NOTICE '';
END $$;

-- FASE 1: ELIMINAR TABLAS LEGACY SIMPLES
DO $$ BEGIN
  DROP TABLE IF EXISTS public.media CASCADE;
  RAISE NOTICE '❌ Dropped table: media (legacy, replaced by media_files)';
END $$;

DO $$ BEGIN
  DROP TABLE IF EXISTS public.property_documents CASCADE;
  RAISE NOTICE '❌ Dropped table: property_documents (legacy, replaced by documents)';
END $$;

DO $$ BEGIN
  DROP TABLE IF EXISTS public.property_images CASCADE;
  RAISE NOTICE '❌ Dropped table: property_images (legacy)';
END $$;

-- FASE 2: ELIMINAR SISTEMA ELEVENLABS COMPLETO (7 TABLAS)
DO $$ BEGIN
  DROP FUNCTION IF EXISTS public.increment_usage(UUID, TEXT, INTEGER, NUMERIC) CASCADE;
  DROP FUNCTION IF EXISTS public.check_usage_limits(UUID) CASCADE;
  RAISE NOTICE '❌ Dropped ElevenLabs helper functions';
END $$;

DO $$ BEGIN
  DROP VIEW IF EXISTS public.elevenlabs_usage_summary CASCADE;
END $$;

DO $$ BEGIN
  DROP TABLE IF EXISTS public.tts_batch_jobs CASCADE;
  DROP TABLE IF EXISTS public.elevenlabs_webhook_events CASCADE;
  DROP TABLE IF EXISTS public.elevenlabs_usage CASCADE;
  DROP TABLE IF EXISTS public.elevenlabs_conversations CASCADE;
  DROP TABLE IF EXISTS public.elevenlabs_agents CASCADE;
  DROP TABLE IF EXISTS public.elevenlabs_voices CASCADE;
  DROP TABLE IF EXISTS public.tts_requests CASCADE;
  RAISE NOTICE '❌ Dropped all ElevenLabs tables (not integrated in workflow)';
END $$;

-- FASE 3: LIMPIAR FUNCIONES LEGACY
DO $$ BEGIN
  -- Primero DROP la función existente (puede tener nombre de parámetro diferente)
  DROP FUNCTION IF EXISTS public.clean_property_data(UUID) CASCADE;
  RAISE NOTICE '🔄 Recreating clean_property_data function...';
END $$;

CREATE OR REPLACE FUNCTION public.clean_property_data(p_property_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Eliminar archivos multimedia asociados a la propiedad
  DELETE FROM media_files WHERE property_id = p_property_id;
  
  -- Eliminar documentos asociados (vector store)
  DELETE FROM documents WHERE property_id = p_property_id;
  
  -- REMOVED: property_documents (deprecated)
  -- REMOVED: property_images (deprecated)
  
  RAISE NOTICE 'Cleaned property data for property_id: %', p_property_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.clean_property_data IS 'Limpia datos asociados a una propiedad (solo tablas activas: media_files, documents)';

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ PASO 2 COMPLETADO: Tablas legacy eliminadas';
  RAISE NOTICE '';
END $$;

-- FASE 4: VERIFICACIÓN POST-LIMPIEZA
DO $$
DECLARE
  table_count INTEGER;
  table_list TEXT;
BEGIN
  SELECT COUNT(*), STRING_AGG(tablename, ', ')
  INTO table_count, table_list
  FROM pg_tables 
  WHERE schemaname = 'public' 
    AND tablename NOT LIKE '_backup_%'
    AND tablename NOT LIKE 'pg_%';
  
  RAISE NOTICE '📊 Total tables remaining: % (%)', table_count, table_list;
END $$;

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 LIMPIEZA COMPLETADA!';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- PASO 3: VERIFICACIÓN DETALLADA
-- ============================================================================

DO $$ BEGIN
  RAISE NOTICE '🔍 EJECUTANDO VERIFICACIONES...';
  RAISE NOTICE '';
END $$;

-- Verificación 1: Listar tablas restantes
SELECT 
  '1️⃣ TABLAS RESTANTES' as verificacion,
  tablename as nombre_tabla,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as tamaño,
  CASE 
    WHEN tablename IN ('properties', 'reservations', 'media_files', 'documents', 
                       'shareable_links', 'incidents', 'property_match_log') 
    THEN '✅ CORE'
    WHEN tablename LIKE '_backup_%' 
    THEN '📦 BACKUP'
    ELSE '⚠️ VERIFICAR'
  END as status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
ORDER BY 
  CASE 
    WHEN tablename LIKE '_backup_%' THEN 2
    ELSE 1
  END,
  tablename;

-- Verificación 2: Confirmar tablas legacy eliminadas
SELECT 
  '2️⃣ LEGACY CHECK' as verificacion,
  legacy_table as tabla,
  CASE 
    WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = legacy_table)
    THEN '❌ TODAVÍA EXISTE'
    ELSE '✅ ELIMINADA'
  END as status
FROM (VALUES 
  ('media'),
  ('property_documents'),
  ('property_images'),
  ('tts_requests'),
  ('elevenlabs_voices'),
  ('elevenlabs_agents'),
  ('elevenlabs_conversations'),
  ('elevenlabs_usage'),
  ('elevenlabs_webhook_events'),
  ('tts_batch_jobs')
) AS t(legacy_table)
ORDER BY status, legacy_table;

-- Verificación 3: Backups creados
SELECT 
  '3️⃣ BACKUPS' as verificacion,
  tablename as nombre_backup,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as tamaño,
  '📦 OK' as status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename LIKE '_backup_20251016_%'
ORDER BY tablename;

-- ============================================================================
-- RESULTADO FINAL
-- ============================================================================
-- 
-- ✅ Tablas CORE mantenidas (7):
--    - properties
--    - reservations
--    - media_files
--    - documents
--    - shareable_links
--    - incidents
--    - property_match_log
--
-- ❌ Tablas eliminadas (10):
--    - media
--    - property_documents
--    - property_images
--    - tts_requests
--    - elevenlabs_voices
--    - elevenlabs_agents
--    - elevenlabs_conversations
--    - elevenlabs_usage
--    - elevenlabs_webhook_events
--    - tts_batch_jobs
--
-- 📦 Backups: Creados automáticamente (con prefijo _backup_20251016_)
--
-- ============================================================================

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ VERIFICACIÓN COMPLETADA';
  RAISE NOTICE '';
  RAISE NOTICE '📊 RESUMEN:';
  RAISE NOTICE '   - Revisa las tablas en la sección "Results"';
  RAISE NOTICE '   - Solo deben quedar 7 tablas CORE';
  RAISE NOTICE '   - Todas las legacy deben mostrar "✅ ELIMINADA"';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ¡Base de datos limpia y minimalista!';
  RAISE NOTICE '';
END $$;


-- Migration: Limpieza de tablas legacy y no usadas
-- Date: 2025-10-16
-- Description: Elimina tablas, funciones y triggers no usados en el workflow
-- ENFOQUE MINIMALISTA: Solo mantener lo estrictamente necesario

-- ============================================================================
-- FASE 1: ELIMINAR TABLAS LEGACY SIMPLES
-- ============================================================================

-- 1.1 DROP tabla 'media' (legacy, reemplazada por 'media_files')
DO $$ BEGIN
  DROP TABLE IF EXISTS public.media CASCADE;
  RAISE NOTICE 'Dropped table: media (legacy, replaced by media_files)';
END $$;

-- 1.2 DROP tabla 'property_documents' (legacy, reemplazada por 'documents')
DO $$ BEGIN
  DROP TABLE IF EXISTS public.property_documents CASCADE;
  RAISE NOTICE 'Dropped table: property_documents (legacy, replaced by documents)';
END $$;

-- 1.3 DROP tabla 'property_images' (legacy, probablemente no existe)
DO $$ BEGIN
  DROP TABLE IF EXISTS public.property_images CASCADE;
  RAISE NOTICE 'Dropped table: property_images (legacy)';
END $$;

-- ============================================================================
-- FASE 2: ELIMINAR SISTEMA ELEVENLABS COMPLETO (7 TABLAS)
-- ============================================================================

-- 2.1 Eliminar funciones ElevenLabs primero (dependencias)
DO $$ BEGIN
  DROP FUNCTION IF EXISTS public.increment_usage(UUID, TEXT, INTEGER, NUMERIC) CASCADE;
  DROP FUNCTION IF EXISTS public.check_usage_limits(UUID) CASCADE;
  RAISE NOTICE 'Dropped ElevenLabs helper functions';
END $$;

-- 2.2 Eliminar vistas ElevenLabs (si existen)
DO $$ BEGIN
  DROP VIEW IF EXISTS public.elevenlabs_usage_summary CASCADE;
END $$;

-- 2.3 Eliminar tablas ElevenLabs
DO $$ BEGIN
  DROP TABLE IF EXISTS public.tts_batch_jobs CASCADE;
  DROP TABLE IF EXISTS public.elevenlabs_webhook_events CASCADE;
  DROP TABLE IF EXISTS public.elevenlabs_usage CASCADE;
  DROP TABLE IF EXISTS public.elevenlabs_conversations CASCADE;
  DROP TABLE IF EXISTS public.elevenlabs_agents CASCADE;
  DROP TABLE IF EXISTS public.elevenlabs_voices CASCADE;
  DROP TABLE IF EXISTS public.tts_requests CASCADE;
  RAISE NOTICE 'Dropped all ElevenLabs tables (not integrated in workflow)';
END $$;

-- ============================================================================
-- FASE 3: LIMPIAR FUNCIONES LEGACY
-- ============================================================================

-- 3.1 Actualizar clean_property_data() para quitar referencia a property_images
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

-- ============================================================================
-- FASE 4: VERIFICACIÓN POST-LIMPIEZA
-- ============================================================================

-- 4.1 Verificar tablas restantes
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
  
  RAISE NOTICE 'Total tables remaining: % (%)', table_count, table_list;
END $$;

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- Tablas mantenidas (CORE):
-- ✅ properties - Propiedades base
-- ✅ reservations - Reservas y guests
-- ✅ media_files - Imágenes/videos (workflow activo)
-- ✅ documents - Vector store para RAG
-- ✅ shareable_links - Links de review
-- ✅ incidents - Escalación de problemas (recién creada)
-- ✅ property_match_log - Audit fuzzy matching (recién creada)
--
-- Tablas eliminadas (LEGACY/NO USADAS):
-- ❌ media - Legacy
-- ❌ property_documents - Legacy
-- ❌ property_images - Legacy
-- ❌ tts_requests - ElevenLabs no integrado
-- ❌ elevenlabs_voices - ElevenLabs no integrado
-- ❌ elevenlabs_agents - ElevenLabs no integrado
-- ❌ elevenlabs_conversations - ElevenLabs no integrado
-- ❌ elevenlabs_usage - ElevenLabs no integrado
-- ❌ elevenlabs_webhook_events - ElevenLabs no integrado
-- ❌ tts_batch_jobs - ElevenLabs no integrado
-- ============================================================================

-- Nota: Las tablas de Supabase Auth y sistema se mantienen automáticamente


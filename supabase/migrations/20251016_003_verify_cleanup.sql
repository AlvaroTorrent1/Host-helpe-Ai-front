-- Migration: Verificación post-limpieza
-- Date: 2025-10-16
-- Description: Verifica que solo quedan las tablas necesarias y el sistema funciona

-- ============================================================================
-- VERIFICACIÓN 1: LISTAR TODAS LAS TABLAS PÚBLICAS
-- ============================================================================

SELECT 
  'TABLAS RESTANTES' as check_type,
  tablename as name,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
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

-- ============================================================================
-- VERIFICACIÓN 2: CONFIRMAR TABLAS LEGACY ELIMINADAS
-- ============================================================================

SELECT 
  'LEGACY TABLES CHECK' as check_type,
  legacy_table as name,
  EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename = legacy_table
  ) as still_exists,
  CASE 
    WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = legacy_table)
    THEN '❌ NO ELIMINADA'
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
) AS t(legacy_table);

-- ============================================================================
-- VERIFICACIÓN 3: FUNCIONES ACTIVAS
-- ============================================================================

SELECT 
  'ACTIVE FUNCTIONS' as check_type,
  routine_name as name,
  routine_type as type,
  CASE 
    WHEN routine_name IN (
      'match_property_by_name',
      'log_property_match',
      'get_incident_stats',
      'clean_property_data',
      'create_property_with_media',
      'match_documents'
    ) 
    THEN '✅ NEEDED'
    WHEN routine_name LIKE 'increment_usage%' OR routine_name LIKE 'check_usage%'
    THEN '❌ LEGACY (should be removed)'
    ELSE '⚠️ REVIEW'
  END as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- ============================================================================
-- VERIFICACIÓN 4: VISTAS ACTIVAS
-- ============================================================================

SELECT 
  'ACTIVE VIEWS' as check_type,
  table_name as name,
  CASE 
    WHEN table_name IN ('incidents_with_property', 'property_matches_needing_review')
    THEN '✅ NEEDED'
    ELSE '⚠️ REVIEW'
  END as status
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================================================
-- VERIFICACIÓN 5: RLS POLICIES (Solo tablas activas)
-- ============================================================================

SELECT 
  'RLS POLICIES' as check_type,
  tablename as table_name,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PROTECTED'
    ELSE '⚠️ NO RLS'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================================================
-- VERIFICACIÓN 6: ÍNDICES (Solo tablas activas)
-- ============================================================================

SELECT 
  'INDEXES' as check_type,
  tablename as table_name,
  indexname as index_name,
  '✅ OK' as status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('properties', 'reservations', 'media_files', 'documents', 
                    'shareable_links', 'incidents', 'property_match_log')
ORDER BY tablename, indexname;

-- ============================================================================
-- VERIFICACIÓN 7: BACKUPS CREADOS
-- ============================================================================

SELECT 
  'BACKUPS' as check_type,
  tablename as name,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_schema = 'public' AND table_name = pg_tables.tablename) as columns,
  '📦 BACKUP' as status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename LIKE '_backup_20251016_%'
ORDER BY tablename;

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- ✅ 7 tablas CORE activas
-- ✅ 10 tablas legacy eliminadas
-- ✅ Funciones ElevenLabs eliminadas
-- ✅ RLS policies solo en tablas activas
-- ✅ Backups creados (si había datos)
-- ============================================================================


-- File: supabase/migrations/20251016_006_cleanup_tablas_candidatas.sql
-- Purpose: Drop candidate tables after verification and backup
-- Date: 2025-10-16
-- Run this LAST, after 004 (verification) and 005 (backup)

-- ⚠️ WARNING: This script will DROP tables permanently
-- Make sure you have:
-- 1. Reviewed verification results (004)
-- 2. Created backups (005)
-- 3. Confirmed tables are not needed

-- ============================================
-- CLEANUP: DROP CANDIDATE TABLES
-- ============================================

DO $$ 
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CLEANUP DE TABLAS NO UTILIZADAS';
    RAISE NOTICE 'Fecha: %', NOW();
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ Este script eliminará tablas permanentemente';
    RAISE NOTICE '✅ Backups disponibles con prefijo: _backup_20251016_';
    RAISE NOTICE '';
END $$;

-- ============================================
-- DROP: sync_logs (Calendly)
-- ============================================
DO $$ 
BEGIN
    DROP TABLE IF EXISTS public.sync_logs CASCADE;
    RAISE NOTICE '🗑️ Dropped table: sync_logs';
    RAISE NOTICE '   Razón: Sistema Calendly no usado en workflows activos';
    RAISE NOTICE '   Backup: _backup_20251016_sync_logs (si tenía datos)';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error dropping sync_logs: %', SQLERRM;
END $$;

-- ============================================
-- DROP: scal_configs (Calendly)
-- ============================================
DO $$ 
BEGIN
    DROP TABLE IF EXISTS public.scal_configs CASCADE;
    RAISE NOTICE '🗑️ Dropped table: scal_configs';
    RAISE NOTICE '   Razón: Configuración Calendly no usada';
    RAISE NOTICE '   Backup: _backup_20251016_scal_configs (si tenía datos)';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error dropping scal_configs: %', SQLERRM;
END $$;

-- ============================================
-- DROP: synced_bookings (Calendly)
-- ============================================
DO $$ 
BEGIN
    DROP TABLE IF EXISTS public.synced_bookings CASCADE;
    RAISE NOTICE '🗑️ Dropped table: synced_bookings';
    RAISE NOTICE '   Razón: Bookings Calendly no sincronizados en workflows';
    RAISE NOTICE '   Backup: _backup_20251016_synced_bookings (si tenía datos)';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error dropping synced_bookings: %', SQLERRM;
END $$;

-- ============================================
-- DROP: integrity_alerts_log (CONDICIONAL)
-- Comentado por defecto - descomentar SOLO si está vacía o legacy
-- ============================================
/*
DO $$ 
BEGIN
    DROP TABLE IF EXISTS public.integrity_alerts_log CASCADE;
    RAISE NOTICE '🗑️ Dropped table: integrity_alerts_log';
    RAISE NOTICE '   Razón: Sistema de monitoreo no detectado';
    RAISE NOTICE '   Backup: _backup_20251016_integrity_alerts_log (si tenía datos)';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error dropping integrity_alerts_log: %', SQLERRM;
END $$;
*/

-- ============================================
-- DROP: modal_logs_state (CONDICIONAL)
-- Comentado por defecto - descomentar SOLO si está vacía o legacy
-- ============================================
/*
DO $$ 
BEGIN
    DROP TABLE IF EXISTS public.modal_logs_state CASCADE;
    RAISE NOTICE '🗑️ Dropped table: modal_logs_state';
    RAISE NOTICE '   Razón: Logs de frontend no conectados a backend';
    RAISE NOTICE '   Backup: _backup_20251016_modal_logs_state (si tenía datos)';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error dropping modal_logs_state: %', SQLERRM;
END $$;
*/

-- ============================================
-- VERIFY: List remaining tables
-- ============================================
DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICACIÓN POST-CLEANUP';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Tablas eliminadas (Calendly):';
    RAISE NOTICE '   - sync_logs';
    RAISE NOTICE '   - scal_configs';
    RAISE NOTICE '   - synced_bookings';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Tablas mantenidas (Core):';
    RAISE NOTICE '   - obs_chat_histories (Postgres Chat Memory)';
    RAISE NOTICE '   - customer_subscriptions (Billing)';
    RAISE NOTICE '   - plan_limits (Billing)';
    RAISE NOTICE '   - user_properties (Core relation)';
    RAISE NOTICE '   - storage_file_registry (Supabase Storage)';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ Tablas comentadas (revisar manualmente):';
    RAISE NOTICE '   - integrity_alerts_log';
    RAISE NOTICE '   - modal_logs_state';
    RAISE NOTICE '';
END $$;

-- Show remaining public tables
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename NOT LIKE '_backup_%'
ORDER BY tablename;

-- ============================================
-- CLEANUP COMPLETE
-- ============================================
DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ CLEANUP COMPLETADO';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Resumen:';
    RAISE NOTICE '   🗑️ 3 tablas eliminadas (Calendly integration)';
    RAISE NOTICE '   ✅ 5 tablas core mantenidas';
    RAISE NOTICE '   ⚠️ 2 tablas pendientes de decisión manual';
    RAISE NOTICE '';
    RAISE NOTICE '💾 Backups disponibles por 30 días:';
    RAISE NOTICE '   - _backup_20251016_sync_logs';
    RAISE NOTICE '   - _backup_20251016_scal_configs';
    RAISE NOTICE '   - _backup_20251016_synced_bookings';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Para eliminar backups después de verificar:';
    RAISE NOTICE '   DROP TABLE _backup_20251016_sync_logs;';
    RAISE NOTICE '   DROP TABLE _backup_20251016_scal_configs;';
    RAISE NOTICE '   DROP TABLE _backup_20251016_synced_bookings;';
END $$;


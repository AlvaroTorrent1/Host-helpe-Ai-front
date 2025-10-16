-- File: supabase/migrations/20251016_EJECUTAR_TODO_VERIFICACION.sql
-- Purpose: ALL-IN-ONE script for verification + backup + cleanup of candidate tables
-- Date: 2025-10-16
-- 
-- ⚠️ IMPORTANTE: 
-- 1. Este script hace VERIFICACIÓN + BACKUP automático
-- 2. El CLEANUP de tablas está COMENTADO por seguridad
-- 3. Revisa los resultados y descomenta el PASO 3 si quieres ejecutar el cleanup

-- ============================================
-- PASO 1: VERIFICACIÓN
-- ============================================

DO $$ 
DECLARE
    table_exists boolean;
    row_count integer;
    last_activity timestamp;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '   VERIFICACIÓN DE TABLAS CANDIDATAS A DEPRECAR';
    RAISE NOTICE '   Fecha: %', NOW();
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';

    -- ============================================
    -- GROUP 1: CALENDLY INTEGRATION (🗑️ CANDIDATAS)
    -- ============================================
    RAISE NOTICE '📦 GRUPO 1: INTEGRACIÓN CALENDLY (candidatas a deprecar)';
    RAISE NOTICE '──────────────────────────────────────────────────────────────';
    
    -- sync_logs
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sync_logs') INTO table_exists;
    IF table_exists THEN
        SELECT COUNT(*) INTO row_count FROM public.sync_logs;
        IF row_count > 0 THEN
            SELECT MAX(created_at) INTO last_activity FROM public.sync_logs;
            RAISE NOTICE '  ✅ sync_logs: % rows | Última actividad: %', row_count, last_activity;
        ELSE
            RAISE NOTICE '  ⚠️ sync_logs: VACÍA (0 rows)';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ sync_logs: NO EXISTE';
    END IF;

    -- scal_configs
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'scal_configs') INTO table_exists;
    IF table_exists THEN
        SELECT COUNT(*) INTO row_count FROM public.scal_configs;
        IF row_count > 0 THEN
            SELECT MAX(created_at) INTO last_activity FROM public.scal_configs;
            RAISE NOTICE '  ✅ scal_configs: % rows | Última actividad: %', row_count, last_activity;
        ELSE
            RAISE NOTICE '  ⚠️ scal_configs: VACÍA (0 rows)';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ scal_configs: NO EXISTE';
    END IF;

    -- synced_bookings
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'synced_bookings') INTO table_exists;
    IF table_exists THEN
        SELECT COUNT(*) INTO row_count FROM public.synced_bookings;
        IF row_count > 0 THEN
            SELECT MAX(created_at) INTO last_activity FROM public.synced_bookings;
            RAISE NOTICE '  ✅ synced_bookings: % rows | Última actividad: %', row_count, last_activity;
        ELSE
            RAISE NOTICE '  ⚠️ synced_bookings: VACÍA (0 rows)';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ synced_bookings: NO EXISTE';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '📊 GRUPO 2: MONITORING/LOGS (verificar antes de eliminar)';
    RAISE NOTICE '──────────────────────────────────────────────────────────────';
    
    -- integrity_alerts_log
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'integrity_alerts_log') INTO table_exists;
    IF table_exists THEN
        SELECT COUNT(*) INTO row_count FROM public.integrity_alerts_log;
        IF row_count > 0 THEN
            SELECT MAX(created_at) INTO last_activity FROM public.integrity_alerts_log;
            RAISE NOTICE '  ✅ integrity_alerts_log: % rows | Última actividad: %', row_count, last_activity;
        ELSE
            RAISE NOTICE '  ⚠️ integrity_alerts_log: VACÍA (0 rows)';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ integrity_alerts_log: NO EXISTE';
    END IF;

    -- modal_logs_state
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'modal_logs_state') INTO table_exists;
    IF table_exists THEN
        SELECT COUNT(*) INTO row_count FROM public.modal_logs_state;
        IF row_count > 0 THEN
            SELECT MAX(updated_at) INTO last_activity FROM public.modal_logs_state;
            RAISE NOTICE '  ✅ modal_logs_state: % rows | Última actividad: %', row_count, last_activity;
        ELSE
            RAISE NOTICE '  ⚠️ modal_logs_state: VACÍA (0 rows)';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ modal_logs_state: NO EXISTE';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '✅ GRUPO 3: TABLAS CORE (mantener siempre)';
    RAISE NOTICE '──────────────────────────────────────────────────────────────';
    
    -- obs_chat_histories
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'obs_chat_histories') INTO table_exists;
    IF table_exists THEN
        SELECT COUNT(*) INTO row_count FROM public.obs_chat_histories;
        RAISE NOTICE '  ✅ obs_chat_histories (Chat Memory): % conversaciones', row_count;
    ELSE
        RAISE NOTICE '  ❌ obs_chat_histories: NO EXISTE ⚠️ PROBLEMA';
    END IF;

    -- customer_subscriptions
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customer_subscriptions') INTO table_exists;
    IF table_exists THEN
        SELECT COUNT(*) INTO row_count FROM public.customer_subscriptions;
        RAISE NOTICE '  ✅ customer_subscriptions (Billing): % suscripciones', row_count;
    ELSE
        RAISE NOTICE '  ❌ customer_subscriptions: NO EXISTE';
    END IF;

    -- plan_limits
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'plan_limits') INTO table_exists;
    IF table_exists THEN
        SELECT COUNT(*) INTO row_count FROM public.plan_limits;
        RAISE NOTICE '  ✅ plan_limits (Billing): % planes configurados', row_count;
    ELSE
        RAISE NOTICE '  ❌ plan_limits: NO EXISTE';
    END IF;

    -- user_properties
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_properties') INTO table_exists;
    IF table_exists THEN
        SELECT COUNT(*) INTO row_count FROM public.user_properties;
        RAISE NOTICE '  ✅ user_properties (Core): % relaciones user-property', row_count;
    ELSE
        RAISE NOTICE '  ❌ user_properties: NO EXISTE';
    END IF;

    -- storage_file_registry
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'storage_file_registry') INTO table_exists;
    IF table_exists THEN
        SELECT COUNT(*) INTO row_count FROM public.storage_file_registry;
        IF row_count > 0 THEN
            RAISE NOTICE '  ✅ storage_file_registry: % archivos registrados', row_count;
        ELSE
            RAISE NOTICE '  ⚠️ storage_file_registry: VACÍA (¿no se usa Storage?)';
        END IF;
    ELSE
        RAISE NOTICE '  ❌ storage_file_registry: NO EXISTE';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '   VERIFICACIÓN COMPLETADA';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    
END $$;

-- ============================================
-- PASO 2: BACKUP AUTOMÁTICO
-- ============================================

DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '   BACKUP AUTOMÁTICO DE TABLAS CON DATOS';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
END $$;

-- Backup: sync_logs
DO $$ 
DECLARE
    row_count integer;
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sync_logs') THEN
        SELECT COUNT(*) INTO row_count FROM public.sync_logs;
        IF row_count > 0 THEN
            CREATE TABLE IF NOT EXISTS _backup_20251016_sync_logs AS SELECT * FROM public.sync_logs;
            RAISE NOTICE '  💾 Backup creado: _backup_20251016_sync_logs (% rows)', row_count;
        ELSE
            RAISE NOTICE '  ⚠️ sync_logs vacía - sin backup';
        END IF;
    END IF;
END $$;

-- Backup: scal_configs
DO $$ 
DECLARE
    row_count integer;
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'scal_configs') THEN
        SELECT COUNT(*) INTO row_count FROM public.scal_configs;
        IF row_count > 0 THEN
            CREATE TABLE IF NOT EXISTS _backup_20251016_scal_configs AS SELECT * FROM public.scal_configs;
            RAISE NOTICE '  💾 Backup creado: _backup_20251016_scal_configs (% rows)', row_count;
        ELSE
            RAISE NOTICE '  ⚠️ scal_configs vacía - sin backup';
        END IF;
    END IF;
END $$;

-- Backup: synced_bookings
DO $$ 
DECLARE
    row_count integer;
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'synced_bookings') THEN
        SELECT COUNT(*) INTO row_count FROM public.synced_bookings;
        IF row_count > 0 THEN
            CREATE TABLE IF NOT EXISTS _backup_20251016_synced_bookings AS SELECT * FROM public.synced_bookings;
            RAISE NOTICE '  💾 Backup creado: _backup_20251016_synced_bookings (% rows)', row_count;
        ELSE
            RAISE NOTICE '  ⚠️ synced_bookings vacía - sin backup';
        END IF;
    END IF;
END $$;

-- Backup: integrity_alerts_log
DO $$ 
DECLARE
    row_count integer;
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'integrity_alerts_log') THEN
        SELECT COUNT(*) INTO row_count FROM public.integrity_alerts_log;
        IF row_count > 0 THEN
            CREATE TABLE IF NOT EXISTS _backup_20251016_integrity_alerts_log AS SELECT * FROM public.integrity_alerts_log;
            RAISE NOTICE '  💾 Backup creado: _backup_20251016_integrity_alerts_log (% rows)', row_count;
        END IF;
    END IF;
END $$;

-- Backup: modal_logs_state
DO $$ 
DECLARE
    row_count integer;
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'modal_logs_state') THEN
        SELECT COUNT(*) INTO row_count FROM public.modal_logs_state;
        IF row_count > 0 THEN
            CREATE TABLE IF NOT EXISTS _backup_20251016_modal_logs_state AS SELECT * FROM public.modal_logs_state;
            RAISE NOTICE '  💾 Backup creado: _backup_20251016_modal_logs_state (% rows)', row_count;
        END IF;
    END IF;
END $$;

DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '   BACKUP COMPLETADO';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
END $$;

-- ============================================
-- PASO 3: CLEANUP (COMENTADO - Descomentar para ejecutar)
-- ============================================

/*
DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '   CLEANUP: ELIMINANDO TABLAS NO UTILIZADAS';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
END $$;

-- DROP: sync_logs
DO $$ 
BEGIN
    DROP TABLE IF EXISTS public.sync_logs CASCADE;
    RAISE NOTICE '  🗑️ Eliminada: sync_logs (Sistema Calendly)';
END $$;

-- DROP: scal_configs
DO $$ 
BEGIN
    DROP TABLE IF EXISTS public.scal_configs CASCADE;
    RAISE NOTICE '  🗑️ Eliminada: scal_configs (Configuración Calendly)';
END $$;

-- DROP: synced_bookings
DO $$ 
BEGIN
    DROP TABLE IF EXISTS public.synced_bookings CASCADE;
    RAISE NOTICE '  🗑️ Eliminada: synced_bookings (Bookings Calendly)';
END $$;

-- DROP: integrity_alerts_log (solo si está vacía)
-- DO $$ 
-- BEGIN
--     DROP TABLE IF EXISTS public.integrity_alerts_log CASCADE;
--     RAISE NOTICE '  🗑️ Eliminada: integrity_alerts_log (Monitoreo legacy)';
-- END $$;

-- DROP: modal_logs_state (solo si está vacía)
-- DO $$ 
-- BEGIN
--     DROP TABLE IF EXISTS public.modal_logs_state CASCADE;
--     RAISE NOTICE '  🗑️ Eliminada: modal_logs_state (Logs frontend legacy)';
-- END $$;

DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '   ✅ CLEANUP COMPLETADO';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Resumen:';
    RAISE NOTICE '   🗑️ 3 tablas eliminadas (Calendly)';
    RAISE NOTICE '   ✅ 5 tablas core mantenidas';
    RAISE NOTICE '   💾 Backups disponibles por 30 días';
    RAISE NOTICE '';
END $$;
*/

-- ============================================
-- RESUMEN FINAL
-- ============================================

DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '   📊 RESUMEN FINAL';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Pasos completados:';
    RAISE NOTICE '   1. ✅ Verificación de tablas';
    RAISE NOTICE '   2. ✅ Backup automático (si tenían datos)';
    RAISE NOTICE '   3. ⚠️ Cleanup PENDIENTE (está comentado)';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Siguiente acción:';
    RAISE NOTICE '   - Revisar los resultados de verificación arriba';
    RAISE NOTICE '   - Si todo está OK, descomenta PASO 3 y ejecuta de nuevo';
    RAISE NOTICE '   - O ejecuta 006_cleanup_tablas_candidatas.sql directamente';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Tablas candidatas a eliminar:';
    RAISE NOTICE '   🗑️ sync_logs (Calendly - no usada en workflows)';
    RAISE NOTICE '   🗑️ scal_configs (Calendly - no usada)';
    RAISE NOTICE '   🗑️ synced_bookings (Calendly - no usada)';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Tablas a mantener:';
    RAISE NOTICE '   ✅ obs_chat_histories (Postgres Chat Memory)';
    RAISE NOTICE '   ✅ customer_subscriptions (Billing Stripe)';
    RAISE NOTICE '   ✅ plan_limits (Billing)';
    RAISE NOTICE '   ✅ user_properties (Core)';
    RAISE NOTICE '   ✅ storage_file_registry (Supabase Storage)';
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;


-- File: supabase/migrations/20251016_004_verificar_tablas_candidatas.sql
-- Purpose: Verify candidate tables for deprecation (Calendly, logs, monitoring)
-- Date: 2025-10-16
-- Run this FIRST to decide what to deprecate

-- ============================================
-- VERIFICATION SCRIPT FOR CANDIDATE TABLES
-- ============================================

DO $$ 
DECLARE
    table_exists boolean;
    row_count integer;
    last_activity timestamp;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICACIÓN DE TABLAS CANDIDATAS A DEPRECAR';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';

    -- ============================================
    -- GROUP 1: CALENDLY INTEGRATION (🗑️ CANDIDATAS A DEPRECAR)
    -- ============================================
    RAISE NOTICE '--- 1. CALENDLY INTEGRATION TABLES ---';
    
    -- sync_logs
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sync_logs') INTO table_exists;
    IF table_exists THEN
        SELECT COUNT(*) INTO row_count FROM public.sync_logs;
        IF row_count > 0 THEN
            SELECT MAX(created_at) INTO last_activity FROM public.sync_logs;
            RAISE NOTICE '✅ sync_logs: EXISTS - % rows - Last activity: %', row_count, last_activity;
        ELSE
            RAISE NOTICE '⚠️ sync_logs: EXISTS but EMPTY (0 rows)';
        END IF;
    ELSE
        RAISE NOTICE '❌ sync_logs: NOT FOUND';
    END IF;

    -- scal_configs
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'scal_configs') INTO table_exists;
    IF table_exists THEN
        SELECT COUNT(*) INTO row_count FROM public.scal_configs;
        IF row_count > 0 THEN
            SELECT MAX(created_at) INTO last_activity FROM public.scal_configs;
            RAISE NOTICE '✅ scal_configs: EXISTS - % rows - Last activity: %', row_count, last_activity;
        ELSE
            RAISE NOTICE '⚠️ scal_configs: EXISTS but EMPTY (0 rows)';
        END IF;
    ELSE
        RAISE NOTICE '❌ scal_configs: NOT FOUND';
    END IF;

    -- synced_bookings
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'synced_bookings') INTO table_exists;
    IF table_exists THEN
        SELECT COUNT(*) INTO row_count FROM public.synced_bookings;
        IF row_count > 0 THEN
            SELECT MAX(created_at) INTO last_activity FROM public.synced_bookings;
            RAISE NOTICE '✅ synced_bookings: EXISTS - % rows - Last activity: %', row_count, last_activity;
        ELSE
            RAISE NOTICE '⚠️ synced_bookings: EXISTS but EMPTY (0 rows)';
        END IF;
    ELSE
        RAISE NOTICE '❌ synced_bookings: NOT FOUND';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '--- 2. MONITORING/LOGS TABLES (⚠️ VERIFICAR) ---';
    
    -- integrity_alerts_log
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'integrity_alerts_log') INTO table_exists;
    IF table_exists THEN
        SELECT COUNT(*) INTO row_count FROM public.integrity_alerts_log;
        IF row_count > 0 THEN
            SELECT MAX(created_at) INTO last_activity FROM public.integrity_alerts_log;
            RAISE NOTICE '✅ integrity_alerts_log: EXISTS - % rows - Last activity: %', row_count, last_activity;
        ELSE
            RAISE NOTICE '⚠️ integrity_alerts_log: EXISTS but EMPTY (0 rows)';
        END IF;
    ELSE
        RAISE NOTICE '❌ integrity_alerts_log: NOT FOUND';
    END IF;

    -- modal_logs_state
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'modal_logs_state') INTO table_exists;
    IF table_exists THEN
        SELECT COUNT(*) INTO row_count FROM public.modal_logs_state;
        IF row_count > 0 THEN
            SELECT MAX(updated_at) INTO last_activity FROM public.modal_logs_state;
            RAISE NOTICE '✅ modal_logs_state: EXISTS - % rows - Last activity: %', row_count, last_activity;
        ELSE
            RAISE NOTICE '⚠️ modal_logs_state: EXISTS but EMPTY (0 rows)';
        END IF;
    ELSE
        RAISE NOTICE '❌ modal_logs_state: NOT FOUND';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '--- 3. CORE TABLES (✅ MANTENER) ---';
    
    -- obs_chat_histories (Postgres Chat Memory)
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'obs_chat_histories') INTO table_exists;
    IF table_exists THEN
        SELECT COUNT(*) INTO row_count FROM public.obs_chat_histories;
        RAISE NOTICE '✅ obs_chat_histories (Chat Memory): EXISTS - % conversations', row_count;
    ELSE
        RAISE NOTICE '❌ obs_chat_histories: NOT FOUND (⚠️ PROBLEMA - necesaria para chatbots)';
    END IF;

    -- customer_subscriptions (Billing)
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customer_subscriptions') INTO table_exists;
    IF table_exists THEN
        SELECT COUNT(*) INTO row_count FROM public.customer_subscriptions;
        RAISE NOTICE '✅ customer_subscriptions (Billing): EXISTS - % subscriptions', row_count;
    ELSE
        RAISE NOTICE '❌ customer_subscriptions: NOT FOUND';
    END IF;

    -- plan_limits (Billing)
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'plan_limits') INTO table_exists;
    IF table_exists THEN
        SELECT COUNT(*) INTO row_count FROM public.plan_limits;
        RAISE NOTICE '✅ plan_limits (Billing): EXISTS - % plans configured', row_count;
    ELSE
        RAISE NOTICE '❌ plan_limits: NOT FOUND';
    END IF;

    -- user_properties (Core relation)
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_properties') INTO table_exists;
    IF table_exists THEN
        SELECT COUNT(*) INTO row_count FROM public.user_properties;
        RAISE NOTICE '✅ user_properties (Core): EXISTS - % user-property relations', row_count;
    ELSE
        RAISE NOTICE '❌ user_properties: NOT FOUND';
    END IF;

    -- storage_file_registry
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'storage_file_registry') INTO table_exists;
    IF table_exists THEN
        SELECT COUNT(*) INTO row_count FROM public.storage_file_registry;
        IF row_count > 0 THEN
            RAISE NOTICE '✅ storage_file_registry: EXISTS - % files registered', row_count;
        ELSE
            RAISE NOTICE '⚠️ storage_file_registry: EXISTS but EMPTY (not using Storage?)';
        END IF;
    ELSE
        RAISE NOTICE '❌ storage_file_registry: NOT FOUND';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ANÁLISIS COMPLETO';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 RECOMENDACIONES:';
    RAISE NOTICE '  🗑️ DEPRECAR: Tablas VACÍAS o con última actividad > 6 meses';
    RAISE NOTICE '  ✅ MANTENER: Tablas con datos activos o críticas para sistema';
    RAISE NOTICE '  ⚠️ VERIFICAR: Tablas con datos pero sin uso detectado en n8n';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 SIGUIENTE PASO: Revisar resultados y ejecutar backup + cleanup';
    
END $$;

-- ============================================
-- DETAILED QUERIES (Optional - run manually if needed)
-- ============================================

-- Uncomment to see sample data from Calendly tables:
/*
SELECT 'sync_logs sample' as info, * FROM public.sync_logs LIMIT 5;
SELECT 'scal_configs sample' as info, * FROM public.scal_configs LIMIT 5;
SELECT 'synced_bookings sample' as info, * FROM public.synced_bookings LIMIT 5;
*/

-- Check for foreign key dependencies:
/*
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('sync_logs', 'scal_configs', 'synced_bookings', 'integrity_alerts_log', 'modal_logs_state');
*/


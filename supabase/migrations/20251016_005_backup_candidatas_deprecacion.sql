-- File: supabase/migrations/20251016_005_backup_candidatas_deprecacion.sql
-- Purpose: Conditional backup of candidate tables before deprecation
-- Date: 2025-10-16
-- Run this AFTER verification (004) and BEFORE cleanup (006)

-- ============================================
-- CONDITIONAL BACKUP - ONLY IF TABLES EXIST AND HAVE DATA
-- ============================================

DO $$ 
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'BACKUP DE TABLAS CANDIDATAS A DEPRECACIÓN';
    RAISE NOTICE 'Fecha: %', NOW();
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;

-- ============================================
-- BACKUP: sync_logs
-- ============================================
DO $$ 
DECLARE
    row_count integer;
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sync_logs') THEN
        SELECT COUNT(*) INTO row_count FROM public.sync_logs;
        
        IF row_count > 0 THEN
            CREATE TABLE IF NOT EXISTS _backup_20251016_sync_logs AS 
            SELECT * FROM public.sync_logs;
            
            RAISE NOTICE '✅ Backup creado: _backup_20251016_sync_logs (% rows)', row_count;
        ELSE
            RAISE NOTICE '⚠️ sync_logs está vacía - no se crea backup';
        END IF;
    ELSE
        RAISE NOTICE '❌ sync_logs no existe - skip backup';
    END IF;
END $$;

-- ============================================
-- BACKUP: scal_configs
-- ============================================
DO $$ 
DECLARE
    row_count integer;
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'scal_configs') THEN
        SELECT COUNT(*) INTO row_count FROM public.scal_configs;
        
        IF row_count > 0 THEN
            CREATE TABLE IF NOT EXISTS _backup_20251016_scal_configs AS 
            SELECT * FROM public.scal_configs;
            
            RAISE NOTICE '✅ Backup creado: _backup_20251016_scal_configs (% rows)', row_count;
        ELSE
            RAISE NOTICE '⚠️ scal_configs está vacía - no se crea backup';
        END IF;
    ELSE
        RAISE NOTICE '❌ scal_configs no existe - skip backup';
    END IF;
END $$;

-- ============================================
-- BACKUP: synced_bookings
-- ============================================
DO $$ 
DECLARE
    row_count integer;
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'synced_bookings') THEN
        SELECT COUNT(*) INTO row_count FROM public.synced_bookings;
        
        IF row_count > 0 THEN
            CREATE TABLE IF NOT EXISTS _backup_20251016_synced_bookings AS 
            SELECT * FROM public.synced_bookings;
            
            RAISE NOTICE '✅ Backup creado: _backup_20251016_synced_bookings (% rows)', row_count;
        ELSE
            RAISE NOTICE '⚠️ synced_bookings está vacía - no se crea backup';
        END IF;
    ELSE
        RAISE NOTICE '❌ synced_bookings no existe - skip backup';
    END IF;
END $$;

-- ============================================
-- BACKUP: integrity_alerts_log (SOLO SI ESTÁ VACÍA)
-- ============================================
DO $$ 
DECLARE
    row_count integer;
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'integrity_alerts_log') THEN
        SELECT COUNT(*) INTO row_count FROM public.integrity_alerts_log;
        
        IF row_count > 0 THEN
            CREATE TABLE IF NOT EXISTS _backup_20251016_integrity_alerts_log AS 
            SELECT * FROM public.integrity_alerts_log;
            
            RAISE NOTICE '✅ Backup creado: _backup_20251016_integrity_alerts_log (% rows)', row_count;
            RAISE NOTICE '⚠️ ATENCIÓN: Esta tabla tiene datos - revisar si es legacy antes de eliminar';
        ELSE
            RAISE NOTICE '⚠️ integrity_alerts_log está vacía - no se crea backup';
        END IF;
    ELSE
        RAISE NOTICE '❌ integrity_alerts_log no existe - skip backup';
    END IF;
END $$;

-- ============================================
-- BACKUP: modal_logs_state (SOLO SI ESTÁ VACÍA)
-- ============================================
DO $$ 
DECLARE
    row_count integer;
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'modal_logs_state') THEN
        SELECT COUNT(*) INTO row_count FROM public.modal_logs_state;
        
        IF row_count > 0 THEN
            CREATE TABLE IF NOT EXISTS _backup_20251016_modal_logs_state AS 
            SELECT * FROM public.modal_logs_state;
            
            RAISE NOTICE '✅ Backup creado: _backup_20251016_modal_logs_state (% rows)', row_count;
            RAISE NOTICE '⚠️ ATENCIÓN: Esta tabla tiene datos - revisar si es legacy antes de eliminar';
        ELSE
            RAISE NOTICE '⚠️ modal_logs_state está vacía - no se crea backup';
        END IF;
    ELSE
        RAISE NOTICE '❌ modal_logs_state no existe - skip backup';
    END IF;
END $$;

-- ============================================
-- SUMMARY
-- ============================================
DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'BACKUP COMPLETADO';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📦 Backups creados con prefijo: _backup_20251016_';
    RAISE NOTICE '🎯 Siguiente paso: Ejecutar 006_cleanup_tablas_candidatas.sql';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ IMPORTANTE: Revisar resultados de verificación (004) antes de ejecutar cleanup';
    RAISE NOTICE '   - Si tablas tienen datos RECIENTES → NO eliminar';
    RAISE NOTICE '   - Si tablas están VACÍAS o LEGACY → Seguro eliminar';
END $$;


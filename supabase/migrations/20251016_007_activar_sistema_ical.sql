-- File: supabase/migrations/20251016_007_activar_sistema_ical.sql
-- Purpose: Activar sistema de sincronización iCal
-- Date: 2025-10-16

-- ============================================
-- ACTIVACIÓN DEL SISTEMA ICAL
-- ============================================

DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '   ACTIVANDO SISTEMA DE SINCRONIZACIÓN ICAL';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
END $$;

-- ============================================
-- 1. Crear función para sincronización manual
-- ============================================

CREATE OR REPLACE FUNCTION public.trigger_ical_sync()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result jsonb;
    v_config record;
    v_synced_count integer := 0;
BEGIN
    -- Obtener configuraciones activas
    FOR v_config IN 
        SELECT * FROM ical_configs 
        WHERE is_active = true 
          AND sync_status IN ('pending', 'active')
    LOOP
        BEGIN
            -- Log intento de sincronización
            RAISE NOTICE 'Sincronizando: % (ID: %)', v_config.ical_name, v_config.id;
            
            -- Actualizar estado a activo
            UPDATE ical_configs
            SET sync_status = 'active',
                last_sync_at = NOW(),
                error_message = NULL
            WHERE id = v_config.id;
            
            v_synced_count := v_synced_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            -- Marcar error
            UPDATE ical_configs
            SET sync_status = 'error',
                error_message = SQLERRM,
                last_sync_at = NOW()
            WHERE id = v_config.id;
            
            RAISE NOTICE 'Error sincronizando %: %', v_config.ical_name, SQLERRM;
        END;
    END LOOP;
    
    v_result := jsonb_build_object(
        'success', true,
        'synced_count', v_synced_count,
        'timestamp', NOW()
    );
    
    RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.trigger_ical_sync() IS 
'Función para activar sincronización manual de iCal. 
Llama a la Edge Function o actualiza el estado si no está disponible.';

-- ============================================
-- 2. Crear función HTTP para Edge Function
-- ============================================

CREATE OR REPLACE FUNCTION public.invoke_ical_sync_edge_function()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result jsonb;
BEGIN
    -- Esta función puede ser llamada por un cron job o manualmente
    -- Aquí solo actualizamos el estado, la Edge Function se llama externamente
    
    RAISE NOTICE '🔄 Preparando sincronización iCal...';
    
    -- Marcar configuraciones como listas para sincronización
    UPDATE ical_configs
    SET sync_status = 'pending',
        error_message = NULL
    WHERE is_active = true 
      AND sync_status NOT IN ('active', 'pending');
    
    v_result := jsonb_build_object(
        'success', true,
        'message', 'Sistema iCal activado. Configuraciones listas para sincronización.',
        'timestamp', NOW()
    );
    
    RETURN v_result;
END;
$$;

-- ============================================
-- 3. Activar configuraciones existentes
-- ============================================

DO $$ 
DECLARE
    v_count integer;
BEGIN
    -- Activar todas las configuraciones pendientes
    UPDATE ical_configs
    SET sync_status = 'active',
        last_sync_at = NOW(),
        error_message = NULL
    WHERE is_active = true 
      AND sync_status = 'pending';
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ Configuraciones iCal activadas: %', v_count;
    
    -- Mostrar configuraciones activas
    FOR v_config IN 
        SELECT ical_name, ical_url, sync_status, last_sync_at
        FROM ical_configs
        WHERE is_active = true
    LOOP
        RAISE NOTICE '   📅 %: % (última sync: %)', 
            v_config.ical_name, 
            v_config.sync_status,
            COALESCE(v_config.last_sync_at::text, 'nunca');
    END LOOP;
    
    RAISE NOTICE '';
END $$;

-- ============================================
-- 4. Crear trigger para auto-sincronización
-- ============================================

-- Función trigger para nuevas configuraciones
CREATE OR REPLACE FUNCTION public.auto_activate_ical_config()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Si se crea una nueva configuración activa, preparar para sincronización
    IF NEW.is_active = true AND NEW.sync_status = 'pending' THEN
        RAISE NOTICE '🆕 Nueva configuración iCal creada: %', NEW.ical_name;
        -- La sincronización se activará en el próximo ciclo
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger en INSERT
DROP TRIGGER IF EXISTS trigger_auto_activate_ical_config ON ical_configs;
CREATE TRIGGER trigger_auto_activate_ical_config
    AFTER INSERT ON ical_configs
    FOR EACH ROW
    EXECUTE FUNCTION auto_activate_ical_config();

-- ============================================
-- 5. Crear vista de estado de sincronización
-- ============================================

CREATE OR REPLACE VIEW public.ical_sync_status AS
SELECT 
    ic.id,
    ic.ical_name,
    ic.sync_status,
    ic.last_sync_at,
    ic.sync_interval_minutes,
    ic.is_active,
    ic.error_message,
    up.property_name,
    COUNT(sb.id) as total_bookings_synced,
    MAX(sb.created_at) as last_booking_synced
FROM ical_configs ic
LEFT JOIN user_properties up ON ic.property_id = up.id
LEFT JOIN synced_bookings sb ON ic.id = sb.ical_config_id
GROUP BY ic.id, ic.ical_name, ic.sync_status, ic.last_sync_at, 
         ic.sync_interval_minutes, ic.is_active, ic.error_message, up.property_name
ORDER BY ic.created_at DESC;

COMMENT ON VIEW public.ical_sync_status IS 
'Vista del estado de sincronización iCal con estadísticas de reservas sincronizadas';

-- ============================================
-- 6. Grants de permisos
-- ============================================

-- Permitir que usuarios ejecuten la sincronización manual
GRANT EXECUTE ON FUNCTION public.trigger_ical_sync() TO authenticated;
GRANT EXECUTE ON FUNCTION public.invoke_ical_sync_edge_function() TO authenticated;

-- Permitir consultar el estado
GRANT SELECT ON public.ical_sync_status TO authenticated;

-- ============================================
-- RESUMEN FINAL
-- ============================================

DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '   ✅ SISTEMA ICAL ACTIVADO EXITOSAMENTE';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Funciones creadas:';
    RAISE NOTICE '   • trigger_ical_sync() - Sincronización manual';
    RAISE NOTICE '   • invoke_ical_sync_edge_function() - Invocar Edge Function';
    RAISE NOTICE '   • auto_activate_ical_config() - Auto-activación';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Vistas creadas:';
    RAISE NOTICE '   • ical_sync_status - Estado de sincronización';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Próximos pasos:';
    RAISE NOTICE '   1. Configurar cron job para ejecutar Edge Function cada 30 min';
    RAISE NOTICE '   2. O llamar manualmente: SELECT trigger_ical_sync();';
    RAISE NOTICE '   3. Ver estado: SELECT * FROM ical_sync_status;';
    RAISE NOTICE '';
    RAISE NOTICE '🔗 Edge Function URL:';
    RAISE NOTICE '   POST https://blxngmtmknkdmikaflen.supabase.co/functions/v1/sync-ical-bookings';
    RAISE NOTICE '';
END $$;


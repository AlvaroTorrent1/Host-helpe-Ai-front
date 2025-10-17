-- scripts/check-ical-sync-status.sql
-- Script rápido para verificar el estado de la sincronización iCal

-- ========================================
-- 1. ESTADO GENERAL DEL SISTEMA
-- ========================================

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '📊 ESTADO GENERAL DE SINCRONIZACIÓN ICAL'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

SELECT 
  ical_name as "Configuración",
  sync_status as "Estado",
  to_char(last_sync_at, 'YYYY-MM-DD HH24:MI:SS') as "Última Sync",
  CASE 
    WHEN last_sync_at IS NULL THEN 'Nunca'
    WHEN EXTRACT(EPOCH FROM (now() - last_sync_at))/60 < 60 THEN 
      ROUND(EXTRACT(EPOCH FROM (now() - last_sync_at))/60) || ' minutos atrás'
    WHEN EXTRACT(EPOCH FROM (now() - last_sync_at))/3600 < 24 THEN 
      ROUND(EXTRACT(EPOCH FROM (now() - last_sync_at))/3600) || ' horas atrás'
    ELSE 
      ROUND(EXTRACT(EPOCH FROM (now() - last_sync_at))/86400) || ' días atrás'
  END as "Tiempo Desde Sync",
  CASE 
    WHEN is_active THEN '✅ Activo'
    ELSE '❌ Inactivo'
  END as "Activo",
  CASE 
    WHEN error_message IS NULL THEN '✅ Sin errores'
    ELSE '⚠️ ' || error_message
  END as "Estado"
FROM ical_configs;

\echo ''

-- ========================================
-- 2. RESUMEN DE RESERVAS
-- ========================================

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '📅 RESUMEN DE RESERVAS SINCRONIZADAS'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

SELECT 
  'Total Reservas' as "Categoría",
  COUNT(*)::text as "Cantidad",
  '📊' as "Icono"
FROM synced_bookings

UNION ALL

SELECT 
  'Actuales/Futuras' as "Categoría",
  COUNT(*)::text as "Cantidad",
  '🔮' as "Icono"
FROM synced_bookings
WHERE check_out_date >= CURRENT_DATE

UNION ALL

SELECT 
  'Pasadas' as "Categoría",
  COUNT(*)::text as "Cantidad",
  '📜' as "Icono"
FROM synced_bookings
WHERE check_out_date < CURRENT_DATE;

\echo ''

-- ========================================
-- 3. RESERVAS ACTUALES/FUTURAS
-- ========================================

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '🔮 RESERVAS ACTUALES Y FUTURAS'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

SELECT 
  to_char(check_in_date, 'DD Mon YYYY') as "Check-in",
  to_char(check_out_date, 'DD Mon YYYY') as "Check-out",
  check_out_date - check_in_date as "Noches",
  booking_status as "Estado",
  COALESCE(guest_name, 'No disponible') as "Huésped",
  raw_ical_event->>'summary' as "Descripción"
FROM synced_bookings
WHERE check_out_date >= CURRENT_DATE
ORDER BY check_in_date;

\echo ''

-- ========================================
-- 4. ESTADO DEL CRON JOB
-- ========================================

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '⏰ ESTADO DEL CRON JOB'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

SELECT 
  jobid as "Job ID",
  schedule as "Programación",
  command as "Comando",
  CASE 
    WHEN active THEN '✅ Activo'
    ELSE '❌ Inactivo'
  END as "Estado",
  database as "Base de Datos"
FROM cron.job
WHERE command LIKE '%auto_sync_ical%';

\echo ''

-- ========================================
-- 5. ÚLTIMAS EJECUCIONES DEL CRON
-- ========================================

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '📜 ÚLTIMAS EJECUCIONES DEL CRON'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

SELECT 
  to_char(start_time, 'YYYY-MM-DD HH24:MI:SS') as "Inicio",
  to_char(end_time, 'HH24:MI:SS') as "Fin",
  EXTRACT(EPOCH FROM (end_time - start_time)) || 's' as "Duración",
  status as "Estado",
  COALESCE(return_message, '✅') as "Resultado"
FROM cron.job_run_details
WHERE jobid = 1
ORDER BY start_time DESC
LIMIT 5;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '✅ Verificación completada'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'


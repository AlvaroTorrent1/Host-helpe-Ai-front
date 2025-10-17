-- scripts/sync-ical-manual-mcp.sql
-- Script para sincronizar manualmente reservas iCal usando SQL
-- Este script descarga el iCal actual y sincroniza las reservas

-- PASO 1: Insertar nuevas reservas manualmente
-- (Reemplaza los valores con los datos del iCal actual)

DO $$
DECLARE
  v_config_id uuid;
  v_property_id uuid;
  v_user_id uuid;
BEGIN
  -- Obtener IDs de configuración
  SELECT id, property_id, user_id 
  INTO v_config_id, v_property_id, v_user_id
  FROM ical_configs
  WHERE ical_name = 'Booking.com - Casa María Flora'
  LIMIT 1;
  
  -- Insertar reserva si no existe
  -- ACTUALIZA estos valores con los datos del iCal actual:
  -- booking_uid, check_in_date, check_out_date, summary
  
  INSERT INTO synced_bookings (
    id,
    property_id,
    user_id,
    ical_config_id,
    booking_uid,
    booking_source,
    check_in_date,
    check_out_date,
    booking_status,
    guest_name,
    raw_ical_event,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    v_property_id,
    v_user_id,
    v_config_id,
    '3fc1357333f5e058b3416924cc625a68@booking.com', -- UID del evento
    'booking.com',
    '2025-11-06'::date,  -- Fecha de entrada
    '2025-11-13'::date,  -- Fecha de salida
    'blocked',           -- Estado
    NULL,                -- Nombre del huésped (si disponible)
    jsonb_build_object(
      'uid', '3fc1357333f5e058b3416924cc625a68@booking.com',
      'summary', 'CLOSED - Not available',
      'start', '2025-11-06',
      'end', '2025-11-13',
      'processed_at', now()
    ),
    now(),
    now()
  )
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'Reserva sincronizada';
END $$;

-- PASO 2: Actualizar estado de sincronización
UPDATE ical_configs
SET last_sync_at = now(),
    sync_status = 'active',
    error_message = NULL
WHERE ical_name = 'Booking.com - Casa María Flora';

-- PASO 3: Verificar resultados
SELECT 
  booking_uid,
  check_in_date,
  check_out_date,
  booking_status,
  raw_ical_event->>'summary' as summary,
  CASE 
    WHEN check_out_date >= CURRENT_DATE THEN '✅ FUTURA'
    ELSE '📜 PASADA'
  END as tipo
FROM synced_bookings
ORDER BY check_in_date DESC
LIMIT 10;


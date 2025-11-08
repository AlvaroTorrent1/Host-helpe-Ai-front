-- =============================================================================
-- SCRIPT DE PRUEBA: Crear reserva + enlace parte de viajeros para Lynx
-- Propiedad: Cabaña Mirlo Blanco
-- Objetivo: Probar flujo completo de registro de viajeros y envío a Lynx
-- =============================================================================

-- 1. CREAR RESERVA PARA UNA PERSONA
-- =============================================================================
-- Insertamos una reserva en la tabla reservations para la propiedad Cabaña Mirlo Blanco
-- Check-in: mañana | Check-out: 3 días después | Nacionalidad: España (ES)

INSERT INTO reservations (
  property_id,
  guest_name,
  guest_surname,
  phone_number,
  nationality,
  checkin_date,
  checkout_date,
  notes,
  status
)
VALUES (
  '16fbf161-beda-46b7-baca-16243049562d',  -- Cabaña Mirlo Blanco
  'María',                                   -- Nombre del huésped
  'García López',                            -- Apellidos
  '+34600123456',                            -- Teléfono
  'ES',                                      -- Nacionalidad (código ISO)
  CURRENT_DATE + INTERVAL '1 day',          -- Check-in mañana
  CURRENT_DATE + INTERVAL '4 days',         -- Check-out 3 días después
  'Reserva de prueba para testear flujo Lynx', -- Notas
  'active'                                   -- Estado activo
)
RETURNING id, uuid, property_name, guest_name, guest_surname, checkin_date, checkout_date;

-- NOTA: Copia el ID de la reserva que se muestra arriba


-- 2. CREAR ENLACE DEL PARTE DE VIAJEROS
-- =============================================================================
-- Insertamos registro en traveler_form_requests con token único
-- Este enlace se enviaría al turista vía email/WhatsApp

-- IMPORTANTE: Reemplaza <RESERVATION_ID> con el ID que obtuviste arriba
-- IMPORTANTE: Reemplaza <USER_ID> con tu user_id (ejemplo: '17917dcc-2678-4b8a-97af-2ca62817b280')

WITH new_token AS (
  SELECT gen_random_uuid()::text AS token_value
)
INSERT INTO traveler_form_requests (
  user_id,
  property_id,
  reservation_id,                            -- Asociar con la reserva creada
  token,
  check_in_date,
  check_out_date,
  property_name,
  guest_email,
  guest_phone,
  num_travelers_expected,                    -- 1 persona esperada
  num_travelers_completed,                   -- 0 al inicio
  status,
  expires_at,                                -- Válido por 30 días
  sent_at
)
SELECT
  '17917dcc-2678-4b8a-97af-2ca62817b280',    -- CAMBIA ESTO: tu user_id
  '16fbf161-beda-46b7-baca-16243049562d',    -- Cabaña Mirlo Blanco
  <RESERVATION_ID>,                          -- CAMBIA ESTO: ID de la reserva creada arriba
  new_token.token_value,
  CURRENT_DATE + INTERVAL '1 day',           -- Check-in
  CURRENT_DATE + INTERVAL '4 days',          -- Check-out
  'Cabaña Mirlo Blanco',
  'maria.garcia@example.com',                -- Email del huésped
  '+34600123456',
  1,                                         -- 1 viajero esperado
  0,                                         -- 0 completado
  'pending',
  CURRENT_DATE + INTERVAL '30 days',         -- Expira en 30 días
  NOW()
FROM new_token
RETURNING 
  id,
  token,
  property_name,
  guest_email,
  check_in_date,
  check_out_date,
  num_travelers_expected,
  status,
  expires_at;

-- NOTA: Copia el TOKEN que se muestra arriba. Lo necesitarás para la URL pública.


-- =============================================================================
-- 3. CONSULTAS PARA VERIFICAR LA CONFIGURACIÓN
-- =============================================================================

-- Ver la reserva creada con todos sus datos
SELECT 
  id,
  uuid,
  property_name,
  guest_name || ' ' || guest_surname AS guest_full_name,
  phone_number,
  nationality,
  checkin_date,
  checkout_date,
  status,
  created_at
FROM reservations
WHERE property_id = '16fbf161-beda-46b7-baca-16243049562d'
ORDER BY created_at DESC
LIMIT 1;

-- Ver el enlace del parte de viajeros creado
SELECT 
  id,
  token,
  property_name,
  guest_email,
  guest_phone,
  check_in_date,
  check_out_date,
  num_travelers_expected,
  num_travelers_completed,
  status,
  expires_at,
  created_at,
  -- Construir URL pública (ajusta el dominio según tu configuración)
  CONCAT('https://tu-dominio.com/check-in/', token) AS public_url
FROM traveler_form_requests
WHERE property_id = '16fbf161-beda-46b7-baca-16243049562d'
ORDER BY created_at DESC
LIMIT 1;

-- Verificar que la propiedad tiene lynx_lodging_id configurado
SELECT 
  name,
  lynx_lodging_id,
  lynx_lodging_status,
  lynx_account_id
FROM properties
WHERE id = '16fbf161-beda-46b7-baca-16243049562d';


-- =============================================================================
-- 4. CONSULTAS DE MONITOREO (ejecutar después de que el turista complete el formulario)
-- =============================================================================

-- Ver si el viajero completó el formulario
SELECT 
  tfd.id,
  tfd.first_name,
  tfd.last_name,
  tfd.document_type,
  tfd.document_number,
  tfd.nationality,
  tfd.birth_date,
  tfd.email,
  tfd.signature_data IS NOT NULL AS has_signature,
  tfd.consent_accepted,
  tfd.submitted_at
FROM traveler_form_data tfd
JOIN traveler_form_requests tfr ON tfr.id = tfd.form_request_id
WHERE tfr.property_id = '16fbf161-beda-46b7-baca-16243049562d'
ORDER BY tfd.submitted_at DESC;

-- Ver el estado del envío a Lynx
SELECT 
  tfr.id,
  tfr.property_name,
  tfr.guest_email,
  tfr.num_travelers_expected,
  tfr.num_travelers_completed,
  tfr.status,
  tfr.lynx_submission_id,
  tfr.lynx_submitted_at,
  tfr.lynx_payload IS NOT NULL AS has_payload,
  tfr.lynx_response IS NOT NULL AS has_response,
  tfr.lynx_response
FROM traveler_form_requests tfr
WHERE tfr.property_id = '16fbf161-beda-46b7-baca-16243049562d'
ORDER BY tfr.created_at DESC
LIMIT 1;


-- =============================================================================
-- 5. CONSULTAS DE LIMPIEZA (opcional - si necesitas resetear la prueba)
-- =============================================================================

-- CUIDADO: Esto borrará todos los datos de prueba. 
-- Descomenta solo si necesitas limpiar y volver a empezar.

/*
-- Borrar datos de formularios completados
DELETE FROM traveler_form_data
WHERE form_request_id IN (
  SELECT id FROM traveler_form_requests
  WHERE property_id = '16fbf161-beda-46b7-baca-16243049562d'
  AND guest_email = 'maria.garcia@example.com'
);

-- Borrar solicitudes de formulario
DELETE FROM traveler_form_requests
WHERE property_id = '16fbf161-beda-46b7-baca-16243049562d'
AND guest_email = 'maria.garcia@example.com';

-- Borrar reserva
DELETE FROM reservations
WHERE property_id = '16fbf161-beda-46b7-baca-16243049562d'
AND guest_name = 'María'
AND guest_surname = 'García López';
*/


-- =============================================================================
-- NOTAS IMPORTANTES
-- =============================================================================
/*

FLUJO DE PRUEBA:

1. Ejecuta el apartado 1 para crear la reserva
2. Copia el ID de la reserva retornado
3. Reemplaza <RESERVATION_ID> y <USER_ID> en el apartado 2
4. Ejecuta el apartado 2 para crear el enlace del parte de viajeros
5. Copia el TOKEN retornado
6. Construye la URL pública: https://tu-dominio.com/check-in/{TOKEN}
7. Abre esa URL en el navegador (simulando el turista)
8. Completa el formulario con los datos del viajero
9. Ejecuta las consultas del apartado 4 para verificar:
   - Que los datos se guardaron en traveler_form_data
   - Que el status de traveler_form_requests cambió a 'completed'
   - Que lynx_submission_id está presente (envío exitoso a Lynx)
   - Que lynx_response tiene la respuesta del servidor


VERIFICACIÓN DEL ENVÍO A LYNX:

El Edge Function (submit-traveler-form) envía automáticamente a Lynx cuando:
✓ num_travelers_completed = num_travelers_expected
✓ La propiedad tiene lynx_lodging_id configurado
✓ Endpoint: POST /accounts/{accountId}/lodgings/{lodgingId}/travelers

Puedes verificar logs en Supabase Dashboard:
- Functions > submit-traveler-form > Invocations
- Busca logs con "Enviando a Lynx" y "Parte enviado exitosamente"


DOCUMENTACIÓN ADICIONAL:
- Edge Function: supabase/functions/submit-traveler-form/index.ts
- Servicio Lynx: supabase/functions/_shared/lynxCheckinService.ts
- Frontend: src/features/sesregistro/SesRegistroPage.tsx

*/
















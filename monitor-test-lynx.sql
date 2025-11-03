-- =============================================================================
-- SCRIPT DE MONITOREO: Test de Envío a Lynx
-- Reserva ID: 75
-- Token: 62e5dfaa-7317-4cf6-951a-6b6866134e0b
-- =============================================================================

-- 1. RESUMEN GENERAL DE LA RESERVA Y PARTE
-- =============================================================================
SELECT 
  '=== INFORMACIÓN DE LA RESERVA ===' as info,
  r.id as reservation_id,
  r.uuid as reservation_uuid,
  r.property_name,
  r.guest_name || ' ' || r.guest_surname as guest,
  r.checkin_date,
  r.checkout_date,
  r.status as reservation_status,
  r.created_at as reservation_created
FROM reservations r
WHERE r.id = 75;

-- 2. ESTADO DEL PARTE DE VIAJEROS
-- =============================================================================
SELECT 
  '=== ESTADO DEL PARTE ===' as info,
  tfr.id as form_request_id,
  tfr.token,
  tfr.guest_email,
  tfr.num_travelers_expected,
  tfr.num_travelers_completed,
  tfr.status,
  tfr.sent_at,
  tfr.completed_at,
  tfr.expires_at,
  -- Información de Lynx
  tfr.lynx_submission_id,
  tfr.lynx_submitted_at,
  CASE 
    WHEN tfr.lynx_payload IS NOT NULL THEN 'SÍ ✅'
    ELSE 'NO ❌'
  END as payload_generado,
  CASE 
    WHEN tfr.lynx_response IS NOT NULL THEN 'SÍ ✅'
    ELSE 'NO ❌'
  END as respuesta_recibida
FROM traveler_form_requests tfr
WHERE tfr.id = '1308514b-1852-4653-9c9d-195b2f5003be';

-- 3. VERIFICAR CONFIGURACIÓN DE LYNX EN LA PROPIEDAD
-- =============================================================================
SELECT 
  '=== CONFIGURACIÓN LYNX ===' as info,
  p.id as property_id,
  p.name as property_name,
  p.lynx_lodging_id,
  p.lynx_lodging_status,
  p.lynx_account_id,
  CASE 
    WHEN p.lynx_lodging_id IS NOT NULL THEN 'CONFIGURADO ✅'
    ELSE 'NO CONFIGURADO ❌'
  END as lynx_ready
FROM properties p
WHERE p.id = '16fbf161-beda-46b7-baca-16243049562d';

-- 4. DATOS DEL VIAJERO (si ya se completó el formulario)
-- =============================================================================
SELECT 
  '=== VIAJERO REGISTRADO ===' as info,
  tfd.id as traveler_id,
  tfd.first_name,
  tfd.last_name,
  tfd.document_type,
  tfd.document_number,
  tfd.nationality,
  tfd.birth_date,
  tfd.email,
  tfd.phone,
  tfd.address_city,
  tfd.address_postal_code,
  tfd.address_country,
  CASE 
    WHEN tfd.signature_data IS NOT NULL THEN 'SÍ ✅'
    ELSE 'NO ❌'
  END as tiene_firma,
  tfd.consent_accepted,
  tfd.consent_ip_address,
  tfd.submitted_at
FROM traveler_form_data tfd
WHERE tfd.form_request_id = '1308514b-1852-4653-9c9d-195b2f5003be'
ORDER BY tfd.submitted_at DESC;

-- 5. RESPUESTA DE LYNX (JSON completo)
-- =============================================================================
SELECT 
  '=== RESPUESTA DE LYNX (JSON) ===' as info,
  tfr.lynx_submission_id as submission_id,
  tfr.lynx_submitted_at as submitted_at,
  tfr.lynx_response as response_json
FROM traveler_form_requests tfr
WHERE tfr.id = '1308514b-1852-4653-9c9d-195b2f5003be'
AND tfr.lynx_response IS NOT NULL;

-- 6. PAYLOAD ENVIADO A LYNX (JSON completo)
-- =============================================================================
SELECT 
  '=== PAYLOAD ENVIADO A LYNX (JSON) ===' as info,
  tfr.lynx_payload as payload_json
FROM traveler_form_requests tfr
WHERE tfr.id = '1308514b-1852-4653-9c9d-195b2f5003be'
AND tfr.lynx_payload IS NOT NULL;

-- 7. ESTADO COMPLETO EN UNA SOLA CONSULTA
-- =============================================================================
-- Esta query te da toda la info en una sola vista
SELECT 
  '=== RESUMEN COMPLETO ===' as info,
  -- Reserva
  r.id as reservation_id,
  r.property_name,
  r.guest_name || ' ' || r.guest_surname as guest,
  r.checkin_date,
  r.checkout_date,
  -- Parte de viajeros
  tfr.token,
  tfr.status as form_status,
  tfr.num_travelers_completed || '/' || tfr.num_travelers_expected as travelers_progress,
  -- Viajero (si existe)
  tfd.first_name || ' ' || tfd.last_name as traveler_name,
  tfd.document_number,
  tfd.email as traveler_email,
  -- Lynx
  CASE 
    WHEN tfr.lynx_submission_id IS NOT NULL THEN 'ENVIADO ✅'
    ELSE 'PENDIENTE ⏳'
  END as lynx_status,
  tfr.lynx_submission_id,
  tfr.lynx_submitted_at,
  -- Timestamps
  tfr.sent_at as form_sent,
  tfr.completed_at as form_completed,
  tfd.submitted_at as traveler_submitted
FROM reservations r
LEFT JOIN traveler_form_requests tfr ON tfr.reservation_id = r.id
LEFT JOIN traveler_form_data tfd ON tfd.form_request_id = tfr.id
WHERE r.id = 75
ORDER BY tfd.submitted_at DESC;

-- =============================================================================
-- INTERPRETACIÓN DE RESULTADOS
-- =============================================================================
/*

ESTADOS POSIBLES DEL FORMULARIO (status):
- 'pending'   : Formulario creado pero no completado por el turista
- 'completed' : Turista completó el formulario (todos los viajeros)
- 'expired'   : El enlace expiró sin completarse
- 'cancelled' : Cancelado por el gestor

PROGRESO ESPERADO:

ANTES DE QUE EL TURISTA COMPLETE EL FORMULARIO:
✓ Reserva existe con status 'active'
✓ traveler_form_requests existe con status 'pending'
✓ num_travelers_completed = 0
✓ lynx_submission_id = NULL
✓ NO hay filas en traveler_form_data

DESPUÉS DE QUE EL TURISTA COMPLETE EL FORMULARIO:
✓ traveler_form_data tiene 1 fila con los datos del viajero
✓ traveler_form_requests.status = 'completed'
✓ num_travelers_completed = 1
✓ completed_at tiene timestamp
✓ SI la propiedad tiene lynx_lodging_id:
  → lynx_submission_id tiene UUID
  → lynx_submitted_at tiene timestamp
  → lynx_payload tiene el JSON enviado
  → lynx_response tiene la respuesta de Lynx

VERIFICACIÓN EXITOSA:
✓ form_status = 'completed'
✓ travelers_progress = '1/1'
✓ lynx_status = 'ENVIADO ✅'
✓ lynx_submission_id IS NOT NULL
✓ lynx_response indica success

*/

-- =============================================================================
-- QUERIES RÁPIDAS DE VERIFICACIÓN
-- =============================================================================

-- ¿El formulario ya se completó?
SELECT 
  CASE 
    WHEN status = 'completed' THEN '✅ SÍ - Formulario completado'
    WHEN status = 'pending' THEN '⏳ NO - Esperando que el turista lo complete'
    WHEN status = 'expired' THEN '⚠️ EXPIRADO - El enlace ya no es válido'
    ELSE status
  END as estado_formulario
FROM traveler_form_requests
WHERE id = '1308514b-1852-4653-9c9d-195b2f5003be';

-- ¿Se envió a Lynx?
SELECT 
  CASE 
    WHEN lynx_submission_id IS NOT NULL THEN '✅ SÍ - Enviado a Lynx'
    ELSE '⏳ NO - Aún no se ha enviado'
  END as estado_lynx,
  lynx_submission_id,
  lynx_submitted_at
FROM traveler_form_requests
WHERE id = '1308514b-1852-4653-9c9d-195b2f5003be';

-- ¿Cuántos viajeros faltan?
SELECT 
  num_travelers_expected - num_travelers_completed as viajeros_faltantes,
  CASE 
    WHEN num_travelers_completed = num_travelers_expected 
    THEN '✅ Todos los viajeros completados'
    ELSE '⏳ Faltan ' || (num_travelers_expected - num_travelers_completed) || ' viajero(s)'
  END as mensaje
FROM traveler_form_requests
WHERE id = '1308514b-1852-4653-9c9d-195b2f5003be';

-- =============================================================================
-- FIN DEL SCRIPT DE MONITOREO
-- =============================================================================


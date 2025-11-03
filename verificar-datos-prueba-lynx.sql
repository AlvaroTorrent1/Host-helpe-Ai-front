-- =============================================================================
-- SCRIPT DE VERIFICACIÓN: Datos de prueba para envío a Lynx Check-in
-- Ejecuta este script para ver todos los datos generados
-- =============================================================================

-- 1. VERIFICAR RESERVA
-- =============================================================================
SELECT 
  id,
  uuid,
  property_id,
  property_name,
  guest_name,
  guest_surname,
  phone_number,
  nationality,
  checkin_date,
  checkout_date,
  status,
  created_at
FROM reservations
WHERE id = 82;

-- 2. VERIFICAR TRAVELER_FORM_REQUEST
-- =============================================================================
SELECT 
  id,
  token,
  property_id,
  property_name,
  reservation_id,
  check_in_date,
  check_out_date,
  guest_email,
  guest_phone,
  num_travelers_expected,
  num_travelers_completed,
  status,
  lynx_submission_id,
  lynx_submitted_at,
  created_at
FROM traveler_form_requests
WHERE id = 'f26194aa-929c-4ec4-8bac-8b8202a8b07e';

-- 3. VERIFICAR TRAVELER_FORM_DATA
-- =============================================================================
SELECT 
  id,
  form_request_id,
  first_name,
  last_name,
  document_type,
  document_number,
  document_support_number,
  nationality,
  birth_date,
  email,
  phone,
  address_street,
  address_city,
  address_postal_code,
  address_country,
  payment_method,
  submitted_at
FROM traveler_form_data
WHERE form_request_id = 'f26194aa-929c-4ec4-8bac-8b8202a8b07e';

-- 4. VERIFICAR PROPIEDAD CON LYNX CONFIG
-- =============================================================================
SELECT 
  id,
  name,
  address,
  city,
  postal_code,
  province,
  country,
  tourism_license,
  license_type,
  lynx_account_id,
  lynx_authority_connection_id,
  lynx_lodging_id,
  lynx_lodging_status
FROM properties
WHERE id = '16fbf161-beda-46b7-baca-16243049562d';

-- 5. VERIFICAR RESPUESTA DE LYNX (después de enviar)
-- =============================================================================
-- Ejecuta esto DESPUÉS de hacer el envío para ver la respuesta
SELECT 
  id,
  property_name,
  status,
  lynx_submission_id,
  lynx_submitted_at,
  lynx_payload::jsonb,
  lynx_response::jsonb
FROM traveler_form_requests
WHERE id = 'f26194aa-929c-4ec4-8bac-8b8202a8b07e';

-- 6. RESUMEN COMPLETO
-- =============================================================================
-- Vista unificada de todos los datos
SELECT 
  r.id as reserva_id,
  r.guest_name || ' ' || r.guest_surname as huésped,
  r.checkin_date,
  r.checkout_date,
  tfr.id as form_request_id,
  tfr.status as form_status,
  tfr.num_travelers_completed || '/' || tfr.num_travelers_expected as viajeros,
  tfr.lynx_submission_id,
  CASE 
    WHEN tfr.lynx_submitted_at IS NOT NULL THEN '✅ Enviado'
    WHEN tfr.status = 'completed' THEN '📋 Listo para enviar'
    ELSE '⏳ Pendiente'
  END as estado_lynx,
  p.name as propiedad,
  p.lynx_lodging_id
FROM reservations r
LEFT JOIN traveler_form_requests tfr ON tfr.reservation_id = r.id
LEFT JOIN properties p ON p.id = r.property_id
WHERE r.id = 82;


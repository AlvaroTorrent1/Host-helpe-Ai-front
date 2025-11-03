-- Script para reenviar manualmente un parte de viajeros a Lynx
-- C:\Users\Usuario\Desktop\nuevo-repo\retry-lynx-submission.sql
-- 
-- PROPÓSITO: Cuando un parte se completó pero no se envió a Lynx,
-- este script obtiene todos los datos necesarios para reenviar manualmente

-- ==============================================================================
-- PASO 1: Verificar el estado actual de la solicitud
-- ==============================================================================

SELECT 
  tfr.id as request_id,
  tfr.token,
  tfr.status,
  tfr.property_id,
  tfr.check_in_date,
  tfr.check_out_date,
  tfr.num_travelers_expected,
  tfr.num_travelers_completed,
  tfr.lynx_submission_id,
  tfr.lynx_submitted_at,
  tfr.completed_at,
  p.name as property_name,
  p.lynx_lodging_id,
  COUNT(tfd.id) as travelers_count
FROM traveler_form_requests tfr
INNER JOIN properties p ON p.id = tfr.property_id
LEFT JOIN traveler_form_data tfd ON tfd.form_request_id = tfr.id
WHERE tfr.token = '50865684edbaf5763e67274da9e862ca94534d24c3e7fdb1fe8fa8a1557ff4f6'
GROUP BY tfr.id, p.id;

-- ==============================================================================
-- PASO 2: Obtener todos los datos de los viajeros para este parte
-- ==============================================================================

SELECT 
  tfd.id,
  tfd.first_name,
  tfd.last_name,
  tfd.document_type,
  tfd.document_number,
  tfd.nationality,
  tfd.birth_date,
  tfd.gender,
  tfd.email,
  tfd.phone,
  tfd.address_street,
  tfd.address_city,
  tfd.address_postal_code,
  tfd.address_country,
  tfd.payment_method,
  LEFT(tfd.signature_data, 100) as signature_preview, -- Solo preview
  LENGTH(tfd.signature_data) as signature_length
FROM traveler_form_data tfd
WHERE tfd.form_request_id = '9490c594-fb29-4fdb-963d-74f9caa8b445';

-- ==============================================================================
-- PASO 3: Preparar payload en formato Lynx (JSON simulado)
-- ==============================================================================

WITH traveler_request AS (
  SELECT * FROM traveler_form_requests
  WHERE token = '50865684edbaf5763e67274da9e862ca94534d24c3e7fdb1fe8fa8a1557ff4f6'
),
property_info AS (
  SELECT lynx_lodging_id FROM properties 
  WHERE id = (SELECT property_id FROM traveler_request)
),
travelers_data AS (
  SELECT 
    first_name,
    last_name,
    document_type as "documentType",
    document_number as "documentNumber",
    nationality,
    birth_date as "birthDate",
    CASE 
      WHEN gender = 'M' THEN 'M'
      WHEN gender = 'F' THEN 'F'
      ELSE 'X'
    END as gender,
    email,
    COALESCE(phone, '') as phone,
    address_street,
    address_city,
    address_postal_code,
    address_country
  FROM traveler_form_data
  WHERE form_request_id = (SELECT id FROM traveler_request)
)
SELECT
  '📦 PAYLOAD PARA LYNX API' as title,
  '================================' as separator,
  'POST URL: https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/partners-api/v1/accounts/a190fff8-c5d0-49a2-80a8-79b38ce0f284/lodgings/' ||
  (SELECT lynx_lodging_id FROM property_info) || '/travelers' as endpoint,
  '' as blank,
  '-- Payload JSON:' as payload_header,
  jsonb_build_object(
    'checkInDate', (SELECT check_in_date::text FROM traveler_request),
    'checkOutDate', (SELECT check_out_date::text FROM traveler_request),
    'travelers', (SELECT jsonb_agg(
      jsonb_build_object(
        'firstName', first_name,
        'lastName', last_name,
        'documentType', "documentType",
        'documentNumber', "documentNumber",
        'nationality', nationality,
        'birthDate', "birthDate"::text,
        'gender', gender,
        'email', email,
        'phone', phone,
        'address', jsonb_build_object(
          'street', address_street,
          'city', address_city,
          'postalCode', address_postal_code,
          'country', address_country
        )
      )
    ) FROM travelers_data),
    'signature', '[FIRMA EN BASE64 - VER QUERY SIGUIENTE]',
    'paymentMethod', 'CASH'
  ) as payload_json;

-- ==============================================================================
-- PASO 4: Obtener la firma completa (ejecutar por separado)
-- ==============================================================================

SELECT 
  signature_data as full_signature_base64
FROM traveler_form_data
WHERE form_request_id = '9490c594-fb29-4fdb-963d-74f9caa8b445'
LIMIT 1;

-- ==============================================================================
-- PASO 5: Instrucciones para reenvío manual usando cURL
-- ==============================================================================

-- COPIAR ESTE COMANDO Y EJECUTAR EN TERMINAL:
-- 
-- curl -X POST \
--   'https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/partners-api/v1/accounts/a190fff8-c5d0-49a2-80a8-79b38ce0f284/lodgings/3dfc0644-612d-4449-9dd6-de7a9d15b012/travelers' \
--   -H 'Content-Type: application/json' \
--   -d '{
--     "checkInDate": "2025-11-10",
--     "checkOutDate": "2025-11-13",
--     "travelers": [
--       {
--         "firstName": "Juan",
--         "lastName": "Garcia Lopez",
--         "documentType": "DNI",
--         "documentNumber": "53571577T",
--         "nationality": "AR",
--         "birthDate": "1999-12-12",
--         "gender": "M",
--         "email": "alvarotorrent1@gmail.com",
--         "phone": "654654654",
--         "address": {
--           "street": "Avenida imperio argentina 7, portal 4, 4A",
--           "city": "Málaga",
--           "postalCode": "b1043",
--           "country": "AR"
--         }
--       }
--     ],
--     "signature": "[COPIAR FIRMA COMPLETA DEL PASO 4]",
--     "paymentMethod": "CASH"
--   }'

-- ==============================================================================
-- PASO 6: Después de envío exitoso, actualizar la BD manualmente
-- ==============================================================================

-- EJECUTAR ESTO SOLO DESPUÉS DE QUE LYNX RESPONDA CON ÉXITO
-- Reemplazar 'SUBMISSION_ID_DESDE_LYNX' con el ID que devuelva Lynx

-- UPDATE traveler_form_requests
-- SET 
--   lynx_submission_id = 'SUBMISSION_ID_DESDE_LYNX',
--   lynx_submitted_at = NOW(),
--   lynx_response = '{"success": true, "submissionId": "SUBMISSION_ID_DESDE_LYNX"}'::jsonb
-- WHERE id = '9490c594-fb29-4fdb-963d-74f9caa8b445';


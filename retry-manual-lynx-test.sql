-- Script para preparar y enviar manualmente el parte a Lynx
-- Parte ID: 7b592be9-17b7-4e67-9d17-6dd49a954e8f

-- 1. Ver los datos del parte y viajero
SELECT 
  tfr.id as form_request_id,
  tfr.token,
  tfr.check_in_date,
  tfr.check_out_date,
  tfr.property_name,
  p.lynx_lodging_id,
  p.lynx_account_id,
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
  tfd.payment_method
FROM traveler_form_requests tfr
JOIN properties p ON p.id = tfr.property_id
JOIN traveler_form_data tfd ON tfd.form_request_id = tfr.id
WHERE tfr.id = '7b592be9-17b7-4e67-9d17-6dd49a954e8f';

-- 2. Ver la firma que se subió
SELECT 
  name,
  created_at,
  id
FROM storage.objects
WHERE bucket_id = 'traveler-signatures'
  AND name LIKE '%7b592be9-17b7-4e67-9d17-6dd49a954e8f%'
ORDER BY created_at DESC
LIMIT 1;











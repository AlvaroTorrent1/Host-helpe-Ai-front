-- update-ses-property-lynx-id.sql
-- Actualizar lynx_lodging_id de la propiedad de prueba SES
-- Conecta la propiedad de Host Helper con "PRE SES Lodging" en Lynx

-- ========================================
-- PASO 1: Ver las propiedades más recientes
-- ========================================
-- Ejecuta esta query primero para identificar tu propiedad

SELECT 
  id,
  name,
  address,
  city,
  lynx_lodging_id,
  created_at
FROM properties
ORDER BY created_at DESC
LIMIT 5;

-- ========================================
-- PASO 2: Actualizar el lynx_lodging_id
-- ========================================
-- Opción A: Si la propiedad se llama "Propiedad Prueba SES" (buscar por nombre)

UPDATE properties
SET 
  lynx_lodging_id = '23bc3de7-0a9b-4d7f-85a3-e2e21fc942c6',
  lynx_account_id = 'a190fff8-c5d0-49a2-80a8-79b38ce0f284',
  lynx_authority_connection_id = '18b8c296-5ffb-4015-a5e9-8e0fb5050dc4',
  ses_establishment_code = '0000002870',
  updated_at = NOW()
WHERE name ILIKE '%prueba%ses%'
  OR name ILIKE '%ses%'
  OR name ILIKE '%pre%ses%'
RETURNING id, name, lynx_lodging_id;

-- ========================================
-- PASO 3 (Alternativa): Actualizar por ID específico
-- ========================================
-- Si conoces el ID exacto de tu propiedad, usa esta query:
-- Reemplaza 'TU-PROPERTY-ID-AQUI' con el ID real

/*
UPDATE properties
SET 
  lynx_lodging_id = '23bc3de7-0a9b-4d7f-85a3-e2e21fc942c6',
  lynx_account_id = 'a190fff8-c5d0-49a2-80a8-79b38ce0f284',
  lynx_authority_connection_id = '18b8c296-5ffb-4015-a5e9-8e0fb5050dc4',
  ses_establishment_code = '0000002870',
  updated_at = NOW()
WHERE id = 'TU-PROPERTY-ID-AQUI'
RETURNING id, name, lynx_lodging_id;
*/

-- ========================================
-- PASO 4: Verificar que se actualizó correctamente
-- ========================================

SELECT 
  id,
  name,
  address,
  lynx_lodging_id,
  lynx_account_id,
  lynx_authority_connection_id,
  ses_establishment_code
FROM properties
WHERE lynx_lodging_id = '23bc3de7-0a9b-4d7f-85a3-e2e21fc942c6';

-- ========================================
-- RESULTADO ESPERADO:
-- ========================================
-- Deberías ver tu propiedad con:
-- lynx_lodging_id:              23bc3de7-0a9b-4d7f-85a3-e2e21fc942c6
-- lynx_account_id:              a190fff8-c5d0-49a2-80a8-79b38ce0f284
-- lynx_authority_connection_id: 18b8c296-5ffb-4015-a5e9-8e0fb5050dc4
-- ses_establishment_code:       0000002870


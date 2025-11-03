-- LYNX_TEST_VERIFICATION.sql
-- Queries SQL para verificar cada paso del test de integración con Lynx API

/*
 * INSTRUCCIONES:
 * 1. Ejecuta estas queries en el orden indicado
 * 2. Sustituye {property_id} con el UUID real de tu propiedad de prueba
 * 3. Verifica que los resultados coincidan con lo esperado
 */

-- ============================================
-- 1. VERIFICAR QUE EL CAMPO lynx_lodging_id EXISTE
-- ============================================

-- Debería devolver: lynx_lodging_id, text, YES
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND column_name = 'lynx_lodging_id';

-- Verificar que el índice existe
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'properties'
AND indexname = 'idx_properties_lynx_lodging_id';


-- ============================================
-- 2. VERIFICAR TODOS LOS CAMPOS LYNX/SES EN PROPERTIES
-- ============================================

-- Lista completa de campos relacionados con Lynx/SES
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND (
  column_name LIKE '%lynx%' 
  OR column_name LIKE '%ses%'
  OR column_name LIKE '%owner%'
  OR column_name LIKE '%tourism%'
  OR column_name IN ('city', 'province', 'postal_code', 'country')
)
ORDER BY ordinal_position;


-- ============================================
-- 3. BUSCAR LA PROPIEDAD DE PRUEBA CREADA
-- ============================================

-- Buscar por nombre
SELECT 
  id,
  name,
  city,
  province,
  tourism_license,
  num_bedrooms,
  ses_establishment_code,
  lynx_lodging_id,
  lynx_lodging_status,
  created_at
FROM properties
WHERE name LIKE '%Villa Test Lynx%'
ORDER BY created_at DESC
LIMIT 5;

-- Si conoces el user_id del usuario que creó la propiedad:
-- SELECT id, name, city, tourism_license, lynx_lodging_id
-- FROM properties
-- WHERE user_id = '{tu_user_id}'
-- ORDER BY created_at DESC
-- LIMIT 5;


-- ============================================
-- 4. VERIFICAR PROPIEDAD COMPLETA (Sustituir {property_id})
-- ============================================

-- Ver TODOS los campos de la propiedad de prueba
SELECT *
FROM properties
WHERE id = '{property_id}';

-- Ver solo campos relevantes para Lynx (más legible)
SELECT 
  -- Identificación
  id,
  name,
  user_id,
  
  -- Dirección
  address,
  city,
  province,
  postal_code,
  country,
  
  -- Turístico
  tourism_license,
  license_type,
  property_type,
  max_guests,
  num_bedrooms,
  num_bathrooms,
  
  -- Propietario
  owner_name,
  owner_email,
  owner_phone,
  owner_id_type,
  owner_id_number,
  
  -- Credenciales SES
  ses_landlord_code,
  ses_username,
  -- ses_api_password (omitido por seguridad)
  ses_establishment_code,
  
  -- IDs Lynx
  lynx_lodging_id,
  lynx_account_id,
  lynx_authority_connection_id,
  lynx_lodging_status,
  
  -- Timestamps
  created_at,
  updated_at
FROM properties
WHERE id = '{property_id}';


-- ============================================
-- 5. VERIFICAR QUE TODOS LOS CAMPOS REQUERIDOS ESTÁN COMPLETOS
-- ============================================

-- Esta query retorna TRUE/FALSE para cada campo requerido
SELECT 
  id,
  name,
  
  -- Verificar campos básicos (deben ser NOT NULL)
  name IS NOT NULL AND name != '' AS has_name,
  address IS NOT NULL AND address != '' AS has_address,
  city IS NOT NULL AND city != '' AS has_city,
  province IS NOT NULL AND province != '' AS has_province,
  postal_code IS NOT NULL AND postal_code != '' AS has_postal_code,
  
  -- Verificar campos turísticos
  tourism_license IS NOT NULL AS has_tourism_license,
  license_type IS NOT NULL AS has_license_type,
  property_type IS NOT NULL AS has_property_type,
  max_guests IS NOT NULL AND max_guests > 0 AS has_max_guests,
  num_bedrooms IS NOT NULL AND num_bedrooms >= 0 AS has_num_bedrooms,
  num_bathrooms IS NOT NULL AND num_bathrooms >= 0 AS has_num_bathrooms,
  
  -- Verificar campos propietario
  owner_name IS NOT NULL AND owner_name != '' AS has_owner_name,
  owner_email IS NOT NULL AND owner_email != '' AS has_owner_email,
  owner_phone IS NOT NULL AND owner_phone != '' AS has_owner_phone,
  owner_id_type IS NOT NULL AS has_owner_id_type,
  owner_id_number IS NOT NULL AND owner_id_number != '' AS has_owner_id_number,
  
  -- Verificar credenciales SES
  ses_landlord_code IS NOT NULL AS has_ses_landlord_code,
  ses_username IS NOT NULL AS has_ses_username,
  ses_api_password IS NOT NULL AS has_ses_api_password,
  ses_establishment_code IS NOT NULL AS has_ses_establishment_code,
  
  -- Estado Lynx (después del registro)
  lynx_lodging_id IS NOT NULL AS is_registered_in_lynx
  
FROM properties
WHERE id = '{property_id}';


-- ============================================
-- 6. DESPUÉS DEL REGISTRO: VERIFICAR QUE SE GUARDARON LOS IDs LYNX
-- ============================================

-- Ejecutar DESPUÉS de llamar a lynx-register-lodging
SELECT 
  id,
  name,
  lynx_lodging_id,
  lynx_account_id,
  lynx_authority_connection_id,
  lynx_lodging_status,
  updated_at
FROM properties
WHERE id = '{property_id}';

-- Verificar que los valores son los esperados:
-- ✅ lynx_lodging_id: UUID (no null)
-- ✅ lynx_account_id: 'a190fff8-c5d0-49a2-80a8-79b38ce0f284'
-- ✅ lynx_authority_connection_id: '18b8c296-5ffb-4015-a5e9-8e0fb5050dc4'
-- ✅ lynx_lodging_status: 'active'


-- ============================================
-- 7. CONTAR PROPIEDADES POR ESTADO DE REGISTRO
-- ============================================

-- Estadísticas generales de propiedades registradas
SELECT 
  COUNT(*) AS total_properties,
  COUNT(lynx_lodging_id) AS registered_in_lynx,
  COUNT(*) - COUNT(lynx_lodging_id) AS not_registered,
  COUNT(CASE WHEN lynx_lodging_status = 'active' THEN 1 END) AS active_lodgings,
  COUNT(CASE WHEN lynx_lodging_status = 'pending_validation' THEN 1 END) AS pending_lodgings
FROM properties;


-- ============================================
-- 8. LISTAR TODAS LAS PROPIEDADES REGISTRADAS EN LYNX
-- ============================================

SELECT 
  id,
  name,
  city,
  num_bedrooms,
  lynx_lodging_id,
  lynx_lodging_status,
  created_at
FROM properties
WHERE lynx_lodging_id IS NOT NULL
ORDER BY created_at DESC;


-- ============================================
-- 9. BUSCAR PROPIEDADES LISTAS PARA REGISTRAR
-- ============================================

-- Propiedades con todos los campos completos pero aún no registradas
SELECT 
  id,
  name,
  city,
  tourism_license,
  ses_establishment_code,
  lynx_lodging_id
FROM properties
WHERE 
  -- Datos completos
  name IS NOT NULL
  AND address IS NOT NULL
  AND city IS NOT NULL
  AND province IS NOT NULL
  AND postal_code IS NOT NULL
  AND tourism_license IS NOT NULL
  AND license_type IS NOT NULL
  AND property_type IS NOT NULL
  AND max_guests IS NOT NULL
  AND num_bedrooms IS NOT NULL
  AND num_bathrooms IS NOT NULL
  AND owner_name IS NOT NULL
  AND owner_email IS NOT NULL
  AND owner_phone IS NOT NULL
  AND owner_id_type IS NOT NULL
  AND owner_id_number IS NOT NULL
  AND ses_landlord_code IS NOT NULL
  AND ses_username IS NOT NULL
  AND ses_api_password IS NOT NULL
  AND ses_establishment_code IS NOT NULL
  -- Pero no registrada
  AND lynx_lodging_id IS NULL
ORDER BY created_at DESC;


-- ============================================
-- 10. LIMPIAR DATOS DE PRUEBA (Usar con precaución)
-- ============================================

-- ⚠️ SOLO EJECUTAR SI NECESITAS RESETEAR LA PROPIEDAD DE PRUEBA

-- Limpiar solo los IDs de Lynx (para poder re-registrar)
-- UPDATE properties
-- SET 
--   lynx_lodging_id = NULL,
--   lynx_account_id = NULL,
--   lynx_authority_connection_id = NULL,
--   lynx_lodging_status = NULL,
--   updated_at = NOW()
-- WHERE id = '{property_id}';

-- Eliminar completamente la propiedad de prueba
-- DELETE FROM properties
-- WHERE id = '{property_id}';


-- ============================================
-- 11. VERIFICAR MIGRACIONES APLICADAS
-- ============================================

-- Ver todas las migraciones relacionadas con Lynx/SES
SELECT *
FROM supabase_migrations.schema_migrations
WHERE version LIKE '%lynx%' OR version LIKE '%ses%'
ORDER BY version DESC;


-- ============================================
-- NOTAS FINALES
-- ============================================

/*
 * ORDEN RECOMENDADO DE EJECUCIÓN:
 * 
 * ANTES DE CREAR LA PROPIEDAD:
 * 1. Query #1 - Verificar que lynx_lodging_id existe
 * 2. Query #2 - Ver todos los campos disponibles
 * 
 * DESPUÉS DE CREAR LA PROPIEDAD:
 * 3. Query #3 - Buscar la propiedad por nombre
 * 4. Query #4 - Ver datos completos (copiar el ID real)
 * 5. Query #5 - Verificar que todos los campos están completos
 * 
 * DESPUÉS DE REGISTRAR EN LYNX:
 * 6. Query #6 - Verificar que lynx_lodging_id se guardó
 * 7. Query #7 - Estadísticas generales
 * 8. Query #8 - Listar todas registradas
 * 
 * SI ALGO FALLA:
 * 9. Query #9 - Ver propiedades listas para registrar
 * 10. Query #10 - Limpiar para reintentar (con precaución)
 */


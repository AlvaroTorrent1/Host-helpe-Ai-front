-- supabase/migrations/20251030_add_ses_lynx_fields_to_properties.sql
/**
 * Add SES/Lynx Integration Fields to Properties
 * 
 * Agrega todos los campos necesarios para registrar propiedades en SES Hospedajes
 * a través del proveedor Lynx Check-in. Incluye:
 * - Datos de dirección completa
 * - Datos de la vivienda turística
 * - Datos del propietario
 * - Credenciales SES
 * - IDs de integración con Lynx
 */

-- ========================================
-- 1. DATOS DE DIRECCIÓN COMPLETA
-- ========================================

-- Ciudad (requerido por SES)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS city TEXT;

-- Código postal (requerido por SES)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Provincia (requerido por SES)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS province TEXT;

-- País (default: ES para España)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'ES';

-- ========================================
-- 2. DATOS DE LA VIVIENDA TURÍSTICA
-- ========================================

-- Número de licencia turística (ej: VFT/MA/12345)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS tourism_license TEXT;

-- Tipo de licencia turística
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS license_type TEXT CHECK (
  license_type IN ('VFT', 'VUT', 'VTAR', 'Other')
);

-- Tipo de propiedad
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS property_type TEXT CHECK (
  property_type IN ('apartment', 'house', 'villa', 'room')
);

-- Capacidad máxima de huéspedes
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS max_guests INTEGER CHECK (max_guests > 0);

-- Número de habitaciones
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS num_bedrooms INTEGER CHECK (num_bedrooms >= 0);

-- Número de baños
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS num_bathrooms INTEGER CHECK (num_bathrooms >= 0);

-- ========================================
-- 3. DATOS DEL PROPIETARIO
-- ========================================

-- Nombre completo del propietario
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS owner_name TEXT;

-- Email del propietario
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS owner_email TEXT CHECK (
  owner_email IS NULL OR owner_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Teléfono del propietario (formato internacional)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS owner_phone TEXT;

-- Tipo de documento del propietario
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS owner_id_type TEXT CHECK (
  owner_id_type IN ('DNI', 'NIE', 'PASSPORT')
);

-- Número de documento del propietario
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS owner_id_number TEXT;

-- ========================================
-- 4. CREDENCIALES SES (Sensibles - nunca mostrar en logs)
-- ========================================

-- Código de arrendador en SES Hospedajes
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS ses_landlord_code TEXT;

-- Usuario en SES Hospedajes
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS ses_username TEXT;

-- Contraseña API de SES Hospedajes (encriptada en producción)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS ses_api_password TEXT;

-- Código de establecimiento en SES
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS ses_establishment_code TEXT;

-- ========================================
-- 5. IDs DE INTEGRACIÓN CON LYNX
-- (Guardados después de registrar exitosamente)
-- ========================================

-- ID de cuenta en Lynx (ya existe de migración anterior)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS lynx_account_id TEXT;

-- ID de la conexión de autoridad (authority connection con SES)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS lynx_authority_connection_id TEXT;

-- Estado del lodging en Lynx
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS lynx_lodging_status TEXT CHECK (
  lynx_lodging_status IN ('active', 'pending_validation', 'rejected', 'inactive')
);

-- ========================================
-- 6. ÍNDICES PARA CONSULTAS EFICIENTES
-- ========================================

-- Buscar propiedades por licencia turística
CREATE INDEX IF NOT EXISTS idx_properties_tourism_license 
ON properties(tourism_license);

-- Buscar propiedades por estado de registro en Lynx
CREATE INDEX IF NOT EXISTS idx_properties_lynx_status 
ON properties(lynx_lodging_status);

-- Buscar propiedades por provincia (para estadísticas admin)
CREATE INDEX IF NOT EXISTS idx_properties_province 
ON properties(province);

-- ========================================
-- 7. COMENTARIOS DE DOCUMENTACIÓN
-- ========================================

COMMENT ON COLUMN properties.city IS 
'Ciudad donde se encuentra la propiedad (requerido para SES)';

COMMENT ON COLUMN properties.postal_code IS 
'Código postal de la propiedad (requerido para SES)';

COMMENT ON COLUMN properties.province IS 
'Provincia española (requerido para SES Hospedajes)';

COMMENT ON COLUMN properties.country IS 
'Código de país ISO 3166-1 alpha-2 (default: ES)';

COMMENT ON COLUMN properties.tourism_license IS 
'Número de licencia turística oficial (ej: VFT/MA/12345)';

COMMENT ON COLUMN properties.license_type IS 
'Tipo de licencia: VFT (Vivienda con Fines Turísticos), VUT (Vivienda de Uso Turístico), VTAR (Vivienda Turística Alojamiento Rural), Other';

COMMENT ON COLUMN properties.property_type IS 
'Tipo de propiedad: apartment, house, villa, room';

COMMENT ON COLUMN properties.max_guests IS 
'Capacidad máxima de huéspedes permitida';

COMMENT ON COLUMN properties.num_bedrooms IS 
'Número de habitaciones/dormitorios';

COMMENT ON COLUMN properties.num_bathrooms IS 
'Número de baños';

COMMENT ON COLUMN properties.owner_name IS 
'Nombre completo del propietario registrado';

COMMENT ON COLUMN properties.owner_email IS 
'Email de contacto del propietario';

COMMENT ON COLUMN properties.owner_phone IS 
'Teléfono del propietario en formato internacional';

COMMENT ON COLUMN properties.owner_id_type IS 
'Tipo de documento de identidad del propietario (DNI, NIE, PASSPORT)';

COMMENT ON COLUMN properties.owner_id_number IS 
'Número de documento de identidad del propietario';

COMMENT ON COLUMN properties.ses_landlord_code IS 
'Código de arrendador en el sistema SES Hospedajes del Ministerio del Interior';

COMMENT ON COLUMN properties.ses_username IS 
'Usuario para autenticación en SES Hospedajes';

COMMENT ON COLUMN properties.ses_api_password IS 
'Contraseña API de SES Hospedajes (SENSIBLE - nunca mostrar en logs)';

COMMENT ON COLUMN properties.ses_establishment_code IS 
'Código de establecimiento en SES Hospedajes';

COMMENT ON COLUMN properties.lynx_account_id IS 
'ID de la cuenta en Lynx Check-in (a190fff8-c5d0-49a2-80a8-79b38ce0f284)';

COMMENT ON COLUMN properties.lynx_authority_connection_id IS 
'ID de la conexión de autoridad establecida con SES a través de Lynx';

COMMENT ON COLUMN properties.lynx_lodging_status IS 
'Estado del lodging en Lynx: active (operativo), pending_validation (esperando aprobación), rejected (rechazado), inactive (inactivo)';

-- ========================================
-- 8. LOG DE MIGRACIÓN
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed: Added SES/Lynx integration fields to properties table';
  RAISE NOTICE '📋 Added address fields: city, postal_code, province, country';
  RAISE NOTICE '🏠 Added tourism fields: tourism_license, license_type, property_type, capacity fields';
  RAISE NOTICE '👤 Added owner fields: owner_name, owner_email, owner_phone, owner_id_type, owner_id_number';
  RAISE NOTICE '🔐 Added SES credentials: ses_landlord_code, ses_username, ses_api_password, ses_establishment_code';
  RAISE NOTICE '🔗 Added Lynx integration: lynx_account_id, lynx_authority_connection_id, lynx_lodging_status';
  RAISE NOTICE '🔍 Created indexes for efficient queries';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE: Las credenciales SES son sensibles. Nunca mostrar en logs o frontend.';
  RAISE NOTICE '⚠️  IMPORTANTE: El registro en SES requiere Real Decreto 933/2021 compliance.';
END $$;


-- supabase/migrations/20251106_remove_owner_fields.sql
/**
 * Eliminar campos de datos del propietario
 * 
 * Los datos del propietario no son necesarios para el parte de viajeros.
 * Elimina todos los campos relacionados con el propietario:
 * - owner_name
 * - owner_email
 * - owner_phone
 * - owner_id_type
 * - owner_id_number
 */

-- ========================================
-- ELIMINAR CAMPOS DEL PROPIETARIO
-- ========================================

-- Eliminar nombre del propietario
ALTER TABLE properties
DROP COLUMN IF EXISTS owner_name;

-- Eliminar email del propietario
ALTER TABLE properties
DROP COLUMN IF EXISTS owner_email;

-- Eliminar teléfono del propietario
ALTER TABLE properties
DROP COLUMN IF EXISTS owner_phone;

-- Eliminar tipo de documento del propietario
ALTER TABLE properties
DROP COLUMN IF EXISTS owner_id_type;

-- Eliminar número de documento del propietario
ALTER TABLE properties
DROP COLUMN IF EXISTS owner_id_number;


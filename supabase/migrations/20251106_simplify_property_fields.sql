-- supabase/migrations/20251106_simplify_property_fields.sql
/**
 * Simplificar campos de propiedades
 * 
 * Elimina campos innecesarios y añade campo has_wifi:
 * - Elimina: city, postal_code, province (dirección)
 * - Elimina: tourism_license, license_type (licencia turística)
 * - Elimina: num_bathrooms
 * - Añade: has_wifi (boolean)
 */

-- ========================================
-- 1. ELIMINAR CAMPOS DE DIRECCIÓN
-- ========================================

-- Eliminar ciudad
ALTER TABLE properties
DROP COLUMN IF EXISTS city;

-- Eliminar código postal
ALTER TABLE properties
DROP COLUMN IF EXISTS postal_code;

-- Eliminar provincia
ALTER TABLE properties
DROP COLUMN IF EXISTS province;

-- ========================================
-- 2. ELIMINAR CAMPOS DE LICENCIA TURÍSTICA
-- ========================================

-- Eliminar número de licencia turística
ALTER TABLE properties
DROP COLUMN IF EXISTS tourism_license;

-- Eliminar tipo de licencia
ALTER TABLE properties
DROP COLUMN IF EXISTS license_type;

-- ========================================
-- 3. ELIMINAR NÚMERO DE BAÑOS Y AÑADIR WiFi
-- ========================================

-- Eliminar número de baños
ALTER TABLE properties
DROP COLUMN IF EXISTS num_bathrooms;

-- Añadir campo has_wifi (boolean, nullable)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS has_wifi BOOLEAN;

-- Comentario para el nuevo campo
COMMENT ON COLUMN properties.has_wifi IS '¿La propiedad tiene WiFi disponible para los huéspedes?';


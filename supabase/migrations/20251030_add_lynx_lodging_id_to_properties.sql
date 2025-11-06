-- supabase/migrations/20251030_add_lynx_lodging_id_to_properties.sql
/**
 * Add Lynx Check-in Integration to Properties
 * 
 * Añade columna para mapear propiedades de Host Helper con "lodgings" en Lynx Check-in.
 * Esto permite enviar automáticamente los partes de viajero al Ministerio del Interior
 * a través de la plataforma Lynx Check-in.
 */

-- Add column to store Lynx lodging ID
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS lynx_lodging_id TEXT;

-- Add index for fast lookup when sending traveler data
CREATE INDEX IF NOT EXISTS idx_properties_lynx_lodging_id 
ON properties(lynx_lodging_id);

-- Add comment for documentation
COMMENT ON COLUMN properties.lynx_lodging_id IS 
'ID del alojamiento en Lynx Check-in. Mapea esta propiedad con un lodging en Lynx para enviar partes de viajero automáticamente al Ministerio del Interior (Real Decreto 933/2021).';

-- Log the migration
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Added lynx_lodging_id to properties table';
  RAISE NOTICE 'Gestores can now map properties to Lynx lodgings via the sync tool';
END $$;















-- supabase/migrations/20250121_add_property_name_to_reservations.sql
-- Migración para agregar el nombre de la propiedad a la tabla de reservas

-- Agregar columna property_name a la tabla reservations
ALTER TABLE public.reservations 
ADD COLUMN property_name TEXT;

-- Actualizar los registros existentes con el nombre de la propiedad
UPDATE public.reservations r
SET property_name = p.name
FROM public.properties p
WHERE r.property_id = p.id;

-- Crear una función para sincronizar automáticamente el property_name
CREATE OR REPLACE FUNCTION sync_reservation_property_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Al insertar o actualizar, obtener el nombre de la propiedad
  IF NEW.property_id IS NOT NULL THEN
    SELECT name INTO NEW.property_name
    FROM properties
    WHERE id = NEW.property_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para sincronizar automáticamente el nombre
CREATE TRIGGER trigger_sync_reservation_property_name
  BEFORE INSERT OR UPDATE OF property_id ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION sync_reservation_property_name();

-- Comentario para documentación
COMMENT ON COLUMN public.reservations.property_name IS 'Nombre de la propiedad, sincronizado automáticamente desde properties.name'; 
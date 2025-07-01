-- supabase/migrations/20250118_create_incidents_with_property_view.sql
-- Crear vista incidents_with_property para combinar datos de incidents y properties
-- Esta vista resuelve el problema del frontend que necesita property_name junto con los datos de incidencias

-- Crear la vista incidents_with_property
CREATE VIEW incidents_with_property AS
SELECT 
  i.id,
  i.title,
  i.description,
  i.property_id,
  p.name as property_name,
  i.category,
  i.status,
  i.phone_number,
  i.created_at as date,
  i.created_at,
  i.updated_at,
  i.resolved_at
FROM incidents i
LEFT JOIN properties p ON i.property_id = p.id;

-- Comentario para documentación
COMMENT ON VIEW incidents_with_property IS 'Vista que combina datos de incidencias con nombres de propiedades para el frontend'; 
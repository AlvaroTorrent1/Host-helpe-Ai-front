-- supabase/migrations/20251029_fix_reservation_cascade_delete.sql
-- File location: supabase/migrations/20251029_fix_reservation_cascade_delete.sql
-- 
-- Migración para arreglar la eliminación en cascada de reservas
-- Cuando se elimina una reserva, también se deben eliminar:
-- 1. Todas las solicitudes de parte de viajeros (traveler_form_requests)
-- 2. Todos los datos de viajeros asociados (traveler_form_data) - se eliminan automáticamente via CASCADE existente

-- PROBLEMA ACTUAL:
-- traveler_form_requests.reservation_id usa SET NULL en vez de CASCADE
-- Esto deja registros "huérfanos" sin reserva asociada

-- SOLUCIÓN:
-- Cambiar la foreign key a ON DELETE CASCADE

-- Paso 1: Eliminar la constraint existente
ALTER TABLE public.traveler_form_requests 
DROP CONSTRAINT IF EXISTS traveler_form_requests_reservation_id_fkey;

-- Paso 2: Recrear la constraint con CASCADE
ALTER TABLE public.traveler_form_requests
ADD CONSTRAINT traveler_form_requests_reservation_id_fkey
FOREIGN KEY (reservation_id)
REFERENCES public.reservations(id)
ON DELETE CASCADE;  -- Cambio de SET NULL a CASCADE

-- Comentario para documentación
COMMENT ON CONSTRAINT traveler_form_requests_reservation_id_fkey 
ON public.traveler_form_requests IS 
'Eliminación en cascada: al eliminar una reserva, se eliminan todos los traveler_form_requests asociados y sus datos de viajeros';



















-- supabase/migrations/20251018_add_uuid_to_reservations.sql
-- Agrega columna UUID a reservations para identificación externa
-- Actualiza función add_evaluation_score para trabajar con UUID

-- Agregar columna UUID a reservations
ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS uuid UUID UNIQUE DEFAULT gen_random_uuid();

-- Crear índice para búsquedas rápidas por UUID
CREATE INDEX IF NOT EXISTS idx_reservations_uuid 
ON public.reservations USING btree (uuid);

-- Actualizar función para que acepte UUID en lugar de INTEGER
CREATE OR REPLACE FUNCTION add_evaluation_score(
    p_reservation_uuid UUID,
    p_evaluation NUMERIC(4,2)
)
RETURNS void AS $$
BEGIN
    -- Validar rango de evaluación
    IF p_evaluation < 0 OR p_evaluation > 10 THEN
        RAISE EXCEPTION 'La evaluación debe estar entre 0 y 10';
    END IF;

    -- Actualizar la evaluación usando UUID
    UPDATE public.reservations
    SET 
        evaluation_average = p_evaluation,
        updated_at = now()
    WHERE uuid = p_reservation_uuid;

    -- Validar que se actualizó
    IF NOT FOUND THEN
        RAISE NOTICE 'No se encontró reserva con UUID: %', p_reservation_uuid;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Comentarios de documentación
COMMENT ON COLUMN public.reservations.uuid IS 
'UUID único para identificación externa de la reserva';

COMMENT ON FUNCTION add_evaluation_score(UUID, NUMERIC) IS 
'Agrega o actualiza la puntuación de evaluación (0-10) usando el UUID de la reserva';


-- supabase/migrations/20251018_fix_evaluation_score_overflow.sql
-- Solución para el error "numeric field overflow" en evaluaciones
-- Cambia el campo de evaluación de NUMERIC(3,2) a NUMERIC(4,2)
-- Esto permite valores de 0.00 a 99.99 (escala 0-10)

-- Primero, intentar modificar la columna en la tabla de evaluaciones
-- (si existe con diferentes nombres posibles)
DO $$ 
BEGIN
    -- Intentar con diferentes nombres de tablas y columnas comunes
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'evaluation_scores'
        AND column_name = 'score'
    ) THEN
        ALTER TABLE public.evaluation_scores 
        ALTER COLUMN score TYPE NUMERIC(4,2);
        RAISE NOTICE 'Campo score en evaluation_scores modificado exitosamente';
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'evaluations'
        AND column_name = 'score'
    ) THEN
        ALTER TABLE public.evaluations 
        ALTER COLUMN score TYPE NUMERIC(4,2);
        RAISE NOTICE 'Campo score en evaluations modificado exitosamente';
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reservations'
        AND column_name = 'evaluation_score'
    ) THEN
        ALTER TABLE public.reservations 
        ALTER COLUMN evaluation_score TYPE NUMERIC(4,2);
        RAISE NOTICE 'Campo evaluation_score en reservations modificado exitosamente';
    END IF;
END $$;

-- Crear o reemplazar la función add_evaluation_score
-- Esta función agrega/actualiza la puntuación de evaluación para una reserva
CREATE OR REPLACE FUNCTION add_evaluation_score(
    p_reservation_id INTEGER,
    p_evaluation NUMERIC(4,2)
)
RETURNS void AS $$
BEGIN
    -- Validar que la evaluación esté en el rango permitido (0-10)
    IF p_evaluation < 0 OR p_evaluation > 10 THEN
        RAISE EXCEPTION 'La evaluación debe estar entre 0 y 10';
    END IF;

    -- Actualizar o insertar la evaluación
    -- Ajusta esto según tu estructura de tabla real
    UPDATE public.reservations
    SET 
        evaluation_score = p_evaluation,
        updated_at = now()
    WHERE id = p_reservation_id;

    -- Si no existe la columna, lanzar error informativo
    IF NOT FOUND THEN
        RAISE NOTICE 'No se encontró la reserva con id: %', p_reservation_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Comentario de documentación
COMMENT ON FUNCTION add_evaluation_score(INTEGER, NUMERIC) IS 
'Agrega o actualiza la puntuación de evaluación (0-10) para una reserva específica';


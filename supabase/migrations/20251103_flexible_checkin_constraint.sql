-- supabase/migrations/20251103_flexible_checkin_constraint.sql
-- Migración: Restricción flexible de fecha de check-in
-- 
-- OBJETIVO:
-- Reemplazar la restricción estricta de "check-in debe ser futuro" por una más flexible
-- que permita hasta 5 días en el pasado.
--
-- JUSTIFICACIÓN:
-- - La ley requiere envío del parte de viajeros en 72h (3 días)
-- - Damos margen de 5 días para turistas despistados
-- - Evita errores cuando el turista rellena el parte con 1-2 días de retraso
-- - Más user-friendly sin perder control
--
-- CAMBIOS:
-- - ANTES: checkin_date >= CURRENT_DATE (solo fechas futuras)
-- - AHORA: checkin_date >= CURRENT_DATE - INTERVAL '5 days' (hasta 5 días atrás)
--
-- =============================================================================

-- Paso 1: Eliminar restricción antigua
-- =====================================
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS future_checkin;
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS flexible_checkin_date;

-- Paso 2: Crear nueva restricción flexible
-- =========================================
-- NOT VALID: no valida filas existentes, solo las nuevas
-- Esto evita errores con reservas antiguas de prueba
ALTER TABLE reservations 
ADD CONSTRAINT flexible_checkin_date 
CHECK (checkin_date >= CURRENT_DATE - INTERVAL '5 days')
NOT VALID;

-- Paso 3: Añadir comentario explicativo
-- ======================================
COMMENT ON CONSTRAINT flexible_checkin_date ON reservations IS 
'Permite check-in hasta 5 días en el pasado. Da flexibilidad para turistas que envían el parte con retraso. Ley: 72h, pero somos más flexibles para mejor UX.';

-- =============================================================================
-- EJEMPLOS DE USO
-- =============================================================================

-- ✅ PERMITIDO: Check-in de ayer
-- INSERT INTO reservations (checkin_date, ...) VALUES (CURRENT_DATE - 1, ...);

-- ✅ PERMITIDO: Check-in de hace 3 días (dentro de 5 días)
-- INSERT INTO reservations (checkin_date, ...) VALUES (CURRENT_DATE - 3, ...);

-- ✅ PERMITIDO: Check-in de hace 5 días (límite exacto)
-- INSERT INTO reservations (checkin_date, ...) VALUES (CURRENT_DATE - 5, ...);

-- ❌ RECHAZADO: Check-in de hace 6 días (fuera de margen)
-- INSERT INTO reservations (checkin_date, ...) VALUES (CURRENT_DATE - 6, ...);
-- ERROR: check constraint "flexible_checkin_date" violated

-- ✅ PERMITIDO: Check-in futuro
-- INSERT INTO reservations (checkin_date, ...) VALUES (CURRENT_DATE + 10, ...);

-- =============================================================================
-- NOTAS
-- =============================================================================
-- 
-- 1. La restricción es NOT VALID para no afectar reservas históricas/prueba
-- 2. Solo afecta a INSERT y UPDATE de nuevas filas
-- 3. El margen de 5 días puede ajustarse editando INTERVAL '5 days'
-- 4. Esta restricción mejora la UX sin comprometer la legalidad
-- 5. Los turistas despistados pueden registrarse hasta 5 días después del check-in
--


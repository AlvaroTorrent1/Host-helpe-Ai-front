-- supabase/migrations/20250808_sort_order_robust_fix.sql
-- Robust fix: ensure per-property sequential and non-colliding sort_order for images
-- - Adds unique index (partial) on (property_id, sort_order) for images
-- - Creates function with advisory lock to compute next sort_order safely
-- - Adds BEFORE INSERT trigger to auto-assign/adjust sort_order
-- - Sanitizes existing duplicates before enforcing uniqueness

-- 1) Pre-sanitize existing duplicates for images to avoid index creation failure
WITH prop_max AS (
  SELECT property_id, COALESCE(MAX(sort_order), -1) AS max_sort
  FROM media_files
  WHERE file_type = 'image'
  GROUP BY property_id
),
dups AS (
  SELECT 
    mf.id,
    mf.property_id,
    mf.sort_order,
    mf.created_at,
    ROW_NUMBER() OVER (
      PARTITION BY mf.property_id, mf.sort_order
      ORDER BY mf.created_at, mf.id
    ) AS dup_rn
  FROM media_files mf
  WHERE 
    mf.file_type = 'image'
    AND mf.sort_order IS NOT NULL
),
to_fix AS (
  -- For each duplicate (rn > 1), assign new consecutive sort_orders after the current max per property
  SELECT 
    d.id,
    d.property_id,
    (pm.max_sort + ROW_NUMBER() OVER (
       PARTITION BY d.property_id 
       ORDER BY d.sort_order, d.created_at, d.id
     )) AS new_sort_order
  FROM dups d
  JOIN prop_max pm ON pm.property_id = d.property_id
  WHERE d.dup_rn > 1
)
UPDATE media_files mf
SET sort_order = tf.new_sort_order
FROM to_fix tf
WHERE mf.id = tf.id;

-- 2) Create a partial unique index to enforce uniqueness for images per property
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND indexname = 'media_files_unique_property_image_sort'
  ) THEN
    EXECUTE 'CREATE UNIQUE INDEX media_files_unique_property_image_sort
             ON public.media_files (property_id, sort_order)
             WHERE file_type = ''image''';
  END IF;
END$$;

COMMENT ON INDEX media_files_unique_property_image_sort IS 'Garantiza que no existan sort_order duplicados por propiedad para imágenes';

-- 3) Helper: obtain a stable advisory lock key from UUID
-- Uses hashtextextended to get a BIGINT key from property_id
CREATE OR REPLACE FUNCTION public._lock_key_for_property(p_property_id UUID)
RETURNS BIGINT
LANGUAGE sql
AS $$
  SELECT hashtextextended(p_property_id::text, 0);
$$;

COMMENT ON FUNCTION public._lock_key_for_property(UUID) IS 'Devuelve clave BIGINT para locks de advisory basada en property_id';

-- 4) Function: get next sort_order under advisory lock
CREATE OR REPLACE FUNCTION public.get_next_image_sort_order(p_property_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_key BIGINT;
  v_next INTEGER;
BEGIN
  v_key := public._lock_key_for_property(p_property_id);
  PERFORM pg_advisory_xact_lock(v_key);

  SELECT COALESCE(MAX(sort_order) + 1, 0)
  INTO v_next
  FROM public.media_files
  WHERE property_id = p_property_id
    AND file_type = 'image';

  RETURN v_next;
END;
$$;

COMMENT ON FUNCTION public.get_next_image_sort_order(UUID) IS 'Calcula el siguiente sort_order para imágenes por propiedad bajo lock para evitar colisiones';

-- 5) Trigger: BEFORE INSERT on media_files to assign/adjust sort_order for images
CREATE OR REPLACE FUNCTION public.media_files_assign_sort_order()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_key BIGINT;
  v_exists BOOLEAN;
BEGIN
  -- Solo para imágenes
  IF NEW.file_type = 'image' THEN
    -- Tomar lock por propiedad para serializar concurrencia
    v_key := public._lock_key_for_property(NEW.property_id);
    PERFORM pg_advisory_xact_lock(v_key);

    -- Si no hay sort_order, asignar el siguiente disponible
    IF NEW.sort_order IS NULL THEN
      NEW.sort_order := public.get_next_image_sort_order(NEW.property_id);
    ELSE
      -- Si ya viene informado, asegurar que no colisiona
      SELECT EXISTS (
        SELECT 1 FROM public.media_files
        WHERE property_id = NEW.property_id
          AND file_type = 'image'
          AND sort_order = NEW.sort_order
      ) INTO v_exists;

      IF v_exists THEN
        NEW.sort_order := public.get_next_image_sort_order(NEW.property_id);
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_media_files_assign_sort_order ON public.media_files;
CREATE TRIGGER trg_media_files_assign_sort_order
BEFORE INSERT ON public.media_files
FOR EACH ROW
EXECUTE FUNCTION public.media_files_assign_sort_order();

-- 6) Permissions
GRANT EXECUTE ON FUNCTION public.get_next_image_sort_order(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public._lock_key_for_property(UUID) TO authenticated, service_role;

-- Notas:
-- - No renumeramos tras borrados: mantener huecos es intencionado.
-- - El índice parcial aplica solo a imágenes; documentos no usan sort_order secuencial.
-- - El trigger corrige entradas nulas o en conflicto de forma transparente.



-- supabase/migrations/20250808_sort_order_update_fix.sql
-- Extend robust sort_order handling to UPDATE operations as well
-- - Replace trigger function to exclude self on existence check
-- - Apply trigger BEFORE INSERT OR UPDATE

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
      -- Verificar colisión (excluyendo el propio registro en UPDATE)
      SELECT EXISTS (
        SELECT 1 FROM public.media_files
        WHERE property_id = NEW.property_id
          AND file_type = 'image'
          AND sort_order = NEW.sort_order
          AND (TG_OP = 'INSERT' OR id <> NEW.id)
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
BEFORE INSERT OR UPDATE ON public.media_files
FOR EACH ROW
EXECUTE FUNCTION public.media_files_assign_sort_order();



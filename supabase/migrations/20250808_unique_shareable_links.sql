-- supabase/migrations/20250808_unique_shareable_links.sql
-- Añadir índice único para prevenir duplicados en shareable_links

-- 1. Añadir columna computed para URL normalizada
ALTER TABLE public.shareable_links 
ADD COLUMN IF NOT EXISTS normalized_url TEXT;

-- 2. Función para normalizar URLs
CREATE OR REPLACE FUNCTION public.normalize_url(input_url TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF input_url IS NULL OR trim(input_url) = '' THEN
    RETURN '';
  END IF;
  
  -- Convertir a minúsculas y limpiar espacios
  input_url := lower(trim(input_url));
  
  -- Añadir https si no tiene protocolo
  IF input_url !~ '^https?://' THEN
    input_url := 'https://' || input_url;
  END IF;
  
  -- Remover trailing slash
  input_url := regexp_replace(input_url, '/$', '');
  
  -- Remover parámetros de tracking comunes
  input_url := regexp_replace(input_url, '[?&](utm_[^&]*|fbclid=[^&]*|gclid=[^&]*)', '', 'g');
  input_url := regexp_replace(input_url, '\?$', '');
  
  RETURN input_url;
END;
$$;

-- 3. Actualizar URLs existentes 
UPDATE public.shareable_links 
SET normalized_url = public.normalize_url(public_url)
WHERE normalized_url IS NULL OR normalized_url = '';

-- 4. Trigger para mantener normalized_url actualizada
CREATE OR REPLACE FUNCTION public.update_normalized_url()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.normalized_url := public.normalize_url(NEW.public_url);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_normalized_url ON public.shareable_links;
CREATE TRIGGER trigger_update_normalized_url
  BEFORE INSERT OR UPDATE OF public_url ON public.shareable_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_normalized_url();

-- 5. Crear índice único para prevenir duplicados por propiedad + URL normalizada
-- Usando índice parcial para solo enlaces activos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND indexname = 'shareable_links_unique_property_url'
  ) THEN
    EXECUTE 'CREATE UNIQUE INDEX shareable_links_unique_property_url
             ON public.shareable_links (property_id, normalized_url)
             WHERE is_active = true AND normalized_url IS NOT NULL AND normalized_url != ''''';
  END IF;
END$$;

COMMENT ON INDEX shareable_links_unique_property_url IS 'Previene URLs duplicadas por propiedad para enlaces activos';

-- 6. Permisos
GRANT EXECUTE ON FUNCTION public.normalize_url(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_normalized_url() TO authenticated, service_role;

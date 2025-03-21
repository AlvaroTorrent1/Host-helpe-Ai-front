-- Crear la tabla para almacenar metadatos de medios
CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  size BIGINT NOT NULL,
  dimensions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_media_property_id ON public.media(property_id);
CREATE INDEX IF NOT EXISTS idx_media_file_type ON public.media(file_type);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON public.media(created_at);

-- Política RLS: solo los propietarios de las propiedades pueden ver/gestionar los medios
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Política para SELECT
CREATE POLICY media_select_policy ON public.media 
  FOR SELECT 
  USING (
    property_id IN (
      SELECT id FROM public.properties 
      WHERE owner_id = auth.uid()
    )
  );

-- Política para INSERT
CREATE POLICY media_insert_policy ON public.media 
  FOR INSERT 
  WITH CHECK (
    property_id IN (
      SELECT id FROM public.properties 
      WHERE owner_id = auth.uid()
    )
  );

-- Política para UPDATE
CREATE POLICY media_update_policy ON public.media 
  FOR UPDATE 
  USING (
    property_id IN (
      SELECT id FROM public.properties 
      WHERE owner_id = auth.uid()
    )
  );

-- Política para DELETE
CREATE POLICY media_delete_policy ON public.media 
  FOR DELETE 
  USING (
    property_id IN (
      SELECT id FROM public.properties 
      WHERE owner_id = auth.uid()
    )
  );

-- Añadir comentarios para documentación
COMMENT ON TABLE public.media IS 'Almacena metadatos de imágenes y videos asociados a propiedades';
COMMENT ON COLUMN public.media.id IS 'Identificador único del medio';
COMMENT ON COLUMN public.media.property_id IS 'Referencia a la propiedad a la que pertenece el medio';
COMMENT ON COLUMN public.media.file_name IS 'Nombre del archivo en el storage';
COMMENT ON COLUMN public.media.file_type IS 'Tipo de archivo: imagen o video';
COMMENT ON COLUMN public.media.url IS 'URL pública del archivo';
COMMENT ON COLUMN public.media.thumbnail_url IS 'URL de la miniatura (para videos)';
COMMENT ON COLUMN public.media.size IS 'Tamaño del archivo en bytes';
COMMENT ON COLUMN public.media.dimensions IS 'Dimensiones en píxeles (ancho y alto)';
COMMENT ON COLUMN public.media.created_at IS 'Fecha de creación';
COMMENT ON COLUMN public.media.metadata IS 'Metadatos adicionales del archivo'; 
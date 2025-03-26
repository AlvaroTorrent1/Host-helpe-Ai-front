-- Crear la tabla para almacenar documentos de propiedades
CREATE TABLE IF NOT EXISTS public.property_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('faq', 'guide', 'house_rules', 'inventory', 'other')),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'doc', 'txt', 'other')),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_property_documents_property_id ON public.property_documents(property_id);
CREATE INDEX IF NOT EXISTS idx_property_documents_type ON public.property_documents(type);
CREATE INDEX IF NOT EXISTS idx_property_documents_uploaded_at ON public.property_documents(uploaded_at);

-- Política RLS: solo los propietarios de las propiedades pueden ver/gestionar los documentos
ALTER TABLE public.property_documents ENABLE ROW LEVEL SECURITY;

-- Política para SELECT
CREATE POLICY property_documents_select_policy ON public.property_documents 
  FOR SELECT 
  USING (
    property_id IN (
      SELECT id FROM public.properties 
      WHERE owner_id = auth.uid()
    )
  );

-- Política para INSERT
CREATE POLICY property_documents_insert_policy ON public.property_documents 
  FOR INSERT 
  WITH CHECK (
    property_id IN (
      SELECT id FROM public.properties 
      WHERE owner_id = auth.uid()
    )
  );

-- Política para UPDATE
CREATE POLICY property_documents_update_policy ON public.property_documents 
  FOR UPDATE 
  USING (
    property_id IN (
      SELECT id FROM public.properties 
      WHERE owner_id = auth.uid()
    )
  );

-- Política para DELETE
CREATE POLICY property_documents_delete_policy ON public.property_documents 
  FOR DELETE 
  USING (
    property_id IN (
      SELECT id FROM public.properties 
      WHERE owner_id = auth.uid()
    )
  );

-- Añadir comentarios para documentación
COMMENT ON TABLE public.property_documents IS 'Almacena documentos y sus metadatos asociados a propiedades';
COMMENT ON COLUMN public.property_documents.id IS 'Identificador único del documento';
COMMENT ON COLUMN public.property_documents.property_id IS 'Referencia a la propiedad a la que pertenece el documento';
COMMENT ON COLUMN public.property_documents.name IS 'Nombre descriptivo del documento';
COMMENT ON COLUMN public.property_documents.description IS 'Descripción del contenido del documento';
COMMENT ON COLUMN public.property_documents.type IS 'Tipo de documento: faq, guía, reglas, inventario u otro';
COMMENT ON COLUMN public.property_documents.file_url IS 'URL pública del archivo';
COMMENT ON COLUMN public.property_documents.file_name IS 'Nombre del archivo en el storage';
COMMENT ON COLUMN public.property_documents.file_type IS 'Tipo de archivo: pdf, doc, txt u otro';
COMMENT ON COLUMN public.property_documents.uploaded_at IS 'Fecha de subida';
COMMENT ON COLUMN public.property_documents.created_at IS 'Fecha de creación en la base de datos'; 
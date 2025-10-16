-- Migration: Create media_files table
-- Date: 2025-10-16
-- Description: Creates the media_files table that is used extensively in the workflow but was missing from migrations
-- This migration reverse-engineers the schema based on workflow usage and existing functions

-- 1. Create media_files table
CREATE TABLE IF NOT EXISTS public.media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  property_name TEXT, -- Synced automatically with property
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'document')),
  category TEXT, -- e.g., 'exterior', 'interior', 'amenities'
  subcategory TEXT, -- More specific classification
  title TEXT,
  file_url TEXT NOT NULL, -- Storage path
  public_url TEXT, -- Public accessible URL
  file_size BIGINT,
  mime_type TEXT,
  sort_order INTEGER DEFAULT 0, -- For ordering images
  ai_description TEXT, -- AI-generated description
  n8n_metadata JSONB DEFAULT '{}', -- n8n processing metadata (vectorization status, etc)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_files_property_id ON public.media_files(property_id);
CREATE INDEX IF NOT EXISTS idx_media_files_file_type ON public.media_files(file_type);
CREATE INDEX IF NOT EXISTS idx_media_files_created_at ON public.media_files(created_at);
CREATE INDEX IF NOT EXISTS idx_media_files_category ON public.media_files(category) WHERE category IS NOT NULL;

-- 3. Create partial unique index for images (already exists from sort_order fix, but ensure it)
CREATE UNIQUE INDEX IF NOT EXISTS media_files_unique_property_image_sort
  ON public.media_files (property_id, sort_order)
  WHERE file_type = 'image';

-- 4. Enable RLS
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
-- Policy for SELECT
CREATE POLICY "Users can view media_files for their properties" ON public.media_files
  FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM public.properties 
      WHERE user_id = auth.uid()
    )
  );

-- Policy for INSERT
CREATE POLICY "Users can insert media_files for their properties" ON public.media_files
  FOR INSERT
  WITH CHECK (
    property_id IN (
      SELECT id FROM public.properties 
      WHERE user_id = auth.uid()
    )
  );

-- Policy for UPDATE
CREATE POLICY "Users can update media_files for their properties" ON public.media_files
  FOR UPDATE
  USING (
    property_id IN (
      SELECT id FROM public.properties 
      WHERE user_id = auth.uid()
    )
  );

-- Policy for DELETE
CREATE POLICY "Users can delete media_files for their properties" ON public.media_files
  FOR DELETE
  USING (
    property_id IN (
      SELECT id FROM public.properties 
      WHERE user_id = auth.uid()
    )
  );

-- Service role can manage all media_files
CREATE POLICY "Service role can manage all media_files" ON public.media_files
  FOR ALL
  USING (auth.role() = 'service_role');

-- 6. Create trigger to sync property_name
CREATE OR REPLACE FUNCTION public.sync_media_files_property_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Al insertar, obtener el nombre de la propiedad
  IF TG_OP = 'INSERT' THEN
    NEW.property_name := (
      SELECT name FROM public.properties 
      WHERE id = NEW.property_id
    );
  END IF;
  
  -- Si se actualiza property_id, actualizar también property_name
  IF TG_OP = 'UPDATE' AND OLD.property_id IS DISTINCT FROM NEW.property_id THEN
    NEW.property_name := (
      SELECT name FROM public.properties 
      WHERE id = NEW.property_id
    );
  END IF;
  
  -- Actualizar updated_at
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_media_files_property_name_trigger
  BEFORE INSERT OR UPDATE ON public.media_files
  FOR EACH ROW
  EXECUTE FUNCTION sync_media_files_property_name();

-- 7. Sync when property name changes
CREATE OR REPLACE FUNCTION public.update_media_files_property_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar property_name en media_files cuando cambia en properties
  UPDATE public.media_files 
  SET property_name = NEW.name
  WHERE property_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_media_files_property_name_trigger
  AFTER UPDATE OF name ON public.properties
  FOR EACH ROW
  WHEN (OLD.name IS DISTINCT FROM NEW.name)
  EXECUTE FUNCTION update_media_files_property_name();

-- 8. Add comments for documentation
COMMENT ON TABLE public.media_files IS 'Stores media files (images, videos, documents) associated with properties';
COMMENT ON COLUMN public.media_files.id IS 'Unique identifier';
COMMENT ON COLUMN public.media_files.property_id IS 'Reference to the property';
COMMENT ON COLUMN public.media_files.property_name IS 'Property name (synced automatically)';
COMMENT ON COLUMN public.media_files.file_type IS 'Type: image, video, or document';
COMMENT ON COLUMN public.media_files.category IS 'Category for organization (exterior, interior, etc)';
COMMENT ON COLUMN public.media_files.subcategory IS 'More specific classification';
COMMENT ON COLUMN public.media_files.title IS 'Display title';
COMMENT ON COLUMN public.media_files.file_url IS 'Storage file path';
COMMENT ON COLUMN public.media_files.public_url IS 'Public accessible URL';
COMMENT ON COLUMN public.media_files.sort_order IS 'Order for displaying images (images only)';
COMMENT ON COLUMN public.media_files.ai_description IS 'AI-generated description of the image';
COMMENT ON COLUMN public.media_files.n8n_metadata IS 'n8n workflow metadata (vectorization status, execution IDs, etc)';

-- 9. Grant permissions
GRANT ALL ON public.media_files TO authenticated;
GRANT ALL ON public.media_files TO service_role;


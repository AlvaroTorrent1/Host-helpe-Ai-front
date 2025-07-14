-- Enable document vectorization system
-- This migration creates all necessary components for semantic search on documents

-- 1. Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- 2. Create documents table for vectorized content
CREATE TABLE IF NOT EXISTS public.documents (
    id BIGSERIAL PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    property_name TEXT,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX documents_embedding_idx ON public.documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX documents_property_id_idx ON public.documents(property_id);
CREATE INDEX documents_metadata_idx ON public.documents USING GIN (metadata);

-- Add comments
COMMENT ON TABLE public.documents IS 'Almacena documentos vectorizados para búsqueda semántica';
COMMENT ON COLUMN public.documents.property_id IS 'ID de la propiedad asociada';
COMMENT ON COLUMN public.documents.property_name IS 'Nombre de la propiedad (sincronizado automáticamente)';
COMMENT ON COLUMN public.documents.content IS 'Contenido extraído del documento';
COMMENT ON COLUMN public.documents.metadata IS 'Metadatos adicionales del documento (file_id, page_number, etc)';
COMMENT ON COLUMN public.documents.embedding IS 'Vector de embedding para búsqueda semántica';

-- 3. Create semantic search function
CREATE OR REPLACE FUNCTION public.match_documents (
    query_embedding vector(1536),
    match_count int DEFAULT NULL,
    filter jsonb DEFAULT '{}'
)
RETURNS TABLE (
    id bigint,
    content text,
    metadata jsonb,
    similarity float
)
LANGUAGE plpgsql
AS $$
#variable_conflict use_column
BEGIN
    RETURN QUERY
    SELECT
        id,
        content,
        metadata,
        1 - (documents.embedding <=> query_embedding) AS similarity
    FROM documents
    WHERE metadata @> filter
    ORDER BY documents.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION public.match_documents IS 'Busca documentos similares basándose en embeddings vectoriales';

-- 4. Enable RLS and create policies
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents from their properties" ON public.documents
    FOR SELECT
    USING (
        property_id IN (
            SELECT id FROM public.properties 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert documents for their properties" ON public.documents
    FOR INSERT
    WITH CHECK (
        property_id IN (
            SELECT id FROM public.properties 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their property documents" ON public.documents
    FOR UPDATE
    USING (
        property_id IN (
            SELECT id FROM public.properties 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their property documents" ON public.documents
    FOR DELETE
    USING (
        property_id IN (
            SELECT id FROM public.properties 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage all documents" ON public.documents
    FOR ALL
    USING (auth.role() = 'service_role');

-- 5. Create sync triggers
CREATE OR REPLACE FUNCTION public.sync_document_property_name()
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

CREATE TRIGGER sync_document_property_name_trigger
    BEFORE INSERT OR UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION sync_document_property_name();

-- Sync when property name changes
CREATE OR REPLACE FUNCTION public.update_documents_property_name()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar property_name en documents cuando cambia en properties
    UPDATE public.documents 
    SET property_name = NEW.name
    WHERE property_id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_documents_property_name_trigger
    AFTER UPDATE OF name ON public.properties
    FOR EACH ROW
    WHEN (OLD.name IS DISTINCT FROM NEW.name)
    EXECUTE FUNCTION update_documents_property_name();

-- 6. Create helper functions
CREATE OR REPLACE FUNCTION public.get_documents_for_vectorization(
    p_property_id UUID DEFAULT NULL
)
RETURNS TABLE (
    file_id UUID,
    property_id UUID,
    property_name TEXT,
    file_url TEXT,
    title TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mf.id as file_id,
        mf.property_id,
        mf.property_name,
        mf.file_url,
        mf.title
    FROM public.media_files mf
    WHERE 
        mf.file_type = 'document'
        AND (p_property_id IS NULL OR mf.property_id = p_property_id)
        AND mf.file_url IS NOT NULL
        AND mf.file_url != '#'
        -- Excluir documentos ya procesados
        AND NOT EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.metadata->>'file_id' = mf.id::text
        );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.mark_document_as_vectorized(
    p_file_id UUID,
    p_n8n_execution_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_media_file RECORD;
BEGIN
    -- Obtener información del archivo
    SELECT * INTO v_media_file
    FROM public.media_files
    WHERE id = p_file_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Actualizar metadata en media_files para indicar que fue procesado
    UPDATE public.media_files
    SET n8n_metadata = COALESCE(n8n_metadata, '{}'::jsonb) || 
        jsonb_build_object(
            'vectorized', true,
            'vectorized_at', NOW(),
            'n8n_execution_id', p_n8n_execution_id
        )
    WHERE id = p_file_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_vectorization_stats(
    p_property_id UUID DEFAULT NULL
)
RETURNS TABLE (
    total_documents INTEGER,
    vectorized_documents INTEGER,
    pending_documents INTEGER,
    total_chunks INTEGER,
    avg_chunks_per_document NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH media_stats AS (
        SELECT 
            COUNT(*) FILTER (WHERE file_type = 'document') as total_docs,
            COUNT(*) FILTER (
                WHERE file_type = 'document' 
                AND n8n_metadata->>'vectorized' = 'true'
            ) as vectorized_docs
        FROM public.media_files
        WHERE p_property_id IS NULL OR property_id = p_property_id
    ),
    chunk_stats AS (
        SELECT 
            COUNT(*) as total_chunks,
            COUNT(DISTINCT metadata->>'file_id') as unique_docs
        FROM public.documents
        WHERE p_property_id IS NULL OR property_id = p_property_id
    )
    SELECT 
        media_stats.total_docs::INTEGER,
        media_stats.vectorized_docs::INTEGER,
        (media_stats.total_docs - media_stats.vectorized_docs)::INTEGER,
        COALESCE(chunk_stats.total_chunks, 0)::INTEGER,
        CASE 
            WHEN chunk_stats.unique_docs > 0 
            THEN ROUND(chunk_stats.total_chunks::NUMERIC / chunk_stats.unique_docs, 2)
            ELSE 0
        END
    FROM media_stats, chunk_stats;
END;
$$ LANGUAGE plpgsql;

-- Add comments to helper functions
COMMENT ON FUNCTION public.get_documents_for_vectorization IS 'Obtiene documentos pendientes de vectorización desde media_files';
COMMENT ON FUNCTION public.mark_document_as_vectorized IS 'Marca un documento como procesado para vectorización';
COMMENT ON FUNCTION public.get_vectorization_stats IS 'Obtiene estadísticas sobre el estado de vectorización de documentos'; 
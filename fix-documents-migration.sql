-- Script para migrar documentos FAQs existentes de media_files a documents
-- Este script extrae el contenido de los documentos y los inserta en la tabla documents

-- PASO 1: Insertar documentos FAQs en la tabla documents
-- Por ahora, insertaremos contenido de ejemplo. En producción, N8N debe extraer el contenido real del PDF/DOCX

INSERT INTO documents (property_id, property_name, content, metadata, document_name)
SELECT 
    mf.property_id,
    p.name as property_name,
    -- Contenido de ejemplo con información de WiFi (esto debe ser extraído del documento real)
    CASE 
        WHEN mf.title ILIKE '%faq%' THEN 
            E'INFORMACIÓN DE LA CASA\n\n' ||
            E'WiFi:\n' ||
            E'- Red: CasaVacacional_5G\n' ||
            E'- Contraseña: Welcome2025!\n' ||
            E'- Red alternativa: CasaVacacional_2.4G\n' ||
            E'- Contraseña alternativa: Welcome2025!\n\n' ||
            E'Check-in: 15:00\n' ||
            E'Check-out: 11:00\n\n' ||
            E'Contacto emergencias: +34 600 123 456'
        ELSE mf.title || ' - Documento pendiente de procesamiento'
    END as content,
    jsonb_build_object(
        'media_file_id', mf.id,
        'file_url', mf.file_url,
        'file_type', mf.file_type,
        'original_title', mf.title,
        'upload_date', mf.created_at
    ) as metadata,
    mf.title as document_name
FROM media_files mf
JOIN properties p ON mf.property_id = p.id
WHERE mf.file_type = 'document'
AND NOT EXISTS (
    SELECT 1 FROM documents d 
    WHERE d.metadata->>'media_file_id' = mf.id::text
);

-- PASO 2: Verificar la migración
SELECT 
    d.id,
    d.property_name,
    d.document_name,
    substring(d.content, 1, 100) as content_preview,
    d.created_at
FROM documents d
ORDER BY d.created_at DESC;
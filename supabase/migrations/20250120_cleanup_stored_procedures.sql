-- Migración: 20250120_cleanup_stored_procedures.sql
-- Propósito: Limpiar stored procedures duplicadas y actualizar para usar solo campos existentes
-- Problema: Hay dos versiones de create_property_with_media que causan conflictos
-- Solución: Eliminar versión legacy y actualizar la nueva para usar solo campos que existen

-- 1. Eliminar la función legacy que usa jsonb[] y campos inexistentes
DROP FUNCTION IF EXISTS create_property_with_media(uuid, uuid, jsonb, jsonb[]);

-- 2. Recrear la función actualizada que usa solo campos existentes
CREATE OR REPLACE FUNCTION create_property_with_media(
  p_property_id UUID,
  p_user_id UUID,
  p_property_data JSONB,
  p_media_files JSONB DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
  media_file JSONB;
BEGIN
  -- Clean existing data for idempotency
  PERFORM clean_property_data(p_property_id);
  
  -- Insert/update property - SOLO CAMPOS EXISTENTES
  INSERT INTO properties (
    id, user_id, name, address, description,
    google_business_profile_url, status, created_at, updated_at
  ) VALUES (
    p_property_id,
    p_user_id,
    p_property_data->>'name',
    p_property_data->>'address',
    p_property_data->>'description',
    p_property_data->>'google_business_profile_url',
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    description = EXCLUDED.description,
    google_business_profile_url = EXCLUDED.google_business_profile_url,
    updated_at = NOW();

  -- Insert media files - SOLO CAMPOS EXISTENTES (removido category y subcategory)
  IF p_media_files IS NOT NULL THEN
    FOREACH media_file IN ARRAY p_media_files
    LOOP
      INSERT INTO media_files (
        id, property_id, user_id, file_type, title,
        file_url, public_url, file_size, mime_type, 
        sort_order, is_shareable, ai_description_status, n8n_processing_status,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        p_property_id,
        p_user_id, -- Asegurar que user_id se establece para RLS
        media_file->>'file_type',
        media_file->>'title',
        media_file->>'file_url',
        media_file->>'public_url',
        NULLIF(media_file->>'file_size', '')::BIGINT,
        media_file->>'mime_type',
        COALESCE((media_file->>'sort_order')::INTEGER, 0),
        COALESCE((media_file->>'is_shareable')::BOOLEAN, true),
        COALESCE(media_file->>'ai_description_status', 'pending'),
        COALESCE(media_file->>'n8n_processing_status', 'pending'),
        NOW(),
        NOW()
      );
    END LOOP;
  END IF;

  RETURN QUERY SELECT true, 'Property and media files created successfully';
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT false, SQLERRM;
END;
$$ LANGUAGE plpgsql; 
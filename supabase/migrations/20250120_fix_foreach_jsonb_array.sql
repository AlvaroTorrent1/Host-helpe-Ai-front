-- Migración: 20250120_fix_foreach_jsonb_array.sql
-- Propósito: Arreglar el stored procedure create_property_with_media para manejar correctamente arrays jsonb
-- Problema: FOREACH IN ARRAY no funciona con parámetros jsonb, necesita jsonb_array_elements()
-- Solución: Cambiar la lógica para usar un cursor y jsonb_array_elements()

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

  -- Insert media files usando jsonb_array_elements en lugar de FOREACH IN ARRAY
  IF p_media_files IS NOT NULL AND jsonb_typeof(p_media_files) = 'array' THEN
    -- Iterar sobre elementos del array jsonb usando cursor
    FOR media_file IN SELECT value FROM jsonb_array_elements(p_media_files)
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
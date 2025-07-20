-- Migración: 20250120_fix_property_webhook_schema.sql
-- Propósito: Actualizar stored procedure create_property_with_media para usar solo campos existentes
-- Problema: La stored procedure intenta usar campos legacy que fueron eliminados de la tabla properties
-- Solución: Remover campos inexistentes y usar solo los campos actuales

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

  -- Insert media files with sort_order support
  IF p_media_files IS NOT NULL THEN
    FOREACH media_file IN ARRAY p_media_files
    LOOP
      INSERT INTO media_files (
        id, property_id, file_type, category, subcategory, title,
        file_url, public_url, file_size, mime_type, created_at, updated_at, sort_order
      ) VALUES (
        gen_random_uuid(),
        p_property_id,
        media_file->>'file_type',
        media_file->>'category',
        media_file->>'subcategory',
        media_file->>'title',
        media_file->>'file_url',
        media_file->>'public_url',
        NULLIF(media_file->>'file_size', '')::BIGINT,
        media_file->>'mime_type',
        NOW(),
        NOW(),
        COALESCE((media_file->>'sort_order')::INTEGER, 0)
      );
    END LOOP;
  END IF;

  RETURN QUERY SELECT true, 'Property and media files created successfully with sort_order';
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT false, SQLERRM;
END;
$$ LANGUAGE plpgsql; 
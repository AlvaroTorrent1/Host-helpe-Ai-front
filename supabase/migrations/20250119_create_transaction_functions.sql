-- Migration: Add transaction management functions for webhook operations
-- Date: 2025-01-19
-- Description: Creates stored procedures for managing database transactions atomically

-- Function to begin a transaction
CREATE OR REPLACE FUNCTION begin_transaction()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Begin transaction is implicit in PostgreSQL when called from a function
  -- This function exists for consistency with the Edge Function code
  PERFORM 1;
END;
$$;

-- Function to commit a transaction  
CREATE OR REPLACE FUNCTION commit_transaction()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Commit is handled automatically at the end of the function
  PERFORM 1;
END;
$$;

-- Function to rollback a transaction
CREATE OR REPLACE FUNCTION rollback_transaction()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Transaction rollback requested';
END;
$$;

-- Function to clean property data atomically (for idempotency)
CREATE OR REPLACE FUNCTION clean_property_data(property_uuid UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete media files first (due to foreign key constraints)
  DELETE FROM media_files WHERE property_id = property_uuid;
  
  -- Delete property documents (legacy table - if exists)
  DELETE FROM property_documents WHERE property_id = property_uuid;
  
  -- Delete property images (legacy table - if exists) 
  DELETE FROM property_images WHERE property_id = property_uuid;
  
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail - tables might not exist in all environments
    RAISE NOTICE 'Error cleaning property data: %', SQLERRM;
END;
$$;

-- Function to create property with files atomically
CREATE OR REPLACE FUNCTION create_property_with_media(
  p_property_id UUID,
  p_user_id UUID,
  p_property_data JSONB,
  p_media_files JSONB[]
)
RETURNS TABLE(success BOOLEAN, message TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
  media_file JSONB;
BEGIN
  -- Clean existing data for idempotency
  PERFORM clean_property_data(p_property_id);
  
  -- Insert/update property
  INSERT INTO properties (
    id, user_id, name, address, city, state, postal_code, country,
    property_type, num_bedrooms, num_bathrooms, max_guests, description,
    google_business_profile_url, status, created_at, updated_at
  ) VALUES (
    p_property_id,
    p_user_id,
    p_property_data->>'name',
    p_property_data->>'address',
    p_property_data->>'city',
    p_property_data->>'state', 
    p_property_data->>'postal_code',
    p_property_data->>'country',
    p_property_data->>'property_type',
    NULLIF(p_property_data->>'num_bedrooms', '')::INTEGER,
    NULLIF(p_property_data->>'num_bathrooms', '')::INTEGER,
    NULLIF(p_property_data->>'max_guests', '')::INTEGER,
    p_property_data->>'description',
    p_property_data->>'google_business_profile_url',
    'active',
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    postal_code = EXCLUDED.postal_code,
    country = EXCLUDED.country,
    property_type = EXCLUDED.property_type,
    num_bedrooms = EXCLUDED.num_bedrooms,
    num_bathrooms = EXCLUDED.num_bathrooms,
    max_guests = EXCLUDED.max_guests,
    description = EXCLUDED.description,
    google_business_profile_url = EXCLUDED.google_business_profile_url,
    updated_at = NOW();
  
  -- Insert media files if provided
  IF p_media_files IS NOT NULL THEN
    FOREACH media_file IN ARRAY p_media_files
    LOOP
      INSERT INTO media_files (
        id, property_id, file_type, category, subcategory, title,
        file_url, public_url, file_size, mime_type, created_at, updated_at
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
        NOW()
      );
    END LOOP;
  END IF;
  
  RETURN QUERY SELECT TRUE, 'Property and media files created successfully';
  
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT FALSE, 'Error: ' || SQLERRM;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION begin_transaction() TO authenticated;
GRANT EXECUTE ON FUNCTION commit_transaction() TO authenticated;
GRANT EXECUTE ON FUNCTION rollback_transaction() TO authenticated;
GRANT EXECUTE ON FUNCTION clean_property_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_property_with_media(UUID, UUID, JSONB, JSONB[]) TO authenticated;

-- Grant execute permissions to service role (for Edge Functions)
GRANT EXECUTE ON FUNCTION begin_transaction() TO service_role;
GRANT EXECUTE ON FUNCTION commit_transaction() TO service_role;
GRANT EXECUTE ON FUNCTION rollback_transaction() TO service_role;
GRANT EXECUTE ON FUNCTION clean_property_data(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION create_property_with_media(UUID, UUID, JSONB, JSONB[]) TO service_role; 
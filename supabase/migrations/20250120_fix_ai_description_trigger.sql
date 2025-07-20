-- Migración: 20250120_fix_ai_description_trigger.sql
-- Propósito: Corregir la lógica del trigger generate_ai_description_for_media
-- Problema: El trigger establece description_source y luego inmediatamente lo marca como 'skipped'
-- Solución: Solo usar procesamiento interno cuando NO hay procesamiento externo pendiente

CREATE OR REPLACE FUNCTION generate_ai_description_for_media()
RETURNS TRIGGER AS $$
DECLARE
  description_prompt TEXT;
  property_info RECORD;
BEGIN
  -- Solo procesar si:
  -- 1. Es INSERT o UPDATE
  -- 2. No hay description_source establecido (no hay procesamiento externo)
  -- 3. ai_description está vacío
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND 
     NEW.description_source IS NULL AND 
     (NEW.ai_description IS NULL OR NEW.ai_description = '') THEN
    
    -- NUEVA LÓGICA: Verificar si se usará procesamiento externo
    IF NEW.n8n_processing_status = 'pending' THEN
      -- Si hay procesamiento externo pendiente, NO establecer description_source
      -- Solo marcar como pendiente para que el webhook externo lo procese
      NEW.ai_description_status := 'pending';
      RAISE LOG 'External AI processing will handle file: % (ID: %)', NEW.title, NEW.id;
    ELSE
      -- Si NO hay procesamiento externo, usar el sistema interno (lógica original)
      -- Obtener información de la propiedad para contexto
      SELECT name, description INTO property_info
      FROM properties 
      WHERE id = NEW.property_id;
      
      -- Construir prompt de descripción basado en el tipo de archivo
      description_prompt := format(
        'Generate a detailed description for this %s file from property "%s". 
         File type: %s, 
         Current title: %s, 
         Current description: %s.
         
         Please provide a professional, detailed description that would be useful for:
         - Property managers and owners
         - Guests staying at the property
         - Maintenance and cleaning staff
         
         Focus on practical details and context. Maximum 200 words.',
        NEW.file_type,
        COALESCE(property_info.name, 'Unknown Property'),
        NEW.file_type,
        NEW.title,
        COALESCE(NEW.description, 'No description provided')
      );
      
      -- Log de la solicitud para generación de descripción IA
      RAISE LOG 'Internal AI description generation requested for file: % (ID: %)', NEW.title, NEW.id;
      
      -- Establecer estado como pendiente para procesamiento IA interno
      NEW.ai_description_status := 'pending';
      NEW.description_source := 'db_trigger_vision_api';
      
      -- Almacenar el prompt en n8n_metadata para procesamiento
      NEW.n8n_metadata := COALESCE(NEW.n8n_metadata, '{}'::jsonb) || 
                          jsonb_build_object(
                            'ai_description_prompt', description_prompt,
                            'ai_request_timestamp', NOW()::text,
                            'property_context', row_to_json(property_info)
                          );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql; 
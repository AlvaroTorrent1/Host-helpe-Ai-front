-- Migración para conectar properties con user_properties
-- Archivo: 20241228100000_connect_properties_user_properties.sql

-- Agregar campo de referencia a la tabla properties principal
ALTER TABLE user_properties 
ADD COLUMN IF NOT EXISTS main_property_id UUID,
ADD CONSTRAINT user_properties_main_property_id_fkey 
  FOREIGN KEY (main_property_id) 
  REFERENCES properties(id) 
  ON DELETE CASCADE;

-- Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_user_properties_main_property_id 
ON user_properties(main_property_id);

-- Agregar comentario descriptivo
COMMENT ON COLUMN user_properties.main_property_id IS 'Referencia a la tabla properties principal del sistema';

-- RLS: Permitir que los usuarios vean solo sus propias user_properties
ALTER TABLE user_properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own user_properties" ON user_properties;
CREATE POLICY "Users can view their own user_properties" 
ON user_properties FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own user_properties" ON user_properties;
CREATE POLICY "Users can insert their own user_properties" 
ON user_properties FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own user_properties" ON user_properties;
CREATE POLICY "Users can update their own user_properties" 
ON user_properties FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own user_properties" ON user_properties;
CREATE POLICY "Users can delete their own user_properties" 
ON user_properties FOR DELETE 
USING (auth.uid() = user_id);

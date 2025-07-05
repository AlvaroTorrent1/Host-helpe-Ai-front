-- supabase/migrations/20250121_create_reservations_table.sql
-- Migración para crear la tabla de reservas

-- Crear función para actualizar updated_at si no existe
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear tabla de reservas
CREATE TABLE public.reservations (
  id SERIAL PRIMARY KEY,
  property_id UUID NOT NULL,
  guest_name TEXT NOT NULL,
  guest_surname TEXT NOT NULL,
  phone_number TEXT NULL,
  nationality TEXT NOT NULL,
  checkin_date DATE NOT NULL,
  checkout_date DATE NOT NULL,
  notes TEXT NULL,
  status TEXT NOT NULL DEFAULT 'active'::text,
  created_at TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT reservations_property_id_fkey 
    FOREIGN KEY (property_id) 
    REFERENCES properties (id) 
    ON DELETE CASCADE,
    
  CONSTRAINT reservations_guest_name_check 
    CHECK (length(guest_name) >= 2),
    
  CONSTRAINT reservations_guest_surname_check 
    CHECK (length(guest_surname) >= 2),
    
  CONSTRAINT reservations_phone_number_check 
    CHECK (phone_number IS NULL OR phone_number ~ '^[\+]?[0-9\s\-\(\)]+$'::text),
    
  CONSTRAINT future_checkin 
    CHECK (checkin_date >= CURRENT_DATE),
    
  CONSTRAINT valid_dates 
    CHECK (checkout_date > checkin_date),
    
  CONSTRAINT valid_status 
    CHECK (status IN ('active', 'cancelled', 'completed'))
);

-- Crear índices para optimizar búsquedas
CREATE INDEX idx_reservations_property_id 
  ON public.reservations USING btree (property_id);

CREATE INDEX idx_reservations_dates 
  ON public.reservations USING btree (checkin_date, checkout_date);

CREATE INDEX idx_reservations_status 
  ON public.reservations USING btree (status);

-- Crear trigger para actualizar updated_at
CREATE TRIGGER trigger_update_reservations_timestamp 
  BEFORE UPDATE ON reservations 
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Crear política RLS para que los usuarios solo vean las reservas de sus propiedades
CREATE POLICY "Users can view reservations for their properties" 
  ON public.reservations
  FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM properties 
      WHERE user_id = auth.uid()
    )
  );

-- Crear política RLS para insertar reservas
CREATE POLICY "Users can insert reservations for their properties" 
  ON public.reservations
  FOR INSERT
  WITH CHECK (
    property_id IN (
      SELECT id FROM properties 
      WHERE user_id = auth.uid()
    )
  );

-- Crear política RLS para actualizar reservas
CREATE POLICY "Users can update reservations for their properties" 
  ON public.reservations
  FOR UPDATE
  USING (
    property_id IN (
      SELECT id FROM properties 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    property_id IN (
      SELECT id FROM properties 
      WHERE user_id = auth.uid()
    )
  );

-- Crear política RLS para eliminar reservas
CREATE POLICY "Users can delete reservations for their properties" 
  ON public.reservations
  FOR DELETE
  USING (
    property_id IN (
      SELECT id FROM properties 
      WHERE user_id = auth.uid()
    )
  );

-- Comentarios para documentación
COMMENT ON TABLE public.reservations IS 'Tabla para almacenar las reservas de las propiedades';
COMMENT ON COLUMN public.reservations.phone_number IS 'Número de teléfono del huésped (opcional)';
COMMENT ON COLUMN public.reservations.nationality IS 'Código ISO de 2 letras de la nacionalidad del huésped';
COMMENT ON COLUMN public.reservations.status IS 'Estado de la reserva: active, cancelled o completed'; 
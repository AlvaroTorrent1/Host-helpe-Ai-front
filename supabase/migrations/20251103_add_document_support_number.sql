-- Migración: Agregar columna document_support_number a traveler_form_data
-- Fecha: 2025-11-03
-- Propósito: Capturar el número de soporte del documento (idSupport) requerido por Lynx API

-- Agregar columna document_support_number
-- Este campo es el número de soporte del documento de identidad (ej: número de serie del DNI/pasaporte)
-- Es obligatorio para adultos según el swagger de Lynx Check-in API
ALTER TABLE traveler_form_data
ADD COLUMN document_support_number TEXT;

-- Actualizar registros existentes con valor temporal
-- (en caso de que haya registros previos)
UPDATE traveler_form_data
SET document_support_number = 'TEMP000000'
WHERE document_support_number IS NULL;

-- Hacer la columna NOT NULL ahora que todos los registros tienen valor
ALTER TABLE traveler_form_data
ALTER COLUMN document_support_number SET NOT NULL;

-- Agregar comentario explicativo
COMMENT ON COLUMN traveler_form_data.document_support_number IS 'Número de soporte del documento de identidad (ej: CHC123456 para DNI). Campo obligatorio para Lynx Check-in API.';


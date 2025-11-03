-- =============================================================================
-- SCRIPT MANUAL: Reenviar Parte de Viajeros a Lynx
-- Form Request ID: 1308514b-1852-4653-9c9d-195b2f5003be
-- Prueba con municipalityCode corregido (sin espacios, 5 caracteres)
-- =============================================================================

-- DATOS DEL PARTE:
-- Propiedad: Cabaña Mirlo Blanco
-- Lodging ID: 3dfc0644-612d-4449-9dd6-de7a9d15b012
-- Check-in: 2025-11-04
-- Check-out: 2025-11-06
-- Viajero: Carlos Martinez Ruiz
-- Ciudad: Madrid (código INE: 28079)

-- PROBLEMA ORIGINAL:
-- El municipalityCode se enviaba como "29 067 0" (con espacios, 7 caracteres)
-- Esto podría ser el campo "too long" que rechazaba Lynx

-- SOLUCIÓN APLICADA:
-- Ahora el código se formatea sin espacios y limitado a 5 caracteres: "28079"
-- Formato estándar INE: 2 dígitos provincia + 3 dígitos municipio

-- =============================================================================
-- PASO 1: Resetear el estado del request para poder reenviar
-- =============================================================================

UPDATE traveler_form_requests
SET 
  lynx_submission_id = NULL,
  lynx_submitted_at = NULL,
  lynx_payload = NULL,
  lynx_response = NULL,
  updated_at = NOW()
WHERE id = '1308514b-1852-4653-9c9d-195b2f5003be';

-- Verificar el reset
SELECT 
  id,
  status,
  num_travelers_completed,
  num_travelers_expected,
  lynx_submission_id,
  lynx_submitted_at
FROM traveler_form_requests
WHERE id = '1308514b-1852-4653-9c9d-195b2f5003be';

-- =============================================================================
-- PASO 2: Llamar manualmente a la Edge Function submit-traveler-form
-- =============================================================================

-- NOTA: Esto NO se puede hacer directamente desde SQL.
-- Necesitas usar uno de estos métodos:

-- OPCIÓN A: Desde la consola del navegador
/*
const response = await fetch('https://blxngmtmknkdmikaflen.supabase.co/functions/v1/submit-traveler-form', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: '62e5dfaa-7317-4cf6-951a-6b6866134e0b',
    traveler_data: {
      first_name: 'Carlos',
      last_name: 'Martinez Ruiz',
      document_type: 'DNI',
      document_number: '53571577T',
      nationality: 'ES',
      birth_date: '1999-12-12',
      gender: 'M',
      email: 'alvarotorrent1@gmail.com',
      phone: '654654654',
      address_street: 'Calle de Meridiano 21',
      address_city: 'Madrid',
      address_postal_code: '28002',
      address_country: 'ES',
      payment_method: 'CASH',
      signature_data: 'SVG_DATA_HERE',
      consent_accepted: true
    }
  })
});

const result = await response.json();
console.log('Resultado:', result);
*/

-- OPCIÓN B: Usar el siguiente endpoint HTTP (cURL)
/*
curl -X POST \
  'https://blxngmtmknkdmikaflen.supabase.co/functions/v1/submit-traveler-form' \
  -H 'Content-Type: application/json' \
  -d '{
    "token": "62e5dfaa-7317-4cf6-951a-6b6866134e0b",
    "traveler_data": {
      "first_name": "Carlos",
      "last_name": "Martinez Ruiz",
      "document_type": "DNI",
      "document_number": "53571577T",
      "nationality": "ES",
      "birth_date": "1999-12-12",
      "gender": "M",
      "email": "alvarotorrent1@gmail.com",
      "phone": "654654654",
      "address_street": "Calle de Meridiano 21",
      "address_city": "Madrid",
      "address_postal_code": "28002",
      "address_country": "ES",
      "payment_method": "CASH",
      "signature_data": "<SVG_SIMPLIFICADO>",
      "consent_accepted": true
    }
  }'
*/

-- OPCIÓN C: MÉTODO MÁS SIMPLE - Simular trigger manual
-- Como el parte ya está completo, podemos forzar el reenvío a Lynx
-- usando una función PostgreSQL que llame a la edge function

-- Primero verificar que los datos del viajero existen
SELECT 
  'Datos del viajero:' as info,
  tfd.first_name,
  tfd.last_name,
  tfd.address_city,
  LENGTH(tfd.signature_data) as signature_length
FROM traveler_form_data tfd
WHERE tfd.form_request_id = '1308514b-1852-4653-9c9d-195b2f5003be';

-- =============================================================================
-- PASO 3: Monitorear el resultado
-- =============================================================================

-- Query de monitoreo completo
SELECT 
  '=== RESULTADO DEL REENVÍO ===' as info,
  tfr.id,
  tfr.status,
  tfr.num_travelers_completed || '/' || tfr.num_travelers_expected as progress,
  tfr.lynx_submission_id IS NOT NULL as enviado_a_lynx,
  tfr.lynx_submitted_at,
  tfr.lynx_response->>'success' as lynx_success,
  tfr.lynx_response->>'error' as lynx_error,
  tfr.lynx_response->>'submissionId' as lynx_submission_id_response,
  -- Ver el municipalityCode enviado
  tfr.lynx_payload->'travelers'->0->'address'->>'municipalityCode' as municipality_code_sent
FROM traveler_form_requests tfr
WHERE tfr.id = '1308514b-1852-4653-9c9d-195b2f5003be';

-- Ver payload completo para debug
SELECT 
  lynx_payload
FROM traveler_form_requests
WHERE id = '1308514b-1852-4653-9c9d-195b2f5003be';

-- =============================================================================
-- VALIDACIÓN DEL CAMBIO: Comparar formato antes/después
-- =============================================================================

/*
ANTES (❌ INCORRECTO):
{
  "address": {
    "municipalityCode": "29 067 0",  // 8 caracteres con espacios
    ...
  }
}

DESPUÉS (✅ CORRECTO):
{
  "address": {
    "municipalityCode": "28079",  // 5 caracteres sin espacios
    ...
  }
}
*/

-- =============================================================================
-- CÓDIGOS INE DE MUNICIPIOS COMUNES (para referencia)
-- =============================================================================
/*
Madrid: 28079
Barcelona: 08019
Málaga: 29067
Sevilla: 41091
Valencia: 46250
Marbella: 29069
Torre del Mar: 29067 (Vélez-Málaga)

Formato: PPMMM
  PP = Provincia (2 dígitos)
  MMM = Municipio (3 dígitos)
*/

-- =============================================================================
-- NOTAS IMPORTANTES
-- =============================================================================
/*
1. La Edge Function submit-traveler-form ya está actualizada con el nuevo formato
2. El código ahora:
   - Elimina espacios: replace(/\s+/g, '')
   - Limita a 5 caracteres: slice(0, 5)
   - Ejemplo: "29 067 0" → "29067"

3. NO es necesario redesplegar la función si ya se desplegó el cambio

4. Para este test específico:
   - Ciudad: Madrid
   - Código INE correcto: "28079" (no "29 067 0")
   - El viajero ya rellenó el formulario con Madrid

5. El reenvío se puede hacer:
   - Desde el navegador (consola)
   - Con cURL
   - O volviendo a enviar el formulario web
*/


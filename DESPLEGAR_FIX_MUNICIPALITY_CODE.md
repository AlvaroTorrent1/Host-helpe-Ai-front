# 🚀 Despliegue: Fix municipalityCode

## 📋 Cambios Aplicados

### Archivo Modificado
✅ `supabase/functions/_shared/lynxCheckinService.ts`

### Cambio Específico (líneas 280-291)

**ANTES:**
```typescript
const municipalityCode = isSpain
  ? (t.ine_code || '29 067 0')  // ❌ Con espacios (8 caracteres)
  : undefined;
```

**DESPUÉS:**
```typescript
// Formatear código INE: eliminar espacios y limitar a 5 caracteres (código de municipio)
// Formato correcto: "29067" (2 dígitos provincia + 3 dígitos municipio)
// El swagger muestra "29 051 6" pero el formato estándar INE es sin espacios
let municipalityCode = undefined;
if (isSpain) {
  const rawCode = t.ine_code || '29067'; // Málaga por defecto
  // Eliminar espacios y quedarnos solo con los primeros 5 dígitos
  municipalityCode = rawCode.replace(/\s+/g, '').slice(0, 5);
}
```

---

## 🚀 Comandos de Despliegue

### Opción 1: Despliegue Directo (Recomendado)

```bash
cd C:\Users\Usuario\Desktop\nuevo-repo

# Desplegar la función
npx supabase functions deploy submit-traveler-form
```

### Opción 2: Si Falla "Cannot find project ref"

```bash
cd C:\Users\Usuario\Desktop\nuevo-repo

# Enlazar el proyecto primero
npx supabase link --project-ref blxngmtmknkdmikaflen

# Luego desplegar
npx supabase functions deploy submit-traveler-form
```

### Opción 3: Despliegue Manual desde Dashboard

1. Ve a **Supabase Dashboard** → **Edge Functions**
2. Busca `submit-traveler-form`
3. Haz clic en **"Deploy new version"** o **"Edit"**
4. El archivo `_shared/lynxCheckinService.ts` se importa automáticamente
5. Haz clic en **"Deploy"**

---

## ✅ Verificar Despliegue Exitoso

Después del despliegue, verifica:

```bash
# Ver las últimas versiones desplegadas
npx supabase functions list
```

Deberías ver:
```
submit-traveler-form    │ v16 │ 2025-11-03T...  │ blxngmtmknkdmikaflen
```

O en el Dashboard:
- **Functions** → **submit-traveler-form**
- Verifica que hay una **nueva versión** con timestamp reciente
- Estado: **ACTIVE** ✅

---

## 🧹 Limpiar Datos de Prueba Anteriores

Antes de hacer el nuevo test, limpia la reserva actual:

```sql
-- =============================================================================
-- LIMPIEZA: Borrar reserva de prueba actual
-- =============================================================================

-- 1. Ver qué vamos a borrar
SELECT 
  r.id as reservation_id,
  r.guest_name,
  r.checkin_date,
  tfr.id as form_request_id,
  tfr.token,
  COUNT(tfd.id) as num_travelers
FROM reservations r
LEFT JOIN traveler_form_requests tfr ON tfr.reservation_id = r.id
LEFT JOIN traveler_form_data tfd ON tfd.form_request_id = tfr.id
WHERE r.id = 75
GROUP BY r.id, r.guest_name, r.checkin_date, tfr.id, tfr.token;

-- 2. Borrar datos de viajeros (cascade debería hacerlo automáticamente)
DELETE FROM traveler_form_data
WHERE form_request_id IN (
  SELECT id FROM traveler_form_requests
  WHERE reservation_id = 75
);

-- 3. Borrar solicitudes de formulario
DELETE FROM traveler_form_requests
WHERE reservation_id = 75;

-- 4. Borrar la reserva
DELETE FROM reservations
WHERE id = 75;

-- 5. Verificar que se borró todo
SELECT 
  'Reservas restantes' as tipo,
  COUNT(*) as cantidad
FROM reservations
WHERE id = 75

UNION ALL

SELECT 
  'Form requests restantes' as tipo,
  COUNT(*) as cantidad
FROM traveler_form_requests
WHERE reservation_id = 75

UNION ALL

SELECT 
  'Viajeros restantes' as tipo,
  COUNT(*) as cantidad
FROM traveler_form_data tfd
JOIN traveler_form_requests tfr ON tfr.id = tfd.form_request_id
WHERE tfr.reservation_id = 75;
```

---

## 🆕 Crear Nueva Reserva de Prueba

Después de limpiar, crea una nueva reserva:

```sql
-- =============================================================================
-- NUEVA RESERVA DE PRUEBA
-- =============================================================================

-- 1. Crear reserva
INSERT INTO reservations (
  property_id,
  guest_name,
  guest_surname,
  phone_number,
  nationality,
  checkin_date,
  checkout_date,
  notes,
  status
)
VALUES (
  '16fbf161-beda-46b7-baca-16243049562d',  -- Cabaña Mirlo Blanco
  'Ana',
  'López García',
  '+34611222333',
  'ES',
  CURRENT_DATE + INTERVAL '1 day',
  CURRENT_DATE + INTERVAL '3 days',
  'Test municipalityCode corregido',
  'active'
)
RETURNING 
  id,
  uuid,
  property_name,
  guest_name,
  guest_surname,
  checkin_date,
  checkout_date;

-- NOTA: Copia el ID de la reserva
-- Ejemplo: id = 76

-- 2. Crear parte de viajeros
WITH new_token AS (
  SELECT gen_random_uuid()::text AS token_value
)
INSERT INTO traveler_form_requests (
  user_id,
  property_id,
  reservation_id,                           -- CAMBIA ESTO: ID de arriba
  token,
  check_in_date,
  check_out_date,
  property_name,
  guest_email,
  guest_phone,
  num_travelers_expected,
  num_travelers_completed,
  status,
  expires_at,
  sent_at
)
SELECT
  'ae4bf72a-c538-4b27-8c1e-7f28ba49de7d',  -- user_id
  '16fbf161-beda-46b7-baca-16243049562d',  -- Cabaña Mirlo Blanco
  76,                                       -- CAMBIA ESTO: ID de la reserva
  new_token.token_value,
  CURRENT_DATE + INTERVAL '1 day',
  CURRENT_DATE + INTERVAL '3 days',
  'Cabaña Mirlo Blanco',
  'ana.lopez@example.com',
  '+34611222333',
  1,
  0,
  'pending',
  CURRENT_DATE + INTERVAL '30 days',
  NOW()
FROM new_token
RETURNING 
  id,
  token,
  property_name,
  guest_email,
  check_in_date,
  check_out_date,
  num_travelers_expected,
  status,
  expires_at;

-- NOTA: Copia el TOKEN para la URL
```

---

## 🧪 Nueva URL de Prueba

Construir la URL con el token nuevo:

```
https://hosthelperai.com/check-in/{TOKEN_AQUI}
```

Ejemplo:
```
https://hosthelperai.com/check-in/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

## 📝 Datos de Prueba para el Formulario

Usa estos datos para rellenar el nuevo formulario:

### Información Personal
- **Nombre:** Ana
- **Primer Apellido:** López
- **Segundo Apellido:** García
- **Tipo de Documento:** DNI
- **Número:** 12345678Z
- **Fecha de Nacimiento:** 1995-03-15
- **Género:** Femenino
- **Nacionalidad:** España

### Residencia
- **País:** España

### Dirección
- **Ciudad:** Málaga
- **Código Postal:** 29001
- **Dirección:** Calle Larios 25
- **Información Adicional:** Piso 3A
- **Código INE:** 29067 (Málaga)

### Contacto
- **Email:** ana.lopez@example.com
- **País del Teléfono:** España (+34)
- **Teléfono:** 611222333

### Método de Pago y Firma
- **Método de Pago:** En destino
- **Firma:** Dibuja cualquier trazo
- **Consentimiento:** ✅ Aceptar

---

## 🔍 Verificar el Resultado

### 1. Logs de la Edge Function

```bash
# Ver logs en tiempo real
npx supabase functions logs submit-traveler-form --follow
```

Buscar estos mensajes:
```
✅ Firma subida correctamente
🔗 URL pública de la firma: https://...
📦 Payload preparado para 1 viajero(s)
✅ Enviado a Lynx exitosamente: {submission_id}
```

### 2. Query SQL de Verificación

```sql
-- Ver el resultado completo
SELECT 
  tfr.id,
  tfr.status,
  tfr.lynx_submission_id,
  tfr.lynx_submitted_at,
  tfr.lynx_response->>'success' as success,
  tfr.lynx_response->>'error' as error,
  -- Ver el municipalityCode enviado
  tfr.lynx_payload->'travelers'->0->'address'->>'municipalityCode' as municipality_code
FROM traveler_form_requests tfr
WHERE tfr.token = '{TOKEN_DEL_NUEVO_TEST}'
ORDER BY tfr.created_at DESC
LIMIT 1;
```

### 3. Resultado Esperado

**Si el fix funciona:**
```json
{
  "status": "completed",
  "lynx_submission_id": "uuid-generado-por-lynx",
  "success": "true",
  "error": null,
  "municipality_code": "29067"  // ✅ 5 caracteres sin espacios
}
```

**Si aún falla:**
```json
{
  "status": "completed",
  "lynx_submission_id": null,
  "success": "false",
  "error": "mensaje de error de Lynx",
  "municipality_code": "29067"
}
```

---

## 📊 Checklist del Test

- [ ] Edge Function redesplegada (versión nueva visible en Dashboard)
- [ ] Reserva anterior borrada (ID 75)
- [ ] Nueva reserva creada (ID 76 o siguiente)
- [ ] Nuevo parte de viajeros creado
- [ ] Token copiado y URL construida
- [ ] Formulario completado con datos de prueba
- [ ] Formulario enviado exitosamente
- [ ] Logs revisados
- [ ] Query SQL ejecutada
- [ ] Resultado verificado

---

## 🎯 Casos Posibles

### ✅ Caso 1: Test Exitoso
```
lynx_submission_id: "uuid"
success: true
municipality_code: "29067"
```
**→ Problema resuelto! Era el municipalityCode** 🎉

### ❌ Caso 2: Aún Falla con "too long"
```
success: false
error: "<no value> is too long"
municipality_code: "29067"
```
**→ Entonces también hay que desplegar el fix de signature**

### ❌ Caso 3: Otro Error Diferente
```
success: false
error: "otro mensaje de error"
```
**→ Nuevo problema, revisar el mensaje específico**

---

**Fecha:** 2025-11-03  
**Estado:** 📦 Listo para Redesplegar  
**Próximo paso:** Ejecutar comandos de despliegue


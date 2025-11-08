# Guía de Prueba: Crear Reserva y Parte de Viajeros para Lynx

## 🎯 Objetivos

1. ✅ Crear una reserva para **1 persona** en la propiedad **Cabaña Mirlo Blanco**
2. ✅ Crear un **enlace del parte de viajeros** para que el turista complete el formulario
3. ✅ **Supervisar el envío automático** a Lynx cuando el turista complete el formulario
4. ✅ **Visualizar y descargar el PDF** del parte de viajeros
5. ✅ Verificar que el parte se envió correctamente al **endpoint de Lynx**

---

## 📋 Información de la Propiedad

- **Nombre:** Cabaña Mirlo Blanco
- **Property ID:** `16fbf161-beda-46b7-baca-16243049562d`
- **Lynx Lodging ID:** `3dfc0644-612d-4449-9dd6-de7a9d15b012`
- **Estado en Lynx:** ✅ `active` (registrado y listo para recibir partes)

---

## 🚀 Paso a Paso

### **Paso 1: Crear la Reserva**

Ejecuta este SQL en Supabase SQL Editor:

```sql
-- Crear reserva para María García López
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
  'María',
  'García López',
  '+34600123456',
  'ES',                                    -- Nacionalidad española
  CURRENT_DATE + INTERVAL '1 day',        -- Check-in mañana
  CURRENT_DATE + INTERVAL '4 days',       -- Check-out en 3 días
  'Reserva de prueba para Lynx',
  'active'
)
RETURNING id, uuid, property_name, guest_name, guest_surname, checkin_date, checkout_date;
```

**📝 Resultado esperado:**

```
| id  | uuid                                 | property_name        | guest_name | guest_surname | checkin_date | checkout_date |
|-----|--------------------------------------|----------------------|------------|---------------|--------------|---------------|
| 123 | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx | Cabaña Mirlo Blanco | María      | García López  | 2025-11-01   | 2025-11-04    |
```

⚠️ **IMPORTANTE:** Copia el `id` de la reserva. Lo necesitarás en el siguiente paso.

---

### **Paso 2: Crear Enlace del Parte de Viajeros**

Ejecuta este SQL (reemplaza `<RESERVATION_ID>` con el ID del paso anterior):

```sql
-- Crear enlace para el parte de viajeros
WITH new_token AS (
  SELECT gen_random_uuid()::text AS token_value
)
INSERT INTO traveler_form_requests (
  user_id,
  property_id,
  reservation_id,                        -- 👈 CAMBIA ESTO
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
  '17917dcc-2678-4b8a-97af-2ca62817b280',  -- Tu user_id (ajusta si es necesario)
  '16fbf161-beda-46b7-baca-16243049562d',
  123,                                      -- 👈 CAMBIA ESTO: ID de la reserva
  new_token.token_value,
  CURRENT_DATE + INTERVAL '1 day',
  CURRENT_DATE + INTERVAL '4 days',
  'Cabaña Mirlo Blanco',
  'maria.garcia@example.com',
  '+34600123456',
  1,                                        -- 1 viajero esperado
  0,                                        -- 0 completados al inicio
  'pending',
  CURRENT_DATE + INTERVAL '30 days',
  NOW()
FROM new_token
RETURNING 
  id,
  token,
  property_name,
  guest_email,
  num_travelers_expected,
  status,
  CONCAT('http://localhost:5173/check-in/', token) AS public_url;
```

**📝 Resultado esperado:**

```
| id  | token                                | property_name        | guest_email             | num_travelers | status  | public_url                                                |
|-----|--------------------------------------|----------------------|-------------------------|---------------|---------|-----------------------------------------------------------|
| 456 | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx | Cabaña Mirlo Blanco | maria.garcia@example.com| 1             | pending | http://localhost:5173/check-in/xxxxxxxx-xxxx-xxxx-xxxx... |
```

⚠️ **IMPORTANTE:** Copia la **URL pública**. Esta es la URL que enviarías al turista.

---

### **Paso 3: Completar el Formulario (Simular Turista)**

1. **Abre la URL pública** en tu navegador
2. El formulario debería cargar con:
   - Nombre de la propiedad: "Cabaña Mirlo Blanco"
   - Fechas de check-in/check-out
   - Email pre-rellenado: maria.garcia@example.com

3. **Completa el formulario** con estos datos de ejemplo:

   | Campo | Valor |
   |-------|-------|
   | Nombre | María |
   | Primer Apellido | García |
   | Segundo Apellido | López |
   | Tipo de Documento | DNI |
   | Número de Documento | 12345678A |
   | Nacionalidad | España (ES) |
   | Fecha de Nacimiento | 1990-05-15 |
   | Género | Mujer (F) |
   | Email | maria.garcia@example.com |
   | Teléfono | +34600123456 |
   | Dirección | Calle Mayor 123 |
   | Ciudad | Madrid |
   | Código Postal | 28001 |
   | País | España (ES) |
   | Método de Pago | Transferencia (TRANS) |

4. **Dibuja una firma** en el canvas
5. **Acepta los términos** y haz clic en **"Enviar Check-in"**

**✅ Resultado esperado:**
- Toast de éxito: "Parte de viajero enviado exitosamente"
- El formulario se deshabilita
- Opción de descargar PDF aparece

---

### **Paso 4: Verificar Datos Guardados**

Ejecuta estos queries para verificar que los datos se guardaron correctamente:

#### **4.1 Ver datos del viajero en la BD**

```sql
SELECT 
  tfd.id,
  tfd.first_name || ' ' || tfd.last_name AS full_name,
  tfd.document_type,
  tfd.document_number,
  tfd.nationality,
  tfd.email,
  tfd.signature_data IS NOT NULL AS has_signature,
  tfd.consent_accepted,
  tfd.submitted_at
FROM traveler_form_data tfd
JOIN traveler_form_requests tfr ON tfr.id = tfd.form_request_id
WHERE tfr.property_id = '16fbf161-beda-46b7-baca-16243049562d'
  AND tfr.guest_email = 'maria.garcia@example.com'
ORDER BY tfd.submitted_at DESC;
```

**✅ Resultado esperado:**
- 1 fila con todos los datos del viajero
- `has_signature` = `true`
- `consent_accepted` = `true`

#### **4.2 Ver estado de la solicitud**

```sql
SELECT 
  tfr.id,
  tfr.property_name,
  tfr.guest_email,
  tfr.num_travelers_expected,
  tfr.num_travelers_completed,
  tfr.status,
  tfr.completed_at,
  tfr.updated_at
FROM traveler_form_requests tfr
WHERE tfr.property_id = '16fbf161-beda-46b7-baca-16243049562d'
  AND tfr.guest_email = 'maria.garcia@example.com'
ORDER BY tfr.created_at DESC
LIMIT 1;
```

**✅ Resultado esperado:**
- `num_travelers_completed` = 1
- `status` = 'completed'
- `completed_at` tiene fecha/hora

---

### **Paso 5: Verificar Envío a Lynx**

Ejecuta este query para ver si el parte se envió correctamente a Lynx:

```sql
SELECT 
  tfr.id,
  tfr.property_name,
  tfr.guest_email,
  tfr.status,
  tfr.lynx_submission_id,
  tfr.lynx_submitted_at,
  tfr.lynx_response->>'success' AS lynx_success,
  tfr.lynx_response->>'status' AS lynx_status,
  tfr.lynx_response->>'submissionId' AS lynx_submission_id_response,
  tfr.lynx_payload IS NOT NULL AS has_payload
FROM traveler_form_requests tfr
WHERE tfr.property_id = '16fbf161-beda-46b7-baca-16243049562d'
  AND tfr.guest_email = 'maria.garcia@example.com'
ORDER BY tfr.created_at DESC
LIMIT 1;
```

**✅ Resultado esperado:**
- `lynx_submission_id` tiene un valor (ej: `sub_xxxxxx`)
- `lynx_submitted_at` tiene fecha/hora
- `lynx_success` = 'true'
- `lynx_status` = 'submitted' o 'accepted'
- `has_payload` = `true`

---

### **Paso 6: Ver Logs de Supabase Edge Functions**

Para confirmar el envío a Lynx:

1. Ve a **Supabase Dashboard** → **Edge Functions**
2. Selecciona `submit-traveler-form`
3. Click en **"Invocations"**
4. Busca la invocación más reciente (debería ser exitosa)
5. Revisa los logs. Deberías ver:

```
📦 Payload preparado para 1 viajero(s)
📤 Enviando parte a Lynx para lodging 3dfc0644-612d-4449-9dd6-de7a9d15b012...
📍 URL: https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/partners-api/v1/accounts/a190fff8-c5d0-49a2-80a8-79b38ce0f284/lodgings/3dfc0644-612d-4449-9dd6-de7a9d15b012/travelers
✅ Parte enviado exitosamente a Lynx
✅ Enviado a Lynx exitosamente: sub_xxxxxx
```

---

### **Paso 7: Descargar PDF del Parte**

#### **Opción A: Desde el frontend (después de enviar)**

Después de completar el formulario, aparece un botón **"Descargar PDF"**.

#### **Opción B: Generar manualmente (si necesitas regenerar)**

🚧 **NOTA:** Actualmente el PDF se genera en el momento del envío y se guarda la URL en `traveler_form_data.pdf_url`.

Para ver la URL del PDF:

```sql
SELECT 
  tfd.id,
  tfd.first_name || ' ' || tfd.last_name AS full_name,
  tfd.pdf_url,
  tfd.pdf_generated_at
FROM traveler_form_data tfd
JOIN traveler_form_requests tfr ON tfr.id = tfd.form_request_id
WHERE tfr.property_id = '16fbf161-beda-46b7-baca-16243049562d'
  AND tfr.guest_email = 'maria.garcia@example.com'
ORDER BY tfd.submitted_at DESC;
```

---

## 🔍 Consultas de Monitoreo Adicionales

### Ver todas las reservas de la propiedad

```sql
SELECT 
  id,
  uuid,
  guest_name || ' ' || guest_surname AS guest_full_name,
  checkin_date,
  checkout_date,
  status,
  created_at
FROM reservations
WHERE property_id = '16fbf161-beda-46b7-baca-16243049562d'
ORDER BY created_at DESC;
```

### Ver todos los enlaces de partes de viajeros

```sql
SELECT 
  id,
  token,
  guest_email,
  check_in_date,
  check_out_date,
  num_travelers_expected,
  num_travelers_completed,
  status,
  lynx_submission_id,
  created_at,
  CONCAT('http://localhost:5173/check-in/', token) AS public_url
FROM traveler_form_requests
WHERE property_id = '16fbf161-beda-46b7-baca-16243049562d'
ORDER BY created_at DESC;
```

### Ver todos los partes de viajeros completados

```sql
SELECT 
  tfd.id,
  tfr.property_name,
  tfd.first_name || ' ' || tfd.last_name AS full_name,
  tfd.document_type,
  tfd.document_number,
  tfd.email,
  tfd.submitted_at,
  tfr.lynx_submission_id
FROM traveler_form_data tfd
JOIN traveler_form_requests tfr ON tfr.id = tfd.form_request_id
WHERE tfr.property_id = '16fbf161-beda-46b7-baca-16243049562d'
ORDER BY tfd.submitted_at DESC;
```

---

## 🧹 Limpiar Datos de Prueba (Opcional)

Si necesitas resetear y volver a hacer la prueba:

```sql
-- Borrar datos de viajeros
DELETE FROM traveler_form_data
WHERE form_request_id IN (
  SELECT id FROM traveler_form_requests
  WHERE guest_email = 'maria.garcia@example.com'
  AND property_id = '16fbf161-beda-46b7-baca-16243049562d'
);

-- Borrar solicitudes de partes
DELETE FROM traveler_form_requests
WHERE guest_email = 'maria.garcia@example.com'
AND property_id = '16fbf161-beda-46b7-baca-16243049562d';

-- Borrar reserva
DELETE FROM reservations
WHERE guest_name = 'María'
AND guest_surname = 'García López'
AND property_id = '16fbf161-beda-46b7-baca-16243049562d';
```

---

## 📚 Documentación Adicional

- **Edge Function:** `supabase/functions/submit-traveler-form/index.ts`
- **Servicio Lynx:** `supabase/functions/_shared/lynxCheckinService.ts`
- **Frontend:** `src/features/sesregistro/SesRegistroPage.tsx`
- **Service:** `src/services/travelerFormsService.ts`

---

## ✅ Checklist de Verificación

- [ ] Reserva creada en `reservations`
- [ ] Enlace creado en `traveler_form_requests` con status `pending`
- [ ] Formulario público accesible vía URL
- [ ] Datos del viajero guardados en `traveler_form_data`
- [ ] Status de `traveler_form_requests` cambió a `completed`
- [ ] `num_travelers_completed` = `num_travelers_expected` (ambos = 1)
- [ ] `lynx_submission_id` presente en `traveler_form_requests`
- [ ] `lynx_submitted_at` tiene fecha/hora
- [ ] `lynx_response` indica éxito (`success: true`)
- [ ] Logs de Edge Function muestran envío exitoso
- [ ] PDF descargable desde el frontend

---

## 🎉 ¡Éxito!

Si todos los puntos del checklist están marcados, el flujo completo funciona correctamente:

1. ✅ Reserva creada
2. ✅ Enlace del parte generado
3. ✅ Turista completó el formulario
4. ✅ Datos guardados en Host Helper
5. ✅ **Parte enviado automáticamente a Lynx**
6. ✅ **Lynx transmitió al Ministerio del Interior (SES Hospedajes)**

El sistema está listo para producción. 🚀
















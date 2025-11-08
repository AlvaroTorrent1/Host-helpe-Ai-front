# 🎯 TEST NUEVO PARTE DE VIAJERO - Cabaña Mirlo Blanco

## ✅ Todo Listo para el Test

**Fecha del test:** 2025-11-01  
**Estado:** ✅ LISTO PARA COMPLETAR

---

## 📋 Datos de la Reserva

### Reserva #64
- **Huésped:** María García López
- **Teléfono:** +34666777888
- **Nacionalidad:** ES (España)
- **Check-in:** 2025-11-03 (en 2 días)
- **Check-out:** 2025-11-06 (3 noches)
- **Estado:** active

### Parte de Viajeros
- **ID:** `2389c096-7420-49bd-b400-f1085021db3c`
- **Token:** `b7dab2de-9561-46c8-87fb-a89a08c1cf43`
- **Viajeros esperados:** 1
- **Viajeros completados:** 0
- **Estado:** pending
- **Expira:** 2025-12-01 (30 días)

### Propiedad
- **Nombre:** Cabaña Mirlo Blanco
- **Lynx Lodging ID:** `3dfc0644-612d-4449-9dd6-de7a9d15b012` ✅
- **Lynx Account ID:** `a190fff8-c5d0-49a2-80a8-79b38ce0f284` ✅

---

## 🔗 URL del Formulario

### Accede al formulario público:

```
http://localhost:5173/check-in/b7dab2de-9561-46c8-87fb-a89a08c1cf43
```

**O en producción:**
```
https://tu-dominio.com/check-in/b7dab2de-9561-46c8-87fb-a89a08c1cf43
```

---

## 📝 Datos de Ejemplo para Completar

### 👤 Información Personal
- **Nombre:** María
- **Primer Apellido:** García
- **Segundo Apellido:** López
- **Nacionalidad:** ES (España)
- **Género:** Femenino (F)

### 📄 Documento de Identidad
- **Tipo de Documento:** DNI
- **Número de Documento:** 12345678Z
- **Fecha de Nacimiento:** 1985-03-20
- **Lugar de Nacimiento:** Madrid (opcional)

### 🏠 Residencia
- **País de Residencia:** ES (España)

### 📍 Dirección
- **Ciudad:** Madrid
- **Código Postal:** 28013
- **Dirección:** Calle Mayor 25
- **Información Adicional:** 3º Izquierda (opcional)

### 📧 Contacto
- **Email:** maria.garcia@example.com
- **Código de País (Teléfono):** +34
- **Teléfono:** 666777888

### 💳 Pago (Opcional)
- **Método de Pago:** CASH (Efectivo)
- **Titular del Pago:** María García López
- **Fecha de Pago:** 2025-11-02

### ✍️ Firma
- Dibuja tu firma en el canvas digital

### ✅ Consentimiento
- ☑️ Acepto la política de privacidad y el tratamiento de datos

---

## 🚀 Flujo del Test Completo

### 1. Acceder al Formulario ✅
- Abre la URL en tu navegador
- Verifica que veas la información de la reserva

### 2. Completar el Formulario
- Haz clic en "Añadir Viajero"
- Completa los 4 pasos del wizard:
  1. **Personal:** Nombre, apellidos, nacionalidad, género
  2. **Documento:** Tipo, número, fecha de nacimiento
  3. **Residencia:** País, dirección completa
  4. **Contacto:** Email, teléfono
- Guarda el viajero

### 3. Información de Pago (Opcional)
- Selecciona método de pago
- Completa datos del titular
- Selecciona fecha de pago

### 4. Firmar
- Dibuja tu firma en el canvas
- La firma se capturará automáticamente

### 5. Enviar el Check-in
- Acepta el consentimiento de privacidad
- Haz clic en **"Enviar Check-in"**

### 6. Proceso Automático (Backend)
El sistema hará **automáticamente**:

1. ✅ Guardar datos en `traveler_form_data`
2. ✅ Actualizar estado a "completed"
3. ✅ Subir firma a Supabase Storage
4. ✅ Convertir nacionalidad ES → ESP (ISO-3)
5. ✅ Convertir documento DNI → NIF
6. ✅ Convertir método de pago CASH → EFECT
7. ✅ **ENVIAR AUTOMÁTICAMENTE A LYNX API**
8. ✅ Guardar respuesta de Lynx en la BD
9. ✅ Lynx transmite al Ministerio del Interior

---

## 🔍 Cómo Verificar que Funcionó

### 1. Verificar en la Base de Datos

```sql
-- Ver el estado del parte
SELECT 
  id,
  status,
  num_travelers_completed,
  num_travelers_expected,
  lynx_submission_id,
  lynx_submitted_at,
  completed_at
FROM traveler_form_requests
WHERE id = '2389c096-7420-49bd-b400-f1085021db3c';

-- Ver los datos del viajero
SELECT 
  id,
  first_name,
  last_name,
  document_type,
  document_number,
  nationality,
  email,
  submitted_at
FROM traveler_form_data
WHERE form_request_id = '2389c096-7420-49bd-b400-f1085021db3c';

-- Ver el payload y respuesta de Lynx
SELECT 
  lynx_payload,
  lynx_response
FROM traveler_form_requests
WHERE id = '2389c096-7420-49bd-b400-f1085021db3c';
```

### 2. Verificar en los Logs de Supabase

1. Ve a **Supabase Dashboard**
2. **Edge Functions** > `submit-traveler-form` > **Logs**
3. Busca estos mensajes (deberían aparecer con timestamps recientes):

```
✅ Traveler data submitted for request 2389c096-7420-49bd-b400-f1085021db3c
🚀 All travelers completed. Sending to Lynx Check-in...
🌐 Lynx API abierta - enviando sin autenticación
📤 Subiendo firma a Storage: account/.../signature-[timestamp].svg
✅ Firma subida correctamente
📦 Payload preparado para 1 viajero(s)
📋 Payload completo: {...}
📤 Enviando parte a Lynx para lodging 3dfc0644-612d-4449-9dd6-de7a9d15b012...
📨 Respuesta de Lynx API (status 200): {...}
✅ Parte enviado exitosamente a Lynx
✅ Enviado a Lynx exitosamente: [submission_id]
```

### 3. Verificar en Supabase Storage

1. Ve a **Supabase Dashboard** > **Storage**
2. Bucket: `traveler-signatures`
3. Busca la ruta:
   ```
   account/a190fff8-c5d0-49a2-80a8-79b38ce0f284/
   lodging/3dfc0644-612d-4449-9dd6-de7a9d15b012/
   report/2389c096-7420-49bd-b400-f1085021db3c/
   signature-[timestamp].svg
   ```

---

## ✅ Checklist del Test

- [ ] URL del formulario accesible
- [ ] Información de la reserva visible correctamente
- [ ] Wizard de añadir viajero funciona
- [ ] Datos del viajero se guardan
- [ ] Firma se captura correctamente
- [ ] Consentimiento se acepta
- [ ] Formulario se envía sin errores
- [ ] Estado cambia a "completed"
- [ ] Firma se sube a Storage
- [ ] **Payload se envía a Lynx API**
- [ ] **Respuesta de Lynx es exitosa**
- [ ] `lynx_submission_id` se guarda en BD
- [ ] `lynx_payload` se guarda en BD
- [ ] `lynx_response` se guarda en BD

---

## 🎯 Resultado Esperado

### ✅ Si todo funciona correctamente:

1. El formulario se completa sin errores
2. Los datos se guardan en `traveler_form_data`
3. La firma se sube a Storage
4. El parte se envía automáticamente a Lynx
5. Lynx responde con éxito:
   ```json
   {
     "success": true,
     "submissionId": "xxx-xxx-xxx",
     "status": "submitted",
     "sesResponse": {
       "partId": "12345",
       "accepted": true
     }
   }
   ```
6. Los datos de Lynx se guardan en la BD
7. El estado del parte es "completed"

### ❌ Si hay algún error:

Los logs de la Edge Function mostrarán el error exacto para debugging.

---

## 📚 Diferencias con el Test Anterior

### ❌ Test Anterior (Reserva #63)
- Nacionalidad: AR (ISO-2) ❌ → Causó error
- Sin validación de undefined ❌
- Sin logging detallado ❌

### ✅ Test Nuevo (Reserva #64)
- Edge Function corregida ✅
- Mapeo ISO-2 → ISO-3 implementado ✅
- Validación de respuestas undefined ✅
- Logging detallado para debugging ✅
- Nacionalidad ES → ESP automáticamente ✅

---

## 📞 Soporte

Si encuentras algún problema durante el test:

1. **Revisa los logs** de la Edge Function
2. **Verifica la BD** con las queries SQL
3. **Copia el error exacto** para análisis
4. **Verifica el payload** enviado a Lynx

---

**¡Listo para el test!** 🚀

Accede a la URL del formulario y completa todos los pasos. 

Cuando termines, avísame y verificaremos juntos que todo se haya enviado correctamente a Lynx.















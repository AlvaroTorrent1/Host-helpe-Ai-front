# ✅ Nuevo Test - Fix municipalityCode Desplegado

## 🎉 Estado: Todo Listo para el Test

### ✅ Checklist Completado
- [x] Edge Function redesplegada (versión 16)
- [x] Fix de `municipalityCode` incluido y activo
- [x] Reserva anterior borrada (ID 75)
- [x] Nueva reserva creada (ID 76)
- [x] Nuevo parte de viajeros generado

---

## 📋 Datos de la Nueva Reserva

### Reserva
- **ID:** 76
- **UUID:** 66f75c8a-3ca4-4af4-94d1-059985368af1
- **Propiedad:** Cabaña Mirlo Blanco
- **Huésped:** Ana López García
- **Check-in:** 2025-11-04
- **Check-out:** 2025-11-06
- **Email:** ana.lopez@example.com
- **Teléfono:** +34611222333

### Parte de Viajeros
- **Form Request ID:** 9b64d20c-f99f-4842-9f1f-380f17b86069
- **Token:** `7803ac49-b94b-47f5-904e-38ad5a5cdd8f`
- **Estado:** pending
- **Viajeros Esperados:** 1
- **Expira:** 2025-12-03

---

## 🔗 URLs del Formulario

### Producción (USAR ESTA)
```
https://hosthelperai.com/check-in/7803ac49-b94b-47f5-904e-38ad5a5cdd8f
```

### Desarrollo (Local)
```
http://localhost:5173/check-in/7803ac49-b94b-47f5-904e-38ad5a5cdd8f
```

---

## 📝 Datos de Prueba para Rellenar el Formulario

### Información Personal
| Campo | Valor |
|-------|-------|
| Nombre | Ana |
| Primer Apellido | López |
| Segundo Apellido | García |
| Tipo de Documento | DNI |
| Número | 12345678Z |
| Fecha de Nacimiento | 1995-03-15 |
| Género | Femenino |
| Nacionalidad | España |

### Residencia
| Campo | Valor |
|-------|-------|
| País de Residencia | España |

### Dirección
| Campo | Valor |
|-------|-------|
| Ciudad | Málaga |
| Código Postal | 29001 |
| Dirección | Calle Larios 25 |
| Información Adicional | Piso 3A |
| Código INE | 29067 |

### Contacto
| Campo | Valor |
|-------|-------|
| Email | ana.lopez@example.com |
| País del Teléfono | España (+34) |
| Teléfono | 611222333 |

### Método de Pago
- **Seleccionar:** En destino

### Firma
- **Dibujar** cualquier trazo en el panel de firma
- **Aceptar** el consentimiento de protección de datos

---

## 🎯 Qué Esperar con el Fix

### Formato del municipalityCode

**ANTES (❌ INCORRECTO):**
```json
{
  "address": {
    "municipalityCode": "29 067 0"  // 8 caracteres con espacios
  }
}
```

**AHORA (✅ CORRECTO):**
```json
{
  "address": {
    "municipalityCode": "29067"  // 5 caracteres sin espacios
  }
}
```

### Resultado Esperado

#### Si el fix resuelve el problema ✅
```json
{
  "success": true,
  "lynx_submission_id": "uuid-generado-por-lynx",
  "lynx_submitted_at": "2025-11-03T...",
  "error": null
}
```

**→ ¡PROBLEMA RESUELTO! Era el municipalityCode** 🎉

#### Si aún falla con el mismo error ❌
```json
{
  "success": false,
  "error": "<no value> is too long"
}
```

**→ Entonces también hay que aplicar el fix de `signature` (URL pública)**

---

## 🔍 Verificación Post-Test

### 1. Logs de la Edge Function

Después de enviar el formulario, revisa los logs:

```
Supabase Dashboard > Functions > submit-traveler-form > Invocations
```

Buscar:
```
✅ Firma subida correctamente
🔗 URL pública de la firma: https://...
📦 Payload preparado para 1 viajero(s)
✅ Enviado a Lynx exitosamente: {submission_id}
```

O si falla:
```
❌ Lynx submission error: { message: "..." }
```

### 2. Query SQL de Verificación

```sql
-- Ver el resultado del envío
SELECT 
  tfr.id,
  tfr.status,
  tfr.lynx_submission_id,
  tfr.lynx_submitted_at,
  tfr.lynx_response->>'success' as success,
  tfr.lynx_response->>'error' as error,
  tfr.lynx_response->>'submissionId' as submission_id,
  -- Ver el municipalityCode enviado
  tfr.lynx_payload->'travelers'->0->'address'->>'municipalityCode' as municipality_code_sent
FROM traveler_form_requests tfr
WHERE tfr.id = '9b64d20c-f99f-4842-9f1f-380f17b86069';
```

### 3. Ver el Payload Completo

```sql
-- Ver el payload JSON completo enviado a Lynx
SELECT 
  jsonb_pretty(lynx_payload) as payload_formateado
FROM traveler_form_requests
WHERE id = '9b64d20c-f99f-4842-9f1f-380f17b86069';
```

---

## 📊 Análisis del Resultado

### Caso 1: ✅ Éxito Total
```
status: "completed"
lynx_submission_id: "uuid"
success: "true"
error: null
municipality_code_sent: "29067"
```

**Conclusión:** El problema era el `municipalityCode`. Fix exitoso.  
**Acción:** Documentar y cerrar el issue.

### Caso 2: ❌ Mismo Error
```
status: "completed"
lynx_submission_id: null
success: "false"
error: "<no value> is too long"
municipality_code_sent: "29067"
```

**Conclusión:** El `municipalityCode` está correcto, pero hay otro campo "too long".  
**Acción:** Aplicar también el fix de `signature` (ya preparado pero no desplegado).

### Caso 3: ❌ Error Diferente
```
success: "false"
error: "otro mensaje"
```

**Conclusión:** Problema diferente, analizar el nuevo mensaje de error.  
**Acción:** Revisar el mensaje específico y documentación de Lynx.

---

## 🔧 Si Necesitas Reenviar

Si quieres resetear y reenviar el mismo parte:

```sql
-- Resetear el estado
UPDATE traveler_form_requests
SET 
  lynx_submission_id = NULL,
  lynx_submitted_at = NULL,
  lynx_payload = NULL,
  lynx_response = NULL
WHERE id = '9b64d20c-f99f-4842-9f1f-380f17b86069';

-- Borrar el viajero para volver a rellenar
DELETE FROM traveler_form_data
WHERE form_request_id = '9b64d20c-f99f-4842-9f1f-380f17b86069';

-- Actualizar estado a pending
UPDATE traveler_form_requests
SET 
  status = 'pending',
  num_travelers_completed = 0,
  completed_at = NULL
WHERE id = '9b64d20c-f99f-4842-9f1f-380f17b86069';
```

---

## 📞 Información Adicional

### Propiedad de Lynx
- **Lynx Lodging ID:** 3dfc0644-612d-4449-9dd6-de7a9d15b012
- **Lynx Account ID:** a190fff8-c5d0-49a2-80a8-79b38ce0f284
- **Estado:** active

### Códigos INE de Referencia
- **Málaga:** 29067
- **Madrid:** 28079
- **Barcelona:** 08019
- **Sevilla:** 41091
- **Valencia:** 46250

### Edge Function Desplegada
- **Nombre:** submit-traveler-form
- **Versión:** 16
- **Última actualización:** 2025-11-03
- **Estado:** ACTIVE ✅
- **Fix incluido:** municipalityCode formato correcto (5 chars sin espacios)

---

## ✅ Próximo Paso

**🎯 Completar el formulario:**

1. Abre la URL en incógnito:
   ```
   https://hosthelperai.com/check-in/7803ac49-b94b-47f5-904e-38ad5a5cdd8f
   ```

2. Rellena con los datos de arriba

3. Dibuja la firma y acepta consentimiento

4. Envía el formulario

5. Verifica los logs y ejecuta las queries SQL

---

**Fecha:** 2025-11-03  
**Estado:** ✅ LISTO PARA TEST  
**Token:** `7803ac49-b94b-47f5-904e-38ad5a5cdd8f`  
**Reservation ID:** 76  
**Form Request ID:** 9b64d20c-f99f-4842-9f1f-380f17b86069


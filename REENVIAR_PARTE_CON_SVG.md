# 🔄 Reenviar Parte con Firma SVG

## ✅ Cambio Aplicado

**ANTES:** Enviábamos la URL pública de Supabase  
**AHORA:** Enviamos el SVG simplificado directamente

### Código Modificado
```typescript
// Edge Function ahora envía el SVG, no la URL
signatureForLynx = simplifiedSvg;  // SVG directamente
```

---

## 🚀 Comandos para Redesplegar

```bash
cd C:\Users\Usuario\Desktop\nuevo-repo
npx supabase functions deploy submit-traveler-form
```

---

## 🔄 Resetear y Reenviar el Parte

### SQL para Resetear el Parte Actual

```sql
-- 1. Borrar el viajero existente
DELETE FROM traveler_form_data
WHERE form_request_id = '9b64d20c-f99f-4842-9f1f-380f17b86069';

-- 2. Resetear el request a pending
UPDATE traveler_form_requests
SET 
  status = 'pending',
  num_travelers_completed = 0,
  completed_at = NULL,
  lynx_submission_id = NULL,
  lynx_submitted_at = NULL,
  lynx_payload = NULL,
  lynx_response = NULL,
  updated_at = NOW()
WHERE id = '9b64d20c-f99f-4842-9f1f-380f17b86069';

-- 3. Verificar el reset
SELECT 
  id,
  status,
  num_travelers_completed,
  num_travelers_expected,
  lynx_submission_id
FROM traveler_form_requests
WHERE id = '9b64d20c-f99f-4842-9f1f-380f17b86069';
```

---

## 🔗 Recompletar el Formulario

**Misma URL:**
```
https://hosthelperai.com/check-in/7803ac49-b94b-47f5-904e-38ad5a5cdd8f
```

**Datos de prueba:** Usar los mismos datos del documento `NUEVO_TEST_MUNICIPALITY_CODE.md`

---

## 📊 Verificar el Resultado

### 1. Logs a Buscar

```
📝 Procesando firma SVG para Lynx...
📏 Firma simplificada: XXXX caracteres
✅ Enviando firma como SVG (XXXX chars)
📦 Payload preparado para 1 viajero(s)
✅ Enviado a Lynx exitosamente
```

### 2. Query de Verificación

```sql
SELECT 
  status,
  lynx_submission_id,
  lynx_response->>'success' as success,
  lynx_response->>'error' as error,
  LENGTH(lynx_payload->'travelers'->0->>'signature') as signature_length
FROM traveler_form_requests
WHERE id = '9b64d20c-f99f-4842-9f1f-380f17b86069';
```

---

## 🎯 Resultado Esperado

### ✅ Si Funciona
```json
{
  "status": "completed",
  "lynx_submission_id": "uuid",
  "success": "true",
  "error": null,
  "signature_length": 1500  // SVG simplificado
}
```

### ❌ Si Sigue Fallando
Entonces Lynx probablemente espera:
- Un path interno de su S3
- O un formato específico diferente

---

**Estado:** ✅ Código listo para redesplegar  
**Token:** 7803ac49-b94b-47f5-904e-38ad5a5cdd8f  
**Form Request ID:** 9b64d20c-f99f-4842-9f1f-380f17b86069


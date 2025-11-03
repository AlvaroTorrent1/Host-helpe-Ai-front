# 🚀 Prueba de Envío a Lynx Check-in

Este documento contiene toda la información para probar el envío de partes de viajeros a Lynx Check-in desde localhost:4000

## 📋 Datos de Prueba Generados

### Reserva
- **ID**: 82
- **UUID**: 55238594-3cab-4cef-98fb-d2c6e6c25037
- **Propiedad**: Cabaña Mirlo Blanco (ID: `16fbf161-beda-46b7-baca-16243049562d`)
- **Huésped**: Carlos Ramírez Pérez
- **Teléfono**: +34612345678
- **Nacionalidad**: ES (España)
- **Check-in**: 2025-11-04
- **Check-out**: 2025-11-06
- **Estado**: active

### Traveler Form Request
- **ID**: `f26194aa-929c-4ec4-8bac-8b8202a8b07e`
- **Token**: `test-lynx-d597d27e-df1c-471a-aaf3-7b7d787bcd07`
- **Estado**: completed
- **Viajeros esperados**: 1
- **Viajeros completados**: 1

### Datos del Viajero (traveler_form_data)
- **Nombre**: Carlos
- **Apellidos**: Ramírez Pérez
- **Documento**: DNI 12345678A
- **Número de soporte**: AAA123456
- **Nacionalidad**: ES
- **Fecha nacimiento**: 1985-06-15
- **Email**: carlos.ramirez.test@example.com
- **Teléfono**: +34612345678
- **Dirección**: Calle Mayor 123, Málaga 29001, España
- **Método de pago**: CARD

### Propiedad Lynx
- **Lynx Account ID**: a190fff8-c5d0-49a2-80a8-79b38ce0f284
- **Lynx Lodging ID**: 3dfc0644-612d-4449-9dd6-de7a9d15b012
- **Lynx Authority Connection ID**: 18b8c296-5ffb-4015-a5e9-8e0fb5050dc4
- **Estado**: active

## 🌐 URLs y Endpoints

### Edge Function Desplegada
```
POST https://blxngmtmknkdmikaflen.supabase.co/functions/v1/test-lynx-submission
```

**Body**:
```json
{
  "formRequestId": "f26194aa-929c-4ec4-8bac-8b8202a8b07e"
}
```

### Servidor Local de Prueba
```
http://localhost:4000/test-lynx-envio.html
```

## 🧪 Cómo Probar

### Opción 1: Interfaz Web (Recomendada)

1. Abre tu navegador y ve a:
   ```
   http://localhost:4000/test-lynx-envio.html
   ```

2. Verás una página con los datos de prueba

3. Haz clic en el botón "📤 Enviar Parte de Viajeros a Lynx"

4. Observa la respuesta en pantalla

### Opción 2: curl (Línea de comandos)

```bash
curl -X POST \
  https://blxngmtmknkdmikaflen.supabase.co/functions/v1/test-lynx-submission \
  -H "Content-Type: application/json" \
  -d '{"formRequestId":"f26194aa-929c-4ec4-8bac-8b8202a8b07e"}'
```

### Opción 3: Postman / Thunder Client

**Method**: POST  
**URL**: `https://blxngmtmknkdmikaflen.supabase.co/functions/v1/test-lynx-submission`  
**Headers**:
- Content-Type: application/json

**Body** (raw JSON):
```json
{
  "formRequestId": "f26194aa-929c-4ec4-8bac-8b8202a8b07e"
}
```

## 📊 Respuesta Esperada

### Éxito ✅
```json
{
  "success": true,
  "message": "✅ Parte enviado exitosamente a Lynx Check-in",
  "formRequestId": "f26194aa-929c-4ec4-8bac-8b8202a8b07e",
  "submissionId": "...",
  "lynxResponse": {
    "success": true,
    "submissionId": "...",
    "status": "submitted",
    "submittedAt": "2025-11-03T...",
    "sesResponse": {
      "partId": "...",
      "accepted": true
    }
  },
  "travelers": 1
}
```

### Error ❌
```json
{
  "success": false,
  "message": "❌ Error al enviar parte a Lynx Check-in",
  "formRequestId": "f26194aa-929c-4ec4-8bac-8b8202a8b07e",
  "lynxResponse": {
    "success": false,
    "error": "...",
    "status": "error"
  },
  "travelers": 1
}
```

## 🔍 Verificar en Base de Datos

Después de enviar, puedes verificar que los datos se guardaron:

```sql
-- Ver el traveler_form_request actualizado con la respuesta de Lynx
SELECT 
  id,
  property_name,
  status,
  lynx_submission_id,
  lynx_submitted_at,
  lynx_payload,
  lynx_response
FROM traveler_form_requests
WHERE id = 'f26194aa-929c-4ec4-8bac-8b8202a8b07e';
```

## 🛠️ Troubleshooting

### Error: "La propiedad no tiene lynx_lodging_id"
- Verifica que la propiedad tiene el campo `lynx_lodging_id` configurado
- Ejecuta: `SELECT lynx_lodging_id FROM properties WHERE id = '16fbf161-beda-46b7-baca-16243049562d'`

### Error: "No se encontraron datos de viajeros"
- Verifica que existe traveler_form_data
- Ejecuta: `SELECT * FROM traveler_form_data WHERE form_request_id = 'f26194aa-929c-4ec4-8bac-8b8202a8b07e'`

### Error de CORS
- La Edge Function ya tiene CORS habilitado
- Verifica que no hay bloqueadores de CORS en tu navegador

### Error 404 en Edge Function
- Verifica el deployment: `npx supabase functions list`
- Re-despliega si es necesario: `npx supabase functions deploy test-lynx-submission --no-verify-jwt`

## 📝 Logs de Lynx API

La API de Lynx registra:
- URL completa del endpoint
- Payload enviado
- Respuesta recibida
- Status HTTP

Puedes ver los logs en:
- Consola del navegador (F12)
- Supabase Dashboard → Edge Functions → test-lynx-submission → Logs

## 🔐 Seguridad

- La Edge Function usa `SUPABASE_SERVICE_ROLE_KEY` para acceso completo a la base de datos
- No requiere autenticación del usuario (para pruebas)
- En producción, deberías validar permisos del usuario

## 📚 Referencias

- [Lynx Check-in API Docs](https://docs.lynx-checkin.com)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- Archivo principal: `supabase/functions/_shared/lynxCheckinService.ts`

## ✅ Checklist de Prueba

- [ ] Servidor localhost:4000 corriendo
- [ ] Datos de prueba creados en la base de datos
- [ ] Edge Function desplegada
- [ ] Página de prueba accesible en http://localhost:4000/test-lynx-envio.html
- [ ] Click en botón "Enviar"
- [ ] Verificar respuesta exitosa o error detallado
- [ ] Revisar `lynx_response` en la base de datos

---

**Fecha de creación**: 2025-11-03  
**Autor**: Host Helper Testing Team  
**Proyecto**: Host Helper - Lynx Check-in Integration


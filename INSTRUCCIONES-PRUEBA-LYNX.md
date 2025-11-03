# 🎯 Instrucciones para Probar Envío a Lynx Check-in

## ✅ Todo está listo

He generado una **reserva de prueba completa** con datos de viajero para probar el envío a Lynx Check-in API.

## 📝 ¿Qué se ha creado?

1. ✅ **Reserva en la base de datos** (ID: 82)
   - Propiedad: Cabaña Mirlo Blanco
   - Huésped: Carlos Ramírez Pérez
   - Check-in: 2025-11-04
   - Check-out: 2025-11-06

2. ✅ **Parte de viajeros completado**
   - Form Request ID: `f26194aa-929c-4ec4-8bac-8b8202a8b07e`
   - Estado: `completed` (listo para enviar)
   - Datos completos del viajero con firma

3. ✅ **Edge Function desplegada**
   - Nombre: `test-lynx-submission`
   - URL: https://blxngmtmknkdmikaflen.supabase.co/functions/v1/test-lynx-submission

4. ✅ **Página de prueba HTML**
   - Archivo: `test-lynx-envio.html`
   - Servidor local corriendo en puerto 4000

## 🚀 Cómo probar AHORA

### Opción más fácil: Interfaz Web

1. **Abre tu navegador** en:
   ```
   http://localhost:4000/test-lynx-envio.html
   ```

2. **Verás esta pantalla**:
   - Título: "🚀 Test Envío a Lynx Check-in"
   - Datos de la reserva
   - Botón verde: "📤 Enviar Parte de Viajeros a Lynx"

3. **Haz clic en el botón**

4. **Espera unos segundos** mientras:
   - Se muestra un spinner de carga
   - La Edge Function procesa la solicitud
   - Se envía el parte a Lynx API

5. **Verás el resultado**:
   - ✅ Cuadro verde = Éxito
   - ❌ Cuadro rojo = Error (con detalles)

## 📊 ¿Qué hace la Edge Function?

Cuando haces clic en el botón, la función:

1. 🔍 Busca el `traveler_form_request` en la BD
2. 🏠 Verifica que la propiedad tenga `lynx_lodging_id`
3. 👥 Obtiene los datos del viajero
4. 🔄 Mapea los datos al formato Lynx
5. 📤 Envía el parte a Lynx Check-in API
6. 💾 Guarda la respuesta en la BD
7. ✅ Retorna el resultado

## 🔍 Ver los resultados en la Base de Datos

Después de enviar, ejecuta este SQL para ver la respuesta de Lynx:

```sql
SELECT 
  property_name,
  status,
  lynx_submission_id,
  lynx_submitted_at,
  lynx_response
FROM traveler_form_requests
WHERE id = 'f26194aa-929c-4ec4-8bac-8b8202a8b07e';
```

También puedes ejecutar el script completo:
```bash
# En Supabase SQL Editor, ejecuta:
verificar-datos-prueba-lynx.sql
```

## 🎨 Interfaz de la página de prueba

La página HTML muestra:
- 📋 Todos los datos de la reserva y viajero
- 🏠 ID del Lynx Lodging
- 🔘 Botón grande y verde para enviar
- ⏳ Spinner de carga mientras procesa
- ✅/❌ Resultado con colores (verde=éxito, rojo=error)
- 📝 JSON completo de la respuesta de Lynx

## 📁 Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `supabase/functions/test-lynx-submission/index.ts` | Edge Function para enviar a Lynx |
| `test-lynx-envio.html` | Página web de prueba |
| `PRUEBA-LYNX-CHECKIN.md` | Documentación completa |
| `verificar-datos-prueba-lynx.sql` | Script SQL para verificar datos |
| `INSTRUCCIONES-PRUEBA-LYNX.md` | Este archivo |

## ⚠️ Posibles resultados

### ✅ Éxito esperado

Si todo funciona, verás:

```json
{
  "success": true,
  "message": "✅ Parte enviado exitosamente a Lynx Check-in",
  "submissionId": "abc123...",
  "lynxResponse": {
    "success": true,
    "status": "submitted",
    "sesResponse": {
      "partId": "...",
      "accepted": true
    }
  }
}
```

### ❌ Posibles errores

1. **Error de API de Lynx**: El parte fue rechazado
   - Verás el mensaje de error específico de Lynx
   - Revisa los campos requeridos

2. **Error de conexión**: No se pudo conectar a Lynx
   - Verifica tu conexión a internet
   - Revisa los logs de Supabase

3. **Error de datos**: Faltan campos requeridos
   - El mapper automáticamente usa defaults
   - Revisa `lynxCheckinService.ts`

## 🐛 Debug

### Ver logs en tiempo real

1. **Consola del navegador** (F12):
   ```javascript
   // Verás logs como:
   🚀 Enviando solicitud a Edge Function...
   📥 Respuesta recibida: {...}
   ```

2. **Supabase Dashboard**:
   - Ve a: https://supabase.com/dashboard/project/blxngmtmknkdmikaflen/functions
   - Click en `test-lynx-submission`
   - Tab "Logs"
   - Verás todos los `console.log()` de la Edge Function

### Volver a probar

Puedes hacer click en el botón cuantas veces quieras. Cada envío:
- Actualizará `lynx_response` en la BD
- Sobrescribirá `lynx_submission_id` si es exitoso
- No creará duplicados en la BD (solo actualiza)

## 🔄 Revertir / Limpiar

Si quieres empezar de cero:

```sql
-- Eliminar el viajero de prueba
DELETE FROM traveler_form_data 
WHERE form_request_id = 'f26194aa-929c-4ec4-8bac-8b8202a8b07e';

-- Eliminar el form request
DELETE FROM traveler_form_requests 
WHERE id = 'f26194aa-929c-4ec4-8bac-8b8202a8b07e';

-- Eliminar la reserva
DELETE FROM reservations WHERE id = 82;
```

Luego vuelve a ejecutar los INSERTs del principio.

## 📞 Soporte

Si tienes problemas:

1. Revisa `PRUEBA-LYNX-CHECKIN.md` para más detalles
2. Ejecuta `verificar-datos-prueba-lynx.sql` para validar datos
3. Revisa los logs de Supabase Functions
4. Verifica que el servidor localhost:4000 esté corriendo

## 🎉 ¡Listo!

**Ahora solo abre tu navegador en http://localhost:4000/test-lynx-envio.html y haz click en el botón verde.**

---

**Creado**: 2025-11-03  
**Servidor**: http://localhost:4000  
**Edge Function**: test-lynx-submission  
**Estado**: ✅ TODO LISTO PARA PROBAR


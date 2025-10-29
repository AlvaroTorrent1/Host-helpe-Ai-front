# 🧪 Testing del Sistema de Partes de Viajeros

## ✅ Puntos Implementados

1. ✅ **Edge Function** para submit público (`submit-traveler-form`)
2. ✅ **Ruta con token** en lugar de propertyName (`/check-in/:token`)
3. ✅ **Generación de PDFs** con `@react-pdf/renderer`
4. ✅ **Dashboard** conectado a Supabase con filtros y detalles
5. ✅ **Servicio** completo para operaciones CRUD

## 📋 Pasos para Probar el Flujo Completo

### Paso 1: Desplegar la Edge Function

**⚠️ IMPORTANTE**: Antes de probar, necesitas desplegar la Edge Function.

#### Opción A: Via Dashboard de Supabase (Más Fácil)

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Edge Functions** en el menú lateral
4. Click en **"New Function"**
5. Nombre: `submit-traveler-form`
6. Copia el contenido de `supabase/functions/submit-traveler-form/index.ts`
7. Pégalo en el editor
8. Click **"Deploy"**
9. **IMPORTANTE**: En Settings de la función, desactiva **JWT Verification** (ya que es una ruta pública)

#### Opción B: Via CLI (Si tienes Supabase CLI)

```bash
# Instalar CLI si no lo tienes
npm install -g supabase

# Login
supabase login

# Link al proyecto (obtén el ref de tu dashboard)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy
supabase functions deploy submit-traveler-form --no-verify-jwt
```

### Paso 2: Verificar Datos de Prueba

Tenemos una solicitud pendiente creada en Supabase:

- **Token**: `ead15b2a-8a4c-43d5-8e94-3cb39bc7b462`
- **Propiedad**: Casa María Flora
- **Email**: turista.test@email.com
- **Check-in**: 2025-11-01
- **Check-out**: 2025-11-05
- **Estado**: pending
- **Expira**: 2025-11-28

### Paso 3: Abrir el Formulario Público

Una vez desplegada la Edge Function, abre el siguiente enlace:

```
http://localhost:4000/check-in/ead15b2a-8a4c-43d5-8e94-3cb39bc7b462
```

Este enlace:
- ✅ Carga automáticamente los datos de la reserva desde Supabase
- ✅ Muestra timer de expiración
- ✅ Permite añadir viajeros
- ✅ Captura firma digital
- ✅ Envía datos via Edge Function

### Paso 4: Completar el Formulario

1. **Ver datos precargados**: Propiedad, fechas, etc.
2. **Añadir viajero**: Click en "Añadir Viajero"
   - Nombre: Test
   - Apellidos: Usuario Prueba
   - DNI/NIE: 12345678A
   - Nacionalidad: España (ES)
   - Fecha nacimiento: 1990-01-01
   - Email: test@example.com
   - Dirección completa
3. **Firmar**: Dibuja una firma en el canvas
4. **Enviar**: Click en "Enviar Check-in"

### Paso 5: Verificar en Dashboard

1. Abre: `http://localhost:4000/ses-report`
2. Deberías ver el parte actualizado a **estado "completed"**
3. Click en "Ver Detalles" para ver toda la información
4. Click en "Descargar PDF" para generar y descargar el documento

## 🎯 Qué Esperar

### Formulario Público (`/check-in/:token`)

✅ **Carga automática de datos**:
- Nombre de propiedad
- Fechas check-in/out
- Número de noches
- Timer de expiración

✅ **Validaciones**:
- Token inválido → mensaje de error
- Token expirado → mensaje específico
- Ya completado → mensaje de "ya completado"
- Requiere al menos 1 viajero
- Requiere firma

✅ **Envío exitoso**:
- Toast de "Formulario enviado exitosamente"
- Pantalla de confirmación verde
- Resumen de datos enviados

### Dashboard (`/ses-report`)

✅ **Tabla de partes**:
- Muestra todos los partes del usuario autenticado
- Filtros por propiedad, fecha, estado
- Estados: Pending (amarillo) / Completed (verde)

✅ **Ver Detalles**:
- Modal con toda la información
- Datos del viajero
- Firma capturada
- Metadata (enviado el, completado el)

✅ **Descargar PDF**:
- Genera documento profesional
- Logo y formato oficial
- Incluye firma digital
- Descarga automática

## 🔍 Verificación en Supabase

Puedes verificar los datos directamente en Supabase:

### Tabla `traveler_form_requests`

```sql
SELECT * FROM traveler_form_requests 
WHERE token = 'ead15b2a-8a4c-43d5-8e94-3cb39bc7b462';
```

Después de enviar, el estado debería cambiar a `completed`.

### Tabla `traveler_form_data`

```sql
SELECT * FROM traveler_form_data 
WHERE form_request_id = (
  SELECT id FROM traveler_form_requests 
  WHERE token = 'ead15b2a-8a4c-43d5-8e94-3cb39bc7b462'
);
```

Deberías ver los datos del viajero que completaste.

## 🐛 Troubleshooting

### Error: "Token inválido o no encontrado"
- Verifica que el token en la URL es correcto
- Verifica que existe en la tabla `traveler_form_requests`

### Error: "El enlace ha expirado"
- El campo `expires_at` es anterior a la fecha actual
- Crea una nueva solicitud con fecha de expiración futura

### Error al enviar formulario
- **Verifica que la Edge Function está desplegada**
- Revisa la consola del navegador para detalles
- Verifica logs en Supabase Dashboard → Edge Functions → Logs

### PDF no se genera
- Verifica que el parte está en estado `completed`
- Revisa consola del navegador para errores de `@react-pdf/renderer`

## 🚀 Próximos Pasos

Para producción, necesitarás:

1. ✅ **Integración con N8N**:
   - Crear workflow que genere `traveler_form_requests` automáticamente
   - Enviar emails/WhatsApp con el enlace único
   - Recibir webhooks cuando se completen

2. ✅ **Integración con LynxCheckin**:
   - Enviar datos a su API después de completar
   - Guardar respuesta en `lynx_response`

3. ✅ **Emails con Resend**:
   - Template de invitación
   - Template de confirmación
   - Recordatorios antes de expiración

4. ✅ **Almacenamiento de PDFs**:
   - Subir PDFs generados a Supabase Storage
   - Guardar URL en `pdf_url`

## 📝 Notas

- El sistema actualmente solo envía el **primer viajero** del formulario
- La estructura soporta **múltiples viajeros** por reserva
- Los partes se eliminan automáticamente después de **3 años** (GDPR)
- Cada solicitud tiene un **token único UUID v4**
- Las firmas se almacenan como **base64 data URLs**


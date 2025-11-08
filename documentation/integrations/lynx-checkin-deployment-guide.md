# Lynx Check-in - Guía de Despliegue y Uso

## 📋 Resumen

Esta guía cubre el proceso completo de despliegue e integración con Lynx Check-in, desde la configuración inicial hasta el uso diario por gestores y turistas.

---

## 🎯 Flujo End-to-End

### 1. **Gestor crea propiedad en Host Helper**
   - Va a "Mis Propiedades" y añade una nueva propiedad
   - Completa nombre, dirección, características, etc.
   - La propiedad se guarda en la tabla `properties`

### 2. **Gestor vincula propiedad con Lynx**
   - Va a "Sincronizar con Lynx Check-in" (nueva herramienta)
   - Ve lista de propiedades de Host Helper y lodgings de Lynx
   - Selecciona el lodging correspondiente para cada propiedad
   - Se guarda `lynx_lodging_id` en la tabla `properties`

### 3. **Gestor crea solicitud de parte de viajero**
   - Puede hacerse manualmente desde dashboard
   - O automáticamente vía n8n cuando llega nueva reserva
   - Se crea registro en `traveler_form_requests` con token único
   - Sistema envía email al turista con link: `/check-in/{token}`

### 4. **Turista completa check-in**
   - Abre el link en su móvil
   - Ve formulario con datos de la reserva
   - Añade datos de cada viajero (wizard 4 pasos)
   - Firma digitalmente
   - Envía el formulario

### 5. **Sistema guarda datos**
   - Edge Function `submit-traveler-form` recibe los datos
   - Valida el token
   - Guarda cada viajero en `traveler_form_data`
   - Trigger actualiza `num_travelers_completed` en la solicitud

### 6. **Sistema envía a Lynx (automático)**
   - Si `num_travelers_completed >= num_travelers_expected`:
   - Sistema busca `lynx_lodging_id` de la propiedad
   - Prepara payload en formato Lynx
   - Llama a Lynx API para enviar el parte
   - Guarda respuesta en `lynx_submission_id`, `lynx_response`

### 7. **Lynx transmite al Ministerio**
   - Lynx recibe el parte
   - Lo valida según normativa (RD 933/2021)
   - Lo envía a SES.hospedajes (Ministerio del Interior)
   - Devuelve confirmación con `submissionId`

### 8. **Gestor verifica en dashboard**
   - Ve lista de partes en "Registro de Viajeros"
   - Puede ver estado: "Pendiente", "Completado", "Enviado a Lynx"
   - Si hubo error, puede reintentar manualmente

---

## 🚀 Instrucciones de Despliegue

### Paso 1: Obtener Credenciales de Lynx

**Contactar a Lynx Check-in:**
- Email: soporte@lynxcheckin.com
- Web: https://www.lynxcheckin.com/es

**Solicitar:**
- API Key de producción
- Confirmación de Account ID: `a190fff8-c5d0-49a2-80a8-79b38ce0f284`
- Documentación completa de Partners API
- Rate limits y restricciones

### Paso 2: Configurar Secrets en Supabase

```bash
# Login a Supabase CLI
supabase login

# Link a tu proyecto
supabase link --project-ref YOUR_PROJECT_REF

# Configurar secrets
supabase secrets set LYNX_API_KEY="tu-api-key-aqui"
supabase secrets set LYNX_ACCOUNT_ID="a190fff8-c5d0-49a2-80a8-79b38ce0f284"

# Verificar secrets
supabase secrets list
```

**Alternativamente (via Dashboard):**
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Settings > Edge Functions > Secrets
4. Añade:
   - `LYNX_API_KEY`: tu API key
   - `LYNX_ACCOUNT_ID`: `a190fff8-c5d0-49a2-80a8-79b38ce0f284`

### Paso 3: Ejecutar Migración de Base de Datos

```bash
# Opción A: Via Supabase CLI
supabase db push

# Opción B: Via Dashboard SQL Editor
# 1. Ve a SQL Editor en Supabase Dashboard
# 2. Copia y pega el contenido de:
#    supabase/migrations/20251030_add_lynx_lodging_id_to_properties.sql
# 3. Click en "Run"
```

**Verificar migración:**
```sql
-- Verificar que la columna existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND column_name = 'lynx_lodging_id';

-- Debería retornar:
-- column_name       | data_type
-- lynx_lodging_id   | text
```

### Paso 4: Desplegar Edge Functions

```bash
# Deploy lynx-list-lodgings
supabase functions deploy lynx-list-lodgings

# Deploy submit-traveler-form (actualizada)
supabase functions deploy submit-traveler-form --no-verify-jwt

# Verificar despliegue
supabase functions list
```

**Output esperado:**
```
┌─────────────────────────┬────────┬─────────────────────┐
│ NAME                    │ STATUS │ UPDATED AT          │
├─────────────────────────┼────────┼─────────────────────┤
│ lynx-list-lodgings      │ ACTIVE │ 2025-10-30 10:30:00 │
│ submit-traveler-form    │ ACTIVE │ 2025-10-30 10:31:00 │
└─────────────────────────┴────────┴─────────────────────┘
```

### Paso 5: Configurar Variables de Entorno Frontend

Añade a tu archivo `.env` o `.env.production`:

```env
# Lynx Check-in API (solo info pública)
VITE_LYNX_API_URL=https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/partners-api/v1
VITE_LYNX_ACCOUNT_ID=a190fff8-c5d0-49a2-80a8-79b38ce0f284

# ⚠️ NO incluir LYNX_API_KEY aquí - solo en Supabase Secrets
```

### Paso 6: Build y Deploy Frontend

```bash
# Build con las nuevas variables
npm run build

# Deploy (según tu plataforma)
# Netlify, Vercel, etc.
```

---

## 🧪 Testing de la Integración

### Test 1: Listar Lodgings

```bash
# Via curl (requiere JWT token de usuario autenticado)
curl -X POST \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/lynx-list-lodgings \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN"

# Expected response:
{
  "success": true,
  "lodgings": [
    {
      "id": "3dfc0644-612d-4449-9dd6-de7a9d15b012",
      "name": "Cabaña Mirlo Blanco",
      ...
    }
  ],
  "count": 1
}
```

### Test 2: Vincular Propiedad

1. Login como gestor
2. Ve a "Sincronizar con Lynx Check-in"
3. Verifica que aparezcan tus propiedades
4. Verifica que aparezcan los lodgings de Lynx
5. Selecciona un lodging para una propiedad
6. Verifica que aparezca "✓ Vinculado"

### Test 3: Flujo Completo de Check-in

1. **Crear solicitud de parte:**
   ```typescript
   // Via frontend o SQL
   const { data } = await supabase
     .from('traveler_form_requests')
     .insert({
       property_id: 'tu-property-id',
       check_in_date: '2025-11-01',
       check_out_date: '2025-11-03',
       property_name: 'Mi Propiedad',
       guest_email: 'test@example.com',
       num_travelers_expected: 1,
     })
     .select()
     .single();
   
   console.log('Token:', data.token);
   ```

2. **Turista completa formulario:**
   - Abre: `https://tu-app.com/check-in/{token}`
   - Completa datos de viajero
   - Firma
   - Envía

3. **Verificar en BD:**
   ```sql
   -- Ver datos guardados
   SELECT * FROM traveler_form_data 
   WHERE form_request_id = 'id-de-la-solicitud';
   
   -- Ver estado de envío a Lynx
   SELECT 
     lynx_submission_id,
     lynx_submitted_at,
     lynx_response
   FROM traveler_form_requests 
   WHERE id = 'id-de-la-solicitud';
   ```

4. **Verificar logs de Edge Function:**
   - Dashboard > Edge Functions > submit-traveler-form > Logs
   - Buscar: "✅ Enviado a Lynx exitosamente"

---

## 📊 Uso Diario

### Para Gestores

#### Vincular nuevas propiedades
1. Añadir propiedad en Host Helper
2. Ir a "Sincronizar con Lynx Check-in"
3. Mapear con el lodging correspondiente

#### Ver partes enviados
1. Ir a "Registro de Viajeros"
2. Ver lista con estados:
   - 🟡 Pendiente (turista no completó)
   - 🟢 Completado (guardado en BD)
   - 🔵 Enviado a Lynx (transmitido al Ministerio)
   - 🔴 Error (requiere atención)

#### Reintentar envío fallido
- Si `lynx_submission_id` está vacío pero datos completos
- Botón "Reenviar a Lynx" (futuro enhancement)

### Para Turistas

1. Recibir email con link de check-in
2. Abrir link en móvil
3. Completar wizard de 4 pasos
4. Firmar digitalmente
5. Enviar
6. Recibir confirmación

---

## 🔧 Troubleshooting

### Error: "LYNX_API_KEY no está configurado"

**Causa:** Secret no está configurado en Supabase

**Solución:**
```bash
supabase secrets set LYNX_API_KEY="tu-api-key"
```

### Error: "Property no tiene lynx_lodging_id configurado"

**Causa:** Propiedad no está vinculada con Lynx

**Solución:**
1. Ir a "Sincronizar con Lynx Check-in"
2. Seleccionar lodging para la propiedad

### Error: "No se pudieron obtener lodgings de Lynx"

**Causa:** API Key inválida o endpoint caído

**Solución:**
1. Verificar API Key: `supabase secrets list`
2. Verificar endpoint manualmente:
   ```bash
   curl https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/partners-api/v1/accounts/a190fff8-c5d0-49a2-80a8-79b38ce0f284/lodgings \
     -H "Authorization: Bearer TU_API_KEY"
   ```

### Error: "Lynx API error: 401"

**Causa:** API Key expirada o inválida

**Solución:**
1. Contactar a Lynx para renovar API Key
2. Actualizar secret: `supabase secrets set LYNX_API_KEY="nueva-key"`

---

## 📈 Monitoreo

### Métricas Clave

```sql
-- Partes completados hoy
SELECT COUNT(*) FROM traveler_form_requests 
WHERE status = 'completed' 
AND DATE(completed_at) = CURRENT_DATE;

-- Partes enviados a Lynx hoy
SELECT COUNT(*) FROM traveler_form_requests 
WHERE lynx_submission_id IS NOT NULL 
AND DATE(lynx_submitted_at) = CURRENT_DATE;

-- Partes pendientes de envío (requieren atención)
SELECT 
  id, property_name, guest_email, 
  num_travelers_completed, num_travelers_expected
FROM traveler_form_requests 
WHERE num_travelers_completed >= num_travelers_expected 
AND lynx_submission_id IS NULL 
AND status = 'completed';

-- Propiedades sin vincular
SELECT name FROM properties 
WHERE lynx_lodging_id IS NULL;
```

### Alertas Recomendadas

1. **Envíos fallidos:** Si `num_travelers_completed = expected` pero `lynx_submission_id IS NULL`
2. **Propiedades sin vincular:** Avisar al gestor que debe configurar
3. **Rate limits:** Monitorear respuestas 429 de Lynx API

---

## 🔒 Seguridad

### Datos Sensibles

- ✅ API Key solo en Supabase Secrets (server-side)
- ✅ Datos de viajeros cifrados en tránsito (HTTPS)
- ✅ RLS activado en todas las tablas
- ✅ Tokens únicos con expiración
- ✅ GDPR: auto-delete después de 3 años

### Auditoría

```sql
-- Log de todos los envíos a Lynx
SELECT 
  r.property_name,
  r.guest_email,
  r.lynx_submitted_at,
  r.lynx_submission_id,
  r.lynx_response->>'status' as lynx_status
FROM traveler_form_requests r
WHERE r.lynx_submission_id IS NOT NULL
ORDER BY r.lynx_submitted_at DESC;
```

---

## 📚 Referencias

### Documentación
- [Lynx Check-in Integration Guide](./lynx-checkin-integration.md)
- [Traveler Forms Implementation Notes](../../features/sesregistro/IMPLEMENTATION_NOTES.md)
- [Real Decreto 933/2021](https://www.boe.es/eli/es/rd/2021/10/26/933)

### Archivos Clave
- `src/services/lynxCheckinService.ts` - Servicio de API
- `supabase/functions/_shared/lynxCheckinService.ts` - Servicio para Edge Functions
- `supabase/functions/lynx-list-lodgings/index.ts` - Edge Function listar lodgings
- `supabase/functions/submit-traveler-form/index.ts` - Edge Function enviar parte
- `src/features/properties/components/LynxSyncTool.tsx` - Herramienta de sincronización
- `supabase/migrations/20251030_add_lynx_lodging_id_to_properties.sql` - Migración

### Contacto Soporte Lynx
- Email: soporte@lynxcheckin.com
- Web: https://www.lynxcheckin.com/es

---

**Última actualización:** 2025-10-30  
**Versión:** 1.0  
**Estado:** Listo para producción ✅



















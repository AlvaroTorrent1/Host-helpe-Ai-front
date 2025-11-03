# 🔗 Link del Formulario de Viajeros - Reserva de Prueba

## ✅ Problema Resuelto: Código INE

### ¿Qué estaba mal?

El código INE se estaba usando con un valor por defecto '29067' (Málaga) en `lynxCheckinService.ts` porque:

1. ✅ El **frontend SÍ capturaba** el código INE (`ineCode` en `types.ts`)
2. ❌ El **frontend NO enviaba** el código INE a la Edge Function (faltaba en `SesRegistroPage.tsx`)
3. ❌ La **tabla NO tenía** la columna `ine_code` en `traveler_form_data`
4. ❌ La **Edge Function NO guardaba** el código INE (faltaba en `submit-traveler-form/index.ts`)

### ✅ Solución Implementada

1. **✅ Migración aplicada**: Agregada columna `ine_code` a tabla `traveler_form_data`
   - Archivo: `add_ine_code_to_traveler_form_data.sql`
   - Campo: `TEXT`, nullable, con índice
   - Comentario: "Código INE del municipio español (5 dígitos)"

2. **✅ Frontend actualizado**: `SesRegistroPage.tsx` ahora envía `ine_code`
   - Línea 341: `ine_code: traveler.ineCode || null`
   - El valor capturado en el formulario ahora se envía a la Edge Function

3. **✅ Edge Function actualizada**: `submit-traveler-form/index.ts` guarda `ine_code`
   - Línea 110: `ine_code: travelerData.ine_code || null`
   - Desplegada exitosamente a Supabase

4. **✅ Servicio Lynx ya estaba correcto**: `lynxCheckinService.ts` línea 289
   - Lee: `t.ine_code || '29067'`
   - Ahora usará el valor real de la BD en lugar del fallback

---

## 🔗 Link Público del Formulario

### Para Localhost (Desarrollo)

```
http://localhost:5173/check-in/test-lynx-d597d27e-df1c-471a-aaf3-7b7d787bcd07
```

### Para Producción

```
https://[TU-DOMINIO]/check-in/test-lynx-d597d27e-df1c-471a-aaf3-7b7d787bcd07
```

**Nota**: Reemplaza `[TU-DOMINIO]` con el dominio real de tu aplicación.

---

## 📋 Datos de la Reserva Asociada

| Campo | Valor |
|-------|-------|
| **Reserva ID** | 82 |
| **Reserva UUID** | 55238594-3cab-4cef-98fb-d2c6e6c25037 |
| **Form Request ID** | f26194aa-929c-4ec4-8bac-8b8202a8b07e |
| **Token** | test-lynx-d597d27e-df1c-471a-aaf3-7b7d787bcd07 |
| **Propiedad** | Cabaña Mirlo Blanco |
| **Check-in** | 2025-11-04 |
| **Check-out** | 2025-11-06 |
| **Email huésped** | carlos.ramirez.test@example.com |
| **Teléfono** | +34612345678 |
| **Estado** | pending (esperando que el turista complete el formulario) |

---

## 🧪 Cómo Probar el Flujo Completo

### 1. Iniciar el servidor de desarrollo

```bash
cd c:\Users\Usuario\Desktop\nuevo-repo
npm run dev
```

### 2. Abrir el link del formulario

Abre en tu navegador:
```
http://localhost:5173/check-in/test-lynx-d597d27e-df1c-471a-aaf3-7b7d787bcd07
```

### 3. Completar el formulario

El formulario te pedirá:
- **Datos personales**: Nombre, apellidos, nacionalidad, sexo, fecha de nacimiento
- **Documento**: Tipo (DNI/NIE/Pasaporte), número, número de soporte
- **Residencia**: País de residencia
- **Dirección**: 
  - Ciudad
  - **⭐ Código INE** (si es España) - ¡Ahora se guardará correctamente!
  - Código postal
  - Calle
  - Información adicional (opcional)
- **Contacto**: Email, teléfono
- **Firma digital**
- **Aceptación de términos**

### 4. Enviar el formulario

Al completar:
1. Los datos se enviarán a la Edge Function `submit-traveler-form`
2. Se guardarán en `traveler_form_data` **incluyendo el código INE**
3. El estado del `traveler_form_request` cambiará a `completed`
4. Ya estará listo para enviar a Lynx Check-in

### 5. Enviar a Lynx

Usa la página de prueba que creamos antes:
```
http://localhost:4000/test-lynx-envio.html
```

O ejecuta la Edge Function directamente:
```bash
curl -X POST \
  https://blxngmtmknkdmikaflen.supabase.co/functions/v1/test-lynx-submission \
  -H "Content-Type: application/json" \
  -d '{"formRequestId":"f26194aa-929c-4ec4-8bac-8b8202a8b07e"}'
```

---

## 🔍 Verificar que el Código INE se Guarda

Después de completar el formulario, ejecuta este SQL:

```sql
SELECT 
  id,
  first_name,
  last_name,
  address_city,
  ine_code,  -- ⭐ Ahora debería tener el valor ingresado
  address_postal_code,
  address_country,
  submitted_at
FROM traveler_form_data
WHERE form_request_id = 'f26194aa-929c-4ec4-8bac-8b8202a8b07e';
```

**Antes de nuestro fix**: `ine_code` sería `NULL`  
**Después de nuestro fix**: `ine_code` tendrá el valor ingresado (ej: "29067", "28079", etc.)

---

## 📊 Flujo Completo del Código INE

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USUARIO COMPLETA FORMULARIO                                  │
│    - Ingresa código INE: "29067" (Málaga)                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. FRONTEND (SesRegistroPage.tsx)                               │
│    - Lee: traveler.ineCode                                      │
│    - Envía: { ine_code: "29067", ... }                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. EDGE FUNCTION (submit-traveler-form)                         │
│    - Recibe: travelerData.ine_code = "29067"                    │
│    - Inserta en BD: ine_code = "29067"                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. BASE DE DATOS (traveler_form_data)                           │
│    - Guarda: ine_code = "29067"                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. ENVÍO A LYNX (lynxCheckinService.ts)                         │
│    - Lee: t.ine_code = "29067" (ya NO usa '29067' default)     │
│    - Envía a Lynx: municipalityCode = "29067"                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. LYNX API                                                      │
│    - Recibe código INE real del viajero                          │
│    - Envía al SES Hospedajes (Ministerio)                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Resumen de Cambios

| Archivo | Cambio | Estado |
|---------|--------|--------|
| `supabase/migrations/add_ine_code_to_traveler_form_data.sql` | Agregar columna `ine_code` | ✅ Aplicado |
| `src/features/sesregistro/SesRegistroPage.tsx` | Enviar `ine_code` a Edge Function | ✅ Editado |
| `supabase/functions/submit-traveler-form/index.ts` | Guardar `ine_code` en BD | ✅ Editado y desplegado |
| `supabase/functions/_shared/lynxCheckinService.ts` | Ya leía `t.ine_code` | ✅ No requiere cambios |

---

## 🚀 Próximos Pasos

1. **Probar el formulario**: Abre el link y completa los datos
2. **Verificar el código INE**: Ejecuta el SQL de verificación
3. **Enviar a Lynx**: Usa la página de prueba o curl
4. **Ver respuesta**: Verifica que Lynx acepta el parte con el código INE correcto

---

## 📞 Links Útiles

- **Formulario de Check-in**: http://localhost:5173/check-in/test-lynx-d597d27e-df1c-471a-aaf3-7b7d787bcd07
- **Página de prueba Lynx**: http://localhost:4000/test-lynx-envio.html
- **Supabase Dashboard**: https://supabase.com/dashboard/project/blxngmtmknkdmikaflen
- **Edge Functions**: https://supabase.com/dashboard/project/blxngmtmknkdmikaflen/functions

---

**Fecha**: 2025-11-03  
**Estado**: ✅ TODO CORREGIDO Y LISTO PARA PROBAR  
**Código INE**: Ahora se captura, guarda y envía correctamente


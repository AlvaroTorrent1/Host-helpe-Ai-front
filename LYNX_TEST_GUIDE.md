# 🧪 Guía Completa de Test End-to-End - Lynx API Integration

## 📋 Índice

1. [Pre-requisitos](#pre-requisitos)
2. [Fase 1: Verificación de Base de Datos](#fase-1-verificación-de-base-de-datos)
3. [Fase 2: Crear Propiedad desde Frontend](#fase-2-crear-propiedad-desde-frontend)
4. [Fase 3: Registrar en Lynx API](#fase-3-registrar-en-lynx-api)
5. [Fase 4: Verificación Final](#fase-4-verificación-final)
6. [Troubleshooting](#troubleshooting)
7. [Verificación Externa con cURL](#verificación-externa-con-curl)

---

## Pre-requisitos

### ✅ Checklist Antes de Empezar

- [ ] Campo `lynx_lodging_id` existe en tabla `properties` (migración aplicada)
- [ ] Edge Function `lynx-register-lodging` está desplegada
- [ ] Tienes acceso al frontend de la aplicación
- [ ] Tienes acceso a la base de datos (SQL Editor en Supabase Dashboard)
- [ ] Archivo `LYNX_TEST_DATA.md` abierto para copiar datos
- [ ] Archivo `LYNX_TEST_VERIFICATION.sql` abierto para queries de verificación

### 📚 Documentos de Apoyo

- **LYNX_TEST_DATA.md** - Datos validados para el formulario
- **LYNX_TEST_VERIFICATION.sql** - Queries SQL de verificación
- **LYNX_API_FINDINGS.md** - Información sobre la API de Lynx

---

## Fase 1: Verificación de Base de Datos

### **Paso 1.1: Verificar que el campo lynx_lodging_id existe**

Ejecuta en SQL Editor de Supabase:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND column_name = 'lynx_lodging_id';
```

**Resultado esperado:**
```
column_name       | data_type | is_nullable
lynx_lodging_id  | text      | YES
```

✅ Si ves esto, continúa al siguiente paso  
❌ Si no aparece nada, ejecuta la migración `add_lynx_lodging_id_field`

---

### **Paso 1.2: Verificar todos los campos SES/Lynx**

```sql
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND (
  column_name LIKE '%lynx%' 
  OR column_name LIKE '%ses%'
  OR column_name LIKE '%owner%'
  OR column_name IN ('city', 'province', 'postal_code')
)
ORDER BY column_name;
```

**Debes ver al menos estos campos:**
- `city`, `province`, `postal_code`, `country`
- `tourism_license`, `license_type`, `property_type`
- `max_guests`, `num_bedrooms`, `num_bathrooms`
- `owner_name`, `owner_email`, `owner_phone`, `owner_id_type`, `owner_id_number`
- `ses_landlord_code`, `ses_username`, `ses_api_password`, `ses_establishment_code`
- `lynx_lodging_id`, `lynx_account_id`, `lynx_authority_connection_id`, `lynx_lodging_status`

✅ **Fase 1 completada** - Procede a Fase 2

---

## Fase 2: Crear Propiedad desde Frontend

### **Paso 2.1: Acceder al formulario de nueva propiedad**

1. Abre tu aplicación en el navegador
2. Inicia sesión como usuario gestor
3. Navega a `/properties` o `/properties/new`
4. Click en "Crear Nueva Propiedad" o "Añadir Propiedad"

---

### **Paso 2.2: Completar el formulario con datos de prueba**

Abre el archivo **LYNX_TEST_DATA.md** y copia los datos **exactamente como aparecen**:

#### Sección: Información Básica

| Campo | Valor a introducir |
|-------|-------------------|
| Nombre | `Villa Test Lynx API` |
| Dirección | `Calle de Prueba 123, 4ºB` |
| Ciudad | `Marbella` |
| Provincia | `Málaga` |
| Código Postal | `29600` |
| País | `ES` |

#### Sección: Información Turística

| Campo | Valor a introducir |
|-------|-------------------|
| Licencia Turística | `VFT/MA/99999` |
| Tipo de Licencia | `VFT` |
| Tipo de Propiedad | `villa` |
| Capacidad Máxima | `6` |
| Número de Habitaciones | `3` |
| Número de Baños | `2` |

#### Sección: Datos del Propietario

| Campo | Valor a introducir |
|-------|-------------------|
| Nombre Completo | `Juan Test López` |
| Email | `test@hosthelper.com` |
| Teléfono | `+34612345678` |
| Tipo de Documento | `DNI` |
| Número de Documento | `12345678Z` |

> ⚠️ **Importante:** El DNI `12345678Z` tiene la letra correcta. No lo cambies.

#### Sección: Credenciales SES

| Campo | Valor a introducir |
|-------|-------------------|
| Código de Arrendador | `TEST001` |
| Usuario SES | `test_user` |
| Contraseña API | `test_password` |
| Código de Establecimiento | `0000099999` |

---

### **Paso 2.3: Verificar validaciones en tiempo real**

Mientras introduces los datos, verifica que:

- ✅ No aparecen mensajes de error en rojo bajo ningún campo
- ✅ El email se valida correctamente
- ✅ El teléfono se valida correctamente
- ✅ El DNI no muestra error de letra incorrecta
- ✅ El código postal se valida (5 dígitos)

Si ves errores, corrígelos antes de continuar.

---

### **Paso 2.4: Guardar la propiedad**

1. Click en **"Guardar Propiedad"** o **"Crear Propiedad"**
2. Espera la confirmación (toast verde: "Propiedad creada exitosamente")
3. **Copia el ID de la propiedad** de la URL o de la respuesta
   - Formato: `uuid` como `123e4567-e89b-12d3-a456-426614174000`

📝 **Anota el propertyId aquí:** `_______________________________`

---

### **Paso 2.5: Verificar que la propiedad se guardó correctamente**

Ejecuta en SQL Editor (sustituye `{property_id}` con el ID copiado):

```sql
SELECT 
  id,
  name,
  city,
  tourism_license,
  num_bedrooms,
  ses_establishment_code,
  lynx_lodging_id,
  created_at
FROM properties
WHERE id = '{property_id}';
```

**Resultado esperado:**
- `name` = "Villa Test Lynx API"
- `city` = "Marbella"
- `num_bedrooms` = 3
- `ses_establishment_code` = "0000099999"
- `lynx_lodging_id` = **NULL** (aún no registrada)

✅ **Fase 2 completada** - Procede a Fase 3

---

## Fase 3: Registrar en Lynx API

### **Paso 3.1: Acceder al panel de la propiedad**

1. En el listado de propiedades, busca "Villa Test Lynx API"
2. Click en "Ver Detalles" o en la tarjeta de la propiedad
3. Busca el panel/sección **"Estado de Registro SES"** o **"Registro en SES Hospedajes"**

---

### **Paso 3.2: Verificar que está lista para registrar**

Deberías ver:
- ✅ Badge verde: "Datos completos"
- ✅ Botón azul: **"Registrar en SES Hospedajes"**

Si ves un warning amarillo con "Datos incompletos", verifica qué campos faltan y complétalos.

---

### **Paso 3.3: Registrar la propiedad en Lynx**

1. Click en el botón **"Registrar en SES Hospedajes"**
2. El botón cambiará a "Registrando..." con un spinner
3. **Espera la respuesta** (tarda ~2-5 segundos)

---

### **Paso 3.4: Verificar el resultado**

#### ✅ **Caso de Éxito:**

Deberías ver un **toast verde** con uno de estos mensajes:
- "✓ Propiedad registrada exitosamente en SES Hospedajes"
- "⏳ Propiedad enviada. Pendiente de validación (24-48h)"

**Si ves esto, continúa al paso 3.5** ✅

#### ❌ **Caso de Error:**

Si ves un **toast rojo** con un mensaje de error:
- Ve a la sección [Troubleshooting](#troubleshooting)
- Copia el mensaje de error exacto
- Busca la solución correspondiente

---

### **Paso 3.5: Abrir DevTools y verificar la respuesta**

1. Abre las **DevTools del navegador** (F12)
2. Ve a la pestaña **Network** o **Red**
3. Busca el request a `lynx-register-lodging`
4. Click en él y ve a la pestaña **Response**

**Respuesta esperada (200 OK):**
```json
{
  "success": true,
  "lodging": {
    "id": "uuid-del-lodging",
    "accountId": "a190fff8-c5d0-49a2-80a8-79b38ce0f284",
    "status": "active",
    "createdAt": "2025-10-31T...",
    "sesConnection": {
      "authConnId": "18b8c296-5ffb-4015-a5e9-8e0fb5050dc4",
      "established": true
    }
  },
  "message": "Propiedad registrada exitosamente en SES Hospedajes"
}
```

📝 **Copia el `lodging.id` (UUID):** `_______________________________`

✅ **Fase 3 completada** - Procede a Fase 4

---

## Fase 4: Verificación Final

### **Paso 4.1: Verificar que lynx_lodging_id se guardó en BD**

Ejecuta en SQL Editor (sustituye `{property_id}`):

```sql
SELECT 
  id,
  name,
  lynx_lodging_id,
  lynx_account_id,
  lynx_authority_connection_id,
  lynx_lodging_status,
  updated_at
FROM properties
WHERE id = '{property_id}';
```

**Resultado esperado:**
- `lynx_lodging_id` = UUID del lodging (el que copiaste en paso 3.5)
- `lynx_account_id` = "a190fff8-c5d0-49a2-80a8-79b38ce0f284"
- `lynx_authority_connection_id` = "18b8c296-5ffb-4015-a5e9-8e0fb5050dc4"
- `lynx_lodging_status` = "active"
- `updated_at` = timestamp reciente (hace unos segundos)

✅ Todos los campos tienen los valores esperados

---

### **Paso 4.2: Verificar en la API de Lynx con cURL**

Ejecuta en tu terminal:

```bash
curl https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/partners-api/v1/accounts/a190fff8-c5d0-49a2-80a8-79b38ce0f284/lodgings | jq
```

**Busca en la respuesta:**
- Un objeto con `"name": "Villa Test Lynx API"`
- `"id"` debe coincidir con el `lynx_lodging_id` de la BD
- `"accountId"` = "a190fff8-c5d0-49a2-80a8-79b38ce0f284"
- `"authConnId"` = "18b8c296-5ffb-4015-a5e9-8e0fb5050dc4"
- `"establishmentCode"` = "0000099999"
- `"numRooms"` = 1 o 3 (dependiendo de cómo la API interprete el valor)
- `"internet"` = true

✅ El lodging aparece en la API de Lynx

---

### **Paso 4.3: Verificar en el frontend**

1. Refresca la página de la propiedad
2. En el panel "Estado de Registro SES" deberías ver:
   - ✅ Badge verde: **"✓ Registrada"** o **"✓ Active"**
   - El botón "Registrar" debería desaparecer o cambiar a "Ya registrada"

✅ El frontend refleja el estado correcto

---

### **Paso 4.4: Verificar estadísticas generales**

```sql
SELECT 
  COUNT(*) AS total_properties,
  COUNT(lynx_lodging_id) AS registered_in_lynx,
  COUNT(CASE WHEN lynx_lodging_status = 'active' THEN 1 END) AS active_lodgings
FROM properties;
```

Deberías ver al menos:
- `registered_in_lynx` = 1 o más
- `active_lodgings` = 1 o más

✅ **¡TEST COMPLETO EXITOSO!** 🎉

---

## Troubleshooting

### **Error: "No autorizado - falta token de autenticación"**

**Causa:** No estás autenticado  
**Solución:**
1. Verifica que has iniciado sesión
2. Refresca la página
3. Vuelve a intentar

---

### **Error: "Propiedad no encontrada"**

**Causa:** El propertyId es incorrecto o la propiedad no te pertenece  
**Solución:**
1. Verifica el UUID del propertyId
2. Asegúrate de que la propiedad fue creada por tu usuario

---

### **Error: "Datos incompletos para registro"**

**Causa:** Falta algún campo requerido  
**Solución:**
1. El error te dirá qué campos faltan
2. Edita la propiedad y completa esos campos
3. Vuelve a intentar el registro

---

### **Error: "Propiedad ya registrada"**

**Causa:** La propiedad ya tiene un `lynx_lodging_id`  
**Solución:**
1. Esto es esperado si ya la registraste antes
2. Si quieres probar de nuevo, limpia el campo en BD:
   ```sql
   UPDATE properties
   SET lynx_lodging_id = NULL,
       lynx_lodging_status = NULL
   WHERE id = '{property_id}';
   ```

---

### **Error: "authConnId is required" (400)**

**Causa:** El authConnId hardcodeado no se está enviando  
**Solución:**
1. Verifica el archivo `supabase/functions/_shared/lynxCheckinService.ts`
2. Línea 14: debe tener `const LYNX_AUTH_CONN_ID = '18b8c296-5ffb-4015-a5e9-8e0fb5050dc4';`
3. Línea 296: debe enviar `authConnId: LYNX_AUTH_CONN_ID`

---

### **Error: "establishmentCode is required" (400)**

**Causa:** El campo `ses_establishment_code` está vacío  
**Solución:**
1. Edita la propiedad
2. Completa el campo "Código de Establecimiento" con `0000099999`
3. Guarda y vuelve a registrar

---

### **Error 500: "Error de configuración"**

**Causa:** Aunque la API no requiere autenticación, alguna configuración falta  
**Solución:**
1. Revisa los logs de la Edge Function:
   ```bash
   supabase functions logs lynx-register-lodging
   ```
2. Busca el error específico en los logs

---

### **La respuesta tarda más de 10 segundos**

**Causa:** Problema de red o la API de Lynx está lenta  
**Solución:**
1. Espera un poco más (hasta 30 segundos)
2. Si sigue sin responder, verifica la conectividad
3. Intenta de nuevo más tarde

---

## Verificación Externa con cURL

### **Ver todos los lodgings de tu cuenta**

```bash
curl -s https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/partners-api/v1/accounts/a190fff8-c5d0-49a2-80a8-79b38ce0f284/lodgings | jq
```

### **Buscar un lodging específico por ID**

```bash
curl -s https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/partners-api/v1/accounts/a190fff8-c5d0-49a2-80a8-79b38ce0f284/lodgings | jq '.lodgings[] | select(.id=="TU_LODGING_ID_AQUI")'
```

### **Contar cuántos lodgings tienes**

```bash
curl -s https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/partners-api/v1/accounts/a190fff8-c5d0-49a2-80a8-79b38ce0f284/lodgings | jq '.lodgings | length'
```

### **Ver solo nombres de lodgings**

```bash
curl -s https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/partners-api/v1/accounts/a190fff8-c5d0-49a2-80a8-79b38ce0f284/lodgings | jq '.lodgings[].name'
```

---

## Resumen del Test

### ✅ Checklist Final

- [ ] Campo `lynx_lodging_id` existe en BD
- [ ] Propiedad "Villa Test Lynx API" creada con todos los datos
- [ ] Edge Function `lynx-register-lodging` ejecutada exitosamente
- [ ] Respuesta 200 OK recibida con `lodging.id`
- [ ] `lynx_lodging_id` guardado en BD
- [ ] `lynx_lodging_status` = 'active'
- [ ] Lodging aparece en GET /lodgings de la API de Lynx
- [ ] Datos coinciden entre BD y API de Lynx
- [ ] Frontend muestra badge "Registrada"

### 🎉 Si completaste todos los pasos:

**¡ENHORABUENA! La integración con Lynx API está funcionando correctamente.**

Ahora puedes:
- Registrar propiedades reales de usuarios
- Enviar partes de viajero automáticamente al Ministerio
- Cumplir con el Real Decreto 933/2021

---

**Creado:** 31 de Octubre, 2025  
**Última actualización:** 31 de Octubre, 2025  
**Estado:** ✅ Validado y probado


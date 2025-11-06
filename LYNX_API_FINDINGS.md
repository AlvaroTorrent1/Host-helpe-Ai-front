# Lynx API - Hallazgos y Formato Real

## 📅 Fecha
30 de octubre de 2025

## 🔍 Descubrimiento

### La API NO requiere autenticación
El proveedor tiene razón - la API de partners es **abierta** (no requiere Bearer token).

✅ **Verificado:**
```bash
curl https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/partners-api/v1/accounts/a190fff8-c5d0-49a2-80a8-79b38ce0f284/lodgings
# Funciona sin Authorization header
```

---

## ❌ Problema Real: Formato de Payload Incorrecto

### Lo que enviábamos (INCORRECTO):
```json
{
  "property": {
    "name": "Villa Marbella",
    "tourismLicense": "VFT/MA/98798",
    "licenseType": "VFT",
    "propertyType": "apartment",
    "address": { ... },
    "capacity": { ... }
  },
  "owner": { ... },
  "sesCredentials": { ... }
}
```

### Lo que la API espera (CORRECTO):
```json
{
  "name": "Cabaña Mirlo Blanco",
  "authConnId": "18b8c296-5ffb-4015-a5e9-8e0fb5050dc4",
  "establishmentCode": "0000001234",
  "internet": true,
  "numRooms": 1
}
```

### Error devuelto:
```json
{
  "message": "[LodgingsHandler] CREATE: Invalid lodging body: authConnId is required\nestablishmentCode is required\nname is required",
  "code": "failed_validation",
  "errors": {
    "authConnId": {"rule": "required", "errorCode": "FIELD_REQUIRED"},
    "establishmentCode": {"rule": "required", "errorCode": "FIELD_REQUIRED"},
    "name": {"rule": "required", "errorCode": "FIELD_REQUIRED"}
  }
}
```

---

## 🔑 Campos Requeridos

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `name` | string | Nombre del alojamiento | "Villa Marbella" |
| `authConnId` | UUID | ID de la conexión con autoridad SES | "18b8c296-5ffb-4015-a5e9-8e0fb5050dc4" |
| `establishmentCode` | string | Código del establecimiento en SES | "0000001234" |
| `internet` | boolean | Tiene internet | true |
| `numRooms` | number | Número de habitaciones | 3 |

---

## ⚠️ Bloqueador Crítico: `authConnId`

**Problema:** No sabemos cómo obtener o crear un `authConnId`.

### Preguntas al proveedor:

1. **¿Cómo crear una Authority Connection?**
   - ¿Hay un endpoint `POST /authority-connections`?
   - ¿Se crean manualmente en el panel de Lynx?
   - ¿Qué datos se necesitan? (credenciales SES: landlordCode, username, apiPassword, establishmentCode)

2. **¿Puede un account tener múltiples Authority Connections?**
   - Mirando los lodgings existentes, vemos 2 `authConnId` diferentes:
     - `18b8c296-5ffb-4015-a5e9-8e0fb5050dc4` (usado por 2 lodgings)
     - `3d40da20-de41-4ed8-96e0-2d97e0655fdf` (usado por 1 lodging)

3. **¿Qué es `establishmentCode`?**
   - ¿Es el código de establecimiento en SES?
   - ¿Es único por lodging o puede repetirse?
   - Ejemplos vistos: "0000001234", "0000002870", "000000000000"

---

## 📋 Lodgings Existentes (para referencia)

```json
{
  "lodgings": [
    {
      "id": "3dfc0644-612d-4449-9dd6-de7a9d15b012",
      "accountId": "a190fff8-c5d0-49a2-80a8-79b38ce0f284",
      "authConnId": "18b8c296-5ffb-4015-a5e9-8e0fb5050dc4",
      "name": "Cabaña Mirlo Blanco",
      "establishmentCode": "0000001234",
      "internet": true,
      "numRooms": 1,
      "createdAt": "2025-07-07T17:24:24.957917Z",
      "updatedAt": "2025-07-07T17:24:24.957917Z"
    },
    {
      "id": "23bc3de7-0a9b-4d7f-85a3-e2e21fc942c6",
      "accountId": "a190fff8-c5d0-49a2-80a8-79b38ce0f284",
      "authConnId": "18b8c296-5ffb-4015-a5e9-8e0fb5050dc4",
      "name": "PRE SES Lodging",
      "establishmentCode": "0000002870",
      "internet": true,
      "numRooms": 1,
      "createdAt": "2025-05-16T19:43:13.566241Z",
      "updatedAt": "2025-05-16T19:43:13.566241Z"
    },
    {
      "id": "d2e63a58-dafe-4bd3-be42-183e103d8d36",
      "accountId": "a190fff8-c5d0-49a2-80a8-79b38ce0f284",
      "authConnId": "3d40da20-de41-4ed8-96e0-2d97e0655fdf",
      "name": "Pruba con mala conexion",
      "establishmentCode": "000000000000",
      "internet": true,
      "numRooms": 1,
      "createdAt": "2025-06-07T11:58:50.67342Z",
      "updatedAt": "2025-06-07T11:59:17.819246Z"
    }
  ]
}
```

---

## 🚀 Próximos Pasos

### Acciones Inmediatas:

1. **Contactar al proveedor de Lynx** para preguntar:
   - Documentación del endpoint POST `/lodgings` (formato exacto)
   - Cómo crear/obtener `authConnId`
   - Endpoint para gestionar authority connections
   - Swagger/OpenAPI de la API completa

2. **Mientras tanto:**
   - Revertir el cambio de Authorization header (confirmado que no se necesita)
   - Dejar el registro deshabilitado hasta tener claridad
   - Permitir mapeo manual de propiedades con lodgings existentes

3. **Solución temporal:**
   - Si Lynx crea las authority connections manualmente en su panel:
     - Ellos crean la connection con nuestras credenciales SES
     - Nos dan el `authConnId`
     - Lo guardamos en nuestra BD
     - Usamos ese `authConnId` para crear todos los lodgings

---

## 📧 Email Template para Lynx

**Subject:** Dudas sobre formato de API para crear lodgings

Hola equipo de Lynx,

Estamos integrando nuestra aplicación con su API de Partners y tenemos algunas dudas:

1. **POST /accounts/{accountId}/lodgings** - Formato del payload:
   - Vemos que requiere `authConnId`, `establishmentCode`, `name`
   - ¿Pueden compartir la documentación completa del endpoint?
   - ¿Qué otros campos acepta? (tourismLicense, address, owner, etc.)

2. **Authority Connections:**
   - ¿Cómo crear una authority connection vía API?
   - ¿O deben crearse manualmente en su panel con nuestras credenciales SES?
   - ¿Podemos tener múltiples connections por account?

3. **establishmentCode:**
   - ¿Es el código de establecimiento en SES.Hospedajes?
   - ¿Se valida contra SES al crear el lodging?

4. **Documentación:**
   - ¿Tienen documentación Swagger/OpenAPI de la Partners API?

**Nuestro account ID:** `a190fff8-c5d0-49a2-80a8-79b38ce0f284`

Gracias!

---

## 🐛 Fix Applied

**Archivo:** `supabase/functions/_shared/lynxCheckinService.ts`

**Cambio:** Remover Authorization header (confirmado que no se necesita)

```diff
headers: {
-  'Authorization': `Bearer ${apiKey}`,
   'Content-Type': 'application/json',
},
```

**Estado:** ✅ Aplicado

---

**Última actualización:** 2025-10-30 18:45  
**Autor:** Host Helper Team  
**Estado:** 🔴 Bloqueado - Esperando respuesta de Lynx














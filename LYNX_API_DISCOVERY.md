# 🔍 Descubrimiento API Lynx - Solución del Problema

**Fecha**: 31 de Octubre, 2025

## 🎯 Problema Identificado

**Error de Concepto Confirmado por el Proveedor:**
- ❌ Endpoint incorrecto: `/partners-api/v1/.../travelers`  
- ✅ Endpoint correcto: `/api/v1/public/.../reports`

## 📋 Cambios Clave

### 1. Base URL
```
❌ Antes: https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/partners-api/v1
✅ Ahora: https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/api/v1/public
```

### 2. Recurso
```
❌ Antes: /travelers
✅ Ahora: /reports o /reports/contract
```

### 3. Formato del Payload
El formato cambió completamente de nuestro formato simplificado al formato oficial de Lynx.

---

## 📚 Documentación Oficial

**Swagger UI**: https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/api/v1/public/docs  
**Swagger JSON**: Descargado en `lynx-swagger.json`

---

## 🔐 Autenticación

**IMPORTANTE**: Según el Swagger, todos los endpoints requieren **OAuth2**:

```json
"security": [
  {
    "OAuth2AccessCode": ["openid"]
  }
]
```

Esto significa que el endpoint `/public` **NO es realmente público** - requiere autenticación OAuth2.

### Necesitamos del Proveedor:

1. **Client ID y Client Secret** para OAuth2
2. **Token endpoint** para obtener access tokens
3. **Scopes** requeridos
4. **O alternativamente**: API Key si tienen autenticación más simple

---

## 📊 Estructura del Report (Formato Lynx)

### Endpoint Principal:
```
POST /accounts/{accountId}/lodgings/{lodgingId}/reports/contract
```

### Payload Mínimo Requerido:
```json
{
  "checkInDate": "2025-11-10T12:00:00Z",
  "checkOutDate": "2025-11-13T12:00:00Z",
  "numPeople": 1,
  "payment": {
    "paymentMethodCode": "EFECT"
  }
}
```

### Payload Completo con Travelers:
```json
{
  "checkInDate": "2025-11-10T12:00:00Z",
  "checkOutDate": "2025-11-13T12:00:00Z",
  "numPeople": 1,
  "numRooms": 1,
  "payment": {
    "paymentMethodCode": "EFECT",
    "paymentMethodHolder": "Juan Garcia Lopez",
    "paymentDate": "2025-11-10"
  },
  "travelers": [
    {
      "name": "Juan",
      "surname1": "Garcia",
      "surname2": "Lopez",
      "birthdate": "1999-12-12T00:00:00Z",
      "idType": "NIF",
      "idNum": "53571577T",
      "idSupport": "CHC123456",
      "nationality": "ESP",
      "sex": "H",
      "email": "alvarotorrent1@gmail.com",
      "phone": "+34654654654",
      "address": {
        "address": "Avenida imperio argentina 7, portal 4, 4A",
        "municipalityName": "Málaga",
        "postalCode": "29001",
        "country": "ESP"
      },
      "signature": "..."
    }
  ]
}
```

---

## 🔑 Campos Importantes

### IDType (Tipo de Documento)
- `NIF` - DNI español
- `NIE` - Número de Identidad de Extranjero
- `PAS` - Pasaporte
- `CIF` - NIF para empresas
- `OTRO` - Otro

### PaymentMethod (Método de Pago)
- `EFECT` - Efectivo (Cash)
- `TARJT` - Tarjeta (Card)
- `TRANS` - Transferencia (Wire Transfer)
- `PLATF` - Plataforma (Ej: Airbnb, Booking)
- `DESTI` - En destino
- `MOVIL` - Pago móvil
- `TREG` - ?
- `OTRO` - Otro

### Sex (Género)
- `H` - Hombre
- `M` - Mujer

### Nationality
Código ISO 3166-1 alpha-3 (3 letras):
- `ESP` - España
- `ARG` - Argentina  
- `USA` - Estados Unidos
- etc.

### Country (en Address)
Código ISO 3166-1 alpha-3 (3 letras):
- `ESP` - España
- `ARG` - Argentina
- etc.

---

## 🚧 Estado Actual

### Tests Realizados:

1. ✅ **GET /lodgings** - Funciona sin autenticación
2. ✅ **POST /lodgings** - Funciona sin autenticación  
3. ❌ **POST /reports/contract** - Requiere OAuth2 (401/403 esperado)

### Bloqueador Actual:

**No tenemos credenciales OAuth2** para autenticar requests a `/api/v1/public/reports`

---

## 📞 Próximos Pasos con el Proveedor

### Email a Lynx:

```
Asunto: Credenciales OAuth2 para API de Reports

Hola equipo de Lynx,

Gracias por clarificar el endpoint correcto (/api/v1/public/reports).

Hemos revisado el Swagger y vemos que requiere autenticación OAuth2.

¿Pueden proporcionarnos:

1. Client ID y Client Secret para OAuth2
2. URL del token endpoint
3. Scopes necesarios
4. Documentación del flujo de autenticación

O alternativamente:
- ¿Existe una API Key más simple para integraciones server-to-server?

Nuestra cuenta:
- Account ID: a190fff8-c5d0-49a2-80a8-79b38ce0f284
- Email: nacho.lopezosa@gmail.com

Gracias,
[Tu nombre]
```

---

## 💻 Cambios Necesarios en el Código

### 1. Actualizar lynxCheckinService.ts

```typescript
// Cambiar base URL
const LYNX_API_URL = 'https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/api/v1/public';

// Cambiar endpoint
const endpoint = `${LYNX_API_URL}/accounts/${LYNX_ACCOUNT_ID}/lodgings/${lodgingId}/reports/contract`;

// Añadir autenticación OAuth2
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

### 2. Crear Función de Autenticación

```typescript
async function getLynxAccessToken(): Promise<string> {
  const clientId = Deno.env.get('LYNX_CLIENT_ID');
  const clientSecret = Deno.env.get('LYNX_CLIENT_SECRET');
  
  const response = await fetch('https://[token-endpoint]', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'openid'
    })
  });
  
  const data = await response.json();
  return data.access_token;
}
```

### 3. Actualizar Mapeo de Datos

```typescript
export function mapHostHelperToLynx(
  travelerFormData: any[],
  checkInDate: string,
  checkOutDate: string,
  signatureData: string,
  paymentMethod: string
): LynxReportData {
  return {
    checkInDate: `${checkInDate}T12:00:00Z`,
    checkOutDate: `${checkOutDate}T12:00:00Z`,
    numPeople: travelerFormData.length,
    payment: {
      paymentMethodCode: mapPaymentMethod(paymentMethod)
    },
    travelers: travelerFormData.map(t => ({
      name: t.first_name,
      surname1: t.last_name.split(' ')[0],
      surname2: t.last_name.split(' ')[1] || '',
      birthdate: `${t.birth_date}T00:00:00Z`,
      idType: mapIdType(t.document_type),
      idNum: t.document_number,
      idSupport: 'CHC000000', // Necesitamos este campo
      nationality: mapCountryCode(t.nationality), // ISO 3166-1 alpha-3
      sex: t.gender === 'M' ? 'H' : t.gender === 'F' ? 'M' : null,
      email: t.email,
      phone: t.phone,
      address: {
        address: t.address_street,
        municipalityName: t.address_city,
        postalCode: t.address_postal_code,
        country: mapCountryCode(t.address_country)
      },
      signature: signatureData
    }))
  };
}

function mapPaymentMethod(method: string): string {
  const map: Record<string, string> = {
    'CASH': 'EFECT',
    'CARD': 'TARJT',
    'TRANS': 'TRANS',
    'OTHER': 'OTRO'
  };
  return map[method] || 'EFECT';
}

function mapIdType(type: string): string {
  const map: Record<string, string> = {
    'DNI': 'NIF',
    'NIE': 'NIE',
    'PASSPORT': 'PAS'
  };
  return map[type] || 'PAS';
}

function mapCountryCode(code: string): string {
  // Convertir ISO alpha-2 a alpha-3
  const map: Record<string, string> = {
    'ES': 'ESP',
    'AR': 'ARG',
    'US': 'USA',
    'FR': 'FRA',
    'GB': 'GBR',
    'DE': 'DEU',
    'IT': 'ITA'
  };
  return map[code] || code;
}
```

---

## ✅ Resumen

| Aspecto | Estado | Acción Necesaria |
|---------|--------|------------------|
| Endpoint correcto | ✅ Identificado | `/api/v1/public/reports/contract` |
| Formato payload | ✅ Documentado | Ver swagger.json |
| Autenticación OAuth2 | ❌ Bloqueador | Solicitar credenciales a Lynx |
| Mapeo de datos | ⚠️ Pendiente | Implementar funciones de mapeo |
| Actualizar código | ⚠️ Pendiente | Esperar credenciales OAuth2 |

---

## 🎯 Acción Inmediata

**Contactar a Lynx** para solicitar:
1. ✅ Credenciales OAuth2 (Client ID + Secret)
2. ✅ Token endpoint URL
3. ✅ Documentación del flujo de autenticación
4. ✅ Ejemplo de request completo autenticado

Una vez tengamos las credenciales, podremos:
1. Implementar autenticación OAuth2
2. Actualizar el código del edge function
3. Probar el envío completo
4. Reenviar los partes pendientes

---

**Última actualización**: 31 de Octubre, 2025


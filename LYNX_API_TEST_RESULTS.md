# 🧪 Resultados de Tests - API Lynx Partners

**Fecha**: 31 de Octubre, 2025  
**Account ID**: `a190fff8-c5d0-49a2-80a8-79b38ce0f284`  
**Base URL**: `https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/partners-api/v1`

---

## 📊 Resumen Ejecutivo

| Test | Endpoint | Método | Estado | Resultado |
|------|----------|--------|--------|-----------|
| 1 | `/accounts/{id}` | GET | ✅ | Funciona - Devuelve info de cuenta |
| 2 | `/accounts/{id}/lodgings` | GET | ✅ | Funciona - Lista todos los lodgings |
| 3 | `/accounts/{id}/lodgings/{id}` | GET | ✅ | Funciona - Detalles de lodging |
| 4 | `/accounts/{id}/lodgings` | POST | ✅ | Funciona - Crea nuevo lodging |
| 5 | `/accounts/{id}/lodgings/{id}` | PUT | ❌ | 405 Method Not Allowed |
| 6 | `/accounts/{id}/lodgings/{id}` | DELETE | ❌ | Conflict - "Invalid reference to id" |
| 7 | `/accounts/{id}/lodgings/{id}/travelers` | POST | ❌ | 404 Cannot POST |
| 8 | `/accounts/{id}/lodgings/{id}/submissions` | GET | ❌ | 404 Cannot GET |
| 9 | `/accounts/{id}/auth-connections` | GET | ❌ | 404 Cannot GET |

---

## ✅ Tests Exitosos

### 1. Obtener Información de Cuenta
```http
GET /accounts/a190fff8-c5d0-49a2-80a8-79b38ce0f284
Status: 200 OK
```

**Respuesta:**
```json
{
  "id": "a190fff8-c5d0-49a2-80a8-79b38ce0f284",
  "userId": "5d4077a4-30f1-7027-787f-7d22f9117eef",
  "email": "nacho.lopezosa@gmail.com",
  "name": "Nacho",
  "phone": "+34652044477",
  "onboardingStep": 2,
  "onboarded": true,
  "createdAt": "2025-05-16T19:40:58.673109Z",
  "updatedAt": "2025-05-16T19:43:38.811259Z"
}
```

**✅ Conclusión**: La cuenta está activa y completamente configurada (onboarded = true).

---

### 2. Listar Todos los Lodgings
```http
GET /accounts/a190fff8-c5d0-49a2-80a8-79b38ce0f284/lodgings
Status: 200 OK
```

**Respuesta:**
```json
{
  "lodgings": [
    {
      "id": "35b0f745-fc47-4b45-9807-6612860e35d0",
      "accountId": "a190fff8-c5d0-49a2-80a8-79b38ce0f284",
      "authConnId": "18b8c296-5ffb-4015-a5e9-8e0fb5050dc4",
      "name": "Cabaña Mirlo Blanco",
      "establishmentCode": "0000003001",
      "internet": true,
      "numRooms": 1,
      "createdAt": "2025-10-31T09:44:37.723108Z",
      "updatedAt": "2025-10-31T09:44:37.723108Z"
    },
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
    }
  ]
}
```

**✅ Conclusión**: Se pueden listar todos los lodgings. Hay 2 lodgings con el mismo nombre pero códigos de establecimiento diferentes.

---

### 3. Obtener Detalles de un Lodging Específico
```http
GET /accounts/a190fff8-c5d0-49a2-80a8-79b38ce0f284/lodgings/3dfc0644-612d-4449-9dd6-de7a9d15b012
Status: 200 OK
```

**Respuesta:**
```json
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
}
```

**✅ Conclusión**: Se pueden obtener detalles de lodgings individuales por su ID.

---

### 4. Crear Nuevo Lodging
```http
POST /accounts/a190fff8-c5d0-49a2-80a8-79b38ce0f284/lodgings
Status: 200 OK
```

**Payload usado:**
```json
{
  "name": "Cabaña Mirlo Blanco",
  "authConnId": "18b8c296-5ffb-4015-a5e9-8e0fb5050dc4",
  "establishmentCode": "0000003001",
  "internet": true,
  "numRooms": 1
}
```

**✅ Conclusión**: Se pueden crear nuevos lodgings exitosamente.

---

## ❌ Tests Fallidos

### 5. Actualizar Lodging (PUT)
```http
PUT /accounts/a190fff8-c5d0-49a2-80a8-79b38ce0f284/lodgings/3dfc0644-612d-4449-9dd6-de7a9d15b012
Status: 405 Method Not Allowed
```

**❌ Conclusión**: El método PUT no está implementado o permitido en la API. No se pueden actualizar lodgings existentes.

**Workaround**: Eliminar y recrear el lodging (si DELETE funciona).

---

### 6. Eliminar Lodging (DELETE)
```http
DELETE /accounts/a190fff8-c5d0-49a2-80a8-79b38ce0f284/lodgings/3dfc0644-612d-4449-9dd6-de7a9d15b012
Status: Error - Conflict
```

**Respuesta:**
```json
{
  "message": "Invalid reference to id",
  "code": "conflict",
  "cause": "id"
}
```

**❌ Conclusión**: No se puede eliminar un lodging. Posibles razones:
- El lodging tiene referencias (submissions/travelers enviados)
- Soft delete no implementado
- Protección contra borrado accidental

---

### 7. Enviar Parte de Viajeros (POST /travelers) ⚠️ **CRÍTICO**
```http
POST /accounts/a190fff8-c5d0-49a2-80a8-79b38ce0f284/lodgings/3dfc0644-612d-4449-9dd6-de7a9d15b012/travelers
Status: 404 Cannot POST
```

**Payload usado:**
```json
{
  "checkInDate": "2025-11-10",
  "checkOutDate": "2025-11-13",
  "travelers": [
    {
      "firstName": "Juan",
      "lastName": "Garcia Lopez",
      "documentType": "DNI",
      "documentNumber": "53571577T",
      "nationality": "AR",
      "birthDate": "1999-12-12",
      "gender": "M",
      "email": "alvarotorrent1@gmail.com",
      "phone": "654654654",
      "address": {
        "street": "Avenida imperio argentina 7, portal 4, 4A",
        "city": "Málaga",
        "postalCode": "b1043",
        "country": "AR"
      }
    }
  ],
  "signature": "[SVG DATA]",
  "paymentMethod": "CASH"
}
```

**❌ Conclusión**: Este es el endpoint principal de la integración y NO FUNCIONA.

**Posibles causas:**
1. Endpoint aún no implementado por Lynx
2. Ruta diferente (ej: `/submissions`, `/check-ins`, `/reports`)
3. Requiere autenticación adicional (API Key, Bearer token)
4. Feature no activado para esta cuenta

---

### 8. Listar Submissions Previas
```http
GET /accounts/a190fff8-c5d0-49a2-80a8-79b38ce0f284/lodgings/3dfc0644-612d-4449-9dd6-de7a9d15b012/submissions
Status: 404 Cannot GET
```

**❌ Conclusión**: No existe endpoint para consultar submissions/envíos previos.

---

### 9. Listar Conexiones de Autoridad
```http
GET /accounts/a190fff8-c5d0-49a2-80a8-79b38ce0f284/auth-connections
Status: 404 Cannot GET
```

**❌ Conclusión**: No se puede listar las auth-connections disponibles. El `authConnId` debe obtenerse manualmente del soporte de Lynx.

---

## 🔍 Análisis de la Situación

### Lo que SÍ funciona:
1. ✅ **Gestión básica de lodgings** (GET, POST)
2. ✅ **Información de cuenta**
3. ✅ **Listado de lodgings**

### Lo que NO funciona:
1. ❌ **Envío de partes de viajeros** (endpoint crítico)
2. ❌ **Actualización de lodgings** (PUT)
3. ❌ **Eliminación de lodgings** (DELETE con conflicto)
4. ❌ **Consulta de submissions previas**
5. ❌ **Listado de auth-connections**

---

## 📞 Preguntas para Lynx Check-in

### **1. Endpoint de Travelers (CRÍTICO)**
```
¿Cuál es el endpoint correcto para enviar partes de viajeros?

Intentamos:
- POST /accounts/{id}/lodgings/{id}/travelers → 404
- POST /accounts/{id}/lodgings/{id}/traveler-submissions → 404

¿Es alguno de estos?
- /accounts/{id}/submissions
- /accounts/{id}/lodgings/{id}/check-ins
- /accounts/{id}/reports
- Otro endpoint diferente

¿Se requiere autenticación adicional (API Key)?
```

### **2. Gestión de Lodgings**
```
¿Cómo se actualizan lodgings existentes?
- PUT no funciona (405)
- ¿Hay otro endpoint para actualizar?

¿Cómo se eliminan lodgings?
- DELETE da "Invalid reference to id"
- ¿Es soft delete?
- ¿Cómo manejar lodgings obsoletos?
```

### **3. Consulta de Datos**
```
¿Cómo consultar submissions/envíos previos?
- GET /lodgings/{id}/submissions → 404

¿Cómo listar auth-connections disponibles?
- GET /accounts/{id}/auth-connections → 404
```

### **4. Documentación**
```
¿Tienen documentación completa de la API de Partners?
- OpenAPI/Swagger spec
- Postman collection
- Ejemplos de payloads
- Rate limits
- Webhooks disponibles
```

---

## 🛠️ Recomendaciones Técnicas

### Inmediato (mientras esperamos respuesta):
1. **Guardar errores en BD**: Modificar edge function para almacenar intentos fallidos
2. **Sistema de reintentos**: Implementar cola de reintentos para cuando se arregle el endpoint
3. **Notificaciones**: Alertar al gestor cuando un parte no se envía

### Cuando tengamos el endpoint correcto:
1. Actualizar `lynxCheckinService.ts` con la URL correcta
2. Redeploy del edge function `submit-traveler-form`
3. Reenviar partes pendientes manualmente
4. Configurar monitoring y alertas

---

## 📋 Checklist de Integración

| Feature | Estado | Notas |
|---------|--------|-------|
| Crear lodging | ✅ | Funciona correctamente |
| Listar lodgings | ✅ | Funciona correctamente |
| Obtener detalles lodging | ✅ | Funciona correctamente |
| Actualizar lodging | ❌ | PUT no soportado |
| Eliminar lodging | ❌ | Conflicto - referencia inválida |
| Enviar parte viajeros | ❌ | **BLOQUEADOR** - 404 |
| Consultar submissions | ❌ | Endpoint no existe |
| Listar auth-connections | ❌ | Endpoint no existe |

---

## 📧 Email Template para Lynx

```
Asunto: Consulta sobre API de Partners - Endpoint de Travelers

Hola equipo de Lynx Check-in,

Estamos integrando nuestra plataforma (Host Helper) con su API de Partners 
y necesitamos clarificación sobre algunos endpoints:

CRÍTICO - Envío de Partes de Viajeros:
- Endpoint probado: POST /accounts/{id}/lodgings/{id}/travelers
- Respuesta: 404 "Cannot POST"
- ¿Cuál es el endpoint correcto para enviar partes?
- ¿Se requiere API Key u otra autenticación?

Nuestra cuenta:
- Account ID: a190fff8-c5d0-49a2-80a8-79b38ce0f284
- Email: nacho.lopezosa@gmail.com

Adjunto documento con tests realizados: LYNX_API_TEST_RESULTS.md

¿Pueden proporcionarnos:
1. Endpoint correcto para envío de travelers
2. Documentación completa de la API
3. Ejemplos de payloads
4. Información sobre webhooks disponibles

Gracias,
[Tu nombre]
```

---

## 🎯 Próximos Pasos

1. **Contactar con Lynx** usando el template de arriba
2. **Mientras tanto**:
   - Mejorar manejo de errores en edge function
   - Implementar sistema de reintentos
   - Añadir logging detallado
   - Crear panel de "Partes Pendientes" en dashboard
3. **Una vez tengamos respuesta**:
   - Actualizar código con endpoint correcto
   - Redeploy edge functions
   - Probar con datos reales
   - Reenviar partes pendientes

---

**Última actualización**: 31 de Octubre, 2025


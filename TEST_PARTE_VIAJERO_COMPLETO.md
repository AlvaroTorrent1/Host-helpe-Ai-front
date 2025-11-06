# Test Completo de Parte de Viajero - Cabaña Mirlo Blanco

## 📋 Resumen del Test

Este documento contiene toda la información necesaria para completar un test completo del flujo de parte de viajero, desde la creación de la reserva hasta el envío a la API de Lynx.

---

## ✅ Datos Creados

### 1. Propiedad
- **Nombre**: Cabaña Mirlo Blanco
- **ID**: `16fbf161-beda-46b7-baca-16243049562d`
- **Lynx Lodging ID**: `3dfc0644-612d-4449-9dd6-de7a9d15b012` ✅
- **Lynx Account ID**: `a190fff8-c5d0-49a2-80a8-79b38ce0f284` ✅
- **Estado**: Configurada para enviar a Lynx

### 2. Reserva
- **ID**: `63`
- **Huésped**: Juan Pérez García
- **Teléfono**: +34612345678
- **Nacionalidad**: ES (España)
- **Check-in**: 2025-11-02 (mañana)
- **Check-out**: 2025-11-05 (en 4 días)
- **Estado**: active
- **Notas**: Reserva de prueba para test de parte de viajero con Lynx API

### 3. Parte de Viajeros
- **ID**: `7b592be9-17b7-4e67-9d17-6dd49a954e8f`
- **Token**: `70448af1-4c92-4d13-8360-848b7ff4adec`
- **Propiedad**: Cabaña Mirlo Blanco
- **Email del huésped**: juan.perez@example.com
- **Teléfono**: +34612345678
- **Viajeros esperados**: 1
- **Estado**: pending
- **Expira**: 2025-12-01 (30 días desde hoy)

---

## 🔗 URL del Formulario Público

Para completar el parte de viajero, accede a:

```
http://localhost:5173/check-in/70448af1-4c92-4d13-8360-848b7ff4adec
```

O en producción:
```
https://tu-dominio.com/check-in/70448af1-4c92-4d13-8360-848b7ff4adec
```

---

## 📝 Datos de Ejemplo para Completar el Formulario

### Información Personal
- **Nombre**: Juan
- **Primer Apellido**: Pérez
- **Segundo Apellido**: García
- **Nacionalidad**: ES (España)
- **Género**: Masculino (M)

### Documento de Identidad
- **Tipo de Documento**: DNI
- **Número de Documento**: 12345678A
- **Fecha de Nacimiento**: 1990-05-15
- **Lugar de Nacimiento**: Madrid (opcional)

### Residencia
- **País de Residencia**: ES (España)

### Dirección
- **Ciudad**: Madrid
- **Código Postal**: 28001
- **Dirección**: Calle Gran Vía 123
- **Información Adicional**: Piso 3, Puerta B (opcional)

### Contacto
- **Email**: juan.perez@example.com
- **Código de País (Teléfono)**: +34
- **Teléfono**: 612345678

### Pago (Opcional)
- **Método de Pago**: CASH (Efectivo)
- **Titular del Pago**: Juan Pérez García
- **Fecha de Pago**: 2025-11-01

### Firma
- Dibuja tu firma en el canvas
- La firma se capturará como SVG y se subirá a Supabase Storage

### Consentimiento
- ✅ Acepto la política de privacidad y el tratamiento de datos

---

## 🚀 Flujo del Test

### Paso 1: Acceder al Formulario
1. Abre el navegador
2. Accede a la URL del formulario (ver arriba)
3. Verás la información de la reserva:
   - Propiedad: Cabaña Mirlo Blanco
   - Check-in: 2025-11-02
   - Check-out: 2025-11-05
   - 1 viajero esperado

### Paso 2: Completar el Formulario
1. Haz clic en "Añadir Viajero"
2. Completa el wizard de 4 pasos:
   - **Personal**: Nombre, apellidos, nacionalidad, género
   - **Documento**: Tipo, número, fecha de nacimiento
   - **Residencia**: País de residencia, dirección
   - **Contacto**: Email, teléfono
3. Guarda el viajero

### Paso 3: Añadir Información de Pago (Opcional)
1. Selecciona el método de pago
2. Completa los datos del titular
3. Selecciona la fecha de pago

### Paso 4: Firmar
1. Dibuja tu firma en el canvas
2. La firma se capturará automáticamente

### Paso 5: Enviar
1. Acepta el consentimiento de privacidad
2. Haz clic en "Enviar Check-in"
3. El sistema:
   - Guardará los datos en `traveler_form_data`
   - Actualizará el estado a "completed"
   - Subirá la firma a Supabase Storage
   - **Enviará automáticamente a Lynx API** (porque `lynx_lodging_id` está configurado)
   - Lynx transmitirá al Ministerio del Interior (SES.hospedajes)

---

## 🔍 Verificación del Envío

### 1. Verificar en la Base de Datos

```sql
-- Ver el parte de viajeros completado
SELECT 
  id,
  status,
  num_travelers_completed,
  num_travelers_expected,
  lynx_submission_id,
  lynx_submitted_at,
  completed_at
FROM traveler_form_requests
WHERE token = '70448af1-4c92-4d13-8360-848b7ff4adec';

-- Ver los datos del viajero
SELECT 
  id,
  first_name,
  last_name,
  document_type,
  document_number,
  nationality,
  email,
  submitted_at
FROM traveler_form_data
WHERE form_request_id = '7b592be9-17b7-4e67-9d17-6dd49a954e8f';

-- Ver el payload y respuesta de Lynx
SELECT 
  lynx_payload,
  lynx_response
FROM traveler_form_requests
WHERE id = '7b592be9-17b7-4e67-9d17-6dd49a954e8f';
```

### 2. Verificar en los Logs de Supabase

1. Ve a Supabase Dashboard
2. Edge Functions > submit-traveler-form > Logs
3. Busca los siguientes mensajes:
   - ✅ `Traveler data submitted for request...`
   - 🚀 `All travelers completed. Sending to Lynx Check-in...`
   - 📤 `Subiendo firma a Storage...`
   - ✅ `Firma subida correctamente...`
   - 📦 `Payload preparado para 1 viajero(s)`
   - ✅ `Enviado a Lynx exitosamente: [submission_id]`

### 3. Verificar en Supabase Storage

1. Ve a Supabase Dashboard > Storage
2. Bucket: `traveler-signatures`
3. Ruta: `account/a190fff8-c5d0-49a2-80a8-79b38ce0f284/lodging/3dfc0644-612d-4449-9dd6-de7a9d15b012/report/7b592be9-17b7-4e67-9d17-6dd49a954e8f/signature-[timestamp].svg`

---

## 🔧 Troubleshooting

### El formulario no carga
- Verifica que el token sea correcto
- Verifica que no haya expirado (expires_at)
- Verifica que el estado sea "pending" (no "completed")

### El envío a Lynx falla
- Verifica que `lynx_lodging_id` esté configurado en la propiedad
- Verifica que `lynx_account_id` esté configurado en la propiedad
- Revisa los logs de la Edge Function para ver el error exacto
- Verifica que la API de Lynx esté disponible

### La firma no se sube
- Verifica que el bucket `traveler-signatures` exista en Supabase Storage
- Verifica los permisos del bucket (debe ser privado)
- Verifica que la firma se haya capturado correctamente (debe ser un SVG válido)

---

## 📊 Estructura del Payload a Lynx

El payload que se envía a Lynx tiene esta estructura:

```json
{
  "accountId": "a190fff8-c5d0-49a2-80a8-79b38ce0f284",
  "lodgingId": "3dfc0644-612d-4449-9dd6-de7a9d15b012",
  "checkInDate": "2025-11-02",
  "checkOutDate": "2025-11-05",
  "signaturePath": "account/.../signature-[timestamp].svg",
  "paymentMethod": "CASH",
  "travelers": [
    {
      "firstName": "Juan",
      "lastName": "Pérez García",
      "documentType": "DNI",
      "documentNumber": "12345678A",
      "nationality": "ES",
      "birthDate": "1990-05-15",
      "gender": "M",
      "email": "juan.perez@example.com",
      "phone": "+34612345678",
      "address": {
        "street": "Calle Gran Vía 123",
        "city": "Madrid",
        "postalCode": "28001",
        "country": "ES",
        "additional": "Piso 3, Puerta B"
      }
    }
  ]
}
```

---

## ✅ Checklist del Test

- [x] Propiedad creada con Lynx IDs configurados
- [x] Reserva creada para 1 persona
- [x] Parte de viajeros creado y pendiente
- [ ] Formulario público accesible
- [ ] Datos del viajero completados
- [ ] Firma capturada
- [ ] Consentimiento aceptado
- [ ] Formulario enviado exitosamente
- [ ] Datos guardados en `traveler_form_data`
- [ ] Estado actualizado a "completed"
- [ ] Firma subida a Storage
- [ ] Payload enviado a Lynx API
- [ ] Respuesta de Lynx recibida y guardada
- [ ] `lynx_submission_id` guardado en la BD

---

## 🎯 Resultado Esperado

Al completar el test exitosamente:

1. ✅ Los datos del viajero se guardan en nuestra base de datos
2. ✅ La firma se sube a Supabase Storage
3. ✅ El parte se envía automáticamente a Lynx API
4. ✅ Lynx transmite al Ministerio del Interior (SES.hospedajes)
5. ✅ El estado del parte cambia a "completed"
6. ✅ Se guarda el `lynx_submission_id` para trazabilidad
7. ✅ El gestor puede ver el parte completado en el dashboard

---

## 📚 Documentación Relacionada

- [Lynx API Documentation](./LYNX_API_DISCOVERY.md)
- [Lynx Test Guide](./LYNX_TEST_GUIDE.md)
- [Traveler Forms Reset Guide](./documentation/database/traveler-forms-reset.md)
- [Edge Function: submit-traveler-form](./supabase/functions/submit-traveler-form/index.ts)
- [Edge Function: retry-lynx-submission](./supabase/functions/retry-lynx-submission/index.ts)

---

**Fecha de creación**: 2025-11-01  
**Última actualización**: 2025-11-01  
**Estado**: ✅ Listo para test











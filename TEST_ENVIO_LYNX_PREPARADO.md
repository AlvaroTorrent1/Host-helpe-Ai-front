# ✅ Test de Envío a Lynx - Todo Preparado

## 📋 Resumen Ejecutivo

Se ha creado exitosamente:
- ✅ **1 Reserva nueva** en la base de datos
- ✅ **1 Parte de viajeros** asociado a la reserva
- ✅ **Token único** generado para acceso público
- ✅ **Propiedad configurada** con Lynx (lynx_lodging_id activo)

---

## 🎯 Datos de la Reserva Creada

### Información General
| Campo | Valor |
|-------|-------|
| **Reservation ID** | `75` |
| **Reservation UUID** | `1194f9ae-8aad-4fae-83db-48f90a64d106` |
| **Propiedad** | Cabaña Mirlo Blanco |
| **Ciudad** | Torre del Mar |
| **Huésped** | Carlos Martínez Ruiz |
| **Email** | carlos.martinez@example.com |
| **Teléfono** | +34666777888 |
| **Nacionalidad** | España (ES) |
| **Check-in** | 2025-11-04 (mañana) |
| **Check-out** | 2025-11-06 (2 noches) |
| **Estado** | Active |

### Configuración Lynx
| Campo | Valor |
|-------|-------|
| **Lynx Lodging ID** | `3dfc0644-612d-4449-9dd6-de7a9d15b012` |
| **Lynx Status** | `active` ✅ |
| **Lynx Account ID** | `a190fff8-c5d0-49a2-80a8-79b38ce0f284` |

---

## 🔗 Enlace del Parte de Viajeros

### Token Generado
```
62e5dfaa-7317-4cf6-951a-6b6866134e0b
```

### URL Pública (Producción)
```
https://hosthelperai.com/check-in/62e5dfaa-7317-4cf6-951a-6b6866134e0b
```

### URL Local (Desarrollo)
```
http://localhost:5173/check-in/62e5dfaa-7317-4cf6-951a-6b6866134e0b
```

### Información del Formulario
| Campo | Valor |
|-------|-------|
| **Form Request ID** | `1308514b-1852-4653-9c9d-195b2f5003be` |
| **Estado** | `pending` (esperando que el turista lo complete) |
| **Viajeros Esperados** | 1 |
| **Viajeros Completados** | 0 |
| **Expira** | 2025-12-03 (30 días) |

---

## 🧪 Cómo Probar el Flujo Completo

### Paso 1: Acceder al Formulario como Turista
1. Abre la URL en una **ventana de incógnito** (simula ser el turista):
   ```
   https://hosthelperai.com/check-in/62e5dfaa-7317-4cf6-951a-6b6866134e0b
   ```

2. Deberías ver la página de check-in con:
   - Información de la reserva (Cabaña Mirlo Blanco, 2025-11-04 → 2025-11-06)
   - Formulario para añadir viajeros

### Paso 2: Completar los Datos del Viajero
Rellena el formulario con datos de prueba. Aquí tienes un ejemplo completo:

#### Información Personal
- **Nombre**: Carlos
- **Primer Apellido**: Martínez
- **Segundo Apellido**: Ruiz
- **Tipo de Documento**: DNI
- **Número de Documento**: 12345678Z
- **Fecha de Nacimiento**: 1990-05-15
- **Género**: Masculino
- **Nacionalidad**: España (ES)

#### Residencia
- **País de Residencia**: España (ES)

#### Dirección
- **Ciudad**: Málaga
- **Código Postal**: 29001
- **Dirección**: Calle Larios 15
- **Información Adicional**: Piso 2B (opcional)
- **Código INE**: 29067 (Málaga)

#### Contacto
- **Email**: carlos.martinez@example.com
- **País del Teléfono**: España (+34)
- **Teléfono**: 666777888

### Paso 3: Método de Pago y Firma
1. Selecciona un método de pago (ej: "En destino")
2. Dibuja una firma en el panel
3. Acepta el consentimiento de protección de datos
4. Haz clic en **"Enviar Check-in"**

### Paso 4: Verificar el Envío

#### A. Mensaje de Éxito
Deberías ver un toast verde con:
```
✅ Enviando datos de 1 viajero...
✅ Parte de viajero enviado exitosamente
```

#### B. Verificar en Base de Datos
Ejecuta esta query en Supabase:

```sql
-- Ver los datos del viajero guardados
SELECT 
  tfd.id,
  tfd.first_name,
  tfd.last_name,
  tfd.document_type,
  tfd.document_number,
  tfd.nationality,
  tfd.birth_date,
  tfd.email,
  tfd.phone,
  tfd.signature_data IS NOT NULL AS has_signature,
  tfd.consent_accepted,
  tfd.submitted_at
FROM traveler_form_data tfd
JOIN traveler_form_requests tfr ON tfr.id = tfd.form_request_id
WHERE tfr.id = '1308514b-1852-4653-9c9d-195b2f5003be'
ORDER BY tfd.submitted_at DESC;
```

#### C. Verificar Estado del Envío a Lynx
```sql
-- Ver si se envió a Lynx correctamente
SELECT 
  tfr.id,
  tfr.property_name,
  tfr.guest_email,
  tfr.num_travelers_expected,
  tfr.num_travelers_completed,
  tfr.status,
  tfr.lynx_submission_id,
  tfr.lynx_submitted_at,
  tfr.lynx_payload IS NOT NULL AS has_payload,
  tfr.lynx_response IS NOT NULL AS has_response,
  tfr.completed_at,
  -- Ver la respuesta de Lynx (si existe)
  tfr.lynx_response
FROM traveler_form_requests tfr
WHERE tfr.id = '1308514b-1852-4653-9c9d-195b2f5003be';
```

**Valores Esperados:**
- ✅ `num_travelers_completed` = 1
- ✅ `status` = 'completed'
- ✅ `lynx_submission_id` = UUID generado por Lynx
- ✅ `lynx_submitted_at` = timestamp del envío
- ✅ `lynx_response` = objeto JSON con la respuesta

---

## 🔍 Verificar en Lynx API

### Ver Partes Enviados (Reports)
```bash
curl -X GET \
  "https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/partners-api/v1/accounts/a190fff8-c5d0-49a2-80a8-79b38ce0f284/lodgings/3dfc0644-612d-4449-9dd6-de7a9d15b012/reports" \
  | jq
```

Deberías ver un array con el parte que acabas de enviar, incluyendo:
- `checkInDate`: "2025-11-04..."
- `checkOutDate`: "2025-11-06..."
- `numPeople`: 1
- `travelers`: array con 1 viajero (Carlos Martínez Ruiz)

---

## 📊 Estado Esperado Después del Test

### Base de Datos (traveler_form_requests)
| Campo | Valor Esperado |
|-------|----------------|
| `status` | `completed` |
| `num_travelers_completed` | `1` |
| `lynx_submission_id` | UUID generado por Lynx |
| `lynx_submitted_at` | Timestamp ISO |
| `completed_at` | Timestamp ISO |

### Base de Datos (traveler_form_data)
| Campo | Valor Esperado |
|-------|----------------|
| `first_name` | Carlos |
| `last_name` | Martínez Ruiz |
| `document_type` | DNI |
| `document_number` | 12345678Z |
| `nationality` | ES |
| `email` | carlos.martinez@example.com |
| `signature_data` | (base64 de la firma) |
| `consent_accepted` | true |

### Lynx API
- ✅ Nuevo report creado en Lynx
- ✅ Status del report: probablemente "pending" o "submitted"
- ✅ El parte se transmitirá automáticamente al SES (Ministerio del Interior)

---

## 🚨 Troubleshooting

### Error: "Token inválido o expirado"
**Causa**: El token no existe o ha expirado  
**Solución**: Verifica que la URL es exacta y que el token no ha expirado (válido hasta 2025-12-03)

### Error: "No se pudo guardar el viajero"
**Causa**: Datos faltantes o incorrectos  
**Solución**: 
- Verifica que todos los campos obligatorios estén completos
- Verifica que el DNI tenga la letra de control correcta
- Verifica que el formato de fecha sea correcto (YYYY-MM-DD)

### Error al Enviar a Lynx
**Causa**: Problema en la integración con Lynx  
**Solución**:
1. Revisa los logs de la Edge Function `submit-traveler-form`:
   ```
   Supabase Dashboard > Functions > submit-traveler-form > Invocations
   ```
2. Busca errores con "Lynx" en el log
3. Verifica que `lynx_lodging_id` de la propiedad sea correcto
4. Verifica el payload en `lynx_payload` de la tabla

### No Aparece en Lynx API
**Posibles Causas**:
1. **Lynx rechazó el parte**: Revisa `lynx_response` para ver el error
2. **Lodging incorrecto**: Verifica que `lynx_lodging_id` sea el correcto
3. **Datos inválidos**: Lynx puede rechazar si hay datos que no cumplan sus reglas

---

## 📝 Notas Importantes

### Flujo Automático
1. **Turista completa formulario** → Datos guardados en `traveler_form_data`
2. **Trigger automático actualiza** → `num_travelers_completed` en `traveler_form_requests`
3. **Si completado == esperado** → Edge Function envía automáticamente a Lynx
4. **Lynx valida y acepta** → Lynx transmite al SES (Ministerio)

### Campos Críticos para Lynx
- **Documento**: Tipo correcto (DNI/NIE/PASSPORT) y número válido
- **Fecha de Nacimiento**: Formato ISO (YYYY-MM-DD)
- **Teléfono**: Formato internacional (+34...)
- **Nacionalidad**: Código ISO-3 (ej: ESP para España)
- **Dirección**: Ciudad y código postal obligatorios
- **Firma**: Base64 de la firma del turista

### Datos Hardcodeados
- `authConnId`: 18b8c296-5ffb-4015-a5e9-8e0fb5050dc4
- `LYNX_ACCOUNT_ID`: a190fff8-c5d0-49a2-80a8-79b38ce0f284

---

## 🔄 Limpiar Datos de Prueba (Opcional)

Si necesitas resetear y volver a probar:

```sql
-- ⚠️ CUIDADO: Esto borrará los datos de prueba

-- 1. Borrar datos de formulario completado
DELETE FROM traveler_form_data
WHERE form_request_id = '1308514b-1852-4653-9c9d-195b2f5003be';

-- 2. Resetear el request a pending (o borrarlo)
UPDATE traveler_form_requests
SET 
  num_travelers_completed = 0,
  status = 'pending',
  completed_at = NULL,
  lynx_submission_id = NULL,
  lynx_submitted_at = NULL,
  lynx_payload = NULL,
  lynx_response = NULL
WHERE id = '1308514b-1852-4653-9c9d-195b2f5003be';

-- O borrar completamente:
-- DELETE FROM traveler_form_requests
-- WHERE id = '1308514b-1852-4653-9c9d-195b2f5003be';

-- 3. (Opcional) Borrar la reserva
-- DELETE FROM reservations WHERE id = 75;
```

---

## 📞 Archivos de Referencia

### Edge Functions
- `supabase/functions/submit-traveler-form/index.ts` - Guarda datos y envía a Lynx
- `supabase/functions/_shared/lynxCheckinService.ts` - Servicio de integración con Lynx

### Frontend
- `src/features/sesregistro/SesRegistroPage.tsx` - Página del formulario público
- `src/features/sesregistro/components/AddTravelerWizard.tsx` - Wizard multi-paso

### Tipos
- `src/features/sesregistro/types.ts` - Tipos de viajero y reserva
- `supabase/functions/_shared/lynxCheckinService.ts` - Tipos de Lynx API

### Documentación
- `LYNX_API_FINDINGS.md` - Documentación de la API de Lynx
- `LYNX_TEST_GUIDE.md` - Guía de testing de Lynx
- `test-reserva-parte-viajeros.sql` - Queries SQL de ejemplo

---

## ✅ Checklist de Verificación

Después de completar el test, confirma:

- [ ] El formulario se carga correctamente con los datos de la reserva
- [ ] Puedes añadir un viajero con todos los campos obligatorios
- [ ] La firma se puede dibujar correctamente
- [ ] Se muestra el toast de "Enviando datos de 1 viajero..."
- [ ] Se muestra el toast de éxito
- [ ] Los datos aparecen en `traveler_form_data`
- [ ] El status cambió a `completed` en `traveler_form_requests`
- [ ] `lynx_submission_id` está presente
- [ ] `lynx_response` contiene la respuesta de Lynx
- [ ] El parte aparece en la API de Lynx (GET /reports)

---

## 🎉 ¡Todo Listo!

**Tiempo estimado del test:** 5-10 minutos

**Próximo paso:**
1. Abre la URL del formulario en incógnito
2. Completa los datos del viajero
3. Envía el formulario
4. Verifica que se guardó y se envió a Lynx

---

**Creado:** 2025-11-03  
**Estado:** ✅ Listo para Testing  
**Reserva ID:** 75  
**Token:** 62e5dfaa-7317-4cf6-951a-6b6866134e0b


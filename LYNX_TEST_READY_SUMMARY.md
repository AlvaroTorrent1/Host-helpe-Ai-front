# ✅ Test de Lynx API - TODO LISTO

## 🎉 Resumen de Preparación Completada

**Fecha:** 31 de Octubre, 2025  
**Estado:** ✅ **100% Listo para Test**

---

## ✅ Checklist de Preparación

### **Base de Datos**
- [x] Campo `lynx_lodging_id` añadido a tabla `properties`
- [x] Índice `idx_properties_lynx_lodging_id` creado
- [x] Todos los campos SES/Lynx presentes y verificados
- [x] Migración `add_lynx_lodging_id_field` aplicada exitosamente

### **Edge Functions**
- [x] `lynx-register-lodging` desplegada (versión 3)
- [x] Estado: **ACTIVE**
- [x] verify_jwt: **false** (correcto para llamadas desde frontend autenticado)

### **Código**
- [x] `lynxCheckinService.ts` con `registerLodging()` implementado
- [x] authConnId hardcodeado: `18b8c296-5ffb-4015-a5e9-8e0fb5050dc4`
- [x] LYNX_ACCOUNT_ID: `a190fff8-c5d0-49a2-80a8-79b38ce0f284`
- [x] API URL configurada correctamente
- [x] Sin autenticación requerida para POST /lodgings

### **Documentación Creada**
- [x] `LYNX_TEST_DATA.md` - Datos validados para el formulario
- [x] `LYNX_TEST_VERIFICATION.sql` - Queries de verificación SQL
- [x] `LYNX_TEST_GUIDE.md` - Guía paso a paso completa
- [x] Este documento resumen

---

## 📂 Archivos Creados

### **1. LYNX_TEST_DATA.md**
Datos de prueba validados y listos para copiar/pegar en el formulario.

**Contiene:**
- ✅ Información básica (nombre, dirección, ciudad, etc.)
- ✅ Información turística (licencia, tipo, capacidad)
- ✅ Datos del propietario (nombre, email, teléfono, DNI con letra correcta)
- ✅ Credenciales SES ficticias para test
- ✅ Payload esperado que se enviará a Lynx
- ✅ Valores esperados después del registro

### **2. LYNX_TEST_VERIFICATION.sql**
11 queries SQL para verificar cada etapa del test.

**Incluye:**
- ✅ Verificar campo `lynx_lodging_id`
- ✅ Ver todos los campos SES/Lynx
- ✅ Buscar propiedad de prueba
- ✅ Verificar datos completos
- ✅ Verificar IDs Lynx después del registro
- ✅ Estadísticas generales
- ✅ Queries de limpieza (con precaución)

### **3. LYNX_TEST_GUIDE.md**
Guía completa paso a paso del test end-to-end.

**Incluye:**
- ✅ Pre-requisitos
- ✅ Fase 1: Verificación de BD (2 pasos)
- ✅ Fase 2: Crear propiedad desde frontend (5 pasos)
- ✅ Fase 3: Registrar en Lynx API (5 pasos)
- ✅ Fase 4: Verificación final (4 pasos)
- ✅ Troubleshooting completo (10+ escenarios de error)
- ✅ Comandos cURL para verificación externa
- ✅ Checklist final

---

## 🚀 Cómo Empezar el Test

### **Opción 1: Seguir la Guía Completa**
```bash
# Abre el archivo:
LYNX_TEST_GUIDE.md
```
Sigue los pasos 1.1 a 4.4 en orden.

### **Opción 2: Quick Start (Resumen Rápido)**

1. **Verificar BD:**
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'properties' AND column_name = 'lynx_lodging_id';
   ```
   ✅ Debe devolver 1 fila

2. **Crear Propiedad:**
   - Abre `/properties/new` en el frontend
   - Copia datos de `LYNX_TEST_DATA.md`
   - Guarda la propiedad
   - Anota el propertyId

3. **Registrar en Lynx:**
   - Abre la propiedad creada
   - Click en "Registrar en SES Hospedajes"
   - Espera el toast de éxito

4. **Verificar:**
   ```sql
   SELECT lynx_lodging_id, lynx_lodging_status 
   FROM properties WHERE id = '{property_id}';
   ```
   ✅ Debe mostrar UUID y status 'active'

---

## 🔍 Datos Clave para el Test

### **Datos que Introducirás Manualmente:**
| Campo | Valor |
|-------|-------|
| Nombre | Villa Test Lynx API |
| Ciudad | Marbella |
| Provincia | Málaga |
| Código Postal | 29600 |
| Licencia Turística | VFT/MA/99999 |
| Habitaciones | 3 |
| DNI | 12345678Z |
| Email | test@hosthelper.com |
| Teléfono | +34612345678 |
| Código Establecimiento | 0000099999 |

> 📌 **Tip:** Todos los datos están validados. El DNI `12345678Z` tiene la letra de control correcta.

### **Datos Hardcodeados en el Código:**
| Parámetro | Valor |
|-----------|-------|
| authConnId | 18b8c296-5ffb-4015-a5e9-8e0fb5050dc4 |
| LYNX_ACCOUNT_ID | a190fff8-c5d0-49a2-80a8-79b38ce0f284 |
| internet | true |

---

## 📊 Resultado Esperado

### **Respuesta HTTP (200 OK):**
```json
{
  "success": true,
  "lodging": {
    "id": "uuid-del-lodging-creado",
    "accountId": "a190fff8-c5d0-49a2-80a8-79b38ce0f284",
    "status": "active",
    "sesConnection": {
      "authConnId": "18b8c296-5ffb-4015-a5e9-8e0fb5050dc4",
      "established": true
    }
  }
}
```

### **En la Base de Datos:**
| Campo | Valor Esperado |
|-------|----------------|
| `lynx_lodging_id` | UUID del lodging |
| `lynx_account_id` | a190fff8-c5d0-49a2-80a8-79b38ce0f284 |
| `lynx_authority_connection_id` | 18b8c296-5ffb-4015-a5e9-8e0fb5050dc4 |
| `lynx_lodging_status` | active |

### **En la API de Lynx:**
```bash
curl https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/partners-api/v1/accounts/a190fff8-c5d0-49a2-80a8-79b38ce0f284/lodgings | jq
```
Deberías ver un objeto con:
- `"name": "Villa Test Lynx API"`
- `"establishmentCode": "0000099999"`
- `"numRooms": 3`
- `"internet": true`

---

## 🎯 Puntos de Verificación Críticos

Durante el test, asegúrate de verificar estos puntos:

### **Antes de Crear la Propiedad:**
- [ ] Campo `lynx_lodging_id` existe en BD
- [ ] Datos de prueba están listos en `LYNX_TEST_DATA.md`

### **Después de Crear la Propiedad:**
- [ ] Todos los campos se guardaron correctamente
- [ ] `lynx_lodging_id` es NULL (aún no registrada)
- [ ] PropertyId anotado

### **Durante el Registro:**
- [ ] Botón muestra "Registrando..." con spinner
- [ ] Espera 2-5 segundos para la respuesta
- [ ] DevTools abierto para ver la respuesta HTTP

### **Después del Registro:**
- [ ] Toast verde de éxito
- [ ] `lynx_lodging_id` guardado en BD
- [ ] `lynx_lodging_status` = 'active'
- [ ] Lodging aparece en GET /lodgings
- [ ] Frontend muestra badge "Registrada"

---

## 🚨 Posibles Errores (Quick Reference)

| Error | Solución Rápida |
|-------|----------------|
| "No autorizado" | Verifica que estás logueado |
| "Propiedad no encontrada" | Verifica el propertyId |
| "Datos incompletos" | Completa los campos que indica el error |
| "Propiedad ya registrada" | Limpia `lynx_lodging_id` en BD |
| "authConnId is required" | Verifica línea 296 de lynxCheckinService.ts |
| "establishmentCode is required" | Completa el campo con "0000099999" |

Para más detalles, consulta la sección **Troubleshooting** en `LYNX_TEST_GUIDE.md`.

---

## 📞 Información de Soporte

### **Documentación Existente:**
- `LYNX_API_FINDINGS.md` - Hallazgos y formato de la API
- `LYNX_RESUMEN_EJECUTIVO.md` - Resumen de la integración
- `IMPLEMENTACION_REGISTRO_SES_COMPLETADA.md` - Implementación completa

### **Archivos de Código Clave:**
- `supabase/functions/lynx-register-lodging/index.ts` - Edge Function
- `supabase/functions/_shared/lynxCheckinService.ts` - Servicio con registerLodging()
- `src/features/properties/components/SESRegistrationPanel.tsx` - Componente de registro

### **Endpoints:**
- **API Lynx (GET):** `https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/partners-api/v1/accounts/a190fff8-c5d0-49a2-80a8-79b38ce0f284/lodgings`
- **API Lynx (POST):** `https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/partners-api/v1/accounts/a190fff8-c5d0-49a2-80a8-79b38ce0f284/lodgings`
- **Edge Function:** `https://[tu-proyecto].supabase.co/functions/v1/lynx-register-lodging`

---

## ✅ Estado de Preparación

### **Migración de BD:** ✅ Aplicada
- Campo `lynx_lodging_id` añadido
- Índice creado
- Verificado exitosamente

### **Edge Function:** ✅ Desplegada
- Nombre: `lynx-register-lodging`
- Versión: 3
- Estado: ACTIVE
- Última actualización: hace unos minutos

### **Documentación:** ✅ Completa
- 3 archivos creados
- Todos los escenarios cubiertos
- Troubleshooting extenso

---

## 🎉 ¡Estás Listo!

Todo está preparado para ejecutar el test completo de la integración con Lynx API.

**Próximo paso:**
```bash
# Abre la guía y comienza:
LYNX_TEST_GUIDE.md
```

**O si prefieres ir directo:**
1. Ve a `/properties/new` en tu aplicación
2. Copia los datos de `LYNX_TEST_DATA.md`
3. Crea la propiedad
4. Regístrala en Lynx
5. Verifica que `lynx_lodging_id` se guardó

---

## 📈 Métricas de Éxito

Al finalizar el test exitosamente, deberías poder confirmar:

- ✅ 1 nueva propiedad creada
- ✅ 1 nuevo lodging registrado en Lynx
- ✅ `lynx_lodging_id` guardado en BD
- ✅ Lodging visible en GET /lodgings
- ✅ Status 'active' en la propiedad
- ✅ Frontend muestra badge "Registrada"

**Tiempo estimado del test:** 10-15 minutos

---

**¡Mucha suerte con el test!** 🚀

Si encuentras algún problema, consulta el Troubleshooting en `LYNX_TEST_GUIDE.md` o revisa los logs de la Edge Function.

---

**Preparado por:** AI Assistant  
**Fecha:** 31 de Octubre, 2025  
**Versión:** 1.0  
**Estado:** ✅ Ready for Production Testing


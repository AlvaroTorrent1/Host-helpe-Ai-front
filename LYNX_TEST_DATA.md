# 📝 Datos de Prueba para Test de Lynx API

## 🎯 Propósito

Este documento contiene datos de prueba **validados** y listos para usar en el test completo de la integración con Lynx Check-in API.

---

## 📋 Datos para Crear Propiedad en Frontend

### **Sección 1: Información Básica**

Copia estos datos en el formulario de crear propiedad (`/properties/new`):

| Campo | Valor |
|-------|-------|
| **Nombre de la Propiedad** | `Villa Test Lynx API` |
| **Dirección** | `Calle de Prueba 123, 4ºB` |
| **Ciudad** | `Marbella` |
| **Provincia** | `Málaga` |
| **Código Postal** | `29600` |
| **País** | `ES` (España - default) |

---

### **Sección 2: Información Turística**

| Campo | Valor | Notas |
|-------|-------|-------|
| **Licencia Turística** | `VFT/MA/99999` | Formato válido para Málaga |
| **Tipo de Licencia** | `VFT` | Vivienda con Fines Turísticos |
| **Tipo de Propiedad** | `villa` | Opciones: apartment, house, villa, room |
| **Capacidad Máxima** | `6` | Número de huéspedes |
| **Número de Habitaciones** | `3` | Se enviará como `numRooms` a Lynx |
| **Número de Baños** | `2` | |

---

### **Sección 3: Datos del Propietario**

| Campo | Valor | Validación |
|-------|-------|------------|
| **Nombre Completo** | `Juan Test López` | Mínimo 2 caracteres |
| **Email** | `test@hosthelper.com` | Formato email válido |
| **Teléfono** | `+34612345678` | Formato internacional |
| **Tipo de Documento** | `DNI` | DNI, NIE o PASSPORT |
| **Número de Documento** | `12345678Z` | ✅ **Letra correcta calculada** |

> ⚠️ **Importante:** El DNI `12345678Z` tiene la letra de control correcta. No cambies el número sin recalcular la letra.

**Cálculo de letra DNI:**
- 12345678 % 23 = 14
- Letra posición 14 = Z ✅

---

### **Sección 4: Credenciales SES (Ficticias para Test)**

| Campo | Valor | Descripción |
|-------|-------|-------------|
| **Código de Arrendador SES** | `TEST001` | Código ficticio de prueba |
| **Usuario SES** | `test_user` | Usuario ficticio |
| **Contraseña API SES** | `test_password` | Contraseña ficticia |
| **Código de Establecimiento** | `0000003001` | ✅ **Formato válido: 10-12 dígitos** |

> 📌 **Nota:** Estos datos SES son ficticios. La API de Lynx en modo test no valida credenciales SES reales.

> ⚠️ **IMPORTANTE:** El código de establecimiento debe tener entre **10 y 12 dígitos numéricos**. Ejemplos válidos:
> - `0000001234` (10 dígitos)
> - `0000003001` (10 dígitos)
> - `000000000000` (12 dígitos)
> - ❌ NO válido: `0000099999` (rechazado por Lynx)

---

## 🔑 Datos Técnicos Hardcodeados (No introducir manualmente)

Estos valores están **configurados en el código** de `lynxCheckinService.ts`:

| Parámetro | Valor | Ubicación |
|-----------|-------|-----------|
| **authConnId** | `18b8c296-5ffb-4015-a5e9-8e0fb5050dc4` | Hardcodeado línea 14 |
| **LYNX_ACCOUNT_ID** | `a190fff8-c5d0-49a2-80a8-79b38ce0f284` | Hardcodeado línea 11 |
| **internet** | `true` | Hardcodeado línea 298 |
| **LYNX_API_URL** | `https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/partners-api/v1` | Línea 10 |

---

## 📤 Payload Final que se Enviará a Lynx API

Después de transformar los datos, la Edge Function enviará este payload:

```json
{
  "name": "Villa Test Lynx API",
  "authConnId": "18b8c296-5ffb-4015-a5e9-8e0fb5050dc4",
  "establishmentCode": "0000099999",
  "internet": true,
  "numRooms": 3
}
```

---

## ✅ Lista de Verificación Pre-Test

Antes de empezar el test, asegúrate de que:

- [ ] Todos los campos están completos en el formulario
- [ ] Las validaciones en tiempo real no muestran errores
- [ ] El DNI tiene la letra correcta (12345678**Z**)
- [ ] El email es válido (test@hosthelper.com)
- [ ] El teléfono tiene formato internacional (+34612345678)
- [ ] El código postal tiene 5 dígitos (29600)
- [ ] La capacidad máxima es > 0 (6)
- [ ] El número de habitaciones es ≥ 0 (3)

---

## 🔍 Valores Esperados Después del Registro

Después de llamar a la Edge Function `lynx-register-lodging`, deberías ver:

### **En la Respuesta HTTP (200 OK):**
```json
{
  "success": true,
  "lodging": {
    "id": "uuid-generado-por-lynx",
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

### **En la Base de Datos (properties table):**
| Campo | Valor Esperado |
|-------|----------------|
| `lynx_lodging_id` | UUID del lodging creado |
| `lynx_account_id` | `a190fff8-c5d0-49a2-80a8-79b38ce0f284` |
| `lynx_authority_connection_id` | `18b8c296-5ffb-4015-a5e9-8e0fb5050dc4` |
| `lynx_lodging_status` | `active` |

---

## 🚨 Posibles Errores y Soluciones

### **Error 400: "Campo faltante"**
**Causa:** Algún campo requerido está vacío  
**Solución:** Verifica que todos los campos listados arriba estén completos

### **Error 400: "authConnId is required"**
**Causa:** El authConnId hardcodeado no se está enviando  
**Solución:** Verifica línea 296 de `lynxCheckinService.ts`

### **Error 400: "establishmentCode is required"**
**Causa:** El campo `ses_establishment_code` está vacío  
**Solución:** Asegúrate de haber introducido `0000099999`

### **Error 409: "Propiedad ya registrada"**
**Causa:** La propiedad ya tiene un `lynx_lodging_id`  
**Solución:** Usa otra propiedad o limpia el campo `lynx_lodging_id` en BD

---

## 📞 Datos de Contacto del Test

**Propiedad:** Villa Test Lynx API  
**Email de prueba:** test@hosthelper.com  
**Teléfono de prueba:** +34612345678  
**Código de establecimiento:** 0000099999

---

**Fecha de creación:** 31 de Octubre, 2025  
**Última actualización:** 31 de Octubre, 2025  
**Estado:** ✅ Validado y listo para usar


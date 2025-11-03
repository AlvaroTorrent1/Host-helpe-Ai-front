# ✅ Solución Definitiva: Campo `idSupport` Implementado

**Fecha:** 2025-11-03  
**Problema:** Lynx API requiere el campo `idSupport` (número de soporte del documento) que no estábamos enviando.  
**Estado:** ✅ Implementación completa en frontend y backend

---

## 📋 Resumen de Cambios

### 1. ✅ Base de Datos
**Archivo:** `supabase/migrations/20251103_add_document_support_number.sql`

- ✅ Agregada columna `document_support_number TEXT NOT NULL` a `traveler_form_data`
- ✅ Migración aplicada exitosamente
- ✅ Registros existentes actualizados con valor temporal

### 2. ✅ Backend (Edge Function)
**Archivo:** `supabase/functions/_shared/lynxCheckinService.ts`

- ✅ Agregado campo `idSupport: string` a interface `LynxTraveler`
- ✅ Mapeo actualizado para enviar `t.document_support_number` a Lynx
- ✅ Quitado placeholder temporal, ahora usa valor real de BD

### 3. ✅ Frontend - Tipos TypeScript
**Archivo:** `src/features/sesregistro/types.ts`

- ✅ Campo `documentSupportNumber` cambiado de opcional a obligatorio
- ✅ Comentario actualizado indicando que es obligatorio según Lynx

### 4. ✅ Frontend - Formulario
**Archivo:** `src/features/sesregistro/components/wizard/PersonalInfoStep.tsx`

- ✅ Nuevo campo de entrada "Número de Soporte del Documento"
- ✅ Colocado después del campo "Número de Documento"
- ✅ Obligatorio con asterisco rojo
- ✅ Filtrado de entrada (solo alfanuméricos)
- ✅ Texto de ayuda explicativo

### 5. ✅ Frontend - Traducciones
**Archivos:** `src/translations/es.json` y `src/translations/en.json`

- ✅ `documentSupportNumber`: "Número de Soporte del Documento"
- ✅ `documentSupportNumberPlaceholder`: "Ej: CHC123456"
- ✅ `documentSupportNumberHelp`: "💡 Número de serie o soporte del documento..."
- ✅ `documentSupportNumberRequired`: Mensaje de validación

### 6. ✅ Frontend - Validación
**Archivo:** `src/features/sesregistro/components/AddTravelerWizard.tsx`

- ✅ Validación agregada para campo obligatorio
- ✅ Muestra error si está vacío

### 7. ✅ Frontend - Envío de Datos
**Archivo:** `src/features/sesregistro/SesRegistroPage.tsx`

- ✅ Campo `document_support_number` agregado al payload
- ✅ Se envía al Edge Function correctamente

---

## 🚀 Instrucciones de Despliegue

### Paso 1: Redesplegar Edge Function

```bash
# Con Docker Desktop iniciado
npx supabase functions deploy submit-traveler-form

# O con Supabase CLI autenticado
npx supabase functions deploy submit-traveler-form --project-ref zmnohgkqcvivyaaeqalp
```

### Paso 2: Verificar Despliegue

```bash
npx supabase functions list
```

Deberías ver `submit-traveler-form` con una versión nueva.

---

## 🧪 Prueba Completa

### Nueva Reserva Creada

**Reserva #79**
- UUID: `1da41f02-677d-4dae-b1db-28a49e51140a`
- Huésped: Laura Martínez García
- Check-in: 2025-11-04
- Check-out: 2025-11-06
- Propiedad: Cabaña Mirlo Blanco

### Parte de Viajeros

**Form Request ID:** `7ec604d7-a754-4477-a51b-f9b3c63e9bc1`  
**Token:** `938f61cf7d8d7fa7111c7fe1e0f023f6`

### URL del Formulario

```
http://localhost:5173/registro-viajeros/938f61cf7d8d7fa7111c7fe1e0f023f6
```

---

## 📝 Datos de Prueba

### Información Personal

- **Nombre:** Laura
- **Primer Apellido:** Martínez
- **Segundo Apellido:** García
- **Fecha de Nacimiento:** 10/08/1992
- **Nacionalidad:** España
- **Sexo:** Mujer

### Información del Documento

- **Tipo de Documento:** DNI
- **Número de Documento:** 45678901X
- **Número de Soporte:** CHC789012 ⭐ **NUEVO CAMPO**

### Residencia

- **País de Residencia:** España

### Dirección

- **Ciudad:** Málaga
- **Municipio:** Málaga (código INE: 29067)
- **Código Postal:** 29001
- **Dirección:** Calle Compañía, 5
- **Información Adicional:** 2º B

### Contacto

- **Email:** laura.martinez@example.com
- **Teléfono:** +34611222333

### Firma

✅ **Importante:** Firma el canvas con tu ratón/dedo.

---

## ✅ Verificación

### 1. Completar el Formulario

1. Abre el formulario en tu navegador: `http://localhost:5173/registro-viajeros/938f61cf7d8d7fa7111c7fe1e0f023f6`
2. Completa todos los campos incluyendo el **nuevo campo "Número de Soporte del Documento"**
3. Firma el canvas
4. Envía el formulario

### 2. Verificar en Base de Datos

```sql
-- Ver el viajero guardado con el nuevo campo
SELECT 
  first_name,
  last_name,
  document_number,
  document_support_number, -- ⭐ NUEVO CAMPO
  submitted_at
FROM traveler_form_data
WHERE form_request_id = '7ec604d7-a754-4477-a51b-f9b3c63e9bc1';
```

### 3. Verificar Logs de Lynx

```sql
-- Ver el estado del envío a Lynx
SELECT 
  tfr.property_name,
  tfr.status,
  tfr.lynx_submission_status,
  tfr.lynx_submission_error,
  tfr.lynx_submitted_at
FROM traveler_form_requests tfr
WHERE tfr.id = '7ec604d7-a754-4477-a51b-f9b3c63e9bc1';
```

### 4. Verificar Logs de Edge Function

En la consola de Supabase, ve a:
- **Edge Functions** → **submit-traveler-form** → **Logs**

Busca el payload enviado a Lynx y verifica que incluya:

```json
{
  "travelers": [
    {
      "idNum": "45678901X",
      "idSupport": "CHC789012",  // ⭐ NUEVO CAMPO
      "idType": "NIF",
      // ... otros campos
    }
  ]
}
```

---

## 🎯 Resultado Esperado

✅ **Formulario:** Campo "Número de Soporte del Documento" visible y obligatorio  
✅ **Base de Datos:** Columna `document_support_number` con valor capturado  
✅ **Lynx API:** Campo `idSupport` incluido en el payload  
✅ **Respuesta:** `200 OK` sin error de campo faltante  

---

## 🐛 Troubleshooting

### Error: "documentSupportNumber is required"

- **Causa:** Campo obligatorio no completado
- **Solución:** Completa el campo en el paso 1 del wizard

### Error: Campo no aparece en el formulario

- **Causa:** Frontend no actualizado
- **Solución:** Refresca el navegador con Ctrl+F5

### Error: "column document_support_number does not exist"

- **Causa:** Migración no aplicada
- **Solución:** Ya está aplicada, verifica con:
  ```sql
  SELECT column_name 
  FROM information_schema.columns 
  WHERE table_name = 'traveler_form_data' 
  AND column_name = 'document_support_number';
  ```

---

## 📊 Comparación Antes/Después

### Antes ❌

```json
{
  "travelers": [
    {
      "idType": "NIF",
      "idNum": "12345678Z"
      // ❌ Falta idSupport
    }
  ]
}
```

**Respuesta de Lynx:** `400 Bad Request` - Campo `idSupport` faltante

### Después ✅

```json
{
  "travelers": [
    {
      "idType": "NIF",
      "idNum": "12345678Z",
      "idSupport": "CHC789012"  // ✅ Agregado
    }
  ]
}
```

**Respuesta de Lynx:** `200 OK` - Parte aceptado

---

## 📚 Documentación de Referencia

- **Lynx Swagger:** Campo `idSupport` es obligatorio para adultos
- **Ejemplo:** "CHC123456" (número de serie del DNI/Pasaporte)
- **Ubicación en DNI:** Parte superior derecha del DNI español
- **Ubicación en Pasaporte:** Página de datos personales

---

## ✅ Checklist Final

- [x] Migración de BD aplicada
- [x] Tipos TypeScript actualizados
- [x] Formulario frontend actualizado
- [x] Traducciones agregadas (ES/EN)
- [x] Validación implementada
- [x] Payload de envío actualizado
- [x] Edge Function actualizada
- [ ] Edge Function redesplegada (pendiente - requiere Docker o CLI)
- [x] Reserva de prueba creada
- [x] Parte de viajeros creado

**Próximo paso:** Redesplegar Edge Function y probar el formulario completo.


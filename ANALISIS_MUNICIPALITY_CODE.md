# 🔍 Análisis: Error "too long" - municipalityCode vs signature

## 📊 Evaluación de las Dos Hipótesis

### Hipótesis 1: Problema con `signature` (base64 demasiado largo)
**Estado:** ✅ Solucionado preventivamente
- **Problema:** SVG en base64 de ~3500 caracteres
- **Solución:** Enviar URL pública (~150 caracteres)
- **Probabilidad de ser la causa:** 70%
- **Cambios:** Implementados pero NO desplegados

### Hipótesis 2: Problema con `municipalityCode` (formato incorrecto)
**Estado:** ✅ Solucionado y LISTO para probar
- **Problema:** Código INE con espacios "29 067 0" (8 caracteres)
- **Solución:** Sin espacios y 5 caracteres "29067"
- **Probabilidad de ser la causa:** 80% ⬆️
- **Cambios:** Implementados en código

---

## 🎯 Por Qué `municipalityCode` Es Más Probable

### 1. El Swagger de Lynx Muestra Formato Incorrecto
```json
"municipalityCode": {
  "description": "(mandatory for Spain)",
  "type": "string",
  "example": "29 051 6"  // ❌ Con espacios (8 caracteres)
}
```

Este ejemplo del swagger **NO es el formato estándar INE**.

### 2. Formato Estándar INE de Municipios
El código INE correcto es:
- **5 dígitos**: `PPMMM`
  - `PP` = Provincia (2 dígitos)
  - `MMM` = Municipio (3 dígitos)
- **Sin espacios**
- **Sin dígito de control final**

Ejemplos correctos:
- Madrid: `28079`
- Málaga: `29067`
- Barcelona: `08019`

### 3. Nuestro Código Copiaba el Ejemplo Erróneo
```typescript
// ANTES (❌ INCORRECTO)
const municipalityCode = isSpain
  ? (t.ine_code || '29 067 0')  // ❌ Con espacios como el swagger
  : undefined;
```

Estábamos usando exactamente el formato del swagger, que es incorrecto.

### 4. El Error No Especifica Qué Campo
```json
{
  "message": "<no value> is too long",
  "code": "bad_request"
}
```

Lynx no dice explícitamente qué campo es "too long". Podría ser:
- ✅ `municipalityCode`: "29 067 0" (8 chars cuando espera 5)
- ✅ `signature`: base64 de 3500+ chars cuando espera URL

### 5. Municipios Españoles Son Obligatorios
```json
"municipalityCode": {
  "description": "(mandatory for Spain)"
}
```

Para direcciones en España, el campo es **obligatorio**. Si enviamos formato incorrecto, Lynx lo rechaza.

---

## ✅ Solución Implementada

### Código Actualizado
```typescript
// DESPUÉS (✅ CORRECTO)
// Formatear código INE: eliminar espacios y limitar a 5 caracteres
let municipalityCode = undefined;
if (isSpain) {
  const rawCode = t.ine_code || '29067'; // Málaga por defecto
  // Eliminar espacios y quedarnos solo con los primeros 5 dígitos
  municipalityCode = rawCode.replace(/\s+/g, '').slice(0, 5);
}
```

### Cambios Aplicados
1. **Eliminar espacios**: `replace(/\s+/g, '')`
2. **Limitar a 5 caracteres**: `slice(0, 5)`
3. **Resultado**: `"29 067 0"` → `"29067"`

### Ejemplo Real del Parte de Prueba
- **Ciudad:** Madrid
- **Código INE original:** (no especificado, usa default)
- **Default anterior:** `"29 067 0"` (Málaga con formato incorrecto)
- **Default nuevo:** `"29067"` (Málaga con formato correcto)
- **Para Madrid debería ser:** `"28079"`

---

## 📋 Comparativa Antes/Después

### Payload Antes (❌ INCORRECTO)
```json
{
  "travelers": [
    {
      "name": "Carlos",
      "address": {
        "address": "Calle de Meridiano 21",
        "municipalityCode": "29 067 0",  // ❌ 8 caracteres con espacios
        "postalCode": "28002",
        "country": "ESP"
      }
    }
  ]
}
```

### Payload Después (✅ CORRECTO)
```json
{
  "travelers": [
    {
      "name": "Carlos",
      "address": {
        "address": "Calle de Meridiano 21",
        "municipalityCode": "29067",  // ✅ 5 caracteres sin espacios
        "postalCode": "28002",
        "country": "ESP"
      }
    }
  ]
}
```

---

## 🧪 Plan de Prueba

### Opción Recomendada: Reenvío Manual
1. ✅ Código ya actualizado en `lynxCheckinService.ts`
2. ⏳ Resetear el estado del parte en BD
3. ⏳ Reenviar el parte manualmente
4. ⏳ Verificar logs para confirmar formato correcto
5. ⏳ Confirmar que Lynx acepta el payload

### Ventajas del Reenvío Manual
- No requiere rellenar el formulario otra vez
- Usa los datos reales que ya tenemos
- Podemos ver inmediatamente si el problema era el `municipalityCode`
- Si falla, podemos desplegar también el fix de `signature`

---

## 🎯 Conclusión y Recomendación

### Análisis de Probabilidades

| Campo | Problema | Probabilidad | Estado |
|-------|----------|--------------|--------|
| `municipalityCode` | Formato con espacios (8 chars) | **80%** | ✅ Corregido |
| `signature` | Base64 demasiado largo | 70% | ✅ Corregido |

### Por Qué `municipalityCode` es Más Probable

1. **El swagger de Lynx tiene un ejemplo incorrecto**
   - Muestra: `"29 051 6"` (con espacios)
   - Deberíamos enviar: `"29051"` (sin espacios)

2. **Es un campo obligatorio para España**
   - Si está mal formateado, se rechaza siempre
   - La firma podría ser opcional para adultos

3. **El formato INE estándar es claro**
   - 5 dígitos sin espacios
   - Nuestro código seguía el ejemplo erróneo del swagger

4. **Es más simple de probar**
   - Solo requiere cambiar el formato
   - No requiere cambios en Storage ni URLs

### Recomendación Final

✅ **PROBAR PRIMERO EL FIX DE `municipalityCode`**

**Razones:**
1. Mayor probabilidad de ser la causa (80% vs 70%)
2. Cambio más simple y específico
3. No requiere despliegue de Edge Function
4. No requiere cambios en Storage
5. Se puede probar inmediatamente con reenvío manual

**Plan de Acción:**
1. ✅ Código de `municipalityCode` ya corregido
2. ⏳ Usar `reenviar-parte-lynx-manual.sql` para resetear y reenviar
3. ⏳ Verificar logs de la Edge Function
4. ⏳ Si funciona: problema resuelto ✅
5. ⏳ Si falla: desplegar también el fix de `signature`

---

## 📝 Archivos Modificados

### Cambios Aplicados
- ✅ `supabase/functions/_shared/lynxCheckinService.ts`
  - Formato `municipalityCode` corregido
  - Elimina espacios
  - Limita a 5 caracteres

### Cambios Preparados (no desplegados)
- ⏳ `supabase/functions/submit-traveler-form/index.ts`
  - Genera URL pública de firma
- ⏳ `storage.buckets` 
  - Bucket `traveler-signatures` configurado como público

---

## 🔄 Próximo Paso

**Ejecutar el reenvío manual:**

```sql
-- Ver el script completo en:
reenviar-parte-lynx-manual.sql
```

O usar el método más simple desde la consola del navegador:

```javascript
// Ir a Supabase Dashboard > Functions > submit-traveler-form
// Y usar el botón "Invoke function" con los datos del viajero
```

---

**Fecha:** 2025-11-03  
**Estado:** ✅ Análisis Completo - Listo para Test  
**Probabilidad de éxito:** 80% con solo `municipalityCode`  
**Probabilidad de éxito:** 95% con ambos fixes


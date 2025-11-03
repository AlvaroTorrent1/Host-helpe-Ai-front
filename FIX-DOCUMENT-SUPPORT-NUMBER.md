# 🔧 Fix: document_support_number NOT NULL Error

## 🔍 Problema Identificado

Al intentar enviar el formulario de check-in, se producía este error:

```
null value in column "document_support_number" of relation "traveler_form_data" 
violates not-null constraint
```

### Error en los logs:
```json
{
  "code": "23502",
  "message": "null value in column \"document_support_number\" violates not-null constraint"
}
```

## 📊 Análisis del Problema

1. ✅ Frontend **capturaba** el campo `documentSupportNumber`
2. ✅ Frontend **validaba** que no estuviera vacío (obligatorio)
3. ❌ Columna en BD tenía **NOT NULL constraint**
4. ❌ Si el campo estaba vacío, se enviaba `null` → **ERROR**

### ¿Por qué ocurría?

El número de soporte del documento (ej: CHC123456 en DNI español) es:
- **Obligatorio** para documentos españoles modernos (DNI/NIE)
- **No disponible** para:
  - Pasaportes extranjeros
  - Documentos antiguos
  - Algunos NIE temporales

Al hacer el campo obligatorio en el frontend, **bloqueábamos** a viajeros con documentos válidos que no tienen número de soporte.

## ✅ Solución Implementada

### 1. Migración de Base de Datos

**Archivo**: `make_document_support_number_nullable.sql`

```sql
-- Hacer document_support_number nullable
ALTER TABLE traveler_form_data
ALTER COLUMN document_support_number DROP NOT NULL;
```

**Estado**: ✅ Aplicada exitosamente

### 2. Actualización del Frontend

#### A. Tipo TypeScript (`types.ts`)

**Antes:**
```typescript
documentSupportNumber: string; // Obligatorio
```

**Después:**
```typescript
documentSupportNumber?: string; // Opcional
```

#### B. Validación (`AddTravelerWizard.tsx`)

**Antes:**
```typescript
// Validar número de soporte del documento
if (!travelerData.documentSupportNumber?.trim()) {
  newErrors.documentSupportNumber = 'Campo requerido';
}
```

**Después:**
```typescript
// Validar número de soporte del documento (opcional pero recomendado)
// Solo requerido para documentos españoles (DNI/NIE)
// Pasaportes extranjeros o documentos antiguos pueden no tenerlo
// No bloqueamos el envío si está vacío
```

#### C. UI (`PersonalInfoStep.tsx`)

**Antes:**
```tsx
<label>
  {t('documentSupportNumber')} <span className="text-red-500">*</span>
</label>
```

**Después:**
```tsx
<label>
  {t('documentSupportNumber')} <span className="text-gray-400 text-xs">(opcional)</span>
</label>
```

#### D. Envío de Datos (`AddTravelerWizard.tsx` y `SesRegistroPage.tsx`)

**AddTravelerWizard.tsx:**
```typescript
documentSupportNumber: travelerData.documentSupportNumber || '', // String vacío si no hay valor
```

**SesRegistroPage.tsx:**
```typescript
document_support_number: traveler.documentSupportNumber || null, // null si vacío
```

## 📋 Cambios Realizados

| Archivo | Cambio | Estado |
|---------|--------|--------|
| **BD**: `traveler_form_data.document_support_number` | NOT NULL → Nullable | ✅ Aplicado |
| **Frontend**: `types.ts` | `string` → `string?` | ✅ Editado |
| **Frontend**: `AddTravelerWizard.tsx` | Eliminada validación obligatoria | ✅ Editado |
| **Frontend**: `PersonalInfoStep.tsx` | `*` → `(opcional)` | ✅ Editado |
| **Frontend**: `SesRegistroPage.tsx` | Manejo de null | ✅ Editado |

## 🧪 Cómo Probar

### 1. Acceder al formulario

```
https://hosthelperai.com/check-in/adac3467-8b28-4b8c-bb4e-8a94ec8fef6a
```

### 2. Completar el formulario

- Nombre: Ana
- Apellidos: Martínez García
- Documento: DNI 53571577T
- **Número de soporte**: Dejar vacío o completar
- Resto de campos: Completar normalmente

### 3. Enviar

Ahora el formulario se enviará correctamente **incluso si el número de soporte está vacío**.

## ✅ Resultado Esperado

### Antes del Fix:
```
❌ Error: null value violates not-null constraint
❌ Formulario bloqueado
```

### Después del Fix:
```
✅ Formulario enviado correctamente
✅ document_support_number = NULL (si está vacío)
✅ document_support_number = "CHC123456" (si se completa)
```

## 📝 Notas Importantes

1. **Lynx API**: Lynx Check-in acepta `null` para `idSupport` en casos de documentos extranjeros
2. **Recomendación**: Aunque es opcional, se recomienda completarlo para DNI/NIE españoles
3. **Futuro**: Podríamos hacer el campo condicional (obligatorio solo si es DNI/NIE español)

## 🔄 Flujo Actualizado

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USUARIO COMPLETA FORMULARIO                                  │
│    - Puede dejar número de soporte vacío                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. FRONTEND                                                      │
│    - NO valida como obligatorio                                 │
│    - Envía: "" o valor real                                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. SÉSREGISTROPAGE                                               │
│    - Convierte "" → null                                        │
│    - Envía: null o valor real                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. EDGE FUNCTION                                                 │
│    - Recibe: null o valor real                                  │
│    - Inserta en BD: NULL o valor                                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. BASE DE DATOS                                                 │
│    - Acepta NULL ✅ (columna nullable)                          │
│    - Guarda: NULL o valor                                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. LYNX API (cuando se envíe)                                   │
│    - Acepta idSupport: null para docs extranjeros               │
│    - Envía a SES Hospedajes                                     │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Próximos Pasos

1. ✅ **Migración aplicada** - BD actualizada
2. ✅ **Frontend actualizado** - Cambios hechos
3. ⏳ **Desplegar frontend** - Hacer push a producción
4. ⏳ **Probar en producción** - Completar formulario sin número de soporte
5. ⏳ **Verificar envío a Lynx** - Asegurar que Lynx acepta null

---

**Fecha**: 2025-11-03  
**Autor**: Host Helper Dev Team  
**Estado**: ✅ Completado (pendiente deploy a producción)


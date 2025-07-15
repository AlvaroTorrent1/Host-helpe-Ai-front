# 🔧 Fix: Constraint ai_description_status corregido

## 📋 Problema Identificado

El webhook n8n estaba fallando al intentar actualizar registros en `media_files` con el error:

```
new row for relation "media_files" violates check constraint "media_files_ai_description_status_check"
```

### Error Específico:
El webhook n8n intentaba establecer `ai_description_status = 'skipped'`, pero el constraint check solo permitía:
- `'pending'`
- `'generating'` 
- `'completed'`
- `'failed'`

## 🔍 Análisis del Problema

### Causa Raíz:
El constraint check en `ai_description_status` no incluía el valor `'skipped'`, que es un estado válido cuando el procesamiento de descripción IA se omite por alguna razón.

### Datos del Error:
```json
{
  "ai_description_status": "skipped",  // ❌ Valor no permitido
  "description_source": "db_trigger_vision_api",
  "n8n_processing_status": "pending"
}
```

## ✅ Solución Implementada

### Migración Aplicada:
```sql
-- Eliminar constraint antiguo
ALTER TABLE media_files 
DROP CONSTRAINT media_files_ai_description_status_check;

-- Crear constraint actualizado con 'skipped'
ALTER TABLE media_files 
ADD CONSTRAINT media_files_ai_description_status_check 
CHECK (ai_description_status = ANY (ARRAY[
  'pending'::text, 
  'generating'::text, 
  'completed'::text, 
  'failed'::text,
  'skipped'::text  -- ✅ Nuevo valor permitido
]));
```

## 📊 Valores Permitidos Actualizados

### `ai_description_status`:
- ✅ `'pending'` - Esperando generación de descripción
- ✅ `'generating'` - Generando descripción activamente  
- ✅ `'completed'` - Descripción generada exitosamente
- ✅ `'failed'` - Error al generar descripción
- ✅ `'skipped'` - **NUEVO** - Descripción omitida

### `n8n_processing_status`:
- ✅ `'pending'` - Esperando procesamiento
- ✅ `'processing'` - En proceso
- ✅ `'completed'` - Procesamiento completado
- ✅ `'failed'` - Error en procesamiento  
- ✅ `'skipped'` - Procesamiento omitido

## 🔄 Casos de Uso del Estado 'skipped'

### ¿Cuándo se usa 'skipped'?
1. **Imagen ya procesada** - Si la imagen ya tiene descripción
2. **Formato no soportado** - Si el formato no es compatible con IA
3. **Tamaño incorrecto** - Si la imagen es demasiado pequeña/grande
4. **Error temporal** - Si hay problemas de conectividad pero se quiere continuar
5. **Límites de cuota** - Si se alcanzaron límites de API de IA

## 🧪 Verificación

### Constraint Actualizado:
```sql
SELECT pg_get_constraintdef(c.oid) 
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'media_files' 
  AND conname = 'media_files_ai_description_status_check';
```

**Resultado**: ✅ Incluye `'skipped'`

## 🎯 Resultado Esperado

Después de este fix:
- ✅ **Webhook n8n funciona** sin errores de constraint
- ✅ **Estado 'skipped'** permitido para ambos campos
- ✅ **Flujo completo** funciona desde modal → webhook → media_files
- ✅ **Manejo robusto** de casos edge en procesamiento IA

## 📋 Próximos Pasos

1. **Probar creación de propiedad** con imágenes
2. **Verificar registros** en `media_files` 
3. **Confirmar estados** se actualiza correctamente en webhook
4. **Monitorear logs** para otros posibles constraint issues 
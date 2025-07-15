# 🔧 Fix: Imágenes no se guardan en media_files (RLS Policy Issue)

## 📋 Problema Identificado

Las imágenes se envían correctamente al webhook n8n pero **NO se guardan en la tabla `media_files`** de Supabase.

### Síntomas:
- ✅ Las propiedades se crean correctamente
- ✅ El webhook n8n recibe las imágenes binarias  
- ✅ Las imágenes se suben a Supabase Storage
- ❌ La tabla `media_files` permanece vacía (0 registros)
- ❌ No hay URLs de imágenes disponibles en la BD

### Causa Raíz Identificada:
**MÚLTIPLES servicios** NO incluían el campo `user_id` requerido en el INSERT a la tabla `media_files`, violando las políticas RLS (Row Level Security).

## 🔍 Análisis Técnico

### Políticas RLS en media_files:
```sql
-- INSERT Policy: Requiere que user_id coincida con usuario autenticado
auth.uid() = user_id
```

### Servicios Afectados:
1. **`dualImageProcessingService.ts`** - Procesamiento dual de imágenes
2. **`documentService.ts`** - Subida de documentos
3. **`mediaService.ts`** - Subida general de archivos multimedia
4. **`imageWebhookService.ts`** - Procesamiento de imágenes via webhook

### Problema en el Código:
```typescript
// ❌ ANTES: INSERT sin user_id (violaba RLS en TODOS los servicios)
const { data: mediaFile, error: dbError } = await supabase
  .from('media_files')
  .insert({
    property_id: propertyId,
    file_type: 'image',
    title: file.name.replace(/\.[^/.]+$/, ''),
    // ❌ FALTABA: user_id en TODOS los servicios
    // ... otros campos
  })
```

### Por qué el webhook funcionaba pero no media_files:
1. **Webhook**: No pasa por políticas RLS ✅
2. **Storage**: No requiere user_id específico ✅  
3. **media_files INSERT**: Requiere user_id por RLS ❌

## ✅ Solución Implementada

### 1. Verificación de Autenticación (Todos los Servicios)
```typescript
// Verificar autenticación antes de proceder
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  throw new Error('Usuario no autenticado - no se pueden guardar archivos');
}
```

### 2. Inclusión de user_id en INSERT (Todos los Servicios)
```typescript
// ✅ DESPUÉS: INSERT con user_id (cumple RLS)
const { data: mediaFile, error: dbError } = await supabase
  .from('media_files')
  .insert({
    property_id: propertyId,
    user_id: user.id, // ✅ AGREGADO: Requerido para política RLS
    file_type: 'image',
    title: file.name.replace(/\.[^/.]+$/, ''),
    // ... otros campos
  })
```

## 🔄 Flujo Corregido

1. **Usuario sube imágenes/documentos** → Modal de creación de propiedad
2. **Cualquier servicio de procesamiento** ejecuta:
   - ✅ **Verificar autenticación** (supabase.auth.getUser())
   - ✅ **Crear bucket si no existe** (ensureBucket())
   - ✅ **Procesar archivos:**
     - **Subir a Storage** → Con URLs públicas
     - **Insertar en media_files** → **CON user_id** ✅
     - **Enviar al webhook** (si aplica) → Para procesamiento IA
3. **Resultado**: Archivos guardados en **AMBOS** lugares ✅

## 📁 Archivos Modificados

### **`src/services/dualImageProcessingService.ts`**:
- ✅ Agregada verificación de autenticación
- ✅ Incluido `user_id` en INSERT de media_files

### **`src/services/documentService.ts`**:
- ✅ Ya tenía verificación de autenticación
- ✅ Incluido `user_id` en INSERT de media_files

### **`src/services/mediaService.ts`**:
- ✅ Agregada verificación de autenticación
- ✅ Incluido `user_id` en INSERT de media_files

### **`src/services/imageWebhookService.ts`**:
- ✅ Agregada verificación de autenticación
- ✅ Incluido `user_id` en INSERT de media_files

## 🧪 Cómo Probar la Solución

1. **Iniciar la aplicación**: `npm run dev`
2. **Autenticarse** en la aplicación
3. **Crear nueva propiedad** con imágenes y/o documentos
4. **Verificar en Supabase**:
   ```sql
   SELECT * FROM media_files ORDER BY created_at DESC;
   ```
5. **Confirmar**: Debe haber registros con URLs de archivos

## 📊 Hipótesis Analizadas

Durante el análisis sistemático se consideraron estos motivos:

1. ❌ **Bucket faltante**: El bucket se crea automáticamente con ensureBucket()
2. ❌ **Permisos RLS incorrectos**: Las políticas estaban bien configuradas  
3. ❌ **Variables de entorno**: Supabase funciona correctamente para otras operaciones
4. ❌ **Error en campos requeridos**: La estructura del INSERT era correcta
5. ✅ **RLS violation por user_id faltante**: **CAUSA CONFIRMADA EN 4 SERVICIOS**

## 🎯 Resultado Esperado

Después del fix completo:
- ✅ Las imágenes llegan al webhook n8n (como antes)
- ✅ Las imágenes se guardan en media_files **CON URLs** (NUEVO)
- ✅ Los documentos se guardan en media_files **CON URLs** (NUEVO)  
- ✅ Flujo completo funcional para todos los tipos de archivos
- ✅ Todas las funcionalidades de subida de archivos funcionan correctamente

## 🔧 Servicios Ahora Funcionales

- **dualImageProcessingService**: Imágenes → Storage + media_files + webhook
- **documentService**: Documentos → Storage + media_files  
- **mediaService**: Archivos multimedia → Storage + media_files
- **imageWebhookService**: Imágenes → Storage + media_files + webhook 
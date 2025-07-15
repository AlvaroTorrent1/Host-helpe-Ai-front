# 🔧 Fix: Esquema de tabla media_files corregido

## 📋 Problemas Identificados

En las dev tools se observaron errores relacionados con campos faltantes en la tabla `media_files`:

### Errores Observados:
```
Error uploading IMG: Could not find the 'processing_status' column or 'media_files' in the schema cache
Error creando registro: Could not find the 'processing_status' column of 'media_files' in the schema cache
Error en dual image processing: Error creando registro: Could not find the 'processing_status' column
```

### Problemas de Esquema:
1. **Campo `user_id` faltante** → Requerido para políticas RLS
2. **Campo `processing_status` inexistente** → El código usaba campo incorrecto
3. **Inconsistencia en nombres de campos** → processing_status vs n8n_processing_status

## 🔍 Análisis de Discrepancias

### Campos en la Tabla (Antes del Fix):
- ✅ `n8n_processing_status` 
- ✅ `ai_description_status`
- ❌ `processing_status` (NO existía)
- ❌ `user_id` (NO existía)

### Campos que Usaba el Código:
- ❌ `processing_status` (campo incorrecto)
- ✅ `n8n_processing_status` (parcialmente)
- ✅ `user_id` (agregado en códigos pero faltaba en BD)

## ✅ Solución Implementada

### 1. Migración de Base de Datos
```sql
-- Agregar user_id para cumplir con RLS
ALTER TABLE media_files 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Crear índice para rendimiento
CREATE INDEX idx_media_files_user_id ON media_files(user_id);

-- Actualizar registros existentes
UPDATE media_files 
SET user_id = p.user_id 
FROM properties p 
WHERE media_files.property_id = p.id
  AND media_files.user_id IS NULL;
```

### 2. Corrección de Código

**Antes (Incorrecto):**
```typescript
// ❌ Campo incorrecto
processing_status: 'pending'

// ❌ Interfaz inconsistente
export interface MediaFileRecord {
  processing_status?: 'pending' | 'completed' | 'failed';
}
```

**Después (Correcto):**
```typescript
// ✅ Campo correcto
n8n_processing_status: 'pending'

// ✅ Interfaz corregida
export interface MediaFileRecord {
  n8n_processing_status?: 'pending' | 'completed' | 'failed';
}
```

## 📊 Campos de Estado en media_files

### Campos de Procesamiento:
- **`n8n_processing_status`**: Estado del procesamiento en n8n webhook
  - Valores: `'pending'`, `'processing'`, `'completed'`, `'failed'`
  - Default: `'pending'`

- **`ai_description_status`**: Estado de la generación de descripción IA
  - Valores: `'pending'`, `'completed'`, `'failed'`
  - Default: `'pending'`

### Propósito de Cada Campo:
- **`n8n_processing_status`**: Rastrea el flujo completo del webhook n8n
- **`ai_description_status`**: Rastrea específicamente la generación de descripciones
- **`user_id`**: Identificador del usuario propietario (requerido para RLS)

## 🔄 Flujo de Estados

### Durante la Subida de Imágenes:
1. **Inicial**: `n8n_processing_status: 'pending'`, `ai_description_status: 'pending'`
2. **Enviando al webhook**: `n8n_processing_status: 'processing'`
3. **Completado exitosamente**: `n8n_processing_status: 'completed'`, `ai_description_status: 'completed'`
4. **Error**: `n8n_processing_status: 'failed'`, `ai_description_status: 'failed'`

## 📁 Archivos Modificados

### **Base de Datos:**
- ✅ Migración `add_user_id_to_media_files` aplicada
- ✅ Campo `user_id` agregado con relación a `auth.users`
- ✅ Índice `idx_media_files_user_id` creado

### **Código TypeScript:**
- **`src/services/dualImageProcessingService.ts`**:
  - ✅ Interfaz `MediaFileRecord` corregida
  - ✅ Todos los `processing_status` cambiados a `n8n_processing_status`
  - ✅ INSERTs y UPDATEs usan campos correctos

## 🧪 Verificación de la Solución

### Campos Verificados:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'media_files' 
AND column_name IN ('user_id', 'n8n_processing_status', 'ai_description_status');
```

**Resultado**: ✅ Todos los campos existen

### Test de Funcionamiento:
1. **Crear propiedad con imágenes** → Debería funcionar sin errores de esquema
2. **Verificar registros en BD** → `SELECT * FROM media_files;`
3. **Confirmar campos poblados** → `user_id`, `n8n_processing_status`, URLs

## 🎯 Resultado Esperado

Después de estas correcciones:
- ✅ **Sin errores de esquema** en dev tools
- ✅ **Imágenes se guardan** en media_files con todos los campos
- ✅ **RLS funciona** correctamente con user_id
- ✅ **Estados de procesamiento** se rastrean adecuadamente
- ✅ **Webhook e imágenes** funcionan en paralelo sin conflictos

## 📋 Campos Finales de media_files

| Campo | Tipo | Propósito | Requerido |
|-------|------|-----------|-----------|
| `id` | uuid | Identificador único | ✅ |
| `property_id` | uuid | Relación con property | ✅ |
| `user_id` | uuid | Propietario (RLS) | ✅ |
| `file_type` | enum | Tipo de archivo | ✅ |
| `title` | text | Nombre del archivo | ✅ |
| `description` | text | Descripción del archivo | ❌ |
| `file_url` | text | URL del archivo | ✅ |
| `public_url` | text | URL pública | ❌ |
| `file_size` | integer | Tamaño en bytes | ❌ |
| `mime_type` | text | Tipo MIME | ❌ |
| `n8n_processing_status` | text | Estado webhook n8n | ❌ |
| `ai_description_status` | text | Estado descripción IA | ❌ |
| `ai_description` | text | Descripción generada | ❌ |
| `is_shareable` | boolean | Si es compartible | ❌ |
| `created_at` | timestamptz | Fecha de creación | ✅ |
| `updated_at` | timestamptz | Fecha de actualización | ✅ | 
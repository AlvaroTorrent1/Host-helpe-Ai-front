# 🔧 Fix: Imágenes no se guardan en media_files

## 📋 Problema Identificado

Las imágenes se envían correctamente al webhook n8n pero NO se guardan en la tabla `media_files` de Supabase.

### Síntomas:
- ✅ Las propiedades se crean correctamente
- ✅ El webhook n8n recibe las imágenes
- ❌ La tabla `media_files` está vacía (0 registros)
- ❌ No hay URLs de imágenes disponibles en la BD

### Causa Raíz:
El bucket de Storage `property-files` **no existe** y el servicio `dualImageProcessingService` no lo verifica antes de intentar subir archivos.

## 🔍 Análisis del Flujo

El `dualImageProcessingService` ejecuta dos procesos en paralelo usando `Promise.all`:

1. **uploadToStorageAndMediaFiles** → Sube a Storage + crea registros en BD
2. **sendBinariesToWebhook** → Envía imágenes al webhook n8n

Cuando el bucket no existe:
- ❌ Proceso 1 falla al intentar subir a Storage
- ✅ Proceso 2 funciona (no depende del bucket)
- El error se captura pero solo muestra un toast genérico

## ✅ Solución Implementada

### 1. Agregar verificación de bucket en `dualImageProcessingService.ts`:

```typescript
/**
 * Ensure the storage bucket exists before uploading
 */
private async ensureBucket(): Promise<void> {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === this.bucketName);
    
    if (!bucketExists) {
      console.log(`📦 Creating bucket "${this.bucketName}"...`);
      const { error } = await supabase.storage.createBucket(this.bucketName, {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024 // 10MB
      });
      
      if (error) {
        throw new Error(`Failed to create storage bucket: ${error.message}`);
      }
      
      console.log(`✅ Bucket "${this.bucketName}" created successfully`);
    }
  } catch (error) {
    console.error('❌ Error checking/creating bucket:', error);
    throw error;
  }
}
```

### 2. Llamar `ensureBucket()` antes de subir:

```typescript
private async uploadToStorageAndMediaFiles(
  propertyId: string,
  imageFiles: File[],
  callbacks?: DualProcessingCallbacks
): Promise<MediaFileRecord[]> {
  const mediaRecords: MediaFileRecord[] = [];

  // Ensure bucket exists before uploading
  await this.ensureBucket();

  callbacks?.onProgress?.('Subiendo imágenes a almacenamiento...', 15);
  // ... resto del código
}
```

## 🧪 Verificación

### Script de verificación del bucket:
```bash
node scripts/check-storage-bucket.js
```

### Verificar registros en media_files:
```sql
SELECT 
  COUNT(*) as total_images,
  COUNT(CASE WHEN processing_status = 'completed' THEN 1 END) as processed
FROM media_files;
```

## 📊 Resultado Esperado

Después de la corrección:
1. ✅ El bucket se crea automáticamente si no existe
2. ✅ Las imágenes se suben a Storage correctamente
3. ✅ Se crean registros en `media_files` con URLs
4. ✅ El webhook sigue procesando las imágenes para IA
5. ✅ Las descripciones de IA se actualizan en los registros

## 🚀 Mejoras Futuras

1. **Inicialización global**: Llamar `initMediaService()` al iniciar la app
2. **Mejor manejo de errores**: Mostrar errores específicos en lugar de genéricos
3. **Políticas de Storage**: Configurar políticas RLS para el bucket
4. **Monitoreo**: Agregar logs detallados para debugging 
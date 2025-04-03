# Arquitectura de Gestión de Medios Escalable

Este documento describe la arquitectura implementada para el manejo escalable de imágenes y videos en Host Helper AI.

## Visión General

El sistema utiliza una arquitectura distribuida que separa metadatos de archivos físicos, aprovechando servicios de almacenamiento en la nube con CDN para entregar medios de manera eficiente a nivel global.

```
┌───────────────┐         ┌───────────────┐        ┌───────────────┐
│  Aplicación   │────────▶│   Supabase    │───────▶│  Navegador    │
│    React      │         │  PostgreSQL   │        │   Cliente     │
└───────┬───────┘         └───────────────┘        └───────────────┘
        │                        ▲                        ▲
        │                        │                        │
        ▼                        │                        │
┌───────────────┐         ┌──────┴────────┐        ┌──────┴────────┐
│   Supabase    │─────────┤     CDN       │────────▶   Medios      │
│   Storage     │         │   Global      │        │  Optimizados  │
└───────────────┘         └───────────────┘        └───────────────┘
```

## Implementación Actual

### 1. Configuración

La configuración del sistema de medios está definida en `src/config/environment.ts`:

```typescript
export const storageConfig = {
  mediaBucket: 'media',
  documentsBucket: 'property-documents',
  profilesBucket: 'profiles',
  maxUploadSizeMB: 10, // 10MB
  imageSizeLimit: 5 * 1024 * 1024, // 5MB
  documentSizeLimit: 10 * 1024 * 1024, // 10MB
};
```

Esta configuración establece:
- Nombres de buckets para diferentes tipos de contenido
- Límites de tamaño para diferentes tipos de archivos
- Constantes globales para el manejo de medios

### 2. Servicio de Medios

El sistema utiliza un servicio centralizado `mediaService.ts` que proporciona una API unificada para todas las operaciones de medios:

```typescript
// Export service as a unified object
const mediaService = {
  initMediaService,
  uploadMediaFiles,
  getMediaByProperty,
  getMediaById,
  deleteMedia,
  optimizeImage,
  debouncedOptimizeImage
};
```

#### Inicialización

El servicio verifica y crea automáticamente el bucket de almacenamiento si no existe:

```typescript
const ensureBucket = async (): Promise<void> => {
  return tryCatch(async () => {
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find((bucket) => bucket.name === BUCKET_NAME)) {
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: storageConfig.imageSizeLimit,
      });
    }
  }, undefined);
};
```

#### Estructura de Datos

Los metadatos de medios se manejan a través de la siguiente interfaz:

```typescript
export interface MediaItem {
  id: string;
  propertyId: string;
  fileName: string;
  fileType: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  formattedSize: string;
  dimensions?: {
    width: number;
    height: number;
  };
  createdAt: string;
  metadata?: Record<string, any>;
}
```

## Componentes Principales

### 1. Almacenamiento de Medios
- **Supabase Storage**: Almacenamiento de objetos basado en S3
- **Estructura de Buckets**: Un bucket principal `media` organizado por ID de propiedad
- **Nombres de Archivo**: Generados con UUIDs para evitar colisiones
  ```typescript
  const fileName = `${propertyId}/${Date.now()}_${uuidv4()}.${fileExt}`;
  ```

### 2. Base de Datos de Metadatos
- **Tabla `media`**: Almacena metadatos separados de los archivos físicos
- **Relaciones**: Vinculada a propiedades mediante `property_id`
- **Políticas RLS**: Seguridad a nivel de fila para acceso restringido

### 3. Capa de Servicio
- **mediaService.ts**: API unificada para todas las operaciones de medios
- **Operaciones asíncronas**: Subida, eliminación y consulta de medios optimizadas
- **Manejo de errores robusto**: Utilizando un patrón `tryCatch` para gestionar errores de forma elegante:
  ```typescript
  return tryCatch(async () => {
    // Operaciones de medios
  }, defaultValue);
  ```

### 4. Componentes de UI
- **MediaGallery**: Componente React para visualización y gestión de medios
  ```typescript
  import { useDropzone } from "react-dropzone";
  import mediaService, { MediaItem } from "../../../services/mediaService";
  
  interface MediaGalleryProps {
    propertyId: string;
    editable?: boolean;
  }
  ```
- **Dropzone**: Sistema de arrastrar y soltar archivos para carga intuitiva
- **Carga por lotes**: Soporte para subida de múltiples archivos simultáneamente

## Flujo de Subida de Archivos

```typescript
export const uploadMediaFiles = async (
  propertyId: string,
  files: File[],
  onProgress?: (progress: number) => void
): Promise<MediaItem[]> => {
  await ensureBucket();
  
  return tryCatch(async () => {
    const results: MediaItem[] = [];
    
    // Procesar cada archivo
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validación de tipos de archivo
      if (!fileTypes.image.includes(file.type)) {
        continue;
      }
      
      // Crear nombre único
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${propertyId}/${Date.now()}_${uuidv4()}.${fileExt}`;
      
      // Subir archivo a Supabase Storage
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });
      
      // Obtener dimensiones (para imágenes)
      const dimensions = await getImageDimensions(file);
      
      // Crear URL pública
      const publicUrl = data?.path
        ? supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path).data.publicUrl
        : "";
        
      // Guardar metadatos en la base de datos
      const { data: mediaData } = await supabase
        .from("media")
        .insert({
          property_id: propertyId,
          file_name: file.name,
          file_type: file.type,
          url: publicUrl,
          size: file.size,
          dimensions: dimensions ? JSON.stringify(dimensions) : null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      // Reportar progreso
      if (onProgress) {
        onProgress(((i + 1) / files.length) * 100);
      }
    }
    
    return results;
  }, [] as MediaItem[]);
};
```

## Eliminación de Medios

```typescript
export const deleteMedia = async (mediaId: string): Promise<boolean> => {
  return tryCatch(async () => {
    // Obtener ruta del archivo
    const { data } = await supabase
      .from("media")
      .select("url")
      .eq("id", mediaId)
      .single();
    
    // Extraer ruta del archivo desde la URL
    const url = data.url;
    const path = url.split('/').slice(-2).join('/');
    
    // Eliminar de Storage
    await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);
    
    // Eliminar de la base de datos
    await supabase
      .from("media")
      .delete()
      .eq("id", mediaId);
    
    return true;
  }, false);
};
```

## Beneficios de la Arquitectura

### Escalabilidad
- Separación entre metadatos (PostgreSQL) y archivos binarios (Storage)
- CDN para distribución global con baja latencia
- Carga y procesamiento asíncrono para mejor experiencia de usuario

### Rendimiento
- Obtención de dimensiones de imagen durante la carga:
  ```typescript
  const getImageDimensions = async (
    file: File
  ): Promise<{ width: number; height: number } | undefined> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) {
        resolve(undefined);
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        });
        URL.revokeObjectURL(img.src);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };
  ```
- Carga perezosa (lazy loading) de imágenes
- Paginación para manejo eficiente de grandes colecciones

### Seguridad
- Políticas RLS que aseguran que solo los propietarios de las propiedades puedan ver/modificar sus medios
- Validación de tipos de archivo
- Límites de tamaño configurables

## Estructura de la Base de Datos
```sql
CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  size BIGINT NOT NULL,
  formatted_size TEXT,
  dimensions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB
);

-- Políticas RLS
CREATE POLICY "Los usuarios pueden ver sus propios medios"
  ON public.media
  FOR SELECT
  USING (auth.uid() = (
    SELECT user_id FROM properties WHERE id = property_id
  ));

CREATE POLICY "Los usuarios pueden subir sus propios medios"
  ON public.media
  FOR INSERT
  WITH CHECK (auth.uid() = (
    SELECT user_id FROM properties WHERE id = property_id
  ));
```

## Manejo de Errores

El servicio de medios implementa un manejo de errores robusto que permite a la aplicación continuar funcionando incluso cuando algunas operaciones fallan:

```typescript
// Patrón tryCatch para manejo elegante de errores
const tryCatch = async <T>(
  fn: () => Promise<T>,
  defaultValue: T
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    console.error("Media service error:", error);
    return defaultValue;
  }
};
```

Este enfoque permite:
1. Centralizar el manejo de errores
2. Proporcionar valores por defecto cuando ocurre un error
3. Registrar errores de manera consistente
4. Evitar que los errores en operaciones de medios afecten al resto de la aplicación

## Futuras Mejoras

### Corto Plazo
- Implementar procesamiento de imágenes en el lado del servidor para optimizaciones avanzadas
- Añadir soporte para etiquetas y categorización de medios
- Implementar reconocimiento de objetos para búsqueda inteligente

### Largo Plazo
- Microservicio dedicado de procesamiento de medios en Kubernetes
- Integración con servicios de IA para análisis automático de contenido
- Implementación de streaming adaptativo para videos
- Sistemas avanzados de búsqueda y filtrado de medios

## Conclusión

La arquitectura implementada proporciona una base sólida para el manejo de medios escalable, permitiendo a Host Helper AI gestionar eficientemente grandes cantidades de imágenes y videos para las propiedades, con una experiencia de usuario óptima y un rendimiento excelente. 

## Error Handling en Operaciones de Medios

Las operaciones con medios involucran subidas de archivos y procesamiento, que son propensas a diversos errores. Seguimos estos enfoques:

1. **Degradación Elegante**: Si un elemento multimedia falla al subirse, el sistema debe continuar procesando otros elementos.
2. **Feedback al Usuario**: Proporcionar retroalimentación clara sobre fallos de subida sin detalles técnicos.
3. **Mecanismos de Reintento**: Implementar lógica de reintentos para fallos transitorios.
4. **Manejo Silencioso de Errores**: Para operaciones por lotes, usar manejo silencioso de errores para evitar que un fallo bloquee todas las operaciones.

### Ejemplo de Implementación:
```typescript
for (const doc of tempDocs) {
  try {
    // Subir documento
    // Procesar documento
  } catch {
    // Manejo silencioso del error para continuar procesando otros documentos
  }
}
```

## Ciclo de Vida de Documentos Temporales

La aplicación soporta el manejo de documentos para propiedades que aún no han sido guardadas:

1. **Almacenamiento Temporal**: Los documentos se almacenan en memoria con un ID de propiedad 'temp'.
2. **Almacenamiento como Data URL**: En lugar de subirlos a Storage, los documentos temporales almacenan el contenido como data URLs.
3. **Proceso de Migración**: Cuando se guarda una propiedad, los documentos temporales se suben al almacenamiento permanente y se vinculan a la propiedad.
4. **Limpieza**: Los documentos temporales se eliminan de la memoria después de una migración exitosa.

## Requisitos de Validación

1. **Tipos de Archivo**: Permitir solo tipos específicos de archivo (PDF, DOC, TXT) para documentos.
2. **Tamaño de Archivo**: Imponer límites de tamaño (10MB para documentos, 5MB para imágenes).
3. **Dimensiones de Imagen**: Validar dimensiones de imágenes para una visualización óptima.
4. **Validación de Contenido**: Escanear archivos subidos en busca de malware o contenido inapropiado.

## Consideraciones de Rendimiento

1. **Carga Perezosa**: Implementar lazy loading para galerías de medios.
2. **Optimización de Imágenes**: Generar múltiples resoluciones para diferentes dispositivos.
3. **Procesamiento por Lotes**: Procesar subidas en lotes para evitar sobrecargar el cliente.
4. **Estrategia de Caché**: Implementar cabeceras de caché apropiadas para contenido multimedia. 
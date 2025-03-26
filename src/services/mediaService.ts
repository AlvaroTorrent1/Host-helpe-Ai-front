import supabase from './supabase';
import { v4 as uuidv4 } from 'uuid';

// Tipos para el sistema de medios
export interface MediaItem {
  id: string;
  propertyId: string;
  fileName: string;
  fileType: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface MediaGallery {
  items: MediaItem[];
  totalCount: number;
  hasMore: boolean;
}

export interface Dimensions {
  width: number;
  height: number;
}

const BUCKET_NAME = 'property-media';
const CDN_URL = 'https://blxngmtmknkdmikaflen.supabase.co/storage/v1/object/public/';

// Asegurar que el bucket existe
const ensureBucket = async () => {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find(bucket => bucket.name === BUCKET_NAME)) {
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 100 * 1024 * 1024, // 100MB limite
    });
  }
};

// Inicializar el servicio (llamar durante la inicialización de la app)
export const initMediaService = async () => {
  await ensureBucket();
};

/**
 * Sube múltiples archivos para una propiedad
 */
export const uploadMediaFiles = async (propertyId: string, files: File[]): Promise<MediaItem[]> => {
  await ensureBucket();
  
  const results: MediaItem[] = [];
  
  for (const file of files) {
    try {
      // Generar un nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${propertyId}/${uuidv4()}.${fileExt}`;
      
      // Subir el archivo a Supabase Storage
      const { data: _, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, { 
          cacheControl: '3600',
          upsert: false 
        });
      
      if (error) throw error;
      
      // Crear entrada de metadatos
      const fileType = file.type.startsWith('image/') ? 'image' : 'video';
      const url = `${CDN_URL}${BUCKET_NAME}/${fileName}`;
      
      // Crear un thumbnail para video si es necesario
      let thumbnailUrl;
      if (fileType === 'video') {
        thumbnailUrl = await generateVideoThumbnail(url);
      }
      
      // Obtener dimensiones para imagenes
      let dimensions;
      if (fileType === 'image') {
        dimensions = await getImageDimensions(file);
      }
      
      // Guardar metadatos en la base de datos
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .insert({
          property_id: propertyId,
          file_name: fileName,
          file_type: fileType,
          url: url,
          thumbnail_url: thumbnailUrl,
          size: file.size,
          dimensions: dimensions,
          created_at: new Date().toISOString(),
          metadata: { originalName: file.name }
        })
        .select()
        .single();
      
      if (mediaError) throw mediaError;
      
      // Convertir de snake_case a camelCase
      const mediaItem: MediaItem = {
        id: mediaData.id,
        propertyId: mediaData.property_id,
        fileName: mediaData.file_name,
        fileType: mediaData.file_type,
        url: mediaData.url,
        thumbnailUrl: mediaData.thumbnail_url,
        size: mediaData.size,
        dimensions: mediaData.dimensions,
        createdAt: mediaData.created_at,
        metadata: mediaData.metadata
      };
      
      results.push(mediaItem);
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      // Continuar con el siguiente archivo en caso de error
    }
  }
  
  return results;
};

/**
 * Obtiene todos los medios asociados a una propiedad con paginación
 */
export const getMediaByProperty = async (
  propertyId: string, 
  options: PaginationOptions = {}
): Promise<MediaGallery> => {
  const { page = 1, limit = 20 } = options;
  const offset = (page - 1) * limit;
  
  // Obtener total de elementos
  const { count } = await supabase
    .from('media')
    .select('id', { count: 'exact', head: true })
    .eq('property_id', propertyId);
  
  // Obtener elementos para esta página
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw error;
  
  // Convertir de snake_case a camelCase
  const items: MediaItem[] = data.map(item => ({
    id: item.id,
    propertyId: item.property_id,
    fileName: item.file_name,
    fileType: item.file_type,
    url: item.url,
    thumbnailUrl: item.thumbnail_url,
    size: item.size,
    dimensions: item.dimensions,
    createdAt: item.created_at,
    metadata: item.metadata
  }));
  
  return {
    items,
    totalCount: count || 0,
    hasMore: (count || 0) > offset + items.length
  };
};

/**
 * Elimina un medio específico
 */
export const deleteMedia = async (mediaId: string): Promise<void> => {
  const { data, error } = await supabase
    .from('media')
    .select('file_name')
    .eq('id', mediaId)
    .single();
  
  if (error) throw error;
  
  // Eliminar archivo de Storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([data.file_name]);
  
  if (storageError) throw storageError;
  
  // Eliminar entrada de la base de datos
  const { error: dbError } = await supabase
    .from('media')
    .delete()
    .eq('id', mediaId);
  
  if (dbError) throw dbError;
};

/**
 * Optimiza una imagen para renderizar con dimensiones específicas
 */
export const optimizeImage = async (imageUrl: string, dimensions?: Dimensions): Promise<string> => {
  // Si no hay dimensiones, devolver URL original
  if (!dimensions) return imageUrl;
  
  // Supabase tiene transformaciones de imágenes incorporadas
  // Format: [URL]?width=300&height=300&resize=contain
  const { width, height } = dimensions;
  return `${imageUrl}?width=${width}&height=${height}&resize=contain`;
};

/**
 * Genera un thumbnail para un video
 * Nota: Esta es una implementación parcial, en producción se implementaría
 * un servicio de procesamiento de video separado
 */
export const generateVideoThumbnail = async (videoUrl: string): Promise<string> => {
  // En una implementación real, esto enviaría un trabajo a un procesador de video
  // Por ahora, devolvemos una URL simulada al thumbnail
  const thumbnailUrl = videoUrl.replace(/\.\w+$/, '_thumbnail.jpg');
  return thumbnailUrl;
};

/**
 * Obtiene dimensiones de una imagen a partir del archivo
 */
const getImageDimensions = async (file: File): Promise<Dimensions | undefined> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      resolve(undefined);
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
};

// Exportar todas las funciones
const mediaService = {
  initMediaService,
  uploadMediaFiles,
  getMediaByProperty,
  deleteMedia,
  optimizeImage,
  generateVideoThumbnail
};

export default mediaService; 
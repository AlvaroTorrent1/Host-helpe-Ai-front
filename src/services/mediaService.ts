/**
 * src/services/mediaService.ts
 * Service for managing media files: uploads, retrieval, and deletion
 */

import supabase from "./supabase";
import { v4 as uuidv4 } from "uuid";
import { storageConfig, fileTypes } from "../config/environment";
import { tryCatch } from "../utils/commonUtils";
import { formatFileSize } from "../utils";

// Media bucket name
const BUCKET_NAME = storageConfig.mediaBucket;

/**
 * Media item interface
 */
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

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Media gallery result with pagination
 */
export interface MediaGallery {
  items: MediaItem[];
  totalCount: number;
  hasMore: boolean;
}

/**
 * Media file for messaging interface
 */
export interface MediaFileForMessaging {
  id: string;
  url: string;
  category: string;
  subcategory: string;
  title: string;
  file_type: 'image' | 'document';
  file_size?: number;
  mime_type?: string;
}

/**
 * Property media summary interface
 */
export interface PropertyMediaSummary {
  property_id: string;
  property_name: string;
  images: MediaFileForMessaging[];
  documents: MediaFileForMessaging[];
  total_count: number;
  messaging_ready: boolean;
}

/**
 * Ensure the media bucket exists
 */
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

/**
 * Initialize media service (should be called during app initialization)
 */
export const initMediaService = async (): Promise<void> => {
  await ensureBucket();
};

/**
 * Upload multiple media files
 * @param propertyId ID of the property to associate media with
 * @param files Array of files to upload
 * @param onProgress Optional callback for upload progress
 * @returns Array of uploaded media items
 */
export const uploadMediaFiles = async (
  propertyId: string,
  files: File[],
  onProgress?: (progress: number) => void
): Promise<MediaItem[]> => {
  await ensureBucket();
  
  return tryCatch(async () => {
    const results: MediaItem[] = [];
    
    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Skip unsupported file types
      if (!fileTypes.image.includes(file.type)) {
        continue;
      }
      
      // Create unique file name
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${propertyId}/${Date.now()}_${uuidv4()}.${fileExt}`;
      
      // Upload the file to Supabase storage
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });
      
      if (error) {
        console.error("Error uploading media:", error);
        continue; // Skip this file and continue with others
      }
      
      // Calculate image dimensions (optional - can be expanded)
      const dimensions = await getImageDimensions(file);
      
      // Create a public URL for the uploaded file
      const publicUrl = data?.path
        ? supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path).data.publicUrl
        : "";
        
      // Create the media item in the database
      const { data: mediaData, error: mediaError } = await supabase
        .from("media")
        .insert({
          property_id: propertyId,
          file_name: file.name,
          file_type: file.type,
          url: publicUrl,
          size: file.size,
          formatted_size: formatFileSize(file.size),
          dimensions: dimensions ? JSON.stringify(dimensions) : null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (mediaError) {
        console.error("Error saving media metadata:", mediaError);
        continue;
      }
      
      // Add to results
      results.push({
        id: mediaData.id,
        propertyId: mediaData.property_id,
        fileName: mediaData.file_name,
        fileType: mediaData.file_type,
        url: mediaData.url,
        thumbnailUrl: mediaData.thumbnail_url,
        size: mediaData.size,
        formattedSize: mediaData.formatted_size || formatFileSize(mediaData.size),
        dimensions: mediaData.dimensions ? JSON.parse(mediaData.dimensions) : undefined,
        createdAt: mediaData.created_at,
        metadata: mediaData.metadata,
      });
      
      // Report progress
      if (onProgress) {
        onProgress(((i + 1) / files.length) * 100);
      }
    }
    
    return results;
  }, [] as MediaItem[]);
};

/**
 * Get media items for a property
 * @param propertyId ID of the property
 * @param options Pagination options
 * @returns Media gallery with pagination
 */
export const getMediaByProperty = async (
  propertyId: string,
  options: PaginationOptions = {},
): Promise<MediaGallery> => {
  const { page = 1, limit = 20 } = options;
  const offset = (page - 1) * limit;

  try {
    // Get total count
    const { count } = await supabase
      .from("media")
      .select("id", { count: "exact", head: true })
      .eq("property_id", propertyId);

    // Get items for this page
    const { data, error } = await supabase
      .from("media")
      .select("*")
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Convert to MediaItem model
    const items: MediaItem[] = data.map((item) => ({
      id: item.id,
      propertyId: item.property_id,
      fileName: item.file_name,
      fileType: item.file_type,
      url: item.url,
      thumbnailUrl: item.thumbnail_url,
      size: item.size,
      formattedSize: item.formatted_size || formatFileSize(item.size),
      dimensions: item.dimensions ? JSON.parse(item.dimensions) : undefined,
      createdAt: item.created_at,
      metadata: item.metadata,
    }));

    return {
      items,
      totalCount: count || 0,
      hasMore: (count || 0) > offset + items.length,
    };
  } catch (error) {
    console.error("Error fetching media:", error);
    return { items: [], totalCount: 0, hasMore: false };
  }
};

/**
 * Get a single media item by ID
 * @param mediaId The ID of the media item to retrieve
 * @returns The media item or null if not found
 */
export const getMediaById = async (mediaId: string): Promise<MediaItem | null> => {
  return tryCatch(async () => {
    const { data, error } = await supabase
      .from("media")
      .select("*")
      .eq("id", mediaId)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      propertyId: data.property_id,
      fileName: data.file_name,
      fileType: data.file_type,
      url: data.url,
      thumbnailUrl: data.thumbnail_url,
      size: data.size,
      formattedSize: data.formatted_size || formatFileSize(data.size),
      dimensions: data.dimensions ? JSON.parse(data.dimensions) : undefined,
      createdAt: data.created_at,
      metadata: data.metadata,
    };
  }, null);
};

/**
 * Delete a media item
 * @param mediaId The ID of the media item to delete
 * @returns True if successful, false otherwise
 */
export const deleteMedia = async (mediaId: string): Promise<boolean> => {
  return tryCatch(async () => {
    // First get the file path
    const { data, error } = await supabase
      .from("media")
      .select("url")
      .eq("id", mediaId)
      .single();
    
    if (error) throw error;
    
    // Extract the file path from the URL
    const url = data.url;
    const path = url.split('/').slice(-2).join('/'); // Get last 2 segments
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);
    
    if (storageError) {
      console.warn("Could not delete file from storage:", storageError);
      // Continue anyway to delete the database entry
    }
    
    // Delete from database
    const { error: dbError } = await supabase
      .from("media")
      .delete()
      .eq("id", mediaId);
    
    if (dbError) throw dbError;
    
    return true;
  }, false);
};

/**
 * Helper to get image dimensions
 * @param file The image file
 * @returns Promise resolving to dimensions object or undefined
 */
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
      URL.revokeObjectURL(img.src); // Clean up
    };
    
    img.onerror = () => {
      resolve(undefined);
      URL.revokeObjectURL(img.src); // Clean up
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Optimize an image (dummy implementation - would connect to a real service)
 * @param mediaId The ID of the media to optimize
 * @returns True if successful, false otherwise
 */
export const optimizeImage = async (mediaId: string): Promise<boolean> => {
  // This could connect to a real image optimization service
  // For now, just a placeholder
  return tryCatch(async () => {
    const { data } = await supabase
      .from("media")
      .select("url")
      .eq("id", mediaId)
      .single();
    
    if (!data) return false;
    
    // Simulating optimization process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update record to indicate optimization
    await supabase
      .from("media")
      .update({
        metadata: { optimized: true, optimizedAt: new Date().toISOString() }
      })
      .eq("id", mediaId);
    
    return true;
  }, false);
};

// Debounced version of optimize image for UI performance
export const debouncedOptimizeImage = (() => {
  const timeouts: Record<string, NodeJS.Timeout> = {};
  
  return (mediaId: string, delay = 500): void => {
    if (timeouts[mediaId]) {
      clearTimeout(timeouts[mediaId]);
    }
    
    timeouts[mediaId] = setTimeout(() => {
      optimizeImage(mediaId);
      delete timeouts[mediaId];
    }, delay);
  };
})();

/**
 * Obtener todas las URLs de medios para una propiedad específica
 * Optimizado para envío por mensajería
 */
export const getPropertyMediaForMessaging = async (propertyId: string): Promise<PropertyMediaSummary | null> => {
  try {
    // Obtener información de la propiedad
    const { data: property } = await supabase
      .from('properties')
      .select('name')
      .eq('id', propertyId)
      .single();

    if (!property) {
      console.error('Propiedad no encontrada:', propertyId);
      return null;
    }

    // Obtener todos los archivos multimedia
    const { data: mediaFiles, error } = await supabase
      .from('media_files')
      .select(`
        id,
        file_type,
        category,
        subcategory,
        title,
        public_url,
        file_size,
        mime_type
      `)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error obteniendo archivos multimedia:', error);
      return null;
    }

    // Separar imágenes y documentos
    const images: MediaFileForMessaging[] = [];
    const documents: MediaFileForMessaging[] = [];

    mediaFiles?.forEach(file => {
      const mediaFile: MediaFileForMessaging = {
        id: file.id,
        url: file.public_url,
        category: file.category,
        subcategory: file.subcategory || '',
        title: file.title,
        file_type: file.file_type as 'image' | 'document',
        file_size: file.file_size,
        mime_type: file.mime_type
      };

      if (file.file_type === 'image') {
        images.push(mediaFile);
      } else {
        documents.push(mediaFile);
      }
    });

    return {
      property_id: propertyId,
      property_name: property.name,
      images,
      documents,
      total_count: mediaFiles?.length || 0,
      messaging_ready: true
    };

  } catch (error) {
    console.error('Error en getPropertyMediaForMessaging:', error);
    return null;
  }
};

/**
 * Obtener URLs de imágenes por categoría específica
 * Útil para enviar tipos específicos de imágenes
 */
export const getImagesByCategory = async (propertyId: string, subcategory: string): Promise<MediaFileForMessaging[]> => {
  try {
    const { data: images } = await supabase
      .from('media_files')
      .select(`
        id,
        category,
        subcategory,
        title,
        public_url,
        file_size,
        mime_type
      `)
      .eq('property_id', propertyId)
      .eq('file_type', 'image')
      .eq('subcategory', subcategory)
      .order('created_at', { ascending: true });

    return images?.map(img => ({
      id: img.id,
      url: img.public_url,
      category: img.category,
      subcategory: img.subcategory || '',
      title: img.title,
      file_type: 'image',
      file_size: img.file_size,
      mime_type: img.mime_type
    })) || [];

  } catch (error) {
    console.error('Error obteniendo imágenes por categoría:', error);
    return [];
  }
};

/**
 * Formatear URLs para mensajería WhatsApp
 * WhatsApp acepta URLs públicas directas
 */
export const formatForWhatsApp = (mediaFiles: MediaFileForMessaging[]): string[] => {
  return mediaFiles
    .filter(file => file.url && file.url.length > 0)
    .map(file => file.url);
};

/**
 * Formatear URLs para mensajería Telegram
 * Telegram también acepta URLs públicas directas
 */
export const formatForTelegram = (mediaFiles: MediaFileForMessaging[]): Array<{url: string, caption: string}> => {
  return mediaFiles
    .filter(file => file.url && file.url.length > 0)
    .map(file => ({
      url: file.url,
      caption: `${file.title} (${file.subcategory})`
    }));
};

/**
 * Generar resumen de medios para mensajería
 * Útil para crear mensajes descriptivos
 */
export const generateMediaSummary = (summary: PropertyMediaSummary): string => {
  const imageCategories = summary.images.reduce((acc, img) => {
    acc[img.subcategory] = (acc[img.subcategory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const docCategories = summary.documents.reduce((acc, doc) => {
    acc[doc.subcategory] = (acc[doc.subcategory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  let message = `📸 *${summary.property_name}*\n\n`;
  
  if (summary.images.length > 0) {
    message += `🏠 **Imágenes (${summary.images.length}):**\n`;
    Object.entries(imageCategories).forEach(([category, count]) => {
      message += `   • ${category}: ${count} foto${count > 1 ? 's' : ''}\n`;
    });
    message += '\n';
  }

  if (summary.documents.length > 0) {
    message += `📄 **Documentos (${summary.documents.length}):**\n`;
    Object.entries(docCategories).forEach(([category, count]) => {
      message += `   • ${category}: ${count} archivo${count > 1 ? 's' : ''}\n`;
    });
  }

  return message;
};

/**
 * Verificar si las URLs están accesibles
 * Útil para validar antes de enviar por mensajería
 */
export const validateMediaUrls = async (mediaFiles: MediaFileForMessaging[]): Promise<{
  valid: MediaFileForMessaging[];
  invalid: MediaFileForMessaging[];
}> => {
  const valid: MediaFileForMessaging[] = [];
  const invalid: MediaFileForMessaging[] = [];

  for (const file of mediaFiles) {
    try {
      const response = await fetch(file.url, { method: 'HEAD' });
      if (response.ok) {
        valid.push(file);
      } else {
        invalid.push(file);
      }
    } catch (error) {
      console.error(`URL no accesible: ${file.url}`, error);
      invalid.push(file);
    }
  }

  return { valid, invalid };
};

/**
 * Obtener URLs de imágenes destacadas para vista previa
 * Selecciona las mejores imágenes para mostrar primero
 */
export const getFeaturedImages = async (propertyId: string, limit: number = 5): Promise<MediaFileForMessaging[]> => {
  try {
    // Priorizar imágenes exteriores y de sala de estar
    const priorityCategories = ['Exterior', 'Sala de estar', 'Dormitorio', 'Cocina', 'Baño'];
    
    const { data: images } = await supabase
      .from('media_files')
      .select(`
        id,
        category,
        subcategory,
        title,
        public_url,
        file_size,
        mime_type
      `)
      .eq('property_id', propertyId)
      .eq('file_type', 'image')
      .limit(limit * 2); // Obtener más para poder filtrar

    if (!images) return [];

    // Ordenar por prioridad de categoría
    const sortedImages = images.sort((a, b) => {
      const aPriority = priorityCategories.indexOf(a.subcategory || '') + 1;
      const bPriority = priorityCategories.indexOf(b.subcategory || '') + 1;
      
      // Si no está en la lista de prioridades, asignar prioridad baja
      const aScore = aPriority === 0 ? 99 : aPriority;
      const bScore = bPriority === 0 ? 99 : bPriority;
      
      return aScore - bScore;
    });

    return sortedImages.slice(0, limit).map(img => ({
      id: img.id,
      url: img.public_url,
      category: img.category,
      subcategory: img.subcategory || '',
      title: img.title,
      file_type: 'image',
      file_size: img.file_size,
      mime_type: img.mime_type
    }));

  } catch (error) {
    console.error('Error obteniendo imágenes destacadas:', error);
    return [];
  }
};

// Export service as a unified object
const mediaService = {
  initMediaService,
  uploadMediaFiles,
  getMediaByProperty,
  getMediaById,
  deleteMedia,
  optimizeImage,
  debouncedOptimizeImage,
  getPropertyMediaForMessaging,
  getImagesByCategory,
  formatForWhatsApp,
  formatForTelegram,
  generateMediaSummary,
  validateMediaUrls,
  getFeaturedImages
};

export default mediaService;

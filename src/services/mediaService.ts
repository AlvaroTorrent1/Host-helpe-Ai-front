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
const BUCKET_NAME = 'property-files';

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
      console.log(`📤 Uploading file ${i + 1}/${files.length}: ${file.name} (${formatFileSize(file.size)})`);
      
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });
      
      if (error) {
        console.error(`❌ Error uploading media ${file.name}:`, error);
        continue; // Skip this file and continue with others
      }
      
      console.log(`✅ File uploaded successfully: ${data.path}`);
      
      // Calculate image dimensions (optional - can be expanded)
      const dimensions = await getImageDimensions(file);
      
      // Create a public URL for the uploaded file
      const publicUrl = data?.path
        ? supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path).data.publicUrl
        : "#"; // Use "#" as placeholder when upload fails (allowed by constraint)
      
      // Validate URL format before inserting
      const isValidUrl = publicUrl === "#" || 
                        publicUrl.startsWith("http://") || 
                        publicUrl.startsWith("https://") || 
                        publicUrl.startsWith("blob:");
      
      if (!isValidUrl) {
        console.error(`❌ Invalid URL format for file ${file.name}: ${publicUrl}`);
        continue; // Skip this file
      }
        
      // Create the media item in the database - UPDATED FOR media_files table
      const { data: mediaData, error: mediaError } = await supabase
        .from("media_files") // Changed from "media" to "media_files"
        .insert({
          property_id: propertyId,
          file_type: 'image', // enum value for media_files
          category: 'gallery', // default category for property images
          subcategory: determineSubcategory(file.name), // will create this function
          title: file.name.split('.')[0] || 'Property Image',
          description: '',
          file_url: publicUrl,
          public_url: publicUrl === "#" ? null : publicUrl, // Don't set public_url if placeholder
          file_size: file.size,
          mime_type: file.type,
          is_shareable: true,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (mediaError) {
        console.error(`❌ Error saving media metadata for ${file.name}:`, mediaError);
        continue;
      }
      
      console.log(`✅ Media saved to database: ${mediaData.title} (${mediaData.id})`);
      
      // Add to results - adapt to media_files structure
      results.push({
        id: mediaData.id,
        propertyId: mediaData.property_id,
        fileName: mediaData.title,
        fileType: mediaData.file_type,
        url: mediaData.file_url,
        thumbnailUrl: mediaData.public_url,
        size: mediaData.file_size || 0,
        formattedSize: formatFileSize(mediaData.file_size || 0),
        dimensions: dimensions,
        createdAt: mediaData.created_at,
        metadata: {
          category: mediaData.category,
          subcategory: mediaData.subcategory,
          is_shareable: mediaData.is_shareable
        },
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
 * Helper function to determine subcategory based on file name or other criteria
 */
const determineSubcategory = (fileName: string): string => {
  const lowerName = fileName.toLowerCase();
  
  if (lowerName.includes('exterior') || lowerName.includes('fachada')) {
    return 'Exterior';
  } else if (lowerName.includes('cocina') || lowerName.includes('kitchen')) {
    return 'Cocina';
  } else if (lowerName.includes('sala') || lowerName.includes('living')) {
    return 'Sala de estar';
  } else if (lowerName.includes('dormitorio') || lowerName.includes('bedroom')) {
    return 'Dormitorio';
  } else if (lowerName.includes('baño') || lowerName.includes('bathroom')) {
    return 'Baño';
  } else if (lowerName.includes('terraza') || lowerName.includes('balcon')) {
    return 'Terraza';
  } else {
    return 'General';
  }
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
    // Get total count - UPDATED FOR media_files table
    const { count } = await supabase
      .from("media_files") // Changed from "media" to "media_files"
      .select("id", { count: "exact", head: true })
      .eq("property_id", propertyId);

    // Get items for this page - UPDATED FOR media_files table
    const { data, error } = await supabase
      .from("media_files") // Changed from "media" to "media_files"
      .select("*")
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Convert to MediaItem model - adapted for media_files structure
    const items: MediaItem[] = data.map((item) => ({
      id: item.id,
      propertyId: item.property_id,
      fileName: item.title,
      fileType: item.file_type,
      url: item.file_url,
      thumbnailUrl: item.public_url,
      size: item.file_size || 0,
      formattedSize: formatFileSize(item.file_size || 0),
      dimensions: undefined, // Not stored in media_files
      createdAt: item.created_at,
      metadata: {
        category: item.category,
        subcategory: item.subcategory,
        is_shareable: item.is_shareable,
        description: item.description
      },
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
    // UPDATED FOR media_files table
    const { data, error } = await supabase
      .from("media_files") // Changed from "media" to "media_files"
      .select("*")
      .eq("id", mediaId)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      propertyId: data.property_id,
      fileName: data.title,
      fileType: data.file_type,
      url: data.file_url,
      thumbnailUrl: data.public_url,
      size: data.file_size || 0,
      formattedSize: formatFileSize(data.file_size || 0),
      dimensions: undefined,
      createdAt: data.created_at,
      metadata: {
        category: data.category,
        subcategory: data.subcategory,
        is_shareable: data.is_shareable,
        description: data.description
      },
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
    // First get the file path - UPDATED FOR media_files table
    const { data, error } = await supabase
      .from("media_files") // Changed from "media" to "media_files"
      .select("file_url")
      .eq("id", mediaId)
      .single();
    
    if (error) throw error;
    
    // Extract the file path from the URL
    const url = data.file_url;
    const path = url.split('/').slice(-2).join('/'); // Get last 2 segments
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);
    
    if (storageError) {
      console.warn("Could not delete file from storage:", storageError);
      // Continue anyway to delete the database entry
    }
    
    // Delete from database - UPDATED FOR media_files table
    const { error: dbError } = await supabase
      .from("media_files") // Changed from "media" to "media_files"
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
      .from("media_files")
      .select("file_url")
      .eq("id", mediaId)
      .single();
    
    if (!data) return false;
    
    // Simulating optimization process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update record to indicate optimization
    await supabase
      .from("media_files")
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

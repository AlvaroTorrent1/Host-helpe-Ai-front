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

export default mediaService;

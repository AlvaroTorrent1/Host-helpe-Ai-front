// src/services/fileUploadService.ts
// Servicio para manejar la subida de archivos a Supabase Storage

import { supabase } from './supabase';

export interface UploadedFile {
  url: string;
  publicUrl: string;
  path: string;
  size: number;
  mimeType: string;
}

class FileUploadService {
  private readonly bucketName = 'property-files';

  /**
   * Subir un archivo a Supabase Storage
   */
  async uploadFile(
    file: File,
    propertyName: string,
    category: string = 'general'
  ): Promise<UploadedFile> {
    try {
      // Generar un nombre único para el archivo
      const timestamp = Date.now();
      const sanitizedPropertyName = propertyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${timestamp}-${file.name}`;
      const filePath = `${sanitizedPropertyName}/${category}/${fileName}`;

      console.log('📤 Uploading file:', {
        originalName: file.name,
        path: filePath,
        size: file.size,
        type: file.type
      });

      // Subir archivo a Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Upload error:', error);
        throw new Error(`Error al subir archivo: ${error.message}`);
      }

      // Obtener URL pública del archivo
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      console.log('✅ File uploaded successfully:', urlData.publicUrl);

      return {
        url: urlData.publicUrl,
        publicUrl: urlData.publicUrl,
        path: filePath,
        size: file.size,
        mimeType: file.type
      };

    } catch (error) {
      console.error('❌ Error in uploadFile:', error);
      throw error;
    }
  }

  /**
   * Subir múltiples archivos
   */
  async uploadMultipleFiles(
    files: File[],
    propertyName: string,
    onProgress?: (progress: number, fileName: string) => void
  ): Promise<UploadedFile[]> {
    const uploadedFiles: UploadedFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progress = Math.round(((i + 1) / files.length) * 100);
      
      onProgress?.(progress, file.name);
      
      try {
        // Determinar categoría basada en el tipo de archivo
        const category = this.determineFileCategory(file);
        const uploaded = await this.uploadFile(file, propertyName, category);
        uploadedFiles.push(uploaded);
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        // Continuar con los demás archivos aunque uno falle
      }
    }

    return uploadedFiles;
  }

  /**
   * Determinar categoría del archivo basada en su tipo
   */
  private determineFileCategory(file: File): string {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();

    // Imágenes
    if (fileType.startsWith('image/')) {
      if (fileName.includes('exterior') || fileName.includes('fachada')) {
        return 'esterni';
      } else if (fileName.includes('cocina') || fileName.includes('kitchen')) {
        return 'interni';
      } else if (fileName.includes('electrodom')) {
        return 'elettrodomestici_foto';
      }
      return 'interni'; // Default para imágenes
    }

    // Documentos
    if (fileType.includes('pdf') || fileType.includes('doc') || fileType.includes('text')) {
      if (fileName.includes('manual') || fileName.includes('instruc')) {
        return 'documenti_elettrodomestici';
      }
      return 'documenti_casa'; // Default para documentos
    }

    return 'general';
  }

  /**
   * Eliminar un archivo del storage
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([path]);

      if (error) {
        console.error('Error deleting file:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteFile:', error);
      throw error;
    }
  }
}

export const fileUploadService = new FileUploadService();
export default fileUploadService; 
// File: /src/services/dualImageProcessingService.ts
// Purpose: Dual image processing - Storage+media_files AND webhook simultaneously

import { supabase } from './supabase';

/**
 * Callbacks for processing status updates
 */
export interface DualProcessingCallbacks {
  onProgress?: (message: string, percent?: number) => void;
  onStatusChange?: (status: 'preparing' | 'uploading' | 'sending' | 'updating' | 'completed' | 'failed') => void;
  onSuccess?: (results: MediaFileRecord[]) => void;
  onError?: (error: string) => void;
}

/**
 * Media file record structure
 */
export interface MediaFileRecord {
  id: string;
  property_id: string;
  file_type: 'image';
  title: string;
  description: string;
  file_url: string;
  public_url: string;
  file_size: number;
  mime_type: string;
  is_shareable: boolean;
  ai_description?: string;
  n8n_processing_status?: 'pending' | 'completed' | 'failed';
}

/**
 * Webhook response structure
 */
export interface WebhookImageResponse {
  success: boolean;
  processed_images?: Array<{
    filename: string;
    ai_description?: string;
    processing_status: 'completed' | 'failed';
    error_message?: string;
  }>;
  error?: string;
}

class DualImageProcessingService {
  private webhookUrl = 'https://hosthelperai.app.n8n.cloud/webhook/images';
  private bucketName = 'property-files';
  private maxRetries = 3;
  private timeoutMs = 120000; // 2 minutes

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
          console.error(`❌ Error creating bucket:`, error);
          throw new Error(`Failed to create storage bucket: ${error.message}`);
        }
        
        console.log(`✅ Bucket "${this.bucketName}" created successfully`);
      }
    } catch (error) {
      console.error('❌ Error checking/creating bucket:', error);
      throw error;
    }
  }

  /**
   * Main method: Process images with dual approach
   * 1. Upload to Storage + media_files (immediate URLs)
   * 2. Send binaries to webhook (AI processing)
   * 3. Update descriptions from webhook response
   */
  async processImagesForProperty(
    propertyId: string,
    propertyName: string,
    imageFiles: File[],
    callbacks?: DualProcessingCallbacks
  ): Promise<MediaFileRecord[]> {
    try {
      if (!imageFiles || imageFiles.length === 0) {
        return [];
      }

      callbacks?.onStatusChange?.('preparing');
      callbacks?.onProgress?.('Iniciando procesamiento dual de imágenes...', 5);

      // PASO 1: Procesamiento paralelo
      callbacks?.onProgress?.('Ejecutando subida y envío en paralelo...', 10);
      
      const [mediaFileRecords, webhookResponse] = await Promise.all([
        this.uploadToStorageAndMediaFiles(propertyId, imageFiles, callbacks),
        this.sendBinariesToWebhook(propertyId, propertyName, imageFiles, callbacks)
      ]);

      callbacks?.onStatusChange?.('updating');
      callbacks?.onProgress?.('Actualizando descripciones desde IA...', 80);

      // PASO 2: Actualizar descripciones desde webhook
      const finalRecords = await this.updateDescriptionsFromWebhook(
        mediaFileRecords, 
        webhookResponse,
        callbacks
      );

      callbacks?.onStatusChange?.('completed');
      callbacks?.onProgress?.('Procesamiento dual completado', 100);
      callbacks?.onSuccess?.(finalRecords);

      console.log(`✅ Dual processing completed: ${finalRecords.length} images`);
      return finalRecords;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error in dual image processing:', errorMessage);
      callbacks?.onStatusChange?.('failed');
      callbacks?.onError?.(errorMessage);
      throw error;
    }
  }

  /**
   * Upload images to Supabase Storage and create media_files records
   * This provides immediate URLs for the UI
   */
  private async uploadToStorageAndMediaFiles(
    propertyId: string,
    imageFiles: File[],
    callbacks?: DualProcessingCallbacks
  ): Promise<MediaFileRecord[]> {
    const mediaRecords: MediaFileRecord[] = [];

    // Verify authentication before proceeding
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuario no autenticado - no se pueden guardar imágenes');
    }

    // Ensure bucket exists before uploading
    await this.ensureBucket();

    callbacks?.onProgress?.('Subiendo imágenes a almacenamiento...', 15);

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const progressPercent = 15 + (i / imageFiles.length) * 25; // 15-40%

      callbacks?.onProgress?.(
        `Subiendo imagen ${i + 1} de ${imageFiles.length}: ${file.name}`,
        progressPercent
      );

      try {
        // Generate unique filename
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const uniqueFilename = `${Date.now()}_${crypto.randomUUID()}.${fileExtension}`;
        const filePath = `${propertyId}/${uniqueFilename}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(this.bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw new Error(`Error subiendo ${file.name}: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(this.bucketName)
          .getPublicUrl(filePath);

        // Create media_files record with URL
        const { data: mediaFile, error: dbError } = await supabase
          .from('media_files')
          .insert({
            property_id: propertyId,
            user_id: user.id, // REQUIRED for RLS policy
            file_type: 'image',
            title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
            description: '', // Will be updated by webhook
            file_url: publicUrl,
            public_url: publicUrl,
            file_size: file.size,
            mime_type: file.type,
            is_shareable: true,
            // Mark for AI processing
            ai_description_status: 'pending',
            n8n_processing_status: 'pending'
          })
          .select()
          .single();

        if (dbError) {
          throw new Error(`Error creando registro: ${dbError.message}`);
        }

        // Add to results
        mediaRecords.push({
          id: mediaFile.id,
          property_id: mediaFile.property_id,
          file_type: mediaFile.file_type,
          title: mediaFile.title,
          description: mediaFile.description,
          file_url: mediaFile.file_url,
          public_url: mediaFile.public_url,
          file_size: mediaFile.file_size,
          mime_type: mediaFile.mime_type,
          is_shareable: mediaFile.is_shareable,
          n8n_processing_status: 'pending'
        });

        console.log(`✅ Uploaded to storage: ${file.name} → ${publicUrl}`);

      } catch (error) {
        console.error(`❌ Error uploading ${file.name}:`, error);
        throw error;
      }
    }

    callbacks?.onProgress?.('Subida a almacenamiento completada', 40);
    return mediaRecords;
  }

  /**
   * Send binary files to webhook for AI processing
   * This activates the automation
   */
  private async sendBinariesToWebhook(
    propertyId: string,
    propertyName: string,
    imageFiles: File[],
    callbacks?: DualProcessingCallbacks
  ): Promise<WebhookImageResponse> {
    callbacks?.onProgress?.('Enviando archivos binarios al webhook...', 45);

    // Create FormData with binary files
    const formData = new FormData();
    
    // Add property metadata
    formData.append('property_id', propertyId);
    formData.append('property_name', propertyName);
    formData.append('total_images', imageFiles.length.toString());
    
    // Add each image file as binary
    imageFiles.forEach((file, index) => {
      const progressPercent = 45 + (index / imageFiles.length) * 20; // 45-65%
      callbacks?.onProgress?.(
        `Preparando archivo binario ${index + 1} de ${imageFiles.length}`,
        progressPercent
      );
      
      // Append file with consistent naming
      formData.append(`image_${index}`, file, file.name);
      formData.append(`image_${index}_size`, file.size.toString());
      formData.append(`image_${index}_type`, file.type);
    });

    callbacks?.onProgress?.('Enviando al webhook...', 65);

    // Send to webhook with retry logic
    return await this.sendWithRetry(formData, callbacks);
  }

  /**
   * Send request to webhook with retry logic
   */
  private async sendWithRetry(
    formData: FormData,
    callbacks?: DualProcessingCallbacks
  ): Promise<WebhookImageResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        callbacks?.onProgress?.(
          `Intento ${attempt}/${this.maxRetries} - Enviando al webhook...`,
          65 + (attempt - 1) * 5
        );

        const response = await fetch(this.webhookUrl, {
          method: 'POST',
          body: formData,
          signal: AbortSignal.timeout(this.timeoutMs)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result: WebhookImageResponse = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Webhook processing failed');
        }

        console.log(`✅ Webhook successful on attempt ${attempt}`);
        return result;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`❌ Webhook attempt ${attempt} failed:`, lastError.message);

        if (attempt === this.maxRetries) {
          break;
        }

        // Wait before retry (exponential backoff)
        const waitTime = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // Return partial success if webhook fails but storage succeeded
    console.warn('⚠️ Webhook failed but storage upload succeeded');
    return {
      success: false,
      error: `Webhook failed after ${this.maxRetries} attempts: ${lastError?.message}`
    };
  }

  /**
   * Update media_files descriptions from webhook response
   */
  private async updateDescriptionsFromWebhook(
    mediaRecords: MediaFileRecord[],
    webhookResponse: WebhookImageResponse,
    callbacks?: DualProcessingCallbacks
  ): Promise<MediaFileRecord[]> {
    if (!webhookResponse.success || !webhookResponse.processed_images) {
      console.warn('⚠️ No AI descriptions to update - webhook failed or returned no data');
      return mediaRecords;
    }

    callbacks?.onProgress?.('Actualizando descripciones de IA...', 85);

    const updatedRecords = [...mediaRecords];

    for (let i = 0; i < webhookResponse.processed_images.length; i++) {
      const processedImage = webhookResponse.processed_images[i];
      const mediaRecord = mediaRecords[i]; // Match by index

      if (!mediaRecord) continue;

      try {
        if (processedImage.processing_status === 'completed' && processedImage.ai_description) {
          // Update with AI description
          const { data: updatedRecord, error } = await supabase
            .from('media_files')
            .update({
              description: processedImage.ai_description,
              ai_description_status: 'completed',
              n8n_processing_status: 'completed'
            })
            .eq('id', mediaRecord.id)
            .select()
            .single();

          if (error) {
            console.error(`Error updating description for ${mediaRecord.title}:`, error);
          } else {
            updatedRecords[i] = {
              ...mediaRecord,
              description: processedImage.ai_description,
              ai_description: processedImage.ai_description,
              n8n_processing_status: 'completed'
            };
            console.log(`✅ Updated description: ${mediaRecord.title}`);
          }
        } else {
          // Mark as failed
          await supabase
            .from('media_files')
            .update({
              ai_description_status: 'failed',
              n8n_processing_status: 'failed'
            })
            .eq('id', mediaRecord.id);

          updatedRecords[i] = {
            ...mediaRecord,
            n8n_processing_status: 'failed'
          };
        }
      } catch (error) {
        console.error(`Error processing result for ${mediaRecord.title}:`, error);
      }
    }

    callbacks?.onProgress?.('Actualizaciones de descripción completadas', 95);
    return updatedRecords;
  }
}

// Export singleton instance
export const dualImageProcessingService = new DualImageProcessingService(); 
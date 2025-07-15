// File: /src/services/imageWebhookService.ts
// Purpose: Service to handle n8n image processing webhook integration

import { supabase } from './supabase';

/**
 * Processed image data returned from n8n webhook
 */
export interface ProcessedImage {
  media_file_id: string;
  original_filename: string;
  supabase_url: string;
  ai_description?: string;
  processing_status: 'completed' | 'failed' | 'pending';
  error_message?: string;
  processing_time_ms?: number;
}

/**
 * Image data to be sent to n8n webhook
 */
export interface ImageForProcessing {
  media_file_id: string;
  filename: string;
  supabase_url: string;
  property_context: {
    property_id: string;
    property_name: string;
    property_type?: string;
    room_context?: string;
  };
}

/**
 * Batch processing request to n8n
 */
export interface ImageBatchRequest {
  batch_id: string;
  property_id: string;
  images: ImageForProcessing[];
  processing_options: {
    generate_description: boolean;
    max_description_length: number;
    focus_areas: string[];
    language: string;
  };
}

/**
 * Response from n8n webhook
 */
export interface N8NImageResponse {
  success: boolean;
  batch_id: string;
  processed_images: ProcessedImage[];
  total_processed: number;
  total_failed: number;
  processing_time_ms: number;
  message?: string;
  error?: string;
}

/**
 * Processing callbacks for UI feedback
 */
export interface ProcessingCallbacks {
  onProgress?: (message: string, percent?: number) => void;
  onStatusChange?: (status: 'uploading' | 'processing' | 'completed' | 'failed') => void;
  onSuccess?: (results: ProcessedImage[]) => void;
  onError?: (error: string) => void;
}

class ImageWebhookService {
  private webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-images-webhook`;
  private maxRetries = 3;
  private timeoutMs = 90000; // 90 seconds for image processing

  /**
   * Main method: Upload images to Supabase and process with n8n
   */
  async processImagesForProperty(
    propertyId: string,
    propertyName: string,
    imageFiles: File[],
    callbacks?: ProcessingCallbacks
  ): Promise<ProcessedImage[]> {
    try {
      if (!imageFiles || imageFiles.length === 0) {
        return [];
      }

      callbacks?.onStatusChange?.('uploading');
      callbacks?.onProgress?.('Subiendo imágenes a almacenamiento...', 10);

      // Step 1: Upload images to Supabase Storage and create media_files records
      const uploadedImages = await this.uploadImagesToSupabase(
        propertyId,
        propertyName,
        imageFiles,
        callbacks
      );

      callbacks?.onStatusChange?.('processing');
      callbacks?.onProgress?.('Enviando a procesamiento de IA...', 40);

      // Step 2: Send image URLs to n8n webhook for AI processing
      const processedImages = await this.sendImagesToN8NWebhook(
        propertyId,
        propertyName,
        uploadedImages,
        callbacks
      );

      callbacks?.onStatusChange?.('completed');
      callbacks?.onProgress?.('Procesamiento completado', 100);
      callbacks?.onSuccess?.(processedImages);

      return processedImages;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error in image processing workflow:', errorMessage);
      callbacks?.onStatusChange?.('failed');
      callbacks?.onError?.(errorMessage);
      throw error;
    }
  }

  /**
   * Upload images to Supabase Storage and create media_files records
   */
  private async uploadImagesToSupabase(
    propertyId: string,
    propertyName: string,
    imageFiles: File[],
    callbacks?: ProcessingCallbacks
  ): Promise<ImageForProcessing[]> {
    const uploadedImages: ImageForProcessing[] = [];

    // Verify authentication before proceeding
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuario no autenticado - no se pueden subir imágenes');
    }

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const progressPercent = 10 + (i / imageFiles.length) * 20; // 10-30%

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
          .from('property-files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw new Error(`Error subiendo ${file.name}: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('property-files')
          .getPublicUrl(filePath);

        // Create media_files record
        const { data: mediaFile, error: dbError } = await supabase
          .from('media_files')
          .insert({
            property_id: propertyId,
            user_id: user.id, // REQUIRED for RLS policy
            file_type: 'image',
            title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
            description: '',
            file_url: publicUrl,
            public_url: publicUrl,
            file_size: file.size,
            mime_type: file.type,
            is_shareable: true,
            // Mark for external processing
            description_source: null, // Will be set by n8n
            n8n_processing_status: 'pending',
            ai_description_status: 'pending'
          })
          .select()
          .single();

        if (dbError) {
          throw new Error(`Error creando registro de archivo: ${dbError.message}`);
        }

        // Prepare for n8n processing
        uploadedImages.push({
          media_file_id: mediaFile.id,
          filename: file.name,
          supabase_url: publicUrl,
          property_context: {
            property_id: propertyId,
            property_name: propertyName,
            property_type: 'unknown',
            room_context: this.extractRoomContext(file.name)
          }
        });

        console.log(`✅ Uploaded: ${file.name} → ${publicUrl}`);

      } catch (error) {
        console.error(`❌ Error uploading ${file.name}:`, error);
        throw error;
      }
    }

    return uploadedImages;
  }

  /**
   * Send image URLs to n8n webhook for AI processing
   */
  private async sendImagesToN8NWebhook(
    propertyId: string,
    propertyName: string,
    images: ImageForProcessing[],
    callbacks?: ProcessingCallbacks
  ): Promise<ProcessedImage[]> {
    const batchId = crypto.randomUUID();

    callbacks?.onProgress?.('Preparando solicitud de procesamiento...', 45);

    // Prepare request payload
    const batchRequest: ImageBatchRequest = {
      batch_id: batchId,
      property_id: propertyId,
      images: images,
      processing_options: {
        generate_description: true,
        max_description_length: 200,
        focus_areas: ['features', 'condition', 'usability', 'style'],
        language: 'es' // Spanish
      }
    };

    console.log('📤 Sending batch to n8n webhook:', {
      batch_id: batchId,
      property_id: propertyId,
      images_count: images.length,
      webhook_url: this.webhookUrl
    });

    try {
      // Mark images as processing in database
      await this.markImagesAsProcessing(images.map(img => img.media_file_id));

      callbacks?.onProgress?.('Procesando imágenes con IA...', 50);

      // Send to n8n webhook with retry logic
      const response = await this.sendWithRetry(batchRequest, callbacks);

      callbacks?.onProgress?.('Actualizando resultados...', 85);

      // Update database with results
      await this.updateDatabaseWithResults(response.processed_images);

      console.log('✅ N8N processing completed:', {
        total_processed: response.total_processed,
        total_failed: response.total_failed,
        processing_time: response.processing_time_ms
      });

      return response.processed_images;

    } catch (error) {
      // Mark images as failed
      await this.markImagesAsFailed(
        images.map(img => img.media_file_id),
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Send request to n8n webhook with retry logic
   */
  private async sendWithRetry(
    request: ImageBatchRequest,
    callbacks?: ProcessingCallbacks
  ): Promise<N8NImageResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        callbacks?.onProgress?.(
          `Intento ${attempt}/${this.maxRetries} - Procesando con IA...`,
          50 + (attempt - 1) * 10
        );

        // Get authentication token
        const { data: { session } } = await supabase.auth.getSession();
        const authToken = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;

        const response = await fetch(this.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
          },
          body: JSON.stringify(request),
          signal: AbortSignal.timeout(this.timeoutMs)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result: N8NImageResponse = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'N8N processing failed');
        }

        console.log(`✅ N8N webhook successful on attempt ${attempt}:`, result);
        return result;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`❌ Attempt ${attempt} failed:`, lastError.message);

        if (attempt === this.maxRetries) {
          break;
        }

        // Wait before retry (exponential backoff)
        const waitTime = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    throw new Error(`N8N webhook failed after ${this.maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Mark images as processing in database
   */
  private async markImagesAsProcessing(mediaFileIds: string[]): Promise<void> {
    const { error } = await supabase
      .from('media_files')
      .update({
        n8n_processing_status: 'processing',
        updated_at: new Date().toISOString()
      })
      .in('id', mediaFileIds);

    if (error) {
      console.error('Error marking images as processing:', error);
    }
  }

  /**
   * Mark images as failed in database
   */
  private async markImagesAsFailed(mediaFileIds: string[], errorMessage: string): Promise<void> {
    const { error } = await supabase
      .from('media_files')
      .update({
        n8n_processing_status: 'failed',
        n8n_metadata: { external_error: errorMessage },
        updated_at: new Date().toISOString()
      })
      .in('id', mediaFileIds);

    if (error) {
      console.error('Error marking images as failed:', error);
    }
  }

  /**
   * Update database with n8n processing results
   */
  private async updateDatabaseWithResults(processedImages: ProcessedImage[]): Promise<void> {
    for (const image of processedImages) {
      try {
        if (image.processing_status === 'completed' && image.ai_description) {
          // Update successful processing
          const { error } = await supabase
            .rpc('update_media_description_from_external', {
              p_media_file_id: image.media_file_id,
              p_ai_description: image.ai_description,
              p_source: 'n8n_image_webhook'
            });

          if (error) {
            console.error(`Error updating description for ${image.media_file_id}:`, error);
          }
        } else {
          // Mark as failed
          const { error } = await supabase
            .rpc('mark_external_processing_failed', {
              p_media_file_id: image.media_file_id,
              p_error_message: image.error_message || 'Processing failed',
              p_source: 'n8n_image_webhook'
            });

          if (error) {
            console.error(`Error marking failed processing for ${image.media_file_id}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error processing result for ${image.media_file_id}:`, error);
      }
    }
  }

  /**
   * Extract room context from filename for better AI descriptions
   */
  private extractRoomContext(filename: string): string {
    const lower = filename.toLowerCase();
    
    if (lower.includes('salon') || lower.includes('living')) return 'living_room';
    if (lower.includes('cocina') || lower.includes('kitchen')) return 'kitchen';
    if (lower.includes('dormitor') || lower.includes('bedroom')) return 'bedroom';
    if (lower.includes('bano') || lower.includes('bathroom')) return 'bathroom';
    if (lower.includes('exterior') || lower.includes('fachada')) return 'exterior';
    if (lower.includes('terraza') || lower.includes('balcon')) return 'terrace';
    
    return 'general';
  }

  /**
   * Get processing status for a property
   */
  async getProcessingStatus(propertyId: string) {
    const { data, error } = await supabase
      .from('media_files')
      .select('n8n_processing_status, ai_description_status, description_source')
      .eq('property_id', propertyId)
      .eq('file_type', 'image');

    if (error) {
      console.error('Error getting processing status:', error);
      return null;
    }

    const total = data.length;
    const pending = data.filter(item => item.n8n_processing_status === 'pending').length;
    const processing = data.filter(item => item.n8n_processing_status === 'processing').length;
    const completed = data.filter(item => item.n8n_processing_status === 'completed').length;
    const failed = data.filter(item => item.n8n_processing_status === 'failed').length;

    return {
      total,
      pending,
      processing,
      completed,
      failed,
      is_complete: pending === 0 && processing === 0,
      completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }
}

// Export singleton instance
export const imageWebhookService = new ImageWebhookService();
export default imageWebhookService; 
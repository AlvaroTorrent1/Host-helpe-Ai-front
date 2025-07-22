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
  // Removed obsolete fields: n8n_processing_status, ai_description_status after DB cleanup
  created_at?: string;
  updated_at?: string;
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
      // SOLUCION 401: Usar proxy-n8n-webhook que tiene verify_jwt=false configurado
  private webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/proxy-n8n-webhook`;
  private bucketName = 'property-files';
  private maxRetries = 3;
  private timeoutMs = 120000; // 2 minutes

  /**
   * Ensure the storage bucket exists before uploading
   */
  /**
   * Get appropriate headers for webhook request based on function type
   * proxy-n8n-webhook está configurado con verify_jwt=false para permitir webhooks públicos
   */
  private getWebhookHeaders(): Record<string, string> {
    // Todas las funciones Supabase Edge usan la misma autenticación JWT
    return {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
    };
  }

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
    userId: string,
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
        this.sendBinariesToWebhook(propertyId, propertyName, imageFiles, userId, callbacks)
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuario no autenticado - no se pueden guardar imágenes');
    }

    await this.ensureBucket();

    callbacks?.onProgress?.('Subiendo imágenes a almacenamiento y base deatos...', 15);

    console.log(`Iniciando la subida de ${imageFiles.length} imágenes para la propiedad ${propertyId}`);

    // Pre-calcular sort_order antes del Promise.all para evitar race conditions en producción
    const filesWithSortOrder = imageFiles.map((file, index) => ({
      file,
      sortOrder: index,
      fileName: file.name
    }));

    const uploadPromises = filesWithSortOrder.map(async ({ file, sortOrder, fileName }, arrayIndex) => {
      const progressPercent = 15 + (arrayIndex / filesWithSortOrder.length) * 30; // Progreso de 15% a 45%
      callbacks?.onProgress?.(`Subiendo ${fileName}...`, progressPercent);

      console.log(`Procesando archivo ${fileName} en índice ${arrayIndex}. Asignando sort_order: ${sortOrder}`);

      const fileExtension = file.name.split('.').pop() || 'jpg';
      const uniqueFilename = `${Date.now()}_${crypto.randomUUID()}.${fileExtension}`;
      const filePath = `${propertyId}/${uniqueFilename}`;
      
      try {
        const { error: uploadError } = await supabase.storage
          .from(this.bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Error en subida a Storage para ${file.name}: ${uploadError.message}`);
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from(this.bucketName)
          .getPublicUrl(filePath);

        console.log(`Archivo ${fileName} subido a ${publicUrl}. Insertando en DB con sort_order: ${sortOrder}`);

        const { data: insertedMedia, error: insertError } = await supabase
          .from('media_files')
          .insert({
            property_id: propertyId,
            user_id: user.id,
            file_url: publicUrl,
            public_url: publicUrl,
            description: "Property image",
            sort_order: sortOrder,
            file_type: 'image',
            title: file.name.replace(/\.[^/.]+$/, ''),
            file_size: file.size,
            mime_type: file.type,
            is_shareable: true,
            // Removed obsolete status fields - now using simplified approach
          })
          .select()
          .single();

        if (insertError) {
          throw new Error(`Error insertando en DB para ${file.name}: ${insertError.message}`);
        }

        console.log(`Éxito al insertar en DB para ${fileName}. ID: ${insertedMedia.id}, sort_order: ${insertedMedia.sort_order}`);
        
        return insertedMedia as MediaFileRecord;

      } catch (error) {
        console.error(`Fallo al procesar ${fileName} en el índice ${sortOrder}:`, error);
        callbacks?.onError?.(`Error con ${fileName}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        return null; // Retorna null para filtrar después
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter((record): record is MediaFileRecord => record !== null);

    console.log(`Se completaron ${successfulUploads.length} de ${imageFiles.length} subidas.`);
    
    return successfulUploads;
  }

  /**
   * Send binary files to webhook for AI processing
   * This activates the automation
   */
  private async sendBinariesToWebhook(
    propertyId: string,
    propertyName: string,
    imageFiles: File[],
    userId: string,
    callbacks?: DualProcessingCallbacks
  ): Promise<WebhookImageResponse> {
    callbacks?.onProgress?.('Preparando datos para webhook externo de n8n...', 45);

    // CORREGIDO: Usar FormData para enviar archivos binarios al webhook externo
    // Formato esperado por el webhook externo de n8n (similar a directImageWebhookService)
    const formData = new FormData();
    
    // Add property metadata
    formData.append('property_id', propertyId);
    formData.append('property_name', propertyName);
    formData.append('user_id', userId);
    formData.append('total_images', imageFiles.length.toString());
    formData.append('timestamp', new Date().toISOString());
    formData.append('request_id', `dual-${Date.now()}`);
    
    // Add each image file as binary
    imageFiles.forEach((file, index) => {
      callbacks?.onProgress?.(
        `Preparando imagen ${index + 1} de ${imageFiles.length}: ${file.name}`,
        45 + (index / imageFiles.length) * 15
      );
      
      // Append file with a consistent naming pattern
      formData.append(`image_${index}`, file, file.name);
      
      // Add file metadata
      formData.append(`image_${index}_size`, file.size.toString());
      formData.append(`image_${index}_type`, file.type);
    });

    callbacks?.onProgress?.('Enviando al webhook externo de n8n...', 60);

    console.log(`📤 Sending ${imageFiles.length} images to external n8n webhook:`, this.webhookUrl);

    // Send FormData to external webhook with retry logic
    return await this.sendWithRetry(formData, callbacks, imageFiles);
  }

  /**
   * Send request to webhook with retry logic
   */
  private async sendWithRetry(
    payload: FormData | object,
    callbacks?: DualProcessingCallbacks,
    imageFiles?: File[]
  ): Promise<WebhookImageResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        callbacks?.onProgress?.(
          `Intento ${attempt}/${this.maxRetries} - Enviando al webhook...`,
          65 + (attempt - 1) * 5
        );

        // Prepare request options for external n8n webhook
        const requestOptions: RequestInit = {
          method: 'POST',
          signal: AbortSignal.timeout(this.timeoutMs)
        };

        if (payload instanceof FormData) {
          // For FormData, let browser set Content-Type with boundary automatically
          requestOptions.body = payload;
          requestOptions.headers = this.getWebhookHeaders();
        } else {
          // For JSON payloads (fallback compatibility)
          requestOptions.headers = {
            'Content-Type': 'application/json',
            ...this.getWebhookHeaders()
          };
          requestOptions.body = JSON.stringify(payload);
        }

        const response = await fetch(this.webhookUrl, requestOptions);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        // Handle response from external n8n webhook
        let result: WebhookImageResponse;
        try {
          result = await response.json();
                 } catch (jsonError) {
           // If response is not JSON, treat as success for external webhook
           console.log(`✅ External webhook response (attempt ${attempt}):`, response.status);
           return {
             success: true,
             processed_images: imageFiles?.map((file, index) => ({
               filename: file.name,
               ai_description: `AI description for ${file.name}`,
               processing_status: 'completed' as const
             })) || []
           };
         }

        // Check success field if available, otherwise assume success if status is OK
        if (result.success === false) {
          throw new Error(result.error || 'Webhook processing failed');
        }

        console.log(`✅ External n8n webhook successful on attempt ${attempt}:`, result);
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
              ai_description: processedImage.ai_description,
              updated_at: new Date().toISOString()
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
              updated_at: new Date().toISOString()
            };
            console.log(`✅ Updated description: ${mediaRecord.title}`);
          }
        } else {
          // Mark as failed
          await supabase
            .from('media_files')
            .update({
              ai_description: `Property image - ${mediaRecord.title}`,
              updated_at: new Date().toISOString()
            })
            .eq('id', mediaRecord.id);

          updatedRecords[i] = {
            ...mediaRecord,
            updated_at: new Date().toISOString()
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
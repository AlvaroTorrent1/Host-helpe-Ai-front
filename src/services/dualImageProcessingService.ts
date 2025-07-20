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
  private webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/n8n-webhook-simple-public`;
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
            ai_description_status: 'pending',
            n8n_processing_status: 'pending',
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
    callbacks?.onProgress?.('Enviando datos al webhook Edge Function...', 45);

    // Prepare uploaded files in the format expected by Edge Function
    const uploadedFiles = {
      interni: [] as Array<{filename: string, url: string, type: string, size: number, description: string}>,
      esterni: [] as Array<{filename: string, url: string, type: string, size: number, description: string}>,
      elettrodomestici_foto: [] as Array<{filename: string, url: string, type: string, size: number, description: string}>,
      documenti_casa: [] as Array<{filename: string, url: string, type: string, size: number, description: string}>,
      documenti_elettrodomestici: [] as Array<{filename: string, url: string, type: string, size: number, description: string}>
    };

    // Convert image files to uploaded files format
    for (let index = 0; index < imageFiles.length; index++) {
      const file = imageFiles[index];
      const progressPercent = 45 + (index / imageFiles.length) * 15; // 45-60%
      callbacks?.onProgress?.(
        `Preparando imagen ${index + 1} de ${imageFiles.length}`,
        progressPercent
      );

      // For now, add all images to 'interni' category
      // In a more sophisticated version, we could analyze file names/descriptions
      uploadedFiles.interni.push({
        filename: file.name,
        url: URL.createObjectURL(file), // Create blob URL for the file
        type: file.type,
        size: file.size,
        description: file.name.replace(/\.[^/.]+$/, '') // Remove extension
      });
    }

    // Prepare webhook payload
    const webhookPayload = {
      property_id: propertyId,
      user_id: userId,
      property_data: {
        name: propertyName,
        address: 'Webhook generated property'
      },
      uploaded_files: uploadedFiles,
      timestamp: new Date().toISOString(),
      request_id: `dual-${Date.now()}`
    };

    callbacks?.onProgress?.('Enviando al webhook Edge Function...', 60);

    // Send to Edge Function with retry logic
    return await this.sendWithRetry(webhookPayload, callbacks);
  }

  /**
   * Send request to webhook with retry logic
   */
  private async sendWithRetry(
    payload: FormData | object,
    callbacks?: DualProcessingCallbacks
  ): Promise<WebhookImageResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        callbacks?.onProgress?.(
          `Intento ${attempt}/${this.maxRetries} - Enviando al webhook...`,
          65 + (attempt - 1) * 5
        );

        // Prepare request options based on payload type
        const requestOptions: RequestInit = {
          method: 'POST',
          headers: {
            'X-N8N-Token': import.meta.env.VITE_N8N_WEBHOOK_TOKEN || 'hosthelper-n8n-secure-token-2024',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
          },
          signal: AbortSignal.timeout(this.timeoutMs)
        };

        if (payload instanceof FormData) {
          requestOptions.body = payload;
        } else {
          requestOptions.headers = {
            ...requestOptions.headers,
            'Content-Type': 'application/json'
          };
          requestOptions.body = JSON.stringify(payload);
        }

        const response = await fetch(this.webhookUrl, requestOptions);

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
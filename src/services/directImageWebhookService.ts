// File: /src/services/directImageWebhookService.ts
// Service to send images directly to n8n webhook as binary files

export interface DirectImageProcessingCallbacks {
  onProgress?: (message: string, percent?: number) => void;
  onStatusChange?: (status: 'preparing' | 'sending' | 'processing' | 'completed' | 'failed') => void;
  onSuccess?: (results: any[]) => void;
  onError?: (error: string) => void;
}

class DirectImageWebhookService {
  // NOTA: Este servicio usa un formato diferente (FormData) que no es compatible con n8n-webhook-simple
  // Se mantiene la URL original por compatibilidad. Usar dualImageProcessingService para el flujo principal
  private webhookUrl = 'https://hosthelperai.app.n8n.cloud/webhook/images';
  private maxRetries = 3;
  private timeoutMs = 120000; // 2 minutes for processing

  /**
   * Send images directly to n8n webhook as binary files
   */
  async sendImagesToWebhook(
    propertyId: string,
    propertyName: string,
    imageFiles: File[],
    callbacks?: DirectImageProcessingCallbacks
  ): Promise<any> {
    try {
      if (!imageFiles || imageFiles.length === 0) {
        return { success: true, message: 'No images to process' };
      }

      callbacks?.onStatusChange?.('preparing');
      callbacks?.onProgress?.('Preparando imágenes para envío...', 10);

      // Create FormData with binary files
      const formData = new FormData();
      
      // Add property metadata
      formData.append('property_id', propertyId);
      formData.append('property_name', propertyName);
      formData.append('total_images', imageFiles.length.toString());
      
      // Add each image file as binary
      imageFiles.forEach((file, index) => {
        callbacks?.onProgress?.(
          `Preparando imagen ${index + 1} de ${imageFiles.length}: ${file.name}`,
          10 + (index / imageFiles.length) * 20
        );
        
        // Append file with a consistent naming pattern
        formData.append(`image_${index}`, file, file.name);
        
        // Add file metadata
        formData.append(`image_${index}_size`, file.size.toString());
        formData.append(`image_${index}_type`, file.type);
      });

      callbacks?.onStatusChange?.('sending');
      callbacks?.onProgress?.('Enviando imágenes al webhook...', 30);

      // Send to webhook with retry logic
      const response = await this.sendWithRetry(formData, callbacks);

      callbacks?.onStatusChange?.('completed');
      callbacks?.onProgress?.('Procesamiento completado', 100);
      callbacks?.onSuccess?.([response]);

      return response;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error sending images to webhook:', errorMessage);
      callbacks?.onStatusChange?.('failed');
      callbacks?.onError?.(errorMessage);
      throw error;
    }
  }

  /**
   * Send FormData to webhook with retry logic
   */
  private async sendWithRetry(
    formData: FormData,
    callbacks?: DirectImageProcessingCallbacks
  ): Promise<any> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        callbacks?.onProgress?.(
          `Intento ${attempt}/${this.maxRetries} - Enviando al webhook...`,
          30 + (attempt - 1) * 20
        );

        console.log(`📤 Sending images to n8n webhook (attempt ${attempt}):`, this.webhookUrl);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
          const response = await fetch(this.webhookUrl, {
            method: 'POST',
            body: formData,
            signal: controller.signal,
            // No Content-Type header - let browser set it with boundary for multipart/form-data
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }

          const result = await response.json();
          console.log(`✅ Webhook response received:`, result);

          callbacks?.onProgress?.('Procesamiento exitoso', 90);
          return result;

        } catch (fetchError) {
          clearTimeout(timeoutId);
          throw fetchError;
        }

      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Attempt ${attempt} failed:`, error);

        if ((error as Error).name === 'AbortError') {
          lastError = new Error('Timeout: El webhook tardó demasiado en responder');
        }

        // If not the last attempt, wait before retrying
        if (attempt < this.maxRetries) {
          const waitTime = attempt * 2000; // 2s, 4s, 6s
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    throw new Error(`Failed after ${this.maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Test webhook connectivity
   */
  async testWebhook(): Promise<boolean> {
    try {
      console.log('🧪 Testing webhook connectivity...');
      
      const testData = new FormData();
      testData.append('test', 'true');
      testData.append('timestamp', new Date().toISOString());

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        body: testData,
      });

      console.log(`Test response status: ${response.status}`);
      return response.ok;
    } catch (error) {
      console.error('❌ Webhook test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const directImageWebhookService = new DirectImageWebhookService();
export default directImageWebhookService; 
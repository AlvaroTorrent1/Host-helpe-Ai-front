// src/services/webhookDocumentService.ts
// Service for sending documents to n8n webhook for processing and vectorization

import { supabase } from './supabase';

interface DocumentMetadata {
  name: string;
  description?: string;
  type: 'faq' | 'guide' | 'house_rules' | 'inventory' | 'other';
}

// NUEVO: Estructura para FormData binario
interface WebhookDocumentFormData {
  propertyId: string;
  propertyName: string;
  userId: string;
  timestamp: string;
  // Metadata del documento
  documentName: string;
  documentDescription?: string;
  documentType: string;
  // El archivo será añadido como FormData separadamente
}

interface WebhookResponse {
  success: boolean;
  documentId?: string;
  message?: string;
  error?: string;
}

// Estado de procesamiento para UI
export type DocumentProcessingStatus = 
  | 'uploading' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'retry';

interface ProcessingCallbacks {
  onStatusChange?: (status: DocumentProcessingStatus) => void;
  onProgress?: (message: string) => void;
  onError?: (error: string) => void;
  onSuccess?: (documentId: string) => void;
}

class WebhookDocumentService {
  private readonly webhookUrl: string;
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 2000; // 2 seconds

  constructor() {
    // URL del webhook de n8n para procesamiento de documentos
    this.webhookUrl = 'https://hosthelperai.app.n8n.cloud/webhook/file';
  }

  /**
   * Enviar documento al webhook de n8n para procesamiento
   * ACTUALIZADO: Ahora envía archivos en formato binario usando FormData
   */
  async sendDocumentToWebhook(
    propertyId: string,
    propertyName: string,
    file: File,
    metadata: DocumentMetadata,
    callbacks?: ProcessingCallbacks
  ): Promise<WebhookResponse> {
    try {
      // Validar entrada
      if (!file || file.size === 0) {
        throw new Error('Archivo vacío o inválido');
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB límite
        throw new Error('El archivo excede el tamaño máximo de 10MB');
      }

      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      callbacks?.onStatusChange?.('uploading');
      callbacks?.onProgress?.('Preparando documento para envío...');

      // NUEVO: Crear FormData con archivo binario
      const formData = new FormData();
      
      // Añadir archivo binario
      formData.append('file', file, file.name);
      
      // Añadir metadatos como campos de formulario (usando snake_case para n8n)
      formData.append('property_id', propertyId);
      formData.append('property_name', propertyName);
      formData.append('user_id', user.id);
      formData.append('timestamp', new Date().toISOString());
      formData.append('document_name', metadata.name);
      formData.append('document_type', metadata.type);
      if (metadata.description) {
        formData.append('document_description', metadata.description);
      }

      callbacks?.onStatusChange?.('processing');
      callbacks?.onProgress?.('Enviando documento para procesamiento...');

      // Log de datos que se están enviando (debug)
      console.log('📤 Datos enviados al webhook n8n:');
      console.log(`  - URL del webhook: ${this.webhookUrl}`);
      console.log(`  - property_id: ${propertyId}`);
      console.log(`  - property_name: ${propertyName}`);
      console.log(`  - user_id: ${user.id}`);
      console.log(`  - document_name: ${metadata.name}`);
      console.log(`  - document_type: ${metadata.type}`);
      console.log(`  - file size: ${file.size} bytes`);
      console.log(`  - file type: ${file.type}`);
      console.log(`  - file name: ${file.name}`);

      // Intentar enviar con reintentos
      const response = await this.sendWithRetry(formData, callbacks);

      if (response.success) {
        callbacks?.onStatusChange?.('completed');
        callbacks?.onProgress?.('Documento procesado exitosamente');
        callbacks?.onSuccess?.(response.documentId || '');
      } else {
        throw new Error(response.error || 'Error desconocido al procesar documento');
      }

      return response;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      callbacks?.onStatusChange?.('failed');
      callbacks?.onError?.(errorMessage);
      console.error('❌ Error enviando documento al webhook:', error);
      throw error;
    }
  }

  /**
   * Enviar con sistema de reintentos
   * ACTUALIZADO: Ahora maneja FormData en lugar de JSON
   */
  private async sendWithRetry(
    formData: FormData,
    callbacks?: ProcessingCallbacks
  ): Promise<WebhookResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 Intento ${attempt}/${this.maxRetries} - Enviando documento al webhook (formato binario)`);
        console.log(`🎯 URL objetivo: ${this.webhookUrl}`);

        const response = await fetch(this.webhookUrl, {
          method: 'POST',
          // NO establecer Content-Type - el navegador lo configurará automáticamente para FormData
          body: formData
        });

        console.log(`📡 Respuesta del webhook: ${response.status} ${response.statusText}`);

        // Si el webhook responde con 200-299, considerarlo exitoso
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Documento enviado exitosamente (formato binario):', result);
          return {
            success: true,
            documentId: result.documentId || result.id,
            message: result.message
          };
        }

        // Si es un error 4xx (error del cliente), no reintentar
        if (response.status >= 400 && response.status < 500) {
          const errorData = await response.text();
          throw new Error(`Error del cliente (${response.status}): ${errorData}`);
        }

        // Para errores 5xx, intentar reintentar
        const errorText = await response.text();
        lastError = new Error(`Error del servidor (${response.status}): ${errorText}`);
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Error desconocido');
        console.error(`❌ Error en intento ${attempt}:`, lastError.message);
      }

      // Si no es el último intento, esperar antes de reintentar
      if (attempt < this.maxRetries) {
        callbacks?.onStatusChange?.('retry');
        callbacks?.onProgress?.(`Reintentando... (${attempt}/${this.maxRetries})`);
        await this.delay(this.retryDelay * attempt); // Incrementar delay con cada intento
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    throw lastError || new Error('No se pudo enviar el documento después de varios intentos');
  }

  /**
   * Delay helper para reintentos
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Verificar estado del webhook (health check)
   */
  async checkWebhookHealth(): Promise<boolean> {
    try {
      console.log('🏥 Verificando estado del webhook de documentos...');
      
      const response = await fetch(this.webhookUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // El webhook podría responder con 405 (Method Not Allowed) para GET
      // lo cual indica que está activo pero solo acepta POST
      const isHealthy = response.status === 405 || response.status === 200;
      
      console.log(isHealthy ? '✅ Webhook disponible' : '❌ Webhook no disponible');
      return isHealthy;
      
    } catch (error) {
      console.error('❌ Error verificando webhook:', error);
      return false;
    }
  }
}

// Exportar instancia singleton
export const webhookDocumentService = new WebhookDocumentService();

// Exportar tipos para uso en componentes
export type { DocumentMetadata, WebhookResponse, ProcessingCallbacks }; 
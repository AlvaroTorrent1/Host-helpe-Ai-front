// src/services/propertyWebhookService.ts
// Servicio para el procesamiento de propiedades con webhook n8n

import { supabase } from './supabase';

interface UploadedFile {
  filename: string;
  url: string;
  type?: string;
  size?: number;
  description?: string;
}

interface PropertyWebhookPayload {
  property_id: string;
  user_id: string;
  property_data: any;
  uploaded_files: {
    interni: UploadedFile[];
    esterni: UploadedFile[];
    elettrodomestici_foto: UploadedFile[];
    documenti_casa: UploadedFile[];
    documenti_elettrodomestici: UploadedFile[];
  };
  timestamp: string;
  request_id: string;
}

interface ProcessingCallbacks {
  onProgress?: (phase: string, percent: number) => void;
  onError?: (error: string) => void;
  onSuccess?: (result: any) => void;
}

interface WebhookResponse {
  success: boolean;
  property_id: string;
  files_processed: number;
  categorization_summary: {
    images_by_category: Record<string, number>;
    documents_by_category: Record<string, number>;
    total_images: number;
    total_documents: number;
  };
  message: string;
  timestamp: string;
}

class PropertyWebhookService {
  private readonly webhookUrl: string;
  private readonly authToken: string;
  private readonly maxRetries: number = 3;
  private readonly baseDelay: number = 1000; // 1 segundo

  constructor() {
    // URL actualizada para webhook con debug mejorado
    this.webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/n8n-webhook-debug`;
    // Token de autenticación (en producción debería venir de variables de entorno)
    this.authToken = import.meta.env.VITE_N8N_WEBHOOK_TOKEN || 'hosthelper-n8n-secure-token-2024';
  }

  /**
   * Procesar propiedad con archivos usando webhook n8n
   */
  async processPropertyWithWebhook(
    propertyData: any,
    organizedFiles: any,
    callbacks?: ProcessingCallbacks
  ): Promise<any> {
    const requestId = crypto.randomUUID();
    const propertyId = crypto.randomUUID();
    
    try {
      callbacks?.onProgress?.('Preparando datos', 10);

      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      callbacks?.onProgress?.('Validando archivos', 20);

      // Preparar payload para webhook
      const payload: PropertyWebhookPayload = {
        property_id: propertyId,
        user_id: user.id,
        property_data: propertyData,
        uploaded_files: organizedFiles,
        timestamp: new Date().toISOString(),
        request_id: requestId
      };

      callbacks?.onProgress?.('Enviando a procesamiento IA', 40);

      // Enviar al webhook con reintentos
      const response = await this.sendWithRetry(payload, callbacks);
      
      callbacks?.onProgress?.('Procesamiento completado', 100);
      callbacks?.onSuccess?.(response);

      return {
        success: true,
        property_id: propertyId,
        processing_result: response
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error in webhook processing:', errorMessage);
      callbacks?.onError?.(errorMessage);
      throw error;
    }
  }

  /**
   * Enviar webhook con sistema de reintentos
   */
  private async sendWithRetry(
    payload: PropertyWebhookPayload, 
    callbacks?: ProcessingCallbacks
  ): Promise<WebhookResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 Intento ${attempt}/${this.maxRetries} - Enviando webhook`);
        
        // Obtener token de sesión de Supabase para autenticación
        const { data: { session } } = await supabase.auth.getSession();
        const supabaseToken = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;

        const response = await fetch(this.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseToken}`, // JWT de usuario para verificación Supabase
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseG5nbXRta25rZG1pa2FmbGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4ODEwMDIsImV4cCI6MjA1MjQ1NzAwMn0.vQ7VPECLdwlbEOe3kILsGr8ySiJXgFKZJj_YZNqNdBQ',
            'X-N8N-Token': this.authToken // Token personalizado para webhook v1
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const result: WebhookResponse = await response.json();
          console.log('✅ Webhook procesado exitosamente:', result);
          return result;
        } else {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Error desconocido');
        console.error(`❌ Intento ${attempt} falló:`, lastError.message);

        // Si no es el último intento, esperar antes de reintentar
        if (attempt < this.maxRetries) {
          const delay = this.baseDelay * Math.pow(2, attempt - 1); // Backoff exponencial
          console.log(`⏳ Esperando ${delay}ms antes del siguiente intento...`);
          callbacks?.onProgress?.(`Reintentando en ${delay/1000}s`, 30 + (attempt * 10));
          await this.sleep(delay);
        }
      }
    }

    throw new Error(`Webhook falló después de ${this.maxRetries} intentos: ${lastError?.message}`);
  }

  /**
   * Verificar salud del webhook endpoint
   */
  async checkWebhookHealth(): Promise<boolean> {
    try {
      console.log('🏥 Verificando salud del webhook...');
      
      // Obtener token de sesión para la verificación de salud
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseToken = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const response = await fetch(this.webhookUrl, {
        method: 'GET', // Esto debería retornar 405 pero confirma que está activo
        headers: {
          'Authorization': `Bearer ${supabaseToken}`, // JWT de usuario para verificación Supabase
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseG5nbXRta25rZG1pa2FmbGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4ODEwMDIsImV4cCI6MjA1MjQ1NzAwMn0.vQ7VPECLdwlbEOe3kILsGr8ySiJXgFKZJj_YZNqNdBQ',
          'X-N8N-Token': this.authToken // Token personalizado para webhook v1
        }
      });
      
      // 405 Method Not Allowed es esperado para GET requests
      const isHealthy = response.status === 405;
      console.log(isHealthy ? '✅ Webhook endpoint activo' : '❌ Webhook endpoint no responde');
      return isHealthy;
      
    } catch (error) {
      console.error('❌ Webhook endpoint no accesible:', error);
      return false;
    }
  }

  /**
   * Limpiar datos de propiedad en caso de fallo (rollback manual)
   */
  async rollbackProperty(propertyId: string): Promise<void> {
    try {
      console.log('🔄 Iniciando rollback para propiedad:', propertyId);

      // Eliminar archivos de media
      const { error: mediaError } = await supabase
        .from('media_files')
        .delete()
        .eq('property_id', propertyId);

      if (mediaError) {
        console.error('⚠️ Error eliminando archivos:', mediaError);
      }

      // Eliminar propiedad
      const { error: propertyError } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (propertyError) {
        console.error('⚠️ Error eliminando propiedad:', propertyError);
      }

      console.log('✅ Rollback completado');
    } catch (error) {
      console.error('❌ Error durante rollback:', error);
    }
  }

  /**
   * Función de utilidad para pausas
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Categorizar archivo localmente (fallback)
   */
  private categorizeFileLocally(file: any, sourceCategory: string) {
    const filename = file.name?.toLowerCase() || '';
    const isImage = file.type?.startsWith('image/') || 
                   filename.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/);

    if (isImage) {
      // Mapeo simple para imágenes
      const imageCategories = {
        'interni': 'Interior',
        'esterni': 'Exterior',
        'elettrodomestici_foto': 'Electrodomésticos'
      };
      return {
        file_type: 'image',
        category: 'gallery',
        subcategory: imageCategories[sourceCategory as keyof typeof imageCategories] || 'General'
      };
    } else {
      // Mapeo simple para documentos
      return {
        file_type: 'document',
        category: 'document_general',
        subcategory: 'General'
      };
    }
  }
}

export const propertyWebhookService = new PropertyWebhookService();
export default propertyWebhookService;
// src/services/webhookTestService.ts
// Servicio para probar la integración del webhook de propiedades

import { propertyWebhookService } from './propertyWebhookService';
import { supabase } from './supabase';

interface TestPropertyData {
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  property_type: string;
  num_bedrooms: number;
  num_bathrooms: number;
  max_guests: number;
  description: string;
  google_business_profile_url?: string;
}

interface TestFile {
  filename: string;
  url: string;
  type: string;
  size: number;
  description: string;
}

class WebhookTestService {
  /**
   * Ejecutar test completo del webhook
   */
  async runFullTest(): Promise<void> {
    console.log('🚀 Iniciando test completo del webhook...');
    
    try {
      // 1. Verificar salud del webhook
      const isHealthy = await propertyWebhookService.checkWebhookHealth();
      console.log(`🏥 Salud del webhook: ${isHealthy ? '✅ OK' : '❌ Error'}`);
      
      if (!isHealthy) {
        console.error('❌ El webhook no está disponible. Abortando test.');
        return;
      }

      // 2. Preparar datos de test
      const testProperty = this.generateTestPropertyData();
      const testFiles = this.generateTestFiles();
      
      console.log('📋 Datos de test preparados:');
      console.log(`   - Propiedad: ${testProperty.name}`);
      console.log(`   - Archivos: ${Object.values(testFiles).flat().length} total`);

      // 3. Ejecutar webhook con callbacks
      let lastProgress = '';
      const callbacks = {
        onProgress: (phase: string, percent: number) => {
          if (phase !== lastProgress) {
            console.log(`📊 ${phase}: ${percent}%`);
            lastProgress = phase;
          }
        },
        onError: (error: string) => {
          console.error(`❌ Error durante procesamiento: ${error}`);
        },
        onSuccess: (result: any) => {
          console.log('✅ Webhook procesado exitosamente:', result);
        }
      };

      const result = await propertyWebhookService.processPropertyWithWebhook(
        testProperty,
        testFiles,
        callbacks
      );

      console.log('🎉 Test completado exitosamente:', result);

      // 4. Verificar que la propiedad se creó en la base de datos
      await this.verifyPropertyCreation(result.property_id);

    } catch (error) {
      console.error('❌ Error en el test:', error);
      throw error;
    }
  }

  /**
   * Test simple solo del webhook (sin verificación de BD)
   */
  async testWebhookOnly(): Promise<void> {
    console.log('🧪 Probando solo el webhook...');
    
    const isHealthy = await propertyWebhookService.checkWebhookHealth();
    console.log(`Resultado: ${isHealthy ? '✅ Webhook activo' : '❌ Webhook no disponible'}`);
  }

  /**
   * Generar datos de propiedad de test
   */
  private generateTestPropertyData(): TestPropertyData {
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:]/g, '');
    
    return {
      name: `Casa Test Webhook ${timestamp}`,
      address: 'Calle de Prueba 123',
      city: 'Marbella',
      state: 'Málaga',
      postal_code: '29600',
      country: 'España',
      property_type: 'apartment',
      num_bedrooms: 2,
      num_bathrooms: 2,
      max_guests: 4,
      description: 'Propiedad de test para verificar la integración del webhook n8n con categorización automática de archivos.',
      google_business_profile_url: 'https://business.google.com/test-property'
    };
  }

  /**
   * Generar archivos de test simulados
   */
  private generateTestFiles() {
    const baseUrl = 'https://example.com/files/';
    
    return {
      interni: [
        {
          filename: 'sala_estar_01.jpg',
          url: `${baseUrl}sala_estar_01.jpg`,
          type: 'image/jpeg',
          size: 1024000,
          description: 'Sala de estar principal con sofá y televisión'
        },
        {
          filename: 'cocina_moderna.jpg',
          url: `${baseUrl}cocina_moderna.jpg`,
          type: 'image/jpeg', 
          size: 856000,
          description: 'Cocina equipada con electrodomésticos modernos'
        },
        {
          filename: 'dormitorio_matrimonio.jpg',
          url: `${baseUrl}dormitorio_matrimonio.jpg`,
          type: 'image/jpeg',
          size: 920000,
          description: 'Dormitorio principal con cama matrimonial'
        }
      ],
      esterni: [
        {
          filename: 'fachada_edificio.jpg',
          url: `${baseUrl}fachada_edificio.jpg`,
          type: 'image/jpeg',
          size: 1100000,
          description: 'Fachada principal del edificio'
        },
        {
          filename: 'terraza_vistas.jpg',
          url: `${baseUrl}terraza_vistas.jpg`,
          type: 'image/jpeg',
          size: 1200000,
          description: 'Terraza con vistas al mar'
        }
      ],
      elettrodomestici_foto: [
        {
          filename: 'nevera_samsung.jpg',
          url: `${baseUrl}nevera_samsung.jpg`,
          type: 'image/jpeg',
          size: 650000,
          description: 'Nevera Samsung con dispensador de agua'
        },
        {
          filename: 'lavadora_bosch.jpg',
          url: `${baseUrl}lavadora_bosch.jpg`,
          type: 'image/jpeg',
          size: 580000,
          description: 'Lavadora Bosch 8kg'
        }
      ],
      documenti_casa: [
        {
          filename: 'contrato_alquiler.pdf',
          url: `${baseUrl}contrato_alquiler.pdf`,
          type: 'application/pdf',
          size: 240000,
          description: 'Contrato de arrendamiento de la propiedad'
        },
        {
          filename: 'plano_vivienda.pdf',
          url: `${baseUrl}plano_vivienda.pdf`,
          type: 'application/pdf',
          size: 180000,
          description: 'Planos de distribución de la vivienda'
        }
      ],
      documenti_elettrodomestici: [
        {
          filename: 'manual_nevera.pdf',
          url: `${baseUrl}manual_nevera.pdf`,
          type: 'application/pdf',
          size: 320000,
          description: 'Manual de usuario de la nevera Samsung'
        },
        {
          filename: 'garantia_lavadora.pdf',
          url: `${baseUrl}garantia_lavadora.pdf`,
          type: 'application/pdf',
          size: 150000,
          description: 'Certificado de garantía lavadora Bosch'
        }
      ]
    };
  }

  /**
   * Verificar que la propiedad se creó correctamente en la BD
   */
  private async verifyPropertyCreation(propertyId: string): Promise<void> {
    try {
      console.log('🔍 Verificando creación en base de datos...');
      
      // Verificar propiedad
      const { data: property, error: propError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (propError || !property) {
        throw new Error(`Propiedad no encontrada: ${propError?.message}`);
      }

      console.log(`✅ Propiedad creada: ${property.name}`);

      // Verificar archivos multimedia
      const { data: mediaFiles, error: mediaError } = await supabase
        .from('media_files')
        .select('*')
        .eq('property_id', propertyId);

      if (mediaError) {
        throw new Error(`Error verificando archivos: ${mediaError.message}`);
      }

      console.log(`✅ Archivos procesados: ${mediaFiles?.length || 0}`);

      // Mostrar resumen de categorización
      if (mediaFiles && mediaFiles.length > 0) {
        const summary = this.generateVerificationSummary(mediaFiles);
        console.log('📊 Resumen de categorización:');
        console.log('   Imágenes por categoría:', summary.images);
        console.log('   Documentos por categoría:', summary.documents);
      }

    } catch (error) {
      console.error('❌ Error verificando creación:', error);
      throw error;
    }
  }

  /**
   * Generar resumen de verificación
   */
  private generateVerificationSummary(mediaFiles: any[]) {
    const summary = {
      images: {} as Record<string, number>,
      documents: {} as Record<string, number>
    };

    mediaFiles.forEach(file => {
      if (file.file_type === 'image') {
        summary.images[file.subcategory] = (summary.images[file.subcategory] || 0) + 1;
      } else {
        summary.documents[file.category] = (summary.documents[file.category] || 0) + 1;
      }
    });

    return summary;
  }

  /**
   * Limpiar datos de test (opcional)
   */
  async cleanupTestData(propertyId: string): Promise<void> {
    try {
      console.log('🧹 Limpiando datos de test...');
      
      await propertyWebhookService.rollbackProperty(propertyId);
      
      console.log('✅ Datos de test eliminados');
    } catch (error) {
      console.error('⚠️ Error durante limpieza:', error);
    }
  }
}

export const webhookTestService = new WebhookTestService();
export default webhookTestService;
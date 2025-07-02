// src/services/n8nTestService.ts
// Servicio para probar la integración con agentes n8n

import { supabase } from './supabase';

interface TestWebhookPayload {
  conversation: {
    guest_message: string;
    agent_response: string;
    timestamp: string;
    guest_phone?: string;
    guest_name?: string;
  };
  workflow: {
    id: string;
    execution_id: string;
    property_id: string;
  };
  classification: {
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    requires_action: boolean;
  };
}

class N8nTestService {
  private readonly webhookUrl: string;

  constructor() {
    // URL de la Edge Function desplegada (v2 con autenticación dual)
    this.webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/n8n-webhook-v2`;
  }

  /**
   * Enviar webhook de prueba simulando una conversación real
   */
  async sendTestWebhook(propertyId: string, testScenario: 'wifi' | 'checkout' | 'emergency' | 'general' = 'wifi'): Promise<boolean> {
    const testPayloads: Record<string, TestWebhookPayload> = {
      wifi: {
        conversation: {
          guest_message: "Hola, tengo problemas con el WiFi, no puedo conectarme",
          agent_response: "Hola! Te ayudo con el WiFi. La contraseña es 'CasaMarbella2024'. ¿Podrías intentar conectarte de nuevo?",
          timestamp: new Date().toISOString(),
          guest_phone: "+34612345678",
          guest_name: "María García"
        },
        workflow: {
          id: "test-workflow-wifi",
          execution_id: `test-exec-${Date.now()}`,
          property_id: propertyId
        },
        classification: {
          category: "technical_issue",
          priority: "medium",
          requires_action: true
        }
      },
      checkout: {
        conversation: {
          guest_message: "¿A qué hora tengo que hacer el checkout? ¿Puedo dejar las llaves en algún sitio?",
          agent_response: "El checkout es antes de las 12:00h. Puedes dejar las llaves en la caja fuerte junto a la puerta principal, código 1234.",
          timestamp: new Date().toISOString(),
          guest_phone: "+34687123456",
          guest_name: "Carlos Ruiz"
        },
        workflow: {
          id: "test-workflow-checkout",
          execution_id: `test-exec-${Date.now()}`,
          property_id: propertyId
        },
        classification: {
          category: "checkout",
          priority: "low",
          requires_action: false
        }
      },
      emergency: {
        conversation: {
          guest_message: "¡URGENTE! Se ha roto una tubería en el baño y hay agua por todas partes",
          agent_response: "¡Entiendo la urgencia! Te he enviado el contacto del fontanero de emergencia por WhatsApp. Cerrando la llave de paso general ahora.",
          timestamp: new Date().toISOString(),
          guest_phone: "+34634789012",
          guest_name: "Ana López"
        },
        workflow: {
          id: "test-workflow-emergency",
          execution_id: `test-exec-${Date.now()}`,
          property_id: propertyId
        },
        classification: {
          category: "emergency",
          priority: "urgent",
          requires_action: true
        }
      },
      general: {
        conversation: {
          guest_message: "¿Dónde puedo encontrar restaurantes buenos cerca del apartamento?",
          agent_response: "Te recomiendo 'El Rincón de Pepe' a 3 minutos andando para tapas tradicionales. También 'La Terraza del Mar' con vistas espectaculares.",
          timestamp: new Date().toISOString(),
          guest_phone: "+34698765432",
          guest_name: "Luis Martín"
        },
        workflow: {
          id: "test-workflow-general",
          execution_id: `test-exec-${Date.now()}`,
          property_id: propertyId
        },
        classification: {
          category: "general_inquiry",
          priority: "low",
          requires_action: false
        }
      }
    };

    const payload = testPayloads[testScenario];
    
    try {
      console.log(`🧪 Sending test webhook (${testScenario}) to:`, this.webhookUrl);
      
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'X-N8N-Token': 'hosthelper-n8n-secure-token-2024'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Test webhook successful:', result);
        return true;
      } else {
        const error = await response.text();
        console.error('❌ Test webhook failed:', error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending test webhook:', error);
      return false;
    }
  }

  /**
   * Obtener primera propiedad del usuario para testing
   */
  async getFirstUserProperty(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      return properties?.[0]?.id || null;
    } catch (error) {
      console.error('Error getting user property:', error);
      return null;
    }
  }

  /**
   * Ejecutar batería completa de tests
   */
  async runFullTest(): Promise<void> {
    const propertyId = await this.getFirstUserProperty();
    
    if (!propertyId) {
      console.error('❌ No properties found for testing');
      return;
    }

    console.log('🚀 Running full n8n integration test...');
    
    const scenarios: Array<'wifi' | 'checkout' | 'emergency' | 'general'> = ['wifi', 'checkout', 'emergency', 'general'];
    
    for (const scenario of scenarios) {
      console.log(`\n📝 Testing scenario: ${scenario}`);
      await this.sendTestWebhook(propertyId, scenario);
      
      // Esperar un poco entre tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n✅ Full test completed! Check your dashboard for new incidents.');
  }

  /**
   * Verificar estado del webhook endpoint
   */
  async checkWebhookHealth(): Promise<boolean> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'GET', // Esto debería retornar 405 pero confirma que está activo
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        }
      });
      
      // 405 Method Not Allowed es esperado para GET requests
      return response.status === 405;
    } catch (error) {
      console.error('❌ Webhook endpoint not reachable:', error);
      return false;
    }
  }
}

export const n8nTestService = new N8nTestService();
export default n8nTestService; 
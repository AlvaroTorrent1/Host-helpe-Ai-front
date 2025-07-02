// src/services/incidentService.ts
// Servicio para gestionar incidencias desde agentes n8n

import { supabase } from './supabase';

export interface IncidentData {
  id?: string;
  title: string;
  description?: string;
  property_id: string;
  category: 'check-in-out' | 'property-issue' | 'tourist-info' | 'emergency' | 'other';
  status?: 'pending' | 'resolved';
  phone_number?: string;
  n8n_workflow_id?: string;
  n8n_execution_id?: string;
  csv_data?: any;
  created_at?: string;
  updated_at?: string;
  resolved_at?: string;
}

export interface N8nIncidentPayload {
  // Datos de la conversación del agente
  conversation: {
    guest_message: string;
    agent_response: string;
    timestamp: string;
    guest_phone?: string;
    guest_name?: string;
  };
  // Metadatos del workflow
  workflow: {
    id: string;
    execution_id: string;
    property_id: string;
  };
  // Clasificación automática
  classification: {
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    requires_action: boolean;
  };
}

class IncidentService {
  /**
   * Crear incidencia desde datos de agente n8n
   */
  async createIncidentFromAgent(payload: N8nIncidentPayload): Promise<IncidentData> {
    try {
      // Generar título automático basado en la conversación
      const title = this.generateIncidentTitle(payload);
      
      // Preparar datos para insertar
      const incidentData: Partial<IncidentData> = {
        title,
        description: `Conversación con huésped:\n\nHuésped: ${payload.conversation.guest_message}\n\nAgente: ${payload.conversation.agent_response}`,
        property_id: payload.workflow.property_id,
        category: this.mapCategory(payload.classification.category),
        status: 'pending',
        phone_number: payload.conversation.guest_phone,
        n8n_workflow_id: payload.workflow.id,
        n8n_execution_id: payload.workflow.execution_id,
        csv_data: {
          conversation: payload.conversation,
          classification: payload.classification,
          timestamp: payload.conversation.timestamp
        }
      };

      const { data, error } = await supabase
        .from('incidents')
        .insert(incidentData)
        .select()
        .single();

      if (error) {
        console.error('Error creating incident:', error);
        throw error;
      }

      console.log('✅ Incident created from n8n agent:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Failed to create incident from agent:', error);
      throw error;
    }
  }

  /**
   * Obtener incidencias para un usuario específico
   */
  async getIncidentsForUser(userId: string): Promise<IncidentData[]> {
    try {
      const { data, error } = await supabase
        .from('incidents_with_property')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading incidents:', error);
      throw error;
    }
  }

  /**
   * Resolver una incidencia
   */
  async resolveIncident(incidentId: string, resolutionNotes?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('incidents')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          description: resolutionNotes ? 
            `${resolutionNotes}\n\n---\nResuelta el ${new Date().toLocaleString()}` : 
            undefined
        })
        .eq('id', incidentId);

      if (error) throw error;
      console.log('✅ Incident resolved:', incidentId);
    } catch (error) {
      console.error('❌ Failed to resolve incident:', error);
      throw error;
    }
  }

  /**
   * Generar título automático para la incidencia
   */
  private generateIncidentTitle(payload: N8nIncidentPayload): string {
    const message = payload.conversation.guest_message.toLowerCase();
    const guestName = payload.conversation.guest_name || 'Huésped';
    
    // Palabras clave para categorizar automáticamente
    if (message.includes('wifi') || message.includes('internet')) {
      return `${guestName} - Problema con WiFi`;
    }
    if (message.includes('calefacción') || message.includes('aire') || message.includes('temperatura')) {
      return `${guestName} - Problema con climatización`;
    }
    if (message.includes('agua') || message.includes('ducha') || message.includes('baño')) {
      return `${guestName} - Problema con agua/baño`;
    }
    if (message.includes('llave') || message.includes('entrada') || message.includes('acceso')) {
      return `${guestName} - Problema de acceso`;
    }
    if (message.includes('limpieza') || message.includes('toalla') || message.includes('sábana')) {
      return `${guestName} - Consulta sobre limpieza`;
    }
    if (message.includes('checkout') || message.includes('salida') || message.includes('check-out')) {
      return `${guestName} - Consulta sobre check-out`;
    }
    
    // Título genérico si no hay palabras clave específicas
    return `${guestName} - Consulta general`;
  }

  /**
   * Mapear categoría de n8n a categorías de base de datos
   */
  private mapCategory(category: string): IncidentData['category'] {
    const categoryMap: Record<string, IncidentData['category']> = {
      'technical_issue': 'property-issue',
      'access_problem': 'check-in-out',
      'general_inquiry': 'tourist-info',
      'emergency': 'emergency',
      'checkout': 'check-in-out',
      'amenities': 'property-issue'
    };

    return categoryMap[category] || 'other';
  }

  /**
   * Crear incidencia manual (para testing)
   */
  async createTestIncident(propertyId: string): Promise<IncidentData> {
    const testPayload: N8nIncidentPayload = {
      conversation: {
        guest_message: "Hola, tengo problemas con el WiFi, no puedo conectarme",
        agent_response: "Hola! Te ayudo con el WiFi. La contraseña es 'CasaMarbella2024'. ¿Podrías intentar conectarte de nuevo?",
        timestamp: new Date().toISOString(),
        guest_phone: "+34612345678",
        guest_name: "María García"
      },
      workflow: {
        id: "test-workflow-001",
        execution_id: "test-exec-" + Date.now(),
        property_id: propertyId
      },
      classification: {
        category: "technical_issue",
        priority: "medium",
        requires_action: true
      }
    };

    return this.createIncidentFromAgent(testPayload);
  }
}

export const incidentService = new IncidentService();
export default incidentService; 
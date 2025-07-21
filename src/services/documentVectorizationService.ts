// src/services/documentVectorizationService.ts
import { supabase } from './supabase';

interface VectorizationRequest {
  fileUrl: string;
  propertyId: string;
  propertyName: string;
  fileId: string;
}

export class DocumentVectorizationService {
  // Updated webhook URL for document vectorization
  private static N8N_WEBHOOK_URL = process.env.VITE_N8N_WEBHOOK_URL || 'https://hosthelperai.app.n8n.cloud/webhook/pdf';

  /**
   * Envía un documento PDF al workflow de vectorización de n8n
   */
  static async sendDocumentForVectorization(request: VectorizationRequest) {
    try {
      console.log(`📤 Sending document for vectorization to: ${this.N8N_WEBHOOK_URL}`);
      console.log('Request data:', {
        fileUrl: request.fileUrl,
        propertyId: request.propertyId,
        propertyName: request.propertyName,
        fileId: request.fileId
      });

      const response = await fetch(this.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUrl: request.fileUrl,
          propertyId: request.propertyId,
          propertyName: request.propertyName,
          metadata: {
            file_id: request.fileId,
            timestamp: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Document sent for vectorization successfully:', result);

      // Marcar el documento como enviado para vectorización en media_files
      await this.markAsVectorized(request.fileId, result.executionId);

      return result;
    } catch (error) {
      console.error('❌ Error sending document for vectorization:', error);
      throw error;
    }
  }

  /**
   * Marca un documento como enviado para vectorización en media_files
   */
  private static async markAsVectorized(fileId: string, executionId?: string) {
    try {
      // Simplified: just update the timestamp since n8n fields were removed
      const { data, error } = await supabase
        .from('media_files')
        .update({
          updated_at: new Date().toISOString()
          // Removed obsolete n8n_execution_id and n8n_metadata fields
        })
        .eq('id', fileId);

      if (error) {
        console.error('Error marking document as sent for vectorization:', error);
      } else {
        console.log('✅ Document marked as sent for vectorization');
      }

      return data;
    } catch (error) {
      console.error('Error in markAsVectorized:', error);
    }
  }

  /**
   * Obtiene documentos PDF pendientes de vectorización desde media_files
   */
  static async getPendingDocuments(propertyId?: string) {
    try {
      // Simplified query without obsolete n8n_execution_id field
      let query = supabase
        .from('media_files')
        .select('*')
        .eq('file_type', 'document')
        .like('mime_type', '%pdf%');

      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error getting pending documents:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPendingDocuments:', error);
      return [];
    }
  }

  /**
   * Busca documentos usando embeddings semánticos
   */
  static async searchDocuments(queryEmbedding: number[], matchCount = 10, filter = {}) {
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_count: matchCount,
      filter: filter
    });

    if (error) {
      console.error('Error searching documents:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Obtiene estadísticas de vectorización
   */
  static async getVectorizationStats(propertyId?: string) {
    const { data, error } = await supabase.rpc('get_vectorization_stats', {
      p_property_id: propertyId
    });

    if (error) {
      console.error('Error getting vectorization stats:', error);
      return null;
    }

    return data?.[0] || null;
  }
}

// Helper function to handle document upload integration
export async function handleDocumentUpload(fileId: string, propertyId: string) {
  try {
    // Obtener información del archivo desde media_files (tabla correcta)
    const { data: document, error } = await supabase
      .from('media_files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (error || !document) {
      console.error('Error fetching document from media_files:', error);
      return;
    }

    // Si es un documento PDF, enviarlo para vectorización
    if (document.file_type === 'document' && 
        (document.mime_type?.includes('pdf') || document.title?.toLowerCase().includes('.pdf'))) {
      try {
        // Obtener el nombre de la propiedad
        const { data: property } = await supabase
          .from('properties')
          .select('name')
          .eq('id', document.property_id)
          .single();

        await DocumentVectorizationService.sendDocumentForVectorization({
          fileUrl: document.file_url,
          propertyId: document.property_id,
          propertyName: property?.name || 'Unknown Property',
          fileId: document.id
        });
        
        console.log('✅ Document sent for vectorization successfully');
      } catch (error) {
        console.error('❌ Failed to send document for vectorization:', error);
      }
    }
  } catch (error) {
    console.error('❌ Error in handleDocumentUpload:', error);
  }
} 
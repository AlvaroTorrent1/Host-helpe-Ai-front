// src/types/document.ts

/**
 * Representa un documento vectorizado en la base de datos
 */
export interface VectorizedDocument {
  id: number;
  property_id: string;
  property_name: string | null;
  content: string;
  metadata: DocumentMetadata;
  embedding?: number[]; // Vector de 1536 dimensiones
  created_at: string;
  updated_at: string;
}

/**
 * Metadata almacenada en cada chunk de documento
 */
export interface DocumentMetadata {
  file_id: string;
  page_number?: number;
  chunk_index?: number;
  total_chunks?: number;
  original_filename?: string;
  file_size?: number;
  processed_at?: string;
  n8n_execution_id?: string;
  [key: string]: any; // Permitir campos adicionales
}

/**
 * Resultado de búsqueda semántica
 */
export interface DocumentSearchResult {
  id: number;
  content: string;
  metadata: DocumentMetadata;
  similarity: number; // Score de similitud (0-1)
}

/**
 * Estadísticas de vectorización
 */
export interface VectorizationStats {
  total_documents: number;
  vectorized_documents: number;
  pending_documents: number;
  total_chunks: number;
  avg_chunks_per_document: number;
}

/**
 * Documento pendiente de vectorización
 */
export interface PendingDocument {
  file_id: string;
  property_id: string;
  property_name: string;
  file_url: string;
  title: string;
}

/**
 * Request para enviar al webhook de n8n
 */
export interface VectorizationWebhookRequest {
  fileUrl: string;
  propertyId: string;
  propertyName: string;
  metadata: {
    file_id: string;
    timestamp: string;
    [key: string]: any;
  };
} 
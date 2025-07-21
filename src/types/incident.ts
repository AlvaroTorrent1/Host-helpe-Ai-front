// src/types/incident.ts
/**
 * Definición de categorías de incidencias para alojamientos turísticos
 * Estas categorías deben estar sincronizadas con las traducciones en es.json y en.json
 */

// Categorías disponibles para incidencias (10 categorías definidas)
export const INCIDENT_CATEGORIES = [
  'checkin',      // Problemas de llegada/acceso
  'checkout',     // Problemas de salida  
  'maintenance',  // Problemas técnicos/averías
  'cleaning',     // Problemas de limpieza
  'wifi',         // Problemas de conectividad
  'noise',        // Quejas de ruido
  'amenities',    // Problemas con servicios/comodidades
  'security',     // Problemas de seguridad
  'emergency',    // Situaciones de emergencia
  'others'        // Otros problemas no categorizados
] as const;

// Tipo TypeScript derivado de las constantes
export type IncidentCategory = typeof INCIDENT_CATEGORIES[number];

// Validador para verificar si una categoría es válida
export function isValidIncidentCategory(category: string): category is IncidentCategory {
  return INCIDENT_CATEGORIES.includes(category as IncidentCategory);
}

// Función para obtener la categoría por defecto
export function getDefaultIncidentCategory(): IncidentCategory {
  return 'others';
}

// Mapeo de categorías n8n a nuestras categorías estandarizadas
export const N8N_CATEGORY_MAPPING: Record<string, IncidentCategory> = {
  'technical_issue': 'maintenance',
  'access_problem': 'checkin',
  'general_inquiry': 'others',
  'emergency': 'emergency',
  'checkout': 'checkout',
  'amenities': 'amenities',
  'wifi_issue': 'wifi',
  'noise_complaint': 'noise',
  'security_issue': 'security',
  'cleaning_issue': 'cleaning',
  'maintenance_request': 'maintenance',
  'checkin_problem': 'checkin',
  'checkout_problem': 'checkout',
  // Fallback para categorías desconocidas
  'unknown': 'others',
  'other': 'others'
};

// Función para mapear categoría de n8n a categoría válida
export function mapN8nCategory(n8nCategory: string): IncidentCategory {
  const category = N8N_CATEGORY_MAPPING[n8nCategory.toLowerCase()];
  return category || getDefaultIncidentCategory();
}

// Estados disponibles para incidencias
export const INCIDENT_STATUSES = [
  'pending',
  'resolved', 
  'inProgress'
] as const;

export type IncidentStatus = typeof INCIDENT_STATUSES[number];

// Función para validar estado de incidencia
export function isValidIncidentStatus(status: string): status is IncidentStatus {
  return INCIDENT_STATUSES.includes(status as IncidentStatus);
} 
// src/types/property.ts
export interface Property {
  id: string;
  name: string;
  address: string;
  image?: string;
  // Campos adicionales según el PRD
  description?: string;
  amenities?: string[];
  rules?: string[];
  created_at?: string;
  updated_at?: string;
  // Nuevos campos para imágenes adicionales
  additional_images?: PropertyImage[];
  documents?: PropertyDocument[];
  // Enlaces compartibles de la propiedad
  shareable_links?: ShareableLink[];
  // Campo para Google Business Profile URL (legacy - ahora usa shareable_links)
  google_business_profile_url?: string;
  // Descripción para enlaces de negocio
  business_links_description?: string;
  
  // Campos adicionales para dirección completa (requeridos por SES/Lynx)
  country?: string;
  
  // Campos de la vivienda turística (simplificado)
  property_type?: 'apartment' | 'house' | 'villa' | 'room'; // Tipo de propiedad
  max_guests?: number; // Capacidad máxima
  num_bedrooms?: number; // Número de habitaciones
  has_wifi?: boolean; // ¿Tiene WiFi?
  
  // Credenciales SES para Authority Connections (capturadas pero no enviadas a Lynx directamente)
  ses_landlord_code?: string; // Código de arrendador en SES
  ses_username?: string; // Usuario SES
  ses_api_password?: string; // Contraseña API de SES
  ses_establishment_code?: string; // Código de establecimiento en SES
  
  // IDs de integración con Lynx (guardados después de crear conexiones)
  lynx_account_id?: string; // ID de cuenta en Lynx
  lynx_authority_connection_id?: string; // ID de la conexión con SES
  lynx_lodging_id?: string; // ID del lodging creado en Lynx
  lynx_lodging_status?: 'active' | 'pending_validation' | 'rejected' | 'inactive';
}

export interface PropertyImage {
  id: string;
  property_id: string;
  file_url: string;
  description: string;
  uploaded_at: string;
  file?: File;
}

export interface PropertyDocument {
  id: string | number;
  property_id: string;
  name: string;
  description: string;
  type: "faq" | "guide" | "house_rules" | "inventory" | "other";
  file_url: string;
  file_type: string;
  uploaded_at: string;
  file?: File; // Campo opcional para almacenar archivo temporalmente
}

// Nuevos tipos para shareable links
export type LinkType = 'image' | 'gallery' | 'document' | 'profile';
export type PlatformType = 'whatsapp' | 'telegram' | 'email' | 'general';

export interface ShareableLink {
  id: string;
  property_id: string;
  link_type: LinkType;
  target_id?: string; // Referencias a media_files si aplica
  public_url: string;
  title: string;
  description?: string;
  is_active: boolean;
  click_count: number;
  last_accessed_at?: string;
  expires_at?: string;
  created_for: PlatformType;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

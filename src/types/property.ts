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

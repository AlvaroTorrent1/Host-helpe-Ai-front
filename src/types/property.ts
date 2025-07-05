// src/types/property.ts
export interface Property {
  id: string;
  name: string;
  address: string;
  image?: string;
  status: "active" | "inactive";
  // Campos adicionales según el PRD
  description?: string;
  amenities?: string[];
  rules?: string[];
  created_at?: string;
  updated_at?: string;
  // Nuevos campos para imágenes adicionales y documentos
  additional_images?: PropertyImage[];
  documents?: PropertyDocument[];
  // Campo para Google Business Profile URL
  google_business_profile_url?: string;
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
  id: string;
  property_id: string;
  type: "house_rules" | "inventory" | "faq" | "guide" | "other";
  name: string;
  file_url: string;
  description?: string;
  uploaded_at: string;
  file_type: "pdf" | "doc" | "txt" | "other" | string;
  // Propiedades adicionales para documentos temporales
  file?: Blob | File;
  document_type?: string;
  file_path?: string;
}

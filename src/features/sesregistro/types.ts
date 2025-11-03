// src/features/sesregistro/types.ts
/**
 * Tipos TypeScript para el sistema de Registro de Viajeros SES
 * Cumplimiento del Real Decreto 933/2021 - Ministerio del Interior de España
 */

/**
 * Género del viajero
 */
export type Gender = 'male' | 'female' | 'other';

/**
 * Tipo de documento de identidad
 */
export type DocumentType = 'passport' | 'dni' | 'nie' | 'other';

/**
 * Pasos del wizard de añadir viajero
 */
export type WizardStep = 'personal' | 'residence' | 'address' | 'contact';

/**
 * Información completa de un viajero
 * Todos los campos son requeridos excepto los marcados como opcionales
 */
export interface Traveler {
  // ID del viajero (generado por el backend)
  id?: string;
  
  // Información Personal
  firstName: string;
  firstSurname: string;
  secondSurname?: string; // Opcional (obligatorio para DNI/NIE españoles)
  nationality: string; // Código de país (ISO 3166-1 alpha-2)
  gender: Gender;
  
  // Información del Documento (NUEVO - Real Decreto 933/2021)
  documentType: DocumentType; // Tipo de documento
  documentNumber: string; // Número de documento/pasaporte
  documentSupportNumber?: string; // Número de soporte (opcional - requerido solo para DNI/NIE españoles)
  dateOfBirth: string; // Fecha de nacimiento (formato ISO YYYY-MM-DD)
  placeOfBirth?: string; // Lugar de nacimiento (opcional)
  
  // País de Residencia
  residenceCountry: string; // Código de país (ISO 3166-1 alpha-2)
  
  // Información de Dirección
  city: string;
  ineCode?: string; // Código INE del municipio (solo para España, opcional)
  postalCode: string;
  address: string;
  additionalAddress?: string; // Opcional (Apto, Piso, etc.)
  
  // Información de Contacto
  email: string;
  phoneCountry: string; // Código de país para el teléfono
  phone: string;
  alternativePhoneCountry?: string; // Opcional
  alternativePhone?: string; // Opcional
}

/**
 * Datos parciales del viajero durante el wizard
 */
export type PartialTraveler = Partial<Traveler>;

/**
 * Método de pago de la reserva
 */
export type PaymentMethod = 'destination' | 'online' | 'bank_transfer' | 'other';

/**
 * Información de la reserva
 */
export interface Reservation {
  // IDs de la URL
  propertyId: string;
  reservationId: string;
  token: string;
  
  // Datos de la reserva
  propertyName: string;
  checkIn: string; // Formato ISO 8601 (YYYY-MM-DD)
  checkOut: string; // Formato ISO 8601 (YYYY-MM-DD)
  numberOfNights: number;
  numberOfTravelers: number;
  paymentMethod: PaymentMethod;
  
  // Viajeros registrados
  travelers: Traveler[];
  
  // Expiración del enlace
  expiresAt: string; // Timestamp ISO 8601
}

/**
 * Estado del wizard de añadir viajero
 */
export interface WizardState {
  currentStep: WizardStep;
  travelerData: PartialTraveler;
  isOpen: boolean;
  editingTravelerId?: string; // Si está editando un viajero existente
}

/**
 * Respuesta del API al obtener datos de la reserva
 */
export interface ReservationResponse {
  success: boolean;
  data?: Reservation;
  error?: string;
}

/**
 * Respuesta del API al añadir/editar viajero
 */
export interface TravelerResponse {
  success: boolean;
  data?: Traveler;
  error?: string;
}

/**
 * Respuesta del API al enviar el check-in
 */
export interface CheckinSubmitResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * País para el selector
 */
export interface Country {
  code: string; // ISO 3166-1 alpha-2 (ES, US, FR, etc.)
  name: string; // Nombre del país
  nameEs: string; // Nombre en español
  nameEn: string; // Nombre en inglés
  phoneCode: string; // Código telefónico (+34, +1, etc.)
  flag: string; // Emoji de la bandera
}



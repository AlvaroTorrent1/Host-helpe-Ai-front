// src/features/sesregistro/constants.ts
/**
 * Constantes para el sistema de Registro de Viajeros SES
 */

import { Country, WizardStep, PaymentMethod } from './types';

/**
 * Lista de países soportados
 * Ordenados alfabéticamente por nombre en español
 */
export const COUNTRIES: Country[] = [
  { code: 'ES', name: 'España', nameEs: 'España', nameEn: 'Spain', phoneCode: '+34', flag: '🇪🇸' },
  { code: 'DE', name: 'Alemania', nameEs: 'Alemania', nameEn: 'Germany', phoneCode: '+49', flag: '🇩🇪' },
  { code: 'AR', name: 'Argentina', nameEs: 'Argentina', nameEn: 'Argentina', phoneCode: '+54', flag: '🇦🇷' },
  { code: 'AU', name: 'Australia', nameEs: 'Australia', nameEn: 'Australia', phoneCode: '+61', flag: '🇦🇺' },
  { code: 'AT', name: 'Austria', nameEs: 'Austria', nameEn: 'Austria', phoneCode: '+43', flag: '🇦🇹' },
  { code: 'BE', name: 'Bélgica', nameEs: 'Bélgica', nameEn: 'Belgium', phoneCode: '+32', flag: '🇧🇪' },
  { code: 'BO', name: 'Bolivia', nameEs: 'Bolivia', nameEn: 'Bolivia', phoneCode: '+591', flag: '🇧🇴' },
  { code: 'BR', name: 'Brasil', nameEs: 'Brasil', nameEn: 'Brazil', phoneCode: '+55', flag: '🇧🇷' },
  { code: 'CA', name: 'Canadá', nameEs: 'Canadá', nameEn: 'Canada', phoneCode: '+1', flag: '🇨🇦' },
  { code: 'CL', name: 'Chile', nameEs: 'Chile', nameEn: 'Chile', phoneCode: '+56', flag: '🇨🇱' },
  { code: 'CN', name: 'China', nameEs: 'China', nameEn: 'China', phoneCode: '+86', flag: '🇨🇳' },
  { code: 'CO', name: 'Colombia', nameEs: 'Colombia', nameEn: 'Colombia', phoneCode: '+57', flag: '🇨🇴' },
  { code: 'CR', name: 'Costa Rica', nameEs: 'Costa Rica', nameEn: 'Costa Rica', phoneCode: '+506', flag: '🇨🇷' },
  { code: 'HR', name: 'Croacia', nameEs: 'Croacia', nameEn: 'Croatia', phoneCode: '+385', flag: '🇭🇷' },
  { code: 'CU', name: 'Cuba', nameEs: 'Cuba', nameEn: 'Cuba', phoneCode: '+53', flag: '🇨🇺' },
  { code: 'DK', name: 'Dinamarca', nameEs: 'Dinamarca', nameEn: 'Denmark', phoneCode: '+45', flag: '🇩🇰' },
  { code: 'EC', name: 'Ecuador', nameEs: 'Ecuador', nameEn: 'Ecuador', phoneCode: '+593', flag: '🇪🇨' },
  { code: 'US', name: 'Estados Unidos', nameEs: 'Estados Unidos', nameEn: 'United States', phoneCode: '+1', flag: '🇺🇸' },
  { code: 'FI', name: 'Finlandia', nameEs: 'Finlandia', nameEn: 'Finland', phoneCode: '+358', flag: '🇫🇮' },
  { code: 'FR', name: 'Francia', nameEs: 'Francia', nameEn: 'France', phoneCode: '+33', flag: '🇫🇷' },
  { code: 'GR', name: 'Grecia', nameEs: 'Grecia', nameEn: 'Greece', phoneCode: '+30', flag: '🇬🇷' },
  { code: 'GT', name: 'Guatemala', nameEs: 'Guatemala', nameEn: 'Guatemala', phoneCode: '+502', flag: '🇬🇹' },
  { code: 'HN', name: 'Honduras', nameEs: 'Honduras', nameEn: 'Honduras', phoneCode: '+504', flag: '🇭🇳' },
  { code: 'IE', name: 'Irlanda', nameEs: 'Irlanda', nameEn: 'Ireland', phoneCode: '+353', flag: '🇮🇪' },
  { code: 'IT', name: 'Italia', nameEs: 'Italia', nameEn: 'Italy', phoneCode: '+39', flag: '🇮🇹' },
  { code: 'JP', name: 'Japón', nameEs: 'Japón', nameEn: 'Japan', phoneCode: '+81', flag: '🇯🇵' },
  { code: 'MX', name: 'México', nameEs: 'México', nameEn: 'Mexico', phoneCode: '+52', flag: '🇲🇽' },
  { code: 'NI', name: 'Nicaragua', nameEs: 'Nicaragua', nameEn: 'Nicaragua', phoneCode: '+505', flag: '🇳🇮' },
  { code: 'NO', name: 'Noruega', nameEs: 'Noruega', nameEn: 'Norway', phoneCode: '+47', flag: '🇳🇴' },
  { code: 'NL', name: 'Países Bajos', nameEs: 'Países Bajos', nameEn: 'Netherlands', phoneCode: '+31', flag: '🇳🇱' },
  { code: 'PA', name: 'Panamá', nameEs: 'Panamá', nameEn: 'Panama', phoneCode: '+507', flag: '🇵🇦' },
  { code: 'PY', name: 'Paraguay', nameEs: 'Paraguay', nameEn: 'Paraguay', phoneCode: '+595', flag: '🇵🇾' },
  { code: 'PE', name: 'Perú', nameEs: 'Perú', nameEn: 'Peru', phoneCode: '+51', flag: '🇵🇪' },
  { code: 'PL', name: 'Polonia', nameEs: 'Polonia', nameEn: 'Poland', phoneCode: '+48', flag: '🇵🇱' },
  { code: 'PT', name: 'Portugal', nameEs: 'Portugal', nameEn: 'Portugal', phoneCode: '+351', flag: '🇵🇹' },
  { code: 'GB', name: 'Reino Unido', nameEs: 'Reino Unido', nameEn: 'United Kingdom', phoneCode: '+44', flag: '🇬🇧' },
  { code: 'DO', name: 'República Dominicana', nameEs: 'República Dominicana', nameEn: 'Dominican Republic', phoneCode: '+1', flag: '🇩🇴' },
  { code: 'RU', name: 'Rusia', nameEs: 'Rusia', nameEn: 'Russia', phoneCode: '+7', flag: '🇷🇺' },
  { code: 'SV', name: 'El Salvador', nameEs: 'El Salvador', nameEn: 'El Salvador', phoneCode: '+503', flag: '🇸🇻' },
  { code: 'SE', name: 'Suecia', nameEs: 'Suecia', nameEn: 'Sweden', phoneCode: '+46', flag: '🇸🇪' },
  { code: 'CH', name: 'Suiza', nameEs: 'Suiza', nameEn: 'Switzerland', phoneCode: '+41', flag: '🇨🇭' },
  { code: 'UY', name: 'Uruguay', nameEs: 'Uruguay', nameEn: 'Uruguay', phoneCode: '+598', flag: '🇺🇾' },
  { code: 'VE', name: 'Venezuela', nameEs: 'Venezuela', nameEn: 'Venezuela', phoneCode: '+58', flag: '🇻🇪' },
];

/**
 * Encuentra un país por su código
 */
export const getCountryByCode = (code: string): Country | undefined => {
  return COUNTRIES.find(country => country.code === code);
};

/**
 * Encuentra un país por su código telefónico
 */
export const getCountryByPhoneCode = (phoneCode: string): Country | undefined => {
  return COUNTRIES.find(country => country.phoneCode === phoneCode);
};

/**
 * Ordena países por nombre según el idioma actual
 */
export const sortCountriesByLanguage = (language: 'es' | 'en'): Country[] => {
  return [...COUNTRIES].sort((a, b) => {
    const nameA = language === 'es' ? a.nameEs : a.nameEn;
    const nameB = language === 'es' ? b.nameEs : b.nameEn;
    return nameA.localeCompare(nameB);
  });
};

/**
 * Configuración de los pasos del wizard
 */
export const WIZARD_STEPS: Record<WizardStep, { order: number; key: WizardStep }> = {
  personal: { order: 1, key: 'personal' },
  residence: { order: 2, key: 'residence' },
  address: { order: 3, key: 'address' },
  contact: { order: 4, key: 'contact' },
};

/**
 * Número total de pasos del wizard
 */
export const TOTAL_WIZARD_STEPS = 4;

/**
 * Traducciones de métodos de pago
 */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, { es: string; en: string }> = {
  destination: { es: 'Pago en Destino', en: 'Payment on Arrival' },
  online: { es: 'Pago Online', en: 'Online Payment' },
  bank_transfer: { es: 'Transferencia Bancaria', en: 'Bank Transfer' },
  other: { es: 'Otro', en: 'Other' },
};

/**
 * Expresión regular para validación de email
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Expresión regular para validación de teléfono (solo números, espacios, guiones, paréntesis)
 */
export const PHONE_REGEX = /^[\d\s\-\(\)]+$/;

/**
 * País por defecto (España)
 */
export const DEFAULT_COUNTRY = COUNTRIES[0]; // España



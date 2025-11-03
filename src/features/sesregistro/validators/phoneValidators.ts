// src/features/sesregistro/validators/phoneValidators.ts
/**
 * Validadores de números de teléfono internacionales
 * Usa libphonenumber-js para validación robusta
 */

import { parsePhoneNumber, CountryCode, PhoneNumber } from 'libphonenumber-js';
import { ValidationResult } from './documentValidators';

/**
 * Validar número de teléfono internacional
 * 
 * @param phone - Número de teléfono
 * @param countryCode - Código ISO del país (ES, US, etc.)
 * @returns Resultado de la validación con número formateado
 */
export function validatePhone(
  phone: string,
  countryCode: string
): ValidationResult & { formatted?: string } {
  // Limpiar el número
  const cleanedPhone = phone.trim();
  
  if (!cleanedPhone) {
    return {
      valid: false,
      message: 'El número de teléfono es obligatorio',
    };
  }
  
  try {
    // Intentar parsear el número de teléfono
    const phoneNumber: PhoneNumber = parsePhoneNumber(cleanedPhone, countryCode as CountryCode);
    
    // Verificar si es válido
    if (!phoneNumber.isValid()) {
      return {
        valid: false,
        message: 'El número de teléfono no es válido',
        suggestion: `Formato esperado para ${countryCode}: ${getPhoneExample(countryCode)}`,
      };
    }
    
    return {
      valid: true,
      formatted: phoneNumber.formatInternational(), // Formato: +34 600 123 456
    };
  } catch (error) {
    return {
      valid: false,
      message: 'El número de teléfono no es válido',
      suggestion: `Formato esperado: ${getPhoneExample(countryCode)}`,
    };
  }
}

/**
 * Formatear número de teléfono
 * 
 * @param phone - Número de teléfono
 * @param countryCode - Código ISO del país
 * @returns Número formateado o el original si falla
 */
export function formatPhone(phone: string, countryCode: string): string {
  try {
    const phoneNumber = parsePhoneNumber(phone, countryCode as CountryCode);
    if (phoneNumber.isValid()) {
      return phoneNumber.formatInternational();
    }
  } catch (error) {
    // Si falla, devolver el número original
  }
  return phone;
}

/**
 * Obtener ejemplo de número de teléfono según país
 */
export function getPhoneExample(countryCode: string): string {
  const examples: Record<string, string> = {
    ES: '+34 600 123 456',
    US: '+1 555 123 4567',
    GB: '+44 20 1234 5678',
    FR: '+33 1 23 45 67 89',
    DE: '+49 30 12345678',
    IT: '+39 02 1234 5678',
    PT: '+351 21 123 4567',
    NL: '+31 20 123 4567',
    BE: '+32 2 123 45 67',
    AR: '+54 11 1234 5678',
    MX: '+52 55 1234 5678',
    CO: '+57 1 234 5678',
    BR: '+55 11 1234 5678',
    CL: '+56 2 1234 5678',
  };
  
  return examples[countryCode] || '+XX XXX XXX XXXX';
}

/**
 * Obtener código de país del teléfono
 * Útil para autocompletar el selector de país
 */
export function getCountryCodeFromPhone(phone: string): string | null {
  try {
    const phoneNumber = parsePhoneNumber(phone);
    if (phoneNumber && phoneNumber.country) {
      return phoneNumber.country;
    }
  } catch (error) {
    // Si falla, devolver null
  }
  return null;
}
















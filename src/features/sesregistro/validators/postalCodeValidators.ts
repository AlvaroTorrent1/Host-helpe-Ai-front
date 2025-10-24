// src/features/sesregistro/validators/postalCodeValidators.ts
/**
 * Validadores de códigos postales internacionales
 */

import { ValidationResult } from './documentValidators';

/**
 * Patrones de códigos postales por país
 */
const POSTAL_CODE_PATTERNS: Record<string, RegExp> = {
  ES: /^[0-9]{5}$/,                                    // 12345
  US: /^[0-9]{5}(-[0-9]{4})?$/,                       // 12345 o 12345-6789
  GB: /^[A-Z]{1,2}[0-9]{1,2} ?[0-9][A-Z]{2}$/i,      // SW1A 1AA o SW1A1AA
  FR: /^[0-9]{5}$/,                                    // 75001
  DE: /^[0-9]{5}$/,                                    // 10115
  IT: /^[0-9]{5}$/,                                    // 00118
  PT: /^[0-9]{4}(-[0-9]{3})?$/,                       // 1000 o 1000-001
  NL: /^[0-9]{4} ?[A-Z]{2}$/i,                        // 1012 AB o 1012AB
  BE: /^[0-9]{4}$/,                                    // 1000
  AR: /^[A-Z]?[0-9]{4}[A-Z]{0,3}$/i,                  // 1000 o C1425
  MX: /^[0-9]{5}$/,                                    // 01000
  CO: /^[0-9]{6}$/,                                    // 110111
  BR: /^[0-9]{5}-?[0-9]{3}$/,                         // 01310-100 o 01310100
  CL: /^[0-9]{7}$/,                                    // 8320000
  CA: /^[A-Z][0-9][A-Z] ?[0-9][A-Z][0-9]$/i,         // K1A 0B1 o K1A0B1
  AU: /^[0-9]{4}$/,                                    // 2000
  JP: /^[0-9]{3}-?[0-9]{4}$/,                         // 100-0001 o 1000001
  CN: /^[0-9]{6}$/,                                    // 100000
  RU: /^[0-9]{6}$/,                                    // 101000
};

/**
 * Ejemplos de códigos postales por país
 */
const POSTAL_CODE_EXAMPLES: Record<string, string> = {
  ES: '28001 (5 dígitos)',
  US: '12345 o 12345-6789',
  GB: 'SW1A 1AA',
  FR: '75001',
  DE: '10115',
  IT: '00118',
  PT: '1000-001',
  NL: '1012 AB',
  BE: '1000',
  AR: 'C1425',
  MX: '01000',
  CO: '110111',
  BR: '01310-100',
  CL: '8320000',
  CA: 'K1A 0B1',
  AU: '2000',
  JP: '100-0001',
  CN: '100000',
  RU: '101000',
};

/**
 * Limpiar y normalizar código postal de forma agresiva
 * Elimina caracteres invisibles, espacios extra, etc.
 * 
 * @param postalCode - Código postal sin limpiar
 * @param countryCode - Código ISO del país
 * @returns Código postal limpio
 */
function deepCleanPostalCode(postalCode: string, countryCode: string): string {
  // Paso 1: Eliminar espacios al inicio/final y caracteres invisibles
  let cleaned = postalCode.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
  
  // Paso 2: Para países con códigos solo numéricos, extraer solo dígitos
  const numericOnlyCountries = ['ES', 'FR', 'DE', 'IT', 'MX', 'CO', 'CL', 'CN', 'RU', 'AU', 'BE'];
  
  if (numericOnlyCountries.includes(countryCode)) {
    // Extraer solo dígitos
    cleaned = cleaned.replace(/\D/g, '');
  } else if (countryCode === 'PT' || countryCode === 'BR') {
    // Portugal/Brasil: permitir guión
    cleaned = cleaned.replace(/[^\d-]/g, '');
  } else if (countryCode === 'US') {
    // USA: permitir guión
    cleaned = cleaned.replace(/[^\d-]/g, '');
  } else if (countryCode === 'NL' || countryCode === 'CA') {
    // Holanda/Canadá: mantener espacios y letras
    cleaned = cleaned.toUpperCase().replace(/\s+/g, ' ');
  } else if (countryCode === 'GB') {
    // UK: mantener espacios y letras
    cleaned = cleaned.toUpperCase().replace(/\s+/g, ' ');
  } else if (countryCode === 'AR') {
    // Argentina: permitir letras y números
    cleaned = cleaned.toUpperCase().replace(/[^A-Z0-9]/g, '');
  } else if (countryCode === 'JP') {
    // Japón: permitir guión
    cleaned = cleaned.replace(/[^\d-]/g, '');
  }
  
  return cleaned;
}

/**
 * Validar código postal
 * 
 * @param postalCode - Código postal
 * @param countryCode - Código ISO del país
 * @returns Resultado de la validación
 */
export function validatePostalCode(
  postalCode: string,
  countryCode: string
): ValidationResult {
  // Limpieza básica inicial
  const initialClean = postalCode.trim();
  
  if (!initialClean) {
    return {
      valid: false,
      message: 'El código postal es obligatorio',
    };
  }
  
  // Obtener el patrón del país
  const pattern = POSTAL_CODE_PATTERNS[countryCode];
  
  if (!pattern) {
    // País no soportado - validación básica (más permisiva)
    console.log('[PostalCode] País no soportado, usando validación básica:', countryCode);
    return {
      valid: initialClean.length >= 3 && initialClean.length <= 10,
      message: initialClean.length < 3 
        ? 'El código postal es demasiado corto' 
        : initialClean.length > 10 
        ? 'El código postal es demasiado largo'
        : undefined,
    };
  }
  
  // Limpieza profunda según el país
  const cleanedCode = deepCleanPostalCode(initialClean, countryCode);
  
  // DEBUG: Log para diagnosticar problemas
  console.log('🔍 [PostalCode Validation]');
  console.log('   Original:', `"${postalCode}"`);
  console.log('   Limpio inicial:', `"${initialClean}"`);
  console.log('   Limpio profundo:', `"${cleanedCode}"`);
  console.log('   País:', countryCode);
  console.log('   Longitud:', cleanedCode.length);
  
  // Validar contra el patrón
  const isValid = pattern.test(cleanedCode);
  
  console.log('✅ [PostalCode] Resultado Validación:');
  console.log('   Patrón:', pattern.toString());
  console.log('   Código limpio:', `"${cleanedCode}"`);
  console.log('   ¿Es válido?:', isValid);
  console.log('   Test directo:', pattern.test(cleanedCode));
  
  if (!isValid) {
    const example = POSTAL_CODE_EXAMPLES[countryCode] || '';
    return {
      valid: false,
      message: 'El formato del código postal no es válido',
      suggestion: example ? `Formato esperado: ${example}` : undefined,
    };
  }
  
  return {
    valid: true,
  };
}

/**
 * Normalizar código postal (eliminar espacios extra, mayúsculas)
 */
export function normalizePostalCode(postalCode: string, countryCode: string): string {
  let normalized = postalCode.trim().toUpperCase();
  
  // Para códigos postales que requieren espacios (UK, NL, CA), mantenerlos
  if (['GB', 'NL', 'CA'].includes(countryCode)) {
    // Eliminar múltiples espacios
    normalized = normalized.replace(/\s+/g, ' ');
  } else {
    // Para otros países, eliminar todos los espacios
    normalized = normalized.replace(/\s/g, '');
  }
  
  return normalized;
}

/**
 * Obtener ejemplo de código postal
 */
export function getPostalCodeExample(countryCode: string): string {
  return POSTAL_CODE_EXAMPLES[countryCode] || 'Según formato de su país';
}




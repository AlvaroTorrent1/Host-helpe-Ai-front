// src/features/sesregistro/validators/documentValidators.ts
/**
 * Validadores de documentos de identidad (Pasaportes, DNI, NIE, etc.)
 * Implementa validación de formatos según país y tipo de documento
 */

import { DocumentType } from '../types';

// Resultado de validación
export interface ValidationResult {
  valid: boolean;
  message?: string;
  suggestion?: string; // Sugerencia de formato correcto
}

/**
 * Patrones de documentos por país
 * Fuente: Estándares ICAO 9303 y normativas nacionales
 */
const DOCUMENT_PATTERNS: Record<string, Record<string, RegExp>> = {
  // ESPAÑA
  ES: {
    passport: /^[A-Z]{3}[0-9]{6}[A-Z]?$/i, // AAA123456 o AAA123456A
    dni: /^[0-9]{8}[A-Z]$/i,                // 12345678A
    nie: /^[XYZ][0-9]{7}[A-Z]$/i,           // X1234567A
  },
  
  // ESTADOS UNIDOS
  US: {
    passport: /^[0-9]{9}$/,                  // 123456789
  },
  
  // REINO UNIDO
  GB: {
    passport: /^[0-9]{9}$/,                  // 123456789
  },
  
  // FRANCIA
  FR: {
    passport: /^[0-9]{2}[A-Z]{2}[0-9]{5}$/i, // 12AB34567
  },
  
  // ALEMANIA
  DE: {
    passport: /^[CFGHJKLMNPRTVWXYZ0-9]{9}$/i, // C01X00T47
  },
  
  // ITALIA
  IT: {
    passport: /^[A-Z]{2}[0-9]{7}$/i,         // AA1234567
  },
  
  // PORTUGAL
  PT: {
    passport: /^[A-Z][0-9]{6}$/i,            // N123456
  },
  
  // PAÍSES BAJOS
  NL: {
    passport: /^[A-Z]{2}[A-Z0-9]{6}[0-9]$/i, // NE1234567
  },
  
  // BÉLGICA
  BE: {
    passport: /^[A-Z]{2}[0-9]{6}$/i,         // EK123456
  },
  
  // ARGENTINA
  AR: {
    passport: /^[A-Z]{3}[0-9]{6}$/i,         // AAA123456
  },
  
  // MÉXICO
  MX: {
    passport: /^[0-9]{10}$/,                 // 1234567890
  },
  
  // COLOMBIA
  CO: {
    passport: /^[A-Z]{2}[0-9]{6}$/i,         // CC123456
  },
  
  // BRASIL
  BR: {
    passport: /^[A-Z]{2}[0-9]{6}$/i,         // AB123456
  },
  
  // CHILE
  CL: {
    passport: /^[0-9]{8,9}$/,                // 12345678 o 123456789
  },
};

/**
 * Ejemplos de formatos correctos por país y tipo de documento
 */
const DOCUMENT_EXAMPLES: Record<string, Record<string, string>> = {
  ES: {
    passport: 'AAA123456 o AAA123456A',
    dni: '12345678A',
    nie: 'X1234567A (donde X puede ser X, Y o Z)',
    other: 'Cualquier formato',
  },
  US: {
    passport: '123456789 (9 dígitos)',
    other: 'Cualquier formato',
  },
  GB: {
    passport: '123456789 (9 dígitos)',
    other: 'Cualquier formato',
  },
  FR: {
    passport: '12AB34567',
    other: 'Cualquier formato',
  },
  DE: {
    passport: 'C01X00T47',
    other: 'Cualquier formato',
  },
};

/**
 * Validar dígito de control del DNI español
 */
function validateDniCheckDigit(dni: string): boolean {
  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const number = parseInt(dni.substring(0, 8), 10);
  const letter = dni.substring(8, 9).toUpperCase();
  
  return letters[number % 23] === letter;
}

/**
 * Validar dígito de control del NIE español
 */
function validateNieCheckDigit(nie: string): boolean {
  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const niePrefix = nie.substring(0, 1).toUpperCase();
  
  // Reemplazar la letra inicial por el número correspondiente
  let nieNumber: string;
  switch (niePrefix) {
    case 'X': nieNumber = '0' + nie.substring(1, 8); break;
    case 'Y': nieNumber = '1' + nie.substring(1, 8); break;
    case 'Z': nieNumber = '2' + nie.substring(1, 8); break;
    default: return false;
  }
  
  const number = parseInt(nieNumber, 10);
  const letter = nie.substring(8, 9).toUpperCase();
  
  return letters[number % 23] === letter;
}

/**
 * Validar documento de identidad
 * 
 * @param documentNumber - Número del documento
 * @param documentType - Tipo de documento (passport, dni, nie, other)
 * @param countryCode - Código ISO del país (ES, US, etc.)
 * @returns Resultado de la validación
 */
export function validateDocument(
  documentNumber: string,
  documentType: DocumentType,
  countryCode: string
): ValidationResult {
  // Limpiar el número de documento (eliminar espacios y guiones)
  const cleanedNumber = documentNumber.trim().replace(/[\s\-]/g, '');
  
  // Si está vacío
  if (!cleanedNumber) {
    return {
      valid: false,
      message: 'El número de documento es obligatorio',
    };
  }
  
  // Si el tipo es 'other', validar formato básico + detectar patrones inválidos
  if (documentType === 'other') {
    if (cleanedNumber.length < 5) {
      return {
        valid: false,
        message: 'El documento es demasiado corto (mínimo 5 caracteres)',
      };
    }
    
    if (cleanedNumber.length > 20) {
      return {
        valid: false,
        message: 'El documento es demasiado largo (máximo 20 caracteres)',
      };
    }
    
    // Detectar patrones de "tontería"
    if (!seemsValidDocument(cleanedNumber)) {
      return {
        valid: false,
        message: 'El número de documento no parece válido',
        suggestion: 'Verifique que el documento esté escrito correctamente',
      };
    }
    
    return { valid: true };
  }
  
  // Obtener el patrón del documento según país y tipo
  const countryPatterns = DOCUMENT_PATTERNS[countryCode];
  
  if (!countryPatterns) {
    // País no soportado - validación básica con detección de patrones inválidos
    if (cleanedNumber.length < 5) {
      return {
        valid: false,
        message: 'El documento es demasiado corto (mínimo 5 caracteres)',
      };
    }
    
    if (cleanedNumber.length > 20) {
      return {
        valid: false,
        message: 'El documento es demasiado largo (máximo 20 caracteres)',
      };
    }
    
    // Detectar patrones de "tontería"
    if (!seemsValidDocument(cleanedNumber)) {
      return {
        valid: false,
        message: 'El número de documento no parece válido',
        suggestion: 'Verifique que el documento esté escrito correctamente',
      };
    }
    
    return { valid: true };
  }
  
  const pattern = countryPatterns[documentType];
  
  if (!pattern) {
    // Tipo de documento no soportado para este país
    // Aplicar validación básica + detección de patrones
    if (cleanedNumber.length < 5) {
      return {
        valid: false,
        message: 'El documento es demasiado corto (mínimo 5 caracteres)',
      };
    }
    
    if (cleanedNumber.length > 20) {
      return {
        valid: false,
        message: 'El documento es demasiado largo (máximo 20 caracteres)',
      };
    }
    
    if (!seemsValidDocument(cleanedNumber)) {
      return {
        valid: false,
        message: 'El número de documento no parece válido',
        suggestion: 'Verifique que el documento esté escrito correctamente',
      };
    }
    
    return { valid: true };
  }
  
  // Validar contra el patrón
  const matchesPattern = pattern.test(cleanedNumber);
  
  if (!matchesPattern) {
    const example = DOCUMENT_EXAMPLES[countryCode]?.[documentType] || '';
    return {
      valid: false,
      message: 'El formato del documento no es válido',
      suggestion: example ? `Formato esperado: ${example}` : undefined,
    };
  }
  
  // Validación especial para DNI y NIE españoles (verificar dígito de control)
  if (countryCode === 'ES') {
    if (documentType === 'dni') {
      const validCheckDigit = validateDniCheckDigit(cleanedNumber);
      if (!validCheckDigit) {
        return {
          valid: false,
          message: 'La letra del DNI no es correcta',
          suggestion: 'Verifique que la letra final corresponda al número',
        };
      }
    } else if (documentType === 'nie') {
      const validCheckDigit = validateNieCheckDigit(cleanedNumber);
      if (!validCheckDigit) {
        return {
          valid: false,
          message: 'La letra del NIE no es correcta',
          suggestion: 'Verifique que la letra final corresponda al número',
        };
      }
    }
  }
  
  return {
    valid: true,
  };
}

/**
 * Normalizar número de documento (convertir a mayúsculas, eliminar espacios)
 */
export function normalizeDocumentNumber(documentNumber: string): string {
  return documentNumber.trim().toUpperCase().replace(/[\s\-]/g, '');
}

/**
 * Filtrar entrada de documento en tiempo real
 * Permite solo caracteres alfanuméricos, espacios y guiones
 * Evita patrones obviamente inválidos
 */
export function filterDocumentInput(value: string): string {
  // Solo permitir letras (A-Z), números (0-9), espacios y guiones
  let filtered = value.replace(/[^A-Za-z0-9\s\-]/g, '');
  
  // Convertir a mayúsculas
  filtered = filtered.toUpperCase();
  
  // Limitar longitud máxima a 25 caracteres
  filtered = filtered.substring(0, 25);
  
  return filtered;
}

/**
 * Detectar si un documento parece inválido (patrones de "tontería")
 * Retorna true si parece válido, false si parece basura
 */
export function seemsValidDocument(documentNumber: string): boolean {
  const cleaned = documentNumber.trim().replace(/[\s\-]/g, '');
  
  // Muy corto (menos de 5 caracteres)
  if (cleaned.length < 5) {
    return false;
  }
  
  // Solo números repetidos: "11111111", "00000000"
  if (/^(\d)\1+$/.test(cleaned)) {
    return false;
  }
  
  // Solo letras repetidas: "AAAAAAAA", "WWWWWWW"
  if (/^([A-Z])\1+$/.test(cleaned)) {
    return false;
  }
  
  // Patrones repetitivos obvios: "ABABAB", "123123123"
  // Detectar si más del 70% son repeticiones del mismo patrón
  const patterns = [2, 3, 4]; // Patrones de 2, 3 o 4 caracteres
  for (const len of patterns) {
    if (cleaned.length >= len * 3) {
      const pattern = cleaned.substring(0, len);
      const repeated = pattern.repeat(Math.floor(cleaned.length / len));
      
      // Si coincide en más del 70%, es repetitivo
      let matches = 0;
      for (let i = 0; i < Math.min(cleaned.length, repeated.length); i++) {
        if (cleaned[i] === repeated[i]) matches++;
      }
      
      if (matches / cleaned.length > 0.7) {
        return false;
      }
    }
  }
  
  // Más del 80% del mismo carácter (ej: "AAAA1AAA")
  const charCount: Record<string, number> = {};
  for (const char of cleaned) {
    charCount[char] = (charCount[char] || 0) + 1;
  }
  
  const maxCount = Math.max(...Object.values(charCount));
  if (maxCount / cleaned.length > 0.8) {
    return false;
  }
  
  // Secuencias ascendentes/descendentes muy largas: "12345678", "ABCDEFGH"
  let ascSeq = 1, descSeq = 1;
  for (let i = 1; i < cleaned.length; i++) {
    const curr = cleaned.charCodeAt(i);
    const prev = cleaned.charCodeAt(i - 1);
    
    if (curr === prev + 1) {
      ascSeq++;
      descSeq = 1;
    } else if (curr === prev - 1) {
      descSeq++;
      ascSeq = 1;
    } else {
      ascSeq = 1;
      descSeq = 1;
    }
    
    // Secuencia de más de 6 caracteres consecutivos es sospechosa
    if (ascSeq > 6 || descSeq > 6) {
      return false;
    }
  }
  
  // Documentos válidos deben tener al menos algo de variedad
  // Verificar que tenga al menos 3 caracteres diferentes
  const uniqueChars = new Set(cleaned).size;
  if (cleaned.length >= 8 && uniqueChars < 3) {
    return false;
  }
  
  return true;
}

/**
 * Obtener ejemplo de formato de documento
 */
export function getDocumentExample(
  documentType: DocumentType,
  countryCode: string
): string {
  return DOCUMENT_EXAMPLES[countryCode]?.[documentType] || 'Formato según su país';
}

/**
 * Verificar si un país requiere segundo apellido obligatorio
 * (Países hispanohablantes generalmente requieren dos apellidos)
 */
export function requiresSecondSurname(
  documentType: DocumentType,
  countryCode: string
): boolean {
  // Para DNI y NIE españoles, el segundo apellido es obligatorio
  if (countryCode === 'ES' && (documentType === 'dni' || documentType === 'nie')) {
    return true;
  }
  
  // Para otros documentos españoles (pasaporte), también es recomendable
  // pero no estrictamente obligatorio en el formulario
  return false;
}



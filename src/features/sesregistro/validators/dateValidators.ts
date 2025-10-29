// src/features/sesregistro/validators/dateValidators.ts
/**
 * Validadores de fechas (fecha de nacimiento, etc.)
 * Usa date-fns para cálculos de fechas
 */

import { differenceInYears, isValid, parse } from 'date-fns';
import { ValidationResult } from './documentValidators';

/**
 * Validar fecha de nacimiento
 * 
 * @param dateStr - Fecha en formato YYYY-MM-DD o Date
 * @returns Resultado de la validación con edad calculada
 */
export function validateDateOfBirth(
  dateStr: string
): ValidationResult & { age?: number } {
  if (!dateStr) {
    return {
      valid: false,
      message: 'La fecha de nacimiento es obligatoria',
    };
  }
  
  // Intentar parsear la fecha
  let date: Date;
  
  if (typeof dateStr === 'string') {
    // Formato ISO: YYYY-MM-DD
    date = new Date(dateStr);
  } else {
    date = dateStr;
  }
  
  // Verificar si es una fecha válida
  if (!isValid(date)) {
    return {
      valid: false,
      message: 'La fecha de nacimiento no es válida',
      suggestion: 'Use el formato DD/MM/AAAA',
    };
  }
  
  // Verificar que la fecha no sea en el futuro
  const today = new Date();
  if (date > today) {
    return {
      valid: false,
      message: 'La fecha de nacimiento no puede ser en el futuro',
    };
  }
  
  // Calcular edad
  const age = differenceInYears(today, date);
  
  // Verificar edad mínima (0 años - recién nacidos)
  if (age < 0) {
    return {
      valid: false,
      message: 'La fecha de nacimiento no es válida',
    };
  }
  
  // Verificar edad máxima razonable (120 años)
  if (age > 120) {
    return {
      valid: false,
      message: 'La fecha de nacimiento no parece correcta',
      suggestion: 'Verifique el año de nacimiento',
    };
  }
  
  return {
    valid: true,
    age,
  };
}

/**
 * Calcular edad a partir de fecha de nacimiento
 */
export function calculateAge(dateOfBirth: string): number {
  const date = new Date(dateOfBirth);
  return differenceInYears(new Date(), date);
}

/**
 * Formatear fecha para display (DD/MM/YYYY)
 */
export function formatDateForDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  if (!isValid(date)) {
    return dateStr;
  }
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Convertir fecha de DD/MM/YYYY a YYYY-MM-DD (formato ISO)
 */
export function convertToISODate(dateStr: string): string | null {
  // Si ya está en formato ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Si está en formato DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  }
  
  return null;
}

/**
 * Validar que una fecha esté en formato ISO (YYYY-MM-DD)
 */
export function isISODateFormat(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}








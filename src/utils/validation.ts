/**
 * src/utils/validation.ts
 * Form validation utility functions
 */

/**
 * Validates email format
 * @param email Email to validate
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  
  // RFC 5322 compliant email regex
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 * @param password Password to validate
 * @returns Object with validation result and issues
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  if (!password) {
    issues.push('Password is required');
    return { isValid: false, issues };
  }
  
  if (password.length < 8) {
    issues.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    issues.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    issues.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    issues.push('Password must contain at least one number');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    issues.push('Password must contain at least one special character');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Validates a phone number format
 * @param phoneNumber Phone number to validate
 * @param countryCode Country code for validation (default: 'ES' for Spain)
 * @returns true if valid, false otherwise
 */
export function isValidPhoneNumber(phoneNumber: string, countryCode = 'ES'): boolean {
  if (!phoneNumber) return false;
  
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  switch (countryCode) {
    case 'ES': // Spain
      // Spanish numbers: +34 followed by 9 digits
      // Mobile: starts with 6 or 7
      // Landline: starts with 8 or 9
      return /^(?:(?:\+|00)34)?[6789]\d{8}$/.test(phoneNumber);
      
    case 'US': // United States
      // US numbers: +1 followed by 10 digits
      return /^(?:(?:\+|00)1)?[2-9]\d{9}$/.test(phoneNumber);
      
    case 'UK': // United Kingdom
      // UK numbers are complex, this is a simplified check
      return /^(?:(?:\+|00)44)?[1-9]\d{9,10}$/.test(phoneNumber);
      
    default: // Generic international number check
      return digitsOnly.length >= 8 && digitsOnly.length <= 15;
  }
}

/**
 * Validates a URL format
 * @param url URL to validate
 * @returns true if valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Validates if a string is not empty
 * @param value String to validate
 * @returns true if not empty, false otherwise
 */
export function isNotEmpty(value: string | null | undefined): boolean {
  return !!value && value.trim().length > 0;
}

/**
 * Validates if a number is within a range
 * @param value Number to validate
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 * @returns true if within range, false otherwise
 */
export function isInRange(
  value: number, 
  min: number, 
  max: number
): boolean {
  return value >= min && value <= max;
}

/**
 * Validates a date range
 * @param startDate Start date
 * @param endDate End date
 * @param allowEqual Allow equal dates (default: false)
 * @returns true if valid range, false otherwise
 */
export function isValidDateRange(
  startDate: Date, 
  endDate: Date, 
  allowEqual = false
): boolean {
  if (!startDate || !endDate) return false;
  
  if (allowEqual) {
    return startDate <= endDate;
  } else {
    return startDate < endDate;
  }
}

/**
 * Creates a validation function that requires a minimum length
 * @param minLength Minimum length required
 * @returns Validation function
 */
export function createMinLengthValidator(minLength: number) {
  return (value: string): boolean => {
    return !!value && value.length >= minLength;
  };
}

/**
 * Creates a validation function that requires a maximum length
 * @param maxLength Maximum length allowed
 * @returns Validation function
 */
export function createMaxLengthValidator(maxLength: number) {
  return (value: string): boolean => {
    return !value || value.length <= maxLength;
  };
}

/**
 * Validate spanish DNI/NIE format
 * @param id DNI or NIE to validate
 * @returns true if valid, false otherwise
 */
export function isValidSpanishId(id: string): boolean {
  if (!id) return false;
  
  // Clean the input
  const cleanId = id.trim().toUpperCase();
  
  // DNI: 8 digits + letter
  const dniRegex = /^(\d{8})([A-Z])$/;
  // NIE: X/Y/Z + 7 digits + letter
  const nieRegex = /^[XYZ]\d{7}[A-Z]$/;
  
  if (!dniRegex.test(cleanId) && !nieRegex.test(cleanId)) {
    return false;
  }
  
  // Control letter calculation
  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  
  let number;
  if (/^[XYZ]/.test(cleanId)) {
    // For NIE, replace the first letter with corresponding number
    number = cleanId
      .replace('X', '0')
      .replace('Y', '1')
      .replace('Z', '2')
      .slice(0, 8);
  } else {
    // For DNI, take the 8 digits
    number = cleanId.slice(0, 8);
  }
  
  // Calculate control letter
  const position = parseInt(number, 10) % 23;
  const calculatedLetter = letters.charAt(position);
  
  // Compare with actual letter
  const actualLetter = cleanId.slice(-1);
  
  return calculatedLetter === actualLetter;
} 
// src/utils/sesValidations.ts
/**
 * Validaciones para campos relacionados con SES Hospedajes
 * 
 * Incluye validaciones para:
 * - Email del propietario
 * - Teléfono internacional
 * - Documentos de identidad (DNI, NIE, PASSPORT)
 * - Códigos postales españoles
 * - Licencias turísticas
 */

/**
 * Valida formato de email
 */
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email || email.trim() === '') {
    return { valid: false, error: 'El email es obligatorio' };
  }

  // Regex para validar email
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Formato de email inválido' };
  }

  return { valid: true };
};

/**
 * Valida formato de teléfono internacional
 * Acepta formatos: +34612345678, 612345678, +34 612 34 56 78
 */
export const validatePhoneNumber = (phone: string): { valid: boolean; error?: string } => {
  if (!phone || phone.trim() === '') {
    return { valid: false, error: 'El teléfono es obligatorio' };
  }

  // Eliminar espacios y guiones para validación
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  
  // Debe empezar con + o ser un número español (9 dígitos)
  const phoneRegex = /^(\+\d{1,3})?\d{9,15}$/;
  
  if (!phoneRegex.test(cleanPhone)) {
    return { valid: false, error: 'Formato de teléfono inválido. Usa formato internacional (+34612345678)' };
  }

  // Si es español, verificar que empiece con 6, 7, 8 o 9
  if (!cleanPhone.startsWith('+')) {
    const firstDigit = cleanPhone.charAt(0);
    if (!['6', '7', '8', '9'].includes(firstDigit)) {
      return { valid: false, error: 'Teléfono español debe empezar con 6, 7, 8 o 9' };
    }
  }

  return { valid: true };
};

/**
 * Valida formato de DNI español
 * Formato: 12345678A
 */
export const validateDNI = (dni: string): { valid: boolean; error?: string } => {
  if (!dni || dni.trim() === '') {
    return { valid: false, error: 'El DNI es obligatorio' };
  }

  const cleanDNI = dni.toUpperCase().replace(/[\s\-]/g, '');
  
  // Formato: 8 dígitos + 1 letra
  const dniRegex = /^\d{8}[A-Z]$/;
  
  if (!dniRegex.test(cleanDNI)) {
    return { valid: false, error: 'Formato de DNI inválido (debe ser 12345678A)' };
  }

  // Validar letra de control
  const dniLetters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const number = parseInt(cleanDNI.substring(0, 8), 10);
  const letter = cleanDNI.charAt(8);
  const expectedLetter = dniLetters.charAt(number % 23);

  if (letter !== expectedLetter) {
    return { valid: false, error: `Letra de control incorrecta. Debería ser ${expectedLetter}` };
  }

  return { valid: true };
};

/**
 * Valida formato de NIE español
 * Formato: X1234567A, Y1234567A, Z1234567A
 */
export const validateNIE = (nie: string): { valid: boolean; error?: string } => {
  if (!nie || nie.trim() === '') {
    return { valid: false, error: 'El NIE es obligatorio' };
  }

  const cleanNIE = nie.toUpperCase().replace(/[\s\-]/g, '');
  
  // Formato: X/Y/Z + 7 dígitos + 1 letra
  const nieRegex = /^[XYZ]\d{7}[A-Z]$/;
  
  if (!nieRegex.test(cleanNIE)) {
    return { valid: false, error: 'Formato de NIE inválido (debe ser X1234567A)' };
  }

  // Convertir primera letra a número para validación
  const nieMap: { [key: string]: string } = { 'X': '0', 'Y': '1', 'Z': '2' };
  const nieNumber = nieMap[cleanNIE.charAt(0)] + cleanNIE.substring(1, 8);
  
  // Validar letra de control
  const nieLetters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const number = parseInt(nieNumber, 10);
  const letter = cleanNIE.charAt(8);
  const expectedLetter = nieLetters.charAt(number % 23);

  if (letter !== expectedLetter) {
    return { valid: false, error: `Letra de control incorrecta. Debería ser ${expectedLetter}` };
  }

  return { valid: true };
};

/**
 * Valida formato de pasaporte
 * Acepta formatos internacionales (alfanuméricos, 6-9 caracteres)
 */
export const validatePassport = (passport: string): { valid: boolean; error?: string } => {
  if (!passport || passport.trim() === '') {
    return { valid: false, error: 'El pasaporte es obligatorio' };
  }

  const cleanPassport = passport.toUpperCase().replace(/[\s\-]/g, '');
  
  // Formato: 6-9 caracteres alfanuméricos
  const passportRegex = /^[A-Z0-9]{6,9}$/;
  
  if (!passportRegex.test(cleanPassport)) {
    return { valid: false, error: 'Formato de pasaporte inválido (6-9 caracteres alfanuméricos)' };
  }

  return { valid: true };
};

/**
 * Valida documento según su tipo
 */
export const validateDocumentByType = (
  documentType: 'DNI' | 'NIE' | 'PASSPORT',
  documentNumber: string
): { valid: boolean; error?: string } => {
  if (!documentType) {
    return { valid: false, error: 'Selecciona el tipo de documento' };
  }

  switch (documentType) {
    case 'DNI':
      return validateDNI(documentNumber);
    case 'NIE':
      return validateNIE(documentNumber);
    case 'PASSPORT':
      return validatePassport(documentNumber);
    default:
      return { valid: false, error: 'Tipo de documento no válido' };
  }
};

/**
 * Valida código postal español
 * Formato: 5 dígitos (01000 - 52999)
 */
export const validateSpanishPostalCode = (postalCode: string): { valid: boolean; error?: string } => {
  if (!postalCode || postalCode.trim() === '') {
    return { valid: false, error: 'El código postal es obligatorio' };
  }

  const cleanPostalCode = postalCode.replace(/\s/g, '');
  
  // Debe tener exactamente 5 dígitos
  const postalCodeRegex = /^\d{5}$/;
  
  if (!postalCodeRegex.test(cleanPostalCode)) {
    return { valid: false, error: 'Código postal debe tener 5 dígitos' };
  }

  // Validar rango (01000 - 52999 para España)
  const code = parseInt(cleanPostalCode, 10);
  if (code < 1000 || code > 52999) {
    return { valid: false, error: 'Código postal fuera de rango válido (01000-52999)' };
  }

  return { valid: true };
};

/**
 * Valida licencia turística según el tipo
 */
export const validateTourismLicenseFormat = (
  license: string,
  type?: 'VFT' | 'VUT' | 'VTAR' | 'Other'
): { valid: boolean; error?: string } => {
  if (!license || license.trim() === '') {
    return { valid: false, error: 'La licencia turística es obligatoria' };
  }

  const cleanLicense = license.toUpperCase().replace(/\s/g, '');

  // Si no hay tipo específico, solo validar que no esté vacío
  if (!type || type === 'Other') {
    if (cleanLicense.length < 5) {
      return { valid: false, error: 'Licencia turística demasiado corta (mínimo 5 caracteres)' };
    }
    return { valid: true };
  }

  // Validar formatos específicos por tipo
  switch (type) {
    case 'VFT':
      // Ejemplo: VFT/MA/12345 o VFT-MA-12345
      const vftRegex = /^VFT[\/\-][A-Z]{2,3}[\/\-]\d{3,6}$/;
      if (!vftRegex.test(cleanLicense)) {
        return { valid: false, error: 'Formato VFT inválido (ejemplo: VFT/MA/12345)' };
      }
      break;
    case 'VUT':
      // Ejemplo: VUT/SE/12345
      const vutRegex = /^VUT[\/\-][A-Z]{2,3}[\/\-]\d{3,6}$/;
      if (!vutRegex.test(cleanLicense)) {
        return { valid: false, error: 'Formato VUT inválido (ejemplo: VUT/SE/12345)' };
      }
      break;
    case 'VTAR':
      // Ejemplo: VTAR/GR/12345
      const vtarRegex = /^VTAR[\/\-][A-Z]{2,3}[\/\-]\d{3,6}$/;
      if (!vtarRegex.test(cleanLicense)) {
        return { valid: false, error: 'Formato VTAR inválido (ejemplo: VTAR/GR/12345)' };
      }
      break;
  }

  return { valid: true };
};

/**
 * Valida formato de código de establecimiento SES
 * Formato aceptado: 10-12 dígitos numéricos
 * Ejemplos válidos: 0000001234, 0000002870, 000000000000
 */
export const validateEstablishmentCode = (code: string): { valid: boolean; error?: string } => {
  if (!code || code.trim() === '') {
    return { valid: false, error: 'El código de establecimiento es obligatorio' };
  }

  const cleanCode = code.trim();
  
  // Debe ser solo números
  const codeRegex = /^\d+$/;
  if (!codeRegex.test(cleanCode)) {
    return { valid: false, error: 'El código debe contener solo números' };
  }

  // Debe tener entre 10 y 12 dígitos
  if (cleanCode.length < 10 || cleanCode.length > 12) {
    return { 
      valid: false, 
      error: 'El código debe tener entre 10 y 12 dígitos (ejemplo: 0000001234)' 
    };
  }

  return { valid: true };
};

/**
 * Valida que un número sea positivo
 */
export const validatePositiveNumber = (value: number | undefined, fieldName: string): { valid: boolean; error?: string } => {
  if (value === undefined || value === null) {
    return { valid: false, error: `${fieldName} es obligatorio` };
  }

  if (value <= 0) {
    return { valid: false, error: `${fieldName} debe ser mayor a 0` };
  }

  return { valid: true };
};

/**
 * Valida campo de texto no vacío
 */
export const validateRequiredText = (value: string | undefined, fieldName: string): { valid: boolean; error?: string } => {
  if (!value || value.trim() === '') {
    return { valid: false, error: `${fieldName} es obligatorio` };
  }

  if (value.trim().length < 2) {
    return { valid: false, error: `${fieldName} debe tener al menos 2 caracteres` };
  }

  return { valid: true };
};

/**
 * Formatea teléfono para mostrar de forma legible
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  
  // Si empieza con +34, formatear como español
  if (cleanPhone.startsWith('+34')) {
    const number = cleanPhone.substring(3);
    return `+34 ${number.substring(0, 3)} ${number.substring(3, 5)} ${number.substring(5, 7)} ${number.substring(7)}`;
  }
  
  // Si es español sin prefijo
  if (cleanPhone.length === 9) {
    return `${cleanPhone.substring(0, 3)} ${cleanPhone.substring(3, 5)} ${cleanPhone.substring(5, 7)} ${cleanPhone.substring(7)}`;
  }
  
  return phone;
};

/**
 * Valida todos los campos requeridos para registro SES
 */
export const validateSESFields = (property: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Dirección completa
  const cityValidation = validateRequiredText(property.city, 'Ciudad');
  if (!cityValidation.valid) errors.push(cityValidation.error!);

  const provinceValidation = validateRequiredText(property.province, 'Provincia');
  if (!provinceValidation.valid) errors.push(provinceValidation.error!);

  const postalCodeValidation = validateSpanishPostalCode(property.postal_code);
  if (!postalCodeValidation.valid) errors.push(postalCodeValidation.error!);

  // Licencia turística
  const licenseValidation = validateTourismLicenseFormat(property.tourism_license, property.license_type);
  if (!licenseValidation.valid) errors.push(licenseValidation.error!);

  // Capacidad
  const guestsValidation = validatePositiveNumber(property.max_guests, 'Capacidad máxima');
  if (!guestsValidation.valid) errors.push(guestsValidation.error!);

  const bedroomsValidation = validatePositiveNumber(property.num_bedrooms, 'Número de habitaciones');
  if (!bedroomsValidation.valid) errors.push(bedroomsValidation.error!);

  // Propietario
  const ownerNameValidation = validateRequiredText(property.owner_name, 'Nombre del propietario');
  if (!ownerNameValidation.valid) errors.push(ownerNameValidation.error!);

  const ownerEmailValidation = validateEmail(property.owner_email);
  if (!ownerEmailValidation.valid) errors.push(ownerEmailValidation.error!);

  const ownerPhoneValidation = validatePhoneNumber(property.owner_phone);
  if (!ownerPhoneValidation.valid) errors.push(ownerPhoneValidation.error!);

  const documentValidation = validateDocumentByType(property.owner_id_type, property.owner_id_number);
  if (!documentValidation.valid) errors.push(documentValidation.error!);

  // Credenciales SES
  if (!property.ses_landlord_code) errors.push('Código de arrendador SES es obligatorio');
  if (!property.ses_username) errors.push('Usuario SES es obligatorio');
  if (!property.ses_api_password) errors.push('Contraseña API SES es obligatoria');
  
  // Validar formato del código de establecimiento
  const establishmentCodeValidation = validateEstablishmentCode(property.ses_establishment_code);
  if (!establishmentCodeValidation.valid) errors.push(establishmentCodeValidation.error!);

  return {
    valid: errors.length === 0,
    errors
  };
};


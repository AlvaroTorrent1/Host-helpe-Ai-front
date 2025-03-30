/**
 * src/i18n/i18n.ts
 * Simple internationalization (i18n) system
 */

import { i18nConfig } from '../config/environment';

/**
 * Type for translation dictionary
 */
type TranslationsDict = Record<string, Record<string, string>>;

/**
 * Translation dictionaries
 */
const translations: TranslationsDict = {
  en: {
    // Common
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.remove': 'Remove',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.required': 'Required',
    'common.optional': 'Optional',
    
    // Authentication
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    
    // Properties
    'property.title': 'Property',
    'property.list': 'Properties',
    'property.add': 'Add Property',
    'property.edit': 'Edit Property',
    'property.name': 'Name',
    'property.address': 'Address',
    'property.description': 'Description',
    
    // Documents
    'document.title': 'Document',
    'document.list': 'Documents',
    'document.add': 'Add Document',
    'document.types.house_rules': 'House Rules',
    'document.types.inventory': 'Inventory',
    'document.types.faq': 'FAQ',
    'document.types.guide': 'Guide',
    'document.types.other': 'Other',
    
    // Media
    'media.title': 'Media',
    'media.upload': 'Upload',
    'media.gallery': 'Gallery',
    
    // Errors
    'error.generic': 'Something went wrong',
    'error.required': 'This field is required',
    'error.invalidEmail': 'Invalid email address',
    'error.passwordTooWeak': 'Password is too weak',
    'error.passwordsDoNotMatch': 'Passwords do not match',
  },
  
  es: {
    // Common
    'common.yes': 'Sí',
    'common.no': 'No',
    'common.ok': 'Aceptar',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.add': 'Añadir',
    'common.remove': 'Quitar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.required': 'Obligatorio',
    'common.optional': 'Opcional',
    
    // Authentication
    'auth.login': 'Iniciar sesión',
    'auth.logout': 'Cerrar sesión',
    'auth.register': 'Registrarse',
    'auth.email': 'Correo electrónico',
    'auth.password': 'Contraseña',
    'auth.confirmPassword': 'Confirmar contraseña',
    
    // Properties
    'property.title': 'Propiedad',
    'property.list': 'Propiedades',
    'property.add': 'Añadir propiedad',
    'property.edit': 'Editar propiedad',
    'property.name': 'Nombre',
    'property.address': 'Dirección',
    'property.description': 'Descripción',
    
    // Documents
    'document.title': 'Documento',
    'document.list': 'Documentos',
    'document.add': 'Añadir documento',
    'document.types.house_rules': 'Normas de la casa',
    'document.types.inventory': 'Inventario',
    'document.types.faq': 'Preguntas frecuentes',
    'document.types.guide': 'Guía',
    'document.types.other': 'Otro',
    
    // Media
    'media.title': 'Multimedia',
    'media.upload': 'Subir',
    'media.gallery': 'Galería',
    
    // Errors
    'error.generic': 'Algo salió mal',
    'error.required': 'Este campo es obligatorio',
    'error.invalidEmail': 'Dirección de correo electrónico inválida',
    'error.passwordTooWeak': 'La contraseña es demasiado débil',
    'error.passwordsDoNotMatch': 'Las contraseñas no coinciden',
  }
};

/**
 * Current locale
 */
let currentLocale = i18nConfig.defaultLocale;

/**
 * Set the active locale
 * @param locale The locale to set as active
 */
export function setLocale(locale: string): void {
  if (i18nConfig.supportedLocales.includes(locale)) {
    currentLocale = locale;
    // Store user preference
    localStorage.setItem('userLocale', locale);
  } else {
    console.warn(`Locale ${locale} is not supported. Using ${i18nConfig.fallbackLocale} instead.`);
    currentLocale = i18nConfig.fallbackLocale;
  }
}

/**
 * Initialize i18n
 */
export function initI18n(): void {
  // Try to get user's preferred locale from localStorage
  const savedLocale = localStorage.getItem('userLocale');
  if (savedLocale && i18nConfig.supportedLocales.includes(savedLocale)) {
    currentLocale = savedLocale;
    return;
  }
  
  // If not saved, try to get from browser
  const browserLocale = navigator.language.split('-')[0];
  if (i18nConfig.supportedLocales.includes(browserLocale)) {
    currentLocale = browserLocale;
  }
}

/**
 * Get the active locale
 */
export function getLocale(): string {
  return currentLocale;
}

/**
 * Format a date according to the current locale
 * @param date The date to format
 * @param format Optional format (defaults to i18nConfig.defaultDateFormat)
 */
export function formatDate(date: Date | string, format?: string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(currentLocale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateObj);
}

/**
 * Format a number as currency according to the current locale
 * @param amount The amount to format
 * @param currency The currency code (defaults to i18nConfig.defaultCurrency)
 */
export function formatCurrency(amount: number, currency = i18nConfig.defaultCurrency): string {
  return new Intl.NumberFormat(currentLocale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Translate a key
 * @param key Translation key
 * @param params Optional params for interpolation
 */
export function translate(key: string, params?: Record<string, string | number>): string {
  const localeTranslations = translations[currentLocale] || translations[i18nConfig.fallbackLocale];
  
  let text = localeTranslations[key] || key;
  
  // Simple parameter interpolation
  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
    });
  }
  
  return text;
}

// Alias for translate function for shorter code
export const t = translate;

// Initialize i18n
initI18n(); 
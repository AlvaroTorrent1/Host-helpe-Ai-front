/**
 * src/config/environment.ts
 * Central configuration file for environment variables and constants
 */

/**
 * Define project environment
 */
export const environment = {
  production: import.meta.env.PROD || import.meta.env.MODE === 'production',
  development: import.meta.env.DEV || import.meta.env.MODE === 'development',
  test: import.meta.env.MODE === 'test',
};

/**
 * Supabase configuration
 */
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://blxngmtmknkdmikaflen.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  serviceRole: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '',
  storageUrl: import.meta.env.VITE_SUPABASE_STORAGE_URL || 'https://blxngmtmknkdmikaflen.supabase.co/storage/v1/object/public/',
  siteUrl: import.meta.env.VITE_SITE_URL || 'https://hosthelperai.com', // Default to production URL if not specified
};

/**
 * Storage configuration
 */
export const storageConfig = {
  mediaBucket: 'media',
  documentsBucket: 'property-documents',
  profilesBucket: 'profiles',
  maxUploadSizeMB: 10, // 10MB
  imageSizeLimit: 5 * 1024 * 1024, // 5MB
  documentSizeLimit: 10 * 1024 * 1024, // 10MB
};

/**
 * API configuration
 */
export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_URL || '',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
};

/**
 * Authentication configuration
 */
export const authConfig = {
  tokenName: 'host-helper-auth-token',
  refreshTokenName: 'host-helper-refresh-token',
  tokenExpiry: 60 * 60 * 24 * 7, // 7 days in seconds
  sessionStoragePrefix: 'host-helper-',
};

/**
 * Localization configuration
 */
export const i18nConfig = {
  defaultLocale: 'en',
  supportedLocales: ['en', 'es'],
  fallbackLocale: 'en',
  defaultCurrency: 'EUR',
  defaultDateFormat: 'dd/MM/yyyy',
  defaultTimeFormat: 'HH:mm',
};

/**
 * File types configuration
 */
export const fileTypes = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf', '.doc', '.docx', '.txt'],
};

/**
 * Cache configuration
 */
export const cacheConfig = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes in milliseconds
  propertyListTTL: 10 * 60 * 1000, // 10 minutes in milliseconds
  mediaListTTL: 15 * 60 * 1000, // 15 minutes in milliseconds
}; 
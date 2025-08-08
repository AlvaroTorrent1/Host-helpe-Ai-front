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
  // Configuración explícita del entorno desde variables de entorno
  current: import.meta.env.VITE_ENVIRONMENT || import.meta.env.MODE || 'development',
  debug: import.meta.env.VITE_DEBUG_MODE === 'true' || import.meta.env.DEV,
};

/**
 * Helper function to get current origin for auth redirects dynamically
 */
const getCurrentOrigin = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return import.meta.env.VITE_SITE_URL || '';
};

/**
 * Validates and normalizes a URL by ensuring it has no trailing slash
 * This helps prevent redirect issues with authentication
 */
const normalizeUrl = (url: string): string => {
  if (!url) return '';
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

/**
 * Supabase configuration
 */
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://blxngmtmknkdmikaflen.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  serviceRole: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '',
  storageUrl: import.meta.env.VITE_SUPABASE_STORAGE_URL || 'https://blxngmtmknkdmikaflen.supabase.co/storage/v1/object/public/',
  siteUrl: normalizeUrl(import.meta.env.VITE_SITE_URL) || (environment.development ? getCurrentOrigin() : ''),
  
  // Dynamic redirect URL that works in both development and production
  get authRedirectUrl() {
    // Always prioritize the explicitly configured site URL for consistent redirect behavior
    const baseUrl = normalizeUrl(import.meta.env.VITE_SITE_URL);
    
    // If VITE_SITE_URL is properly configured, use it (preferred for production)
    if (baseUrl) {
      return `${baseUrl}/auth/callback`;
    }
    
    // Fallback for development if no SITE_URL is set
    if (environment.development) {
      return `${getCurrentOrigin()}/auth/callback`;
    }
    
    // Final fallback (should rarely happen)
    return '/auth/callback';
  },
  
  // Debug helper to log configuration details
  logConfig() {
    // Información de entorno expandida
    console.log('Environment Configuration:', {
      mode: import.meta.env.MODE,
      environment: environment.current,
      isDevelopment: environment.development,
      isProduction: environment.production,
      isTest: environment.test,
      debug: environment.debug,
    });
    
    // Información de Supabase
    console.log('Supabase Configuration:', {
      url: this.url,
      siteUrl: this.siteUrl,
      authRedirectUrl: this.authRedirectUrl,
      currentOrigin: typeof window !== 'undefined' ? window.location.origin : 'server-side',
    });
    
    // Validación para entorno de producción
    if (environment.production) {
      if (this.siteUrl.includes('localhost')) {
        console.error('⚠️ ADVERTENCIA: VITE_SITE_URL contiene "localhost" en entorno de producción');
        console.error('Esto causará problemas con la autenticación por correo electrónico');
      }
      
      if (!this.siteUrl) {
        console.error('⚠️ ERROR CRÍTICO: VITE_SITE_URL no está definido en producción');
        console.error('La autenticación por correo electrónico NO funcionará correctamente');
      }
    }
  }
};

// Log configuration in development or when debug is enabled
if (environment.development || environment.debug) {
  supabaseConfig.logConfig();
}

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
 * Webhook configuration
 */
export const webhookConfig = {
  // URL del webhook de N8N para procesamiento de documentos
  documentWebhookUrl: import.meta.env.VITE_DOCUMENT_WEBHOOK_URL || 'https://hosthelperai.app.n8n.cloud/webhook-test/file',
  
  // Configuración para desarrollo - deshabilitar webhook si hay problemas CORS
  enableWebhookInDevelopment: import.meta.env.VITE_ENABLE_WEBHOOK_DEV === 'true',
  
  // Configuración de reintentos
  maxRetries: 3,
  retryDelay: 2000, // 2 seconds
  
  // Límites de archivo
  maxFileSizeMB: 10,
  
  // Timeout para requests de webhook
  timeout: 30000, // 30 seconds
};

/**
 * Cache configuration
 */
export const cacheConfig = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes in milliseconds
  propertyListTTL: 10 * 60 * 1000, // 10 minutes in milliseconds
  mediaListTTL: 15 * 60 * 1000, // 15 minutes in milliseconds
}; 
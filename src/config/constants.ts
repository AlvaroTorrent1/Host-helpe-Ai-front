/**
 * Constantes globales para la aplicación Host Helper AI
 */

// Configuración de la aplicación
export const APP_NAME = "Host Helper AI";
export const APP_VERSION = "1.0.0";

// Límites y tamaños
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_FILES_UPLOAD = 10;
export const ITEMS_PER_PAGE = 10;

// Tiempos
export const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos
export const TOAST_DURATION = 3000; // 3 segundos

// Formatos
export const DATE_FORMAT = "dd/MM/yyyy";
export const TIME_FORMAT = "HH:mm";
export const DATETIME_FORMAT = "dd/MM/yyyy HH:mm";

// URLs de API
export const API_BASE_URL = import.meta.env.VITE_SUPABASE_URL || "";

// Endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  PROPERTIES: {
    BASE: "/properties",
    BY_ID: (id: string) => `/properties/${id}`,
  },
  RESERVATIONS: {
    BASE: "/reservations",
    BY_ID: (id: string) => `/reservations/${id}`,
  },
  SES: {
    BASE: "/ses",
    REGISTER: "/ses/register",
  },
};

// Modos de aplicación
export const APP_MODES = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test",
};

// Rutas de navegación (complementa a routes.ts)
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PROPERTIES: "/properties",
  PROPERTY_DETAIL: (id: string) => `/properties/${id}`,
  RESERVATIONS: "/reservations",
  RESERVATION_DETAIL: (id: string) => `/reservations/${id}`,
  PROFILE: "/profile",
  SES: "/ses",
  PRICING: "/pricing",
  TESTIMONIALS: "/testimonios",
  CHATBOT: "/chatbot",
  CHECKIN: "/check-in",
  UPSELLING: "/upselling",
};

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  GENERAL: "Ha ocurrido un error. Por favor, inténtalo de nuevo más tarde.",
  UNAUTHORIZED: "No tienes permisos para realizar esta acción.",
  NOT_FOUND: "El recurso solicitado no existe.",
  VALIDATION: "Por favor, verifica los datos ingresados.",
  CONNECTION: "Error de conexión. Verifica tu conexión a internet.",
  SESSION_EXPIRED:
    "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
};

// Tipos de usuarios
export const USER_ROLES = {
  ADMIN: "admin",
  HOST: "host",
  GUEST: "guest",
};

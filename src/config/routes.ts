/**
 * Configuración de rutas para Host Helper AI
 */

// Define los tipos para nuestras rutas
interface AppRoute {
  path: string;
  componentName: string;
  authRequired: boolean;
}

/**
 * Definición centralizada de todas las rutas de la aplicación
 */
export const ROUTES: Record<string, AppRoute> = {
  // Rutas públicas
  HOME: {
    path: "/",
    componentName: "LandingPage",
    authRequired: false,
  },
  LOGIN: {
    path: "/login",
    componentName: "LoginPage",
    authRequired: false,
  },
  REGISTER: {
    path: "/register",
    componentName: "RegisterPage",
    authRequired: false,
  },
  FORGOT_PASSWORD: {
    path: "/forgot-password",
    componentName: "ForgotPasswordPage",
    authRequired: false,
  },
  RESET_PASSWORD: {
    path: "/reset-password",
    componentName: "ResetPasswordPage",
    authRequired: false,
  },
  AUTH_CALLBACK: {
    path: "/auth/callback",
    componentName: "AuthCallbackPage",
    authRequired: false,
  },
  CHATBOT: {
    path: "/chatbot",
    componentName: "ChatbotPage",
    authRequired: false,
  },
  CHECKIN: {
    path: "/check-in",
    componentName: "CheckinPage",
    authRequired: false,
  },
  UPSELLING: {
    path: "/upselling",
    componentName: "UpsellingPage",
    authRequired: false,
  },
  PRICING: {
    path: "/pricing",
    componentName: "PricingPage",
    authRequired: false,
  },
  TESTIMONIOS: {
    path: "/testimonios",
    componentName: "TestimoniosPage",
    authRequired: false,
  },
  SCHEDULE_DEMO: {
    path: "/schedule-demo",
    componentName: "ScheduleDemoPage",
    authRequired: false,
  },

  // Rutas protegidas
  DASHBOARD: {
    path: "/dashboard",
    componentName: "DashboardPage",
    authRequired: true,
  },
  PROPERTIES: {
    path: "/properties",
    componentName: "PropertiesPage",
    authRequired: true,
  },
  PROPERTY_DETAIL: {
    path: "/properties/:id",
    componentName: "PropertyDetailPage",
    authRequired: true,
  },
  RESERVATIONS: {
    path: "/reservations",
    componentName: "ReservationsPage",
    authRequired: true,
  },
  RESERVATION_DETAIL: {
    path: "/reservations/:id",
    componentName: "ReservationDetailPage",
    authRequired: true,
  },
  PROFILE: {
    path: "/profile",
    componentName: "ProfilePage",
    authRequired: true,
  },

  NOT_FOUND: {
    path: "*",
    componentName: "NotFoundPage",
    authRequired: false,
  },
};

/**
 * Filtra las rutas para obtener solo las rutas públicas
 */
export const getPublicRoutes = (): AppRoute[] => {
  return Object.values(ROUTES).filter((route) => !route.authRequired);
};

/**
 * Filtra las rutas para obtener solo las rutas protegidas
 */
export const getProtectedRoutes = (): AppRoute[] => {
  return Object.values(ROUTES).filter((route) => route.authRequired);
};

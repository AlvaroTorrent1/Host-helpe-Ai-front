/**
 * analytics.ts - Servicio de analíticas simplificado
 * Esta implementación evita dependencias externas y usa console.log para registrar eventos
 * En un entorno de producción real, se conectaría con el servicio de Google Analytics
 */

import ReactGA from "react-ga4";

// === Configuración interna ===
let isInitialized = false;

/**
 * Inicializa Google Analytics 4 si estamos en producción o si VITE_ENABLE_GA=true.
 * Evita doble inicialización.
 */
export const initGA = (measurementId: string): void => {
  if (isInitialized) return;

  if (!measurementId) {
    console.warn("[GA] measurementId no proporcionado; se omite GA");
    return;
  }

  if (!(import.meta.env.PROD || import.meta.env.VITE_ENABLE_GA === "true")) {
    // En dev sin habilitación explícita no se rastrea.
    console.info("[GA] Deshabilitado en modo desarrollo");
    return;
  }

  ReactGA.initialize(measurementId);
  isInitialized = true;
  console.info("[GA] Inicializado", measurementId);
};

/**
 * Registra una vista de página.
 */
export const logPageView = (page?: string): void => {
  if (!isInitialized) return;

  const path = page || window.location.pathname + window.location.search;
  ReactGA.send({ hitType: "pageview", page: path });
  if (import.meta.env.DEV) console.debug("[GA] pageview", path);
};

/**
 * Envía un evento personalizado.
 */
export const logEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number,
): void => {
  if (!isInitialized) return;

  ReactGA.event({ category, action, label, value });
  if (import.meta.env.DEV)
    console.debug("[GA] event", { category, action, label, value });
};

/** Registra un error como evento */
export const logError = (description: string, fatal = false): void => {
  logEvent("Error", fatal ? "Fatal" : "Non‑fatal", description);
};

/** Asigna un identificador de usuario */
export const setUser = (userId: string): void => {
  if (!isInitialized) return;
  ReactGA.set({ user_id: userId });
  if (import.meta.env.DEV) console.debug("[GA] set user", userId);
};

// Utilidad interna para saber si debería rastrear – quedó como referencia, pero no usada.
function shouldTrack(): boolean {
  return isInitialized;
}

/**
 * Envía datos al servicio de analytics
 * Esta es una función simulada que en producción enviaría los datos a GA4
 */
function sendToAnalyticsService(data: any): void {
  // Simulación de envío de datos a un servicio de analytics
  if (import.meta.env.DEV) {
    console.log('[Analytics] Envío simulado:', data);
  }
  
  // En producción, aquí se enviarían los datos al servicio real
} 
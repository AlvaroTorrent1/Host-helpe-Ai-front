/**
 * analytics.ts - Servicio de analíticas simplificado
 * Esta implementación evita dependencias externas y usa console.log para registrar eventos
 * En un entorno de producción real, se conectaría con el servicio de Google Analytics
 */

let isInitialized = false;
let analyticsId = '';

/**
 * Inicializa el servicio de analytics
 * @param measurementId - ID de medición (formato G-XXXXXXXX)
 */
export const initGA = async (measurementId: string) => {
  if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_GA === 'true') {
    isInitialized = true;
    analyticsId = measurementId;
    console.log('Analytics inicializado con ID:', measurementId);
  } else {
    console.log('Analytics no inicializado (solo en producción)');
  }
};

/**
 * Registra una página vista
 * @param page - Ruta de la página (opcional, usa window.location.pathname por defecto)
 */
export const logPageView = async (page?: string) => {
  if (!shouldTrack()) return;
  
  const path = page || window.location.pathname + window.location.search;
  console.log('[Analytics] Página vista:', path);
  
  // Aquí se conectaría con GA4 en una implementación real
  sendToAnalyticsService({
    type: 'pageview',
    page: path
  });
};

/**
 * Registra un evento personalizado
 * @param category - Categoría del evento
 * @param action - Acción específica
 * @param label - Etiqueta descriptiva (opcional)
 * @param value - Valor numérico (opcional)
 */
export const logEvent = async (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (!shouldTrack()) return;
  
  console.log('[Analytics] Evento:', { category, action, label, value });
  
  // Aquí se conectaría con GA4 en una implementación real
  sendToAnalyticsService({
    type: 'event',
    category,
    action,
    label,
    value
  });
};

/**
 * Registra un error como un evento
 * @param description - Descripción del error
 * @param fatal - Indica si el error es fatal
 */
export const logError = async (description: string, fatal: boolean = false) => {
  if (!shouldTrack()) return;
  
  console.log('[Analytics] Error:', { description, fatal });
  
  // Aquí se conectaría con GA4 en una implementación real
  sendToAnalyticsService({
    type: 'event',
    category: 'Error',
    action: fatal ? 'Fatal Error' : 'Error',
    label: description
  });
};

/**
 * Establece el ID de usuario
 * @param userId - ID único del usuario
 */
export const setUser = async (userId: string) => {
  if (!shouldTrack()) return;
  
  console.log('[Analytics] Usuario establecido:', userId);
  
  // Aquí se conectaría con GA4 en una implementación real
  sendToAnalyticsService({
    type: 'user',
    userId
  });
};

/**
 * Comprueba si se debe realizar el seguimiento
 */
function shouldTrack(): boolean {
  return isInitialized && (import.meta.env.PROD || import.meta.env.VITE_ENABLE_GA === 'true');
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
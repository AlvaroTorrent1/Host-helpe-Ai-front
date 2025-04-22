import ReactGA from 'react-ga4';

/**
 * Inicializa Google Analytics con el ID de medición
 * @param measurementId - ID de medición de GA4 (formato G-XXXXXXXX)
 */
export const initGA = (measurementId: string) => {
  // Solo inicializar en producción o si se fuerza
  if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_GA === 'true') {
    ReactGA.initialize(measurementId);
    console.log('Google Analytics inicializado con ID:', measurementId);
  } else {
    console.log('Google Analytics no inicializado (solo en producción)');
  }
};

/**
 * Registra una página vista en Google Analytics
 * @param page - Ruta de la página (opcional, usa window.location.pathname por defecto)
 */
export const logPageView = (page?: string) => {
  const path = page || window.location.pathname + window.location.search;
  if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_GA === 'true') {
    ReactGA.send({ hitType: 'pageview', page: path });
    console.log('Página vista registrada:', path);
  }
};

/**
 * Registra un evento personalizado en Google Analytics
 * @param category - Categoría del evento (ej. 'Interacción del usuario')
 * @param action - Acción específica (ej. 'Clic en botón')
 * @param label - Etiqueta descriptiva (ej. 'Botón de registro')
 * @param value - Valor numérico opcional
 */
export const logEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_GA === 'true') {
    ReactGA.event({
      category,
      action,
      label,
      value
    });
    console.log('Evento registrado:', { category, action, label, value });
  }
};

/**
 * Registra un error en Google Analytics como un evento
 * @param description - Descripción del error
 * @param fatal - Indica si el error es fatal
 */
export const logError = (description: string, fatal: boolean = false) => {
  if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_GA === 'true') {
    // En GA4 usamos eventos para registrar errores
    ReactGA.event({
      category: 'Error',
      action: fatal ? 'Fatal Error' : 'Error',
      label: description
    });
    console.log('Error registrado:', { description, fatal });
  }
};

/**
 * Establece el ID de usuario para Google Analytics
 * @param userId - ID único del usuario
 */
export const setUser = (userId: string) => {
  if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_GA === 'true') {
    ReactGA.set({ userId });
    console.log('Usuario establecido:', userId);
  }
}; 
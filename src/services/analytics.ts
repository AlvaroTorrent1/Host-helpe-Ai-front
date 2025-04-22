// Usamos importación dinámica en lugar de importación estática
// import ReactGA from 'react-ga4';

// Variable para almacenar la instancia de ReactGA una vez cargada
let ReactGA: any = null;

/**
 * Función auxiliar para cargar ReactGA dinámicamente
 */
const loadReactGA = async () => {
  if (!ReactGA) {
    try {
      const module = await import('react-ga4');
      ReactGA = module.default;
      return true;
    } catch (error) {
      console.error('Error al cargar react-ga4:', error);
      return false;
    }
  }
  return true;
};

/**
 * Inicializa Google Analytics con el ID de medición
 * @param measurementId - ID de medición de GA4 (formato G-XXXXXXXX)
 */
export const initGA = async (measurementId: string) => {
  // Solo inicializar en producción o si se fuerza
  if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_GA === 'true') {
    const loaded = await loadReactGA();
    if (loaded && ReactGA) {
      ReactGA.initialize(measurementId);
      console.log('Google Analytics inicializado con ID:', measurementId);
    }
  } else {
    console.log('Google Analytics no inicializado (solo en producción)');
  }
};

/**
 * Registra una página vista en Google Analytics
 * @param page - Ruta de la página (opcional, usa window.location.pathname por defecto)
 */
export const logPageView = async (page?: string) => {
  if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_GA === 'true') {
    const loaded = await loadReactGA();
    if (loaded && ReactGA) {
      const path = page || window.location.pathname + window.location.search;
      ReactGA.send({ hitType: 'pageview', page: path });
      console.log('Página vista registrada:', path);
    }
  }
};

/**
 * Registra un evento personalizado en Google Analytics
 * @param category - Categoría del evento (ej. 'Interacción del usuario')
 * @param action - Acción específica (ej. 'Clic en botón')
 * @param label - Etiqueta descriptiva (ej. 'Botón de registro')
 * @param value - Valor numérico opcional
 */
export const logEvent = async (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_GA === 'true') {
    const loaded = await loadReactGA();
    if (loaded && ReactGA) {
      ReactGA.event({
        category,
        action,
        label,
        value
      });
      console.log('Evento registrado:', { category, action, label, value });
    }
  }
};

/**
 * Registra un error en Google Analytics como un evento
 * @param description - Descripción del error
 * @param fatal - Indica si el error es fatal
 */
export const logError = async (description: string, fatal: boolean = false) => {
  if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_GA === 'true') {
    const loaded = await loadReactGA();
    if (loaded && ReactGA) {
      // En GA4 usamos eventos para registrar errores
      ReactGA.event({
        category: 'Error',
        action: fatal ? 'Fatal Error' : 'Error',
        label: description
      });
      console.log('Error registrado:', { description, fatal });
    }
  }
};

/**
 * Establece el ID de usuario para Google Analytics
 * @param userId - ID único del usuario
 */
export const setUser = async (userId: string) => {
  if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_GA === 'true') {
    const loaded = await loadReactGA();
    if (loaded && ReactGA) {
      ReactGA.set({ userId });
      console.log('Usuario establecido:', userId);
    }
  }
}; 
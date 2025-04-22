import { useEffect, useCallback } from 'react';

/**
 * Hook personalizado para utilizar Google Analytics en componentes funcionales
 * Proporciona métodos para rastrear páginas vistas y eventos
 * 
 * @param pageName - Nombre opcional de la página para registrar automáticamente una vista
 * @param userId - ID opcional del usuario para asociar con las métricas
 */
const useAnalytics = (pageName?: string, userId?: string) => {
  // Registrar página vista al montar el componente
  useEffect(() => {
    const initAnalytics = async () => {
      try {
        const analytics = await import('@services/analytics');
        
        if (pageName) {
          analytics.logPageView(pageName);
        }
        
        if (userId) {
          analytics.setUser(userId);
        }
      } catch (error) {
        console.error('Error al inicializar analytics:', error);
      }
    };
    
    initAnalytics();
  }, [pageName, userId]);
  
  /**
   * Registra un evento personalizado en Google Analytics
   */
  const trackEvent = useCallback((category: string, action: string, label?: string, value?: number) => {
    import('@services/analytics').then(({ logEvent }) => {
      try {
        logEvent(category, action, label, value);
      } catch (error) {
        console.error('Error al registrar evento:', error);
      }
    }).catch(error => {
      console.error('Error al importar servicio de analytics:', error);
    });
  }, []);
  
  /**
   * Registra una conversión o evento importante
   */
  const trackConversion = useCallback((action: string, label?: string, value?: number) => {
    trackEvent('Conversion', action, label, value);
  }, [trackEvent]);
  
  /**
   * Registra una interacción del usuario con la interfaz
   */
  const trackUIInteraction = useCallback((element: string, action: string = 'Click') => {
    trackEvent('UI Interaction', action, element);
  }, [trackEvent]);
  
  /**
   * Registra un error para análisis
   */
  const trackError = useCallback((errorType: string, errorMessage: string) => {
    trackEvent('Error', errorType, errorMessage);
  }, [trackEvent]);
  
  return {
    trackEvent,
    trackConversion,
    trackUIInteraction,
    trackError
  };
};

export default useAnalytics; 
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useLanguage } from './LanguageContext';

interface LoadingState {
  isLoading: boolean;
  priority: number;
  source: string;
}

interface GlobalLoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean, source: string, priority?: number) => void;
  clearLoading: (source: string) => void;
  clearAllLoading: () => void;
}

const GlobalLoadingContext = createContext<GlobalLoadingContextType | undefined>(undefined);

export const useGlobalLoading = () => {
  const context = useContext(GlobalLoadingContext);
  if (context === undefined) {
    throw new Error('useGlobalLoading must be used within a GlobalLoadingProvider');
  }
  return context;
};

interface GlobalLoadingProviderProps {
  children: ReactNode;
}

export const GlobalLoadingProvider: React.FC<GlobalLoadingProviderProps> = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState<Map<string, LoadingState>>(new Map());
  const [isVisible, setIsVisible] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const { t } = useLanguage();

  // Determinar si hay algún loading activo (prioridad más alta gana)
  const isLoading = Array.from(loadingStates.values()).some(state => state.isLoading);

  // Debounce para evitar parpadeos en operaciones rápidas
  React.useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (isLoading && !isVisible) {
      // Mostrar loading después de 100ms para evitar parpadeos
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 100);
      setDebounceTimer(timer);
    } else if (!isLoading && isVisible) {
      // Ocultar loading inmediatamente cuando se complete
      setIsVisible(false);
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [isLoading, isVisible, debounceTimer]);

  // Memorizar funciones para evitar loops infinitos en componentes que las usan como dependencias
  const setLoading = React.useCallback((loading: boolean, source: string, priority: number = 1) => {
    setLoadingStates(prev => {
      const newStates = new Map(prev);
      
      if (loading) {
        newStates.set(source, { isLoading: true, priority, source });
      } else {
        newStates.delete(source);
      }
      
      return newStates;
    });
  }, []);

  const clearLoading = React.useCallback((source: string) => {
    setLoadingStates(prev => {
      const newStates = new Map(prev);
      newStates.delete(source);
      return newStates;
    });
  }, []);

  const clearAllLoading = React.useCallback(() => {
    setLoadingStates(new Map());
  }, []);

  const value = {
    isLoading,
    setLoading,
    clearLoading,
    clearAllLoading
  };

  return (
    <GlobalLoadingContext.Provider value={value}>
      {children}
      {isVisible && <GlobalLoadingScreen />}
    </GlobalLoadingContext.Provider>
  );
};

// Componente de loading unificado
const GlobalLoadingScreen: React.FC = () => {
  const { t } = useLanguage();

  const getLoadingMessage = () => {
    return t ? (t('common.loading') || 'Cargando...') : 'Cargando...';
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-95 z-50 transition-opacity duration-200 ease-in-out">
      <div className="text-center transform transition-transform duration-200 ease-in-out">
        {/* Spinner unificado con color primary */}
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
        
        {/* Mensaje unificado */}
        <p className="text-gray-700 text-lg font-medium">
          {getLoadingMessage()}
        </p>
        
        {/* Indicador sutil de progreso */}
        <div className="mt-2 text-sm text-gray-500">
          {t ? (t('common.loadingSubtext') || 'Esto solo tomará unos segundos') : 'Esto solo tomará unos segundos'}
        </div>
      </div>
    </div>
  );
};

export default GlobalLoadingProvider; 
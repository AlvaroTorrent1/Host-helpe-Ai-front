import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingScreen } from '../components/loading';

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
  const { t } = useTranslation();

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
  // Usar el nuevo LoadingScreen unificado del sistema modular
  return (
    <LoadingScreen
      gradient={true}
      transparent={false}
      data-testid="global-loading-screen"
    />
  );
};

export default GlobalLoadingProvider; 
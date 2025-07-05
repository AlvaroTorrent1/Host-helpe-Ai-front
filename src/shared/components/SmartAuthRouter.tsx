// src/shared/components/SmartAuthRouter.tsx
// Componente inteligente que maneja el enrutamiento post-autenticación
// Decide automáticamente a dónde redirigir al usuario basado en su estado

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@shared/contexts/AuthContext';
import { useGlobalLoading } from '@shared/contexts/GlobalLoadingContext';
import { 
  handleAuthenticationFlow, 
  determineUserDestination,
  AuthFlowDestination 
} from '@/services/authFlowService';
import toast from 'react-hot-toast';

interface SmartAuthRouterProps {
  authMethod: 'email' | 'google' | 'register';
  selectedPlan?: {
    id: string;
    name: string;
    price: number;
  };
  showWelcomeMessage?: boolean;
  onRedirectComplete?: (destination: AuthFlowDestination) => void;
  fallbackRoute?: string;
}

/**
 * Componente que maneja la lógica de redirección inteligente post-autenticación
 * Se puede usar después de login, registro o OAuth para determinar el destino correcto
 */
const SmartAuthRouter: React.FC<SmartAuthRouterProps> = ({
  authMethod,
  selectedPlan,
  showWelcomeMessage = false,
  onRedirectComplete,
  fallbackRoute = '/pricing'
}) => {
  const { user, loading: authLoading } = useAuth();
  const { setLoading, clearLoading } = useGlobalLoading();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [destination, setDestination] = useState<AuthFlowDestination | null>(null);

  useEffect(() => {
    const processAuthFlow = async () => {
      console.log('🚀 SmartAuthRouter: Iniciando procesamiento de flujo de auth');
      
      // Esperar a que termine de cargar la autenticación
      if (authLoading) {
        console.log('⏳ SmartAuthRouter: Esperando a que termine la carga de auth...');
        setLoading(true, 'smart-auth-router', 2);
        return;
      }

      try {
        setIsProcessing(true);
        setLoading(true, 'smart-auth-router', 2);
        
        // Determinar destino
        const targetDestination = await determineUserDestination(user, authMethod);
        setDestination(targetDestination);
        
        console.log(`🎯 SmartAuthRouter: Destino determinado: ${targetDestination}`);
        
        // Mostrar mensaje de bienvenida si es necesario
        if (showWelcomeMessage && user) {
          const welcomeMessage = authMethod === 'google' 
            ? `¡Bienvenido/a ${user.email?.split('@')[0]}!`
            : authMethod === 'register'
              ? '¡Cuenta creada exitosamente!'
              : `¡Bienvenido/a de vuelta!`;
          
          toast.success(welcomeMessage, {
            duration: 3000,
            position: 'top-center'
          });
        }
        
        // Manejar flujo completo de autenticación
        await handleAuthenticationFlow(
          user,
          authMethod,
          navigate,
          {
            selectedPlan,
            showWelcomeMessage: false // Ya lo manejamos arriba
          }
        );
        
        // Notificar que la redirección está completa
        if (onRedirectComplete) {
          onRedirectComplete(targetDestination);
        }
        
        // Limpiar loading state
        clearLoading('smart-auth-router');
        
      } catch (error) {
        console.error('❌ SmartAuthRouter: Error procesando flujo de auth:', error);
        
        // Fallback en caso de error
        toast.error('Error procesando autenticación. Redirigiendo...', {
          duration: 2000
        });
        
        navigate(fallbackRoute);
        
        if (onRedirectComplete) {
          onRedirectComplete(fallbackRoute as AuthFlowDestination);
        }
        
        // Limpiar loading state en caso de error
        clearLoading('smart-auth-router');
      } finally {
        setIsProcessing(false);
      }
    };

    processAuthFlow();
  }, [user, authLoading, authMethod, selectedPlan, showWelcomeMessage, navigate, onRedirectComplete, fallbackRoute]);

  // No renderizar nada - el GlobalLoadingProvider maneja el loading state
  // El componente solo procesa la lógica de redirección
  return null;
};

export default SmartAuthRouter; 
// src/shared/components/SmartAuthRouter.tsx
// Componente inteligente que maneja el enrutamiento post-autenticación
// Decide automáticamente a dónde redirigir al usuario basado en su estado

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@shared/contexts/AuthContext';
import { AuthFlowDestination } from '@/services/authFlowService';
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
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthFlow = async () => {
      if (!user) return;
      
      try {
        console.log('🚀 SmartAuthRouter: Iniciando flujo de autenticación');
        
        // CAMBIO: Siempre redirigir al dashboard, sin verificar suscripción
        const destination: AuthFlowDestination = '/dashboard';
        
        // Si hay un plan seleccionado, mantenerlo en localStorage para después
        if (selectedPlan) {
          console.log('💾 SmartAuthRouter: Plan seleccionado detectado, preservando para después');
          localStorage.setItem("selectedPlanId", selectedPlan.id);
          localStorage.setItem("selectedPlanName", selectedPlan.name);
          localStorage.setItem("selectedPlanPrice", selectedPlan.price.toString());
        }
        
        // Mostrar mensaje de bienvenida si es necesario
        if (showWelcomeMessage) {
          const welcomeMsg = authMethod === 'google' 
            ? `¡Bienvenido/a ${user.email}!`
            : '¡Cuenta creada exitosamente!';
          toast.success(welcomeMsg);
        }
        
        console.log('🎯 SmartAuthRouter: Redirigiendo a:', destination);
        navigate(destination);
        
        // Notificar que la redirección se completó
        if (onRedirectComplete) {
          onRedirectComplete(destination);
        }
        
      } catch (error) {
        console.error('❌ SmartAuthRouter: Error en flujo de autenticación:', error);
        // En caso de error, redirigir al dashboard como fallback
        navigate('/dashboard');
      }
    };
    
    handleAuthFlow();
  }, [user, authMethod, showWelcomeMessage, navigate, onRedirectComplete, selectedPlan]);

  // No renderizar nada - el GlobalLoadingProvider maneja el loading state
  // El componente solo procesa la lógica de redirección
  return null;
};

export default SmartAuthRouter; 
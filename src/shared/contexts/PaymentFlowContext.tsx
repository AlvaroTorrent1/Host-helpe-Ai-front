// src/shared/contexts/PaymentFlowContext.tsx
// Contexto global para manejar flujos de pago interrumpidos por OAuth

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Tipos para el plan seleccionado
interface PlanData {
  id: string;
  name: string;
  price: number;
}

// Interface del contexto
interface PaymentFlowContextType {
  isFlowActive: boolean;
  selectedPlan: PlanData | null;
  shouldShowModal: boolean;
  resumeFlow: () => void;
  clearFlow: () => void;
  startFlow: (plan: PlanData) => void;
}

// Crear el contexto
const PaymentFlowContext = createContext<PaymentFlowContextType | undefined>(undefined);

// Provider del contexto
interface PaymentFlowProviderProps {
  children: ReactNode;
}

export const PaymentFlowProvider: React.FC<PaymentFlowProviderProps> = ({ children }) => {
  const [isFlowActive, setIsFlowActive] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null);
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const { user } = useAuth();

  // Función para verificar localStorage al cargar
  const checkStoredFlow = () => {
    try {
      const awaitingConfirmation = localStorage.getItem('awaitingAccountConfirmation') === 'true';
      const planId = localStorage.getItem('selectedPlanId');
      const planName = localStorage.getItem('selectedPlanName');
      const planPrice = localStorage.getItem('selectedPlanPrice');

      if (awaitingConfirmation && planId && planName && planPrice) {
        const plan: PlanData = {
          id: planId,
          name: planName,
          price: parseFloat(planPrice)
        };
        
        setSelectedPlan(plan);
        setIsFlowActive(true);
        
        console.log('🔄 PaymentFlow: Flujo detectado en localStorage:', plan);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ PaymentFlow: Error verificando localStorage:', error);
      return false;
    }
  };

  // Función para iniciar un nuevo flujo
  const startFlow = (plan: PlanData) => {
    console.log('🚀 PaymentFlow: Iniciando nuevo flujo con plan:', plan);
    setSelectedPlan(plan);
    setIsFlowActive(true);
    setShouldShowModal(true);
    
    // Guardar en localStorage por si se interrumpe
    localStorage.setItem('selectedPlanId', plan.id);
    localStorage.setItem('selectedPlanName', plan.name);
    localStorage.setItem('selectedPlanPrice', plan.price.toString());
  };

  // Función para reanudar el flujo
  const resumeFlow = () => {
    if (user && isFlowActive && selectedPlan) {
      console.log('✅ PaymentFlow: Reanudando flujo para usuario autenticado:', {
        user: user.email,
        plan: selectedPlan
      });
      setShouldShowModal(true);
    }
  };

  // Función para limpiar el flujo
  const clearFlow = () => {
    console.log('🧹 PaymentFlow: Limpiando flujo de pago');
    setIsFlowActive(false);
    setSelectedPlan(null);
    setShouldShowModal(false);
    
    // Limpiar localStorage
    localStorage.removeItem('awaitingAccountConfirmation');
    localStorage.removeItem('selectedPlanId');
    localStorage.removeItem('selectedPlanName');
    localStorage.removeItem('selectedPlanPrice');
  };

  // Efecto para detectar cambios en el usuario y reanudar flujo automáticamente
  useEffect(() => {
    if (user) {
      console.log('👤 PaymentFlow: Usuario detectado, verificando flujo pendiente...');
      
      // Si no hay flujo activo, verificar localStorage
      if (!isFlowActive) {
        const hasStoredFlow = checkStoredFlow();
        if (hasStoredFlow) {
          // Esperar un tick para que el estado se actualice, luego reanudar
          setTimeout(() => {
            resumeFlow();
          }, 100);
        }
      } else if (selectedPlan && !shouldShowModal) {
        // Si ya hay un flujo activo pero no se está mostrando el modal, reanudarlo
        resumeFlow();
      }
    }
  }, [user, isFlowActive]);

  // Efecto para verificar el flujo al cargar la aplicación
  useEffect(() => {
    console.log('🔍 PaymentFlow: Verificando flujo almacenado al inicializar...');
    checkStoredFlow();
  }, []);

  const value: PaymentFlowContextType = {
    isFlowActive,
    selectedPlan,
    shouldShowModal,
    resumeFlow,
    clearFlow,
    startFlow
  };

  return (
    <PaymentFlowContext.Provider value={value}>
      {children}
    </PaymentFlowContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const usePaymentFlow = () => {
  const context = useContext(PaymentFlowContext);
  if (context === undefined) {
    throw new Error('usePaymentFlow debe ser usado dentro de un PaymentFlowProvider');
  }
  return context;
};

export default PaymentFlowContext; 
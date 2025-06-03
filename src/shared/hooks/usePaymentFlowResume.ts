// src/shared/hooks/usePaymentFlowResume.ts
// Hook para detectar y reanudar automáticamente flujos de pago interrumpidos

import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePaymentFlow } from '../contexts/PaymentFlowContext';

/**
 * Hook que detecta automáticamente si hay un flujo de pago pendiente
 * y lo reanuda cuando las condiciones son correctas (usuario autenticado + plan en localStorage)
 */
export const usePaymentFlowResume = () => {
  const { user } = useAuth();
  const { isFlowActive, selectedPlan, shouldShowModal, resumeFlow } = usePaymentFlow();

  useEffect(() => {
    console.log('🔍 PaymentFlowResume: Verificando condiciones...', {
      hasUser: !!user,
      isFlowActive,
      hasSelectedPlan: !!selectedPlan,
      shouldShowModal
    });

    // Solo reanudar si:
    // 1. Hay un usuario autenticado
    // 2. Hay un flujo activo con plan seleccionado
    // 3. El modal no se está mostrando ya
    if (user && isFlowActive && selectedPlan && !shouldShowModal) {
      console.log('✅ PaymentFlowResume: Condiciones cumplidas, reanudando flujo...');
      resumeFlow();
    }
  }, [user, isFlowActive, selectedPlan, shouldShowModal, resumeFlow]);

  // Retornar información útil para el componente que usa el hook
  return {
    isFlowActive,
    selectedPlan,
    shouldShowModal,
    hasUser: !!user
  };
};

export default usePaymentFlowResume; 
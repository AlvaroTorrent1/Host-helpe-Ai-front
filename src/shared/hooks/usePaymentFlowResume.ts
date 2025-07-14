// src/shared/hooks/usePaymentFlowResume.ts
// Hook para manejar la reanudación automática de flujos de pago después de OAuth

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePaymentFlow } from '../contexts/PaymentFlowContext';

export const usePaymentFlowResume = () => {
  const { user } = useAuth();
  const { isFlowActive, selectedPlan, shouldShowModal, resumeFlow } = usePaymentFlow();
  const [lastChecked, setLastChecked] = useState<boolean>(false);

  useEffect(() => {
    // Solo ejecutar verificación si hay cambios reales
    if (user && isFlowActive && selectedPlan && !shouldShowModal && !lastChecked) {
      console.log('🔍 PaymentFlow: Verificando condiciones para reanudar flujo...');
      
      // Verificar si todas las condiciones se cumplen
      const shouldResume = user && isFlowActive && selectedPlan && !shouldShowModal;
      
      if (shouldResume) {
        console.log('✅ PaymentFlow: Reanudando flujo automáticamente...');
      resumeFlow();
        setLastChecked(true);
      }
    }
    
    // Reset lastChecked cuando el modal se cierre
    if (!shouldShowModal && lastChecked) {
      setLastChecked(false);
    }
    
  }, [user, isFlowActive, selectedPlan, shouldShowModal, resumeFlow, lastChecked]);

  return {
    isActive: isFlowActive,
    plan: selectedPlan,
    shouldShow: shouldShowModal
  };
};

export default usePaymentFlowResume; 
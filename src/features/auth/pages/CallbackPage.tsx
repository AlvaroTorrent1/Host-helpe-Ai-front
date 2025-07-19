import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@services/supabase';
import { LoadingScreen } from '@shared/components/loading';

export const CallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Procesar la redirección OAuth
    const handleAuthCallback = async () => {
      try {
        console.log('Procesando callback de autenticación');
        
        // Obtener la sesión actual
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error al procesar callback:', error);
          navigate('/login?error=auth-error');
          return;
        }
        
        if (data?.session) {
          console.log('Autenticación exitosa, verificando contexto...');
          
          // 🎯 NUEVO: Verificar si viene del flujo de modal de pago
          const isModalPaymentFlow = localStorage.getItem('modalPaymentFlow') === 'true';
          const selectedPlanId = localStorage.getItem('selectedPlanId');
          
          if (isModalPaymentFlow && selectedPlanId) {
            console.log('🔄 Callback: Usuario viene del modal de pago, volviendo a pricing con modal');
            // Mantener los flags para que el modal se reabra automáticamente
            navigate('/pricing');
            return;
          }
          
          // Flujo normal: verificar si hay un plan seleccionado
          if (selectedPlanId) {
            console.log('🔄 Callback: Plan seleccionado encontrado, redirigiendo a checkout');
            navigate('/checkout');
          } else {
            console.log('🔄 Callback: Sin plan seleccionado, redirigiendo a dashboard');
            navigate('/dashboard');
          }
        } else {
          // No hay sesión, redirigir al login
          console.log('No se encontró sesión después del callback');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error inesperado en callback:', error);
        navigate('/login?error=unexpected');
      }
    };

    handleAuthCallback();
  }, [navigate]);


      const { t } = useTranslation();
  
  return (
    <LoadingScreen
      message={t('common.loadingAuth')}
      subtext={t('common.loadingSubtext')}
      showLogo={false}
      gradient={false}
      className="bg-gray-50"
      data-testid="callback-loading"
    />
  );
};

export default CallbackPage; 
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@services/supabase';

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-700">Procesando tu inicio de sesión...</h2>
        <p className="mt-2 text-gray-500">Por favor, espera un momento.</p>
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    </div>
  );
};

export default CallbackPage; 
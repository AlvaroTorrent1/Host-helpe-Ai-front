import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@shared/contexts/AuthContext';
import { useSubscription } from '@shared/hooks/useSubscription';
import { updateSubscriptionStatus } from '@/services/stripeApi';
import supabase from '@/services/supabase';
import { useTranslation } from 'react-i18next';
import { LoadingScreen } from '@shared/components/loading';

/**
 * Página de éxito después del pago
 * Esta página se muestra cuando el usuario es redirigido desde Stripe
 * después de completar un pago exitoso.
 */
const PaymentSuccess = () => {
  const { user, loading: authLoading } = useAuth();
  const { hasActiveSubscription, loading: subLoading } = useSubscription();
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Si no está cargando y no hay usuario, redirigir a login
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    // Verificar si hay una suscripción activa
    const checkSubscriptionStatus = async () => {
      try {
        // Esperar a que termine de cargar la información de suscripción
        if (subLoading || authLoading) {
          return;
        }

        // Si ya tiene una suscripción activa, redirigir al dashboard
        if (hasActiveSubscription) {
          navigate('/dashboard');
          return;
        }

        // Obtener información de pago pendiente desde localStorage
        const sessionId = localStorage.getItem('pending_session_id');
        const planId = localStorage.getItem('pending_plan_id');
        
        // Verificar si hay información de pago en la URL (desde redirect de Stripe)
        const paymentIntentId = searchParams.get('payment_intent');
        const paymentStatus = searchParams.get('redirect_status');
        
        // Si el pago fue exitoso desde redirect
        if (paymentIntentId && paymentStatus === 'succeeded' && user) {
          // Actualizar el estado de la suscripción
          try {
            // Actualizar a "active" con confirmación de Stripe
            await updateSubscriptionStatus(user.id, planId || '', 'active');
            
            // Limpiar datos temporales
            localStorage.removeItem('pending_session_id');
            localStorage.removeItem('pending_plan_id');
            
            // Esperar un momento y redirigir al dashboard
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
          } catch (updateError) {
            console.error('Error al actualizar suscripción:', updateError);
            setError('Error al actualizar estado de suscripción. Por favor, contacta a soporte.');
          }
        }
        // Si no hay información de pago pendiente, puede ser que:
        // 1. El webhook ya procesó el pago y actualizó la BD
        // 2. El usuario llegó a esta página sin completar un pago
        else if (!sessionId || !planId) {
          setChecking(false);
          return;
        } else {
          // Intentar registrar manualmente la suscripción si el webhook no lo ha hecho
          // En producción, esto debería manejarse completamente por el webhook
          if (user) {
            // Verificar si ya existe la suscripción
            const { data: existingSub } = await supabase
              .from('customer_subscriptions')
              .select('*')
              .eq('user_id', user.id)
              .single();

            if (!existingSub) {
              // Crear una suscripción pendiente hasta que el webhook la actualice
              await supabase.from('customer_subscriptions').insert({
                user_id: user.id,
                plan_id: planId,
                status: 'pending', // Estado pendiente hasta confirmación de Stripe
                current_period_end: null, // No establecer fecha de expiración hasta confirmar
              });
            }

            // Limpiar datos temporales
            localStorage.removeItem('pending_session_id');
            localStorage.removeItem('pending_plan_id');

            // Esperar un momento y redirigir a la página de perfil para mostrar estado de suscripción
            setTimeout(() => {
              navigate('/profile');
            }, 3000);
          }
        }
      } catch (err) {
        console.error('Error al verificar suscripción:', err);
        setError('Error al procesar la información de pago. Por favor, contacta a soporte.');
      } finally {
        setChecking(false);
      }
    };

    checkSubscriptionStatus();
  }, [user, authLoading, subLoading, hasActiveSubscription, navigate, searchParams]);

  if (authLoading || subLoading || checking) {
  
    
    return (
      <LoadingScreen
        message={t('payment.processing') || 'Procesando pago...'}
        subtext={t('payment.verifying') || 'Verificando información de pago...'}
        showLogo={false}
        gradient={false}
        className="bg-gray-50"
        data-testid="payment-success-loading"
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
          <div className="text-red-500 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {t('payment.error')}
          </h1>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <button
            onClick={() => navigate('/pricing')}
            className="bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded transition-colors"
          >
            {t('payment.backToPricing')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="text-green-500 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {t('payment.success')}
        </h1>
        <p className="text-gray-600 mb-6">
          {t('payment.successMessage')}
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded transition-colors"
        >
          {t('payment.goToDashboard')}
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess; 
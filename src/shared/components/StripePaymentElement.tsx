// src/shared/components/StripePaymentElement.tsx - Componente de Pago Stripe
// Configurado para PRODUCCIÓN - Pagos reales

import React, { useEffect, useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { LoadingInline, LoadingSpinner, LoadingSize, LoadingVariant } from '@shared/components/loading';

interface StripePaymentElementProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  isTestMode?: boolean; // Prop mantenida para compatibilidad (siempre false en producción)
}

const StripePaymentElement: React.FC<StripePaymentElementProps> = ({
  clientSecret,
  onSuccess,
  onError,
  isTestMode = false, // Forzado a false - Sistema configurado para producción
}) => {
  // Forzar modo producción - No permitir modo test
  const isProduction = true;
  const forceProductionMode = true;
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [isPaymentElementReady, setIsPaymentElementReady] = useState(false);
  
  console.log('🚀 StripePaymentElement iniciado en MODO PRODUCCIÓN:', {
    clientSecret: clientSecret?.substring(0, 20) + '...',
    stripeLoaded: !!stripe,
    elementsLoaded: !!elements,
    environment: import.meta.env.MODE || 'development',
    productionMode: isProduction,
    forceProduction: forceProductionMode,
    stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY?.substring(0, 15) + '...'
  });

  // Efecto simple para verificar estado
  useEffect(() => {
    if (!stripe) {
      console.log('⏳ Esperando carga de Stripe.js...');
      return;
    }
    
    if (!clientSecret) {
      console.error('❌ No se proporcionó client_secret válido');
      setMessage('Error: No hay información de pago válida');
      return;
    }
    
    console.log('✅ Stripe.js y client_secret configurados correctamente');
    
    // Timeout para detectar si PaymentElement no se carga en 10 segundos
    const timeout = setTimeout(() => {
      if (!isPaymentElementReady) {
        console.error('❌ Timeout: PaymentElement no se cargó en 10 segundos');
        setMessage('Error: El formulario de pago tardó demasiado en cargar. Verifica la configuración de Stripe o recarga la página.');
      }
    }, 10000);
    
    return () => clearTimeout(timeout);
  }, [stripe, clientSecret, isPaymentElementReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setMessage('Error: Sistema de pago no está listo');
      return;
    }

    // Verificar que el PaymentElement esté completamente montado
    const paymentElement = elements.getElement('payment');
    if (!paymentElement) {
      setMessage('Error: El formulario de pago no está listo. Espera un momento e intenta de nuevo.');
      console.error('❌ PaymentElement no está montado');
      return;
    }

    setIsProcessing(true);
    setMessage('');

    try {
      console.log('🔄 Iniciando confirmación de pago...');
      console.log('✅ PaymentElement está montado correctamente');

      // Enviar el formulario primero
    const { error: submitError } = await elements.submit();
    if (submitError) {
        console.error('❌ Error al enviar formulario:', submitError);
        setMessage(submitError.message || 'Error al enviar el formulario');
        onError(submitError.message || 'Error al enviar formulario');
      return;
    }

      console.log('✅ Formulario enviado correctamente, confirmando pago...');
      
      // Confirmar pago SIN redirección - todo se maneja en el modal
      const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
        // NO incluir confirmParams con return_url
        redirect: 'if_required'
    });

    if (error) {
        console.error('❌ Error al confirmar el pago:', error);
        setMessage(error.message || 'Error al procesar el pago');
        onError(error.message || 'Error desconocido');
      } else if (paymentIntent) {
        console.log('✅ Pago procesado, paymentIntent completo:', paymentIntent);
        console.log('✅ Pago procesado exitosamente (resumen):', {
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
          next_action: paymentIntent.next_action || null,
          client_secret: paymentIntent.client_secret?.substring(0,15) + '...'
        });
        
        if (paymentIntent.status === 'succeeded') {
          console.log('🎉 ¡PAGO COMPLETADO CON ÉXITO EN EL MODAL!');
          onSuccess();
          // Detener cualquier posible evento subsiguiente o comportamiento por defecto
          if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
          }
          if (e && typeof e.stopPropagation === 'function') {
            e.stopPropagation();
          }
          return; // Salir explícitamente de la función aquí
        } else {
          setMessage(`Pago en estado: ${paymentIntent.status}`);
        }
      } else {
        console.log('✅ Pago procesado sin errores');
        onSuccess();
      }
      
    } catch (error: any) {
      console.error('❌ Error inesperado:', error);
      setMessage('Error inesperado al procesar el pago');
      onError(error.message || 'Error inesperado');
    } finally {
      setIsProcessing(false);
    }
  };

  // Mostrar loading mientras Stripe se inicializa
  if (!stripe || !elements) {
  return (
      <div className="text-center py-8">
        <LoadingInline 
          message="Cargando sistema de pago..."
          size={LoadingSize.LG}
          variant={LoadingVariant.PRIMARY}
          direction="vertical"
        />
        <p className="text-sm text-gray-500 mt-2">
          Inicializando Stripe en modo PRODUCCIÓN
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mostrar mensajes */}
      {message && (
        <div className="p-4 text-red-700 bg-red-100 rounded-md border border-red-200">
          <p>{message}</p>
        </div>
      )}

      {/* Formulario de pago */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <PaymentElement 
            options={{
              layout: 'tabs'
            }}
            onReady={() => {
              console.log('✅ PaymentElement está listo y montado');
              setIsPaymentElementReady(true);
            }}
            onLoadError={(error) => {
              console.error('❌ Error cargando PaymentElement:', error);
              setMessage('Error cargando el formulario de pago. Verifica la configuración de Stripe.');
              setIsPaymentElementReady(false);
            }}
            onChange={(event) => {
              // Limpiar mensaje si el elemento está completo
              if (event.complete) {
                setMessage('');
              }
            }}
          />
      </div>
      
      <button
        type="submit"
          disabled={isProcessing || !stripe || !isPaymentElementReady}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            isProcessing || !stripe || !isPaymentElementReady
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          }`}
      >
        {isProcessing ? (
            <span className="flex items-center justify-center">
              <LoadingSpinner size={LoadingSize.SM} variant={LoadingVariant.WHITE} className="mr-2" />
              Procesando pago...
            </span>
          ) : !isPaymentElementReady ? (
            'Preparando formulario...'
        ) : (
            'Completar pago'
        )}
      </button>
    </form>

      {/* Información de seguridad profesional */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-center space-x-6 text-xs">
          {/* Seguridad Stripe */}
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="flex-shrink-0">
              <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-medium">Procesado por Stripe</span>
          </div>
          
          {/* SSL */}
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="flex-shrink-0">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-medium">Protegido SSL</span>
          </div>
          
          {/* Modo Producción */}
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="flex-shrink-0">
              <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-medium">Pago seguro</span>
          </div>
        </div>
        
        {/* Texto adicional más sutil */}
        <p className="text-center text-gray-500 mt-3 text-xs">
          Tus datos están protegidos con encriptación de nivel bancario
        </p>
      </div>
    </div>
  );
};

export default StripePaymentElement; 

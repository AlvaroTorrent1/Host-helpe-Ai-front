// src/shared/components/StripePaymentElement.tsx - Componente de Pago Stripe para Producción
// Solo funcionalidad de producción - sin código de desarrollo o simulaciones

import React, { useEffect, useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface StripePaymentElementProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const StripePaymentElement: React.FC<StripePaymentElementProps> = ({
  clientSecret,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loadError, setLoadError] = useState(false);
  
  console.log('✅ StripePaymentElement iniciado para producción:', {
    clientSecret: clientSecret?.substring(0, 20) + '...',
    stripeLoaded: !!stripe,
    elementsLoaded: !!elements
  });

  // Verificar estado de Stripe y validar client_secret
  useEffect(() => {
    console.log('🔍 Verificando configuración de Stripe...');
    
    if (!stripe) {
      console.log('⏳ Esperando carga de Stripe.js...');
      return;
    }
    
    if (!clientSecret) {
      console.error('❌ No se proporcionó client_secret válido');
      setErrorMessage('Error de configuración: No hay información de pago válida');
      setLoadError(true);
      return;
    }
    
    // Validar formato del client_secret
    if (!clientSecret.startsWith('pi_') || !clientSecret.includes('_secret_')) {
      console.error('❌ Formato de client_secret inválido');
      setErrorMessage('Error de configuración: Información de pago inválida');
      setLoadError(true);
      return;
    }
    
    console.log('✅ Stripe.js y client_secret configurados correctamente');
  }, [stripe, clientSecret]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      const errorMsg = !stripe ? "Stripe.js no está cargado" : "Elements no está disponible";
      console.error('❌', errorMsg);
      setErrorMessage(`${errorMsg}. Por favor, recarga la página e intenta de nuevo.`);
      return;
    }

    if (!clientSecret) {
      console.error('❌ No hay client_secret disponible');
      setErrorMessage('Error: No se puede procesar el pago sin información válida');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      console.log('🔄 Iniciando confirmación de pago...');
      
      // Enviar formulario de pago
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message || 'Error al enviar el formulario de pago');
      }

      // Confirmar el pago con Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required'
      });

      if (error) {
        console.error('❌ Error al confirmar el pago:', error);
        
        // Manejar errores específicos de Stripe con mensajes más claros
        let userMessage = '';
        
        switch (error.type) {
          case 'card_error':
            userMessage = `Error de tarjeta: ${error.message}`;
            break;
          case 'validation_error':
            userMessage = `Error de validación: ${error.message}`;
            break;
          case 'authentication_error':
            userMessage = 'Error de autenticación. Por favor, verifica tus datos.';
            break;
          case 'rate_limit_error':
            userMessage = 'Demasiados intentos. Espera un momento e intenta de nuevo.';
            break;
          case 'api_connection_error':
            userMessage = 'Error de conexión. Verifica tu internet e intenta de nuevo.';
            break;
          case 'api_error':
            userMessage = 'Error del servidor. Intenta de nuevo en unos minutos.';
            break;
          default:
            userMessage = `Error al procesar el pago: ${error.message || 'Error desconocido'}`;
        }
        
        setErrorMessage(userMessage);
        setPaymentStatus('error');
        onError(error.message || 'Error desconocido');
        
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('✅ Pago procesado exitosamente:', paymentIntent.id);
        setPaymentStatus('success');
        onSuccess();
        
      } else {
        console.log('⚠️ Pago en estado:', paymentIntent?.status);
        // El pago puede estar pendiente o requerir acción adicional
        if (paymentIntent?.status === 'processing') {
          setErrorMessage('El pago está siendo procesado. Te notificaremos cuando se complete.');
        } else {
          setErrorMessage('El pago requiere verificación adicional. Revisa tu email.');
        }
      }
      
    } catch (error: any) {
      console.error('❌ Error inesperado durante el pago:', error);
      
      let userMessage = 'Error inesperado al procesar el pago.';
      
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        userMessage = 'Error de conexión. Verifica tu internet e intenta de nuevo.';
      } else if (error.message?.includes('timeout')) {
        userMessage = 'La operación tardó demasiado. Intenta de nuevo.';
      } else if (error.message) {
        userMessage = error.message;
      }
      
      setErrorMessage(userMessage);
      setPaymentStatus('error');
      onError(userMessage);
      
    } finally {
      setIsProcessing(false);
    }
  };

  // Error de carga - mostrar mensaje de error limpio
  if (loadError) {
    return (
      <div className="p-4 text-red-700 bg-red-100 rounded-md">
        <h3 className="font-bold mb-2">❌ Error al cargar el formulario de pago</h3>
        <p>{errorMessage}</p>
        <p className="text-sm mt-2">Por favor, recarga la página e intenta de nuevo.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Recargar página
        </button>
      </div>
    );
  }

  // Estado de carga mientras Stripe.js se inicializa
  if (!stripe || !elements) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <p className="text-gray-600 text-center">🔄 Cargando formulario de pago seguro...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mostrar errores de pago */}
      {errorMessage && (
        <div className="p-4 text-red-700 bg-red-100 rounded-md border border-red-200">
          <div className="flex items-start">
            <span className="mr-2">❌</span>
            <div>
              <p className="font-medium">{errorMessage}</p>
              <p className="text-sm mt-1">Si el problema persiste, contacta con soporte.</p>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de pago */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <PaymentElement 
            options={{
              layout: 'tabs',
              business: {
                name: 'Host Helper - Suscripción Premium'
              },
              paymentMethodOrder: ['card', 'paypal', 'apple_pay', 'google_pay']
            }}
          />
        </div>
        
        <button
          type="submit"
          disabled={isProcessing || !stripe || !clientSecret}
          className={`w-full py-3 px-4 rounded-md font-medium transition-all duration-200 ${
            isProcessing || !stripe || !clientSecret
              ? 'bg-gray-400 cursor-not-allowed opacity-60'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
          }`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando pago...
            </span>
          ) : (
            '🔒 Completar pago seguro'
          )}
        </button>
      </form>

      {/* Estado de éxito */}
      {paymentStatus === 'success' && (
        <div className="p-4 text-green-700 bg-green-100 rounded-md border border-green-200">
          <div className="flex items-center">
            <span className="mr-2">✅</span>
            <div>
              <p className="font-medium">¡Pago completado exitosamente!</p>
              <p className="text-sm">Tu suscripción ha sido activada.</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Información de seguridad */}
      <div className="text-xs text-gray-500 text-center">
        <p>🔒 Tu información está protegida con encriptación SSL</p>
        <p>Procesado de forma segura por Stripe</p>
      </div>
    </div>
  );
};

export default StripePaymentElement; 
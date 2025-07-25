// src/shared/components/StripePaymentElement.tsx - Componente de Pago Stripe
// Soporte para modo TEST y PRODUCCIÓN

import React, { useEffect, useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { LoadingInline, LoadingSpinner, LoadingSize, LoadingVariant } from '@shared/components/loading';

interface StripePaymentElementProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  isTestMode?: boolean; // Nueva prop para detectar modo test
}

const StripePaymentElement: React.FC<StripePaymentElementProps> = ({
  clientSecret,
  onSuccess,
  onError,
  isTestMode = false, // Por defecto asume producción
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [isPaymentElementReady, setIsPaymentElementReady] = useState(false);
  
  console.log(`✅ StripePaymentElement iniciado en modo ${isTestMode ? 'TEST' : 'PRODUCCIÓN'}:`, {
    clientSecret: clientSecret?.substring(0, 20) + '...',
    stripeLoaded: !!stripe,
    elementsLoaded: !!elements,
    environment: import.meta.env.MODE || 'development',
    testMode: isTestMode,
    willShowTestInfo: isTestMode,
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
          Inicializando Stripe en modo {isTestMode ? 'TEST' : 'PRODUCCIÓN'}
        </p>
        {isTestMode && (
          <div className="mt-4 text-xs text-gray-400">
            <p>Client Secret: {clientSecret ? '✅ Válido' : '❌ No disponible'}</p>
            <p>Stripe: {stripe ? '✅ Cargado' : '❌ No cargado'}</p>
            <p>Elements: {elements ? '✅ Cargado' : '❌ No cargado'}</p>
          </div>
        )}
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
            '⏳ Preparando formulario...'
        ) : (
            '💳 Completar pago'
        )}
      </button>
    </form>

      {/* Información de seguridad - Condicionada por modo */}
      <div className="text-xs text-gray-500 text-center">
        {isTestMode ? (
          // Información de modo TEST o DEMO
          <>
            <p>🔒 Modo de prueba - usar tarjetas de test</p>
            <p>Tarjeta: 4242 4242 4242 4242</p>
            <p className="mt-1 text-green-600">✅ El pago se procesa completamente en este modal</p>
          </>
        ) : (
          // Información de modo PRODUCCIÓN (real o demo)
          <>
            <p>🔒 Pago seguro procesado por Stripe</p>
            <p className="mt-1 text-green-600">✅ Transacción protegida con SSL</p>
          </>
        )}
        
        {/* Botón de diagnóstico solo en modo TEST */}
        {isTestMode && !isPaymentElementReady && (
          <button 
            onClick={() => {
              console.log('🔍 Diagnóstico de configuración:');
              console.log('- Stripe cargado:', !!stripe);
              console.log('- Elements cargado:', !!elements);
              console.log('- Client Secret:', clientSecret?.substring(0, 20) + '...');
              console.log('- PaymentElement ready:', isPaymentElementReady);
              
              // Intentar obtener el payment element
              try {
                const paymentEl = elements?.getElement('payment');
                console.log('- PaymentElement encontrado:', !!paymentEl);
              } catch (e) {
                console.log('- Error obteniendo PaymentElement:', e);
              }
            }}
            className="mt-2 px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
          >
            🔍 Diagnóstico
          </button>
        )}
      </div>
    </div>
  );
};

export default StripePaymentElement; 

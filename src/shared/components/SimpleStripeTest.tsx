// src/shared/components/SimpleStripeTest.tsx - Componente simple para probar Stripe
import React from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface SimpleStripeTestProps {
  clientSecret: string;
}

const SimpleStripeTest: React.FC<SimpleStripeTestProps> = ({ clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();

  console.log('🧪 SimpleStripeTest - Estado actual:', {
    stripe: !!stripe,
    elements: !!elements,
    clientSecret: clientSecret?.substring(0, 20) + '...',
    fullClientSecret: clientSecret  // Log completo para verificar formato
  });

  if (!stripe || !elements) {
    return (
      <div className="p-4 border-2 border-yellow-300 bg-yellow-50 rounded">
        <h3 className="font-bold text-yellow-800">🧪 Componente de Prueba Simple</h3>
        <p className="text-yellow-700">Esperando inicialización de Stripe...</p>
        <div className="mt-2 text-xs">
          <div>Stripe: {stripe ? '✅' : '❌'}</div>
          <div>Elements: {elements ? '✅' : '❌'}</div>
          <div>Client Secret: {clientSecret ? '✅' : '❌'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-2 border-green-300 bg-green-50 rounded">
      <h3 className="font-bold text-green-800 mb-4">🧪 Componente de Prueba Simple</h3>
      <div className="text-xs text-green-700 mb-4">
        <div>✅ Stripe cargado</div>
        <div>✅ Elements cargado</div>
        <div>✅ Client Secret disponible</div>
        <div className="mt-2 p-2 bg-gray-100 rounded text-gray-800">
          <div><strong>Client Secret:</strong> {clientSecret?.substring(0, 30)}...</div>
          <div><strong>Formato válido:</strong> {clientSecret?.startsWith('pi_') && clientSecret?.includes('_secret_') ? '✅' : '❌'}</div>
        </div>
      </div>
      
      <div className="border border-gray-300 p-4 bg-white rounded">
        <PaymentElement 
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card'],
            fields: {
              billingDetails: 'never'
            }
          }}
          onReady={() => {
            console.log('🎉 PaymentElement simple está listo!');
          }}
          onLoadError={(error) => {
            console.error('💥 Error en PaymentElement simple:', error);
            console.error('💥 Error details:', JSON.stringify(error, null, 2));
          }}
          onChange={(event) => {
            console.log('🔄 PaymentElement cambió:', event);
          }}
        />
      </div>
      
      <button 
        className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        onClick={() => {
          console.log('🔍 Diagnóstico detallado:');
          console.log('- Elements:', elements);
          console.log('- PaymentElement:', elements.getElement('payment'));
          alert('Ver consola para diagnóstico');
        }}
      >
        🔍 Diagnóstico Simple
      </button>
    </div>
  );
};

export default SimpleStripeTest; 
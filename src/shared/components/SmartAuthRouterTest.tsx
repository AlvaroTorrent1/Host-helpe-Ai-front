// src/shared/components/SmartAuthRouterTest.tsx
// Componente de prueba para verificar el funcionamiento del SmartAuthRouter

import React, { useState } from 'react';
import SmartAuthRouter from './SmartAuthRouter';
import { useAuth } from '@shared/contexts/AuthContext';

const SmartAuthRouterTest: React.FC = () => {
  const { user } = useAuth();
  const [testScenario, setTestScenario] = useState<'email' | 'google' | 'register' | null>(null);
  const [testPlan, setTestPlan] = useState({
    id: 'basic',
    name: 'Plan Básico',
    price: 7.99
  });

  const resetTest = () => {
    setTestScenario(null);
  };

  if (testScenario) {
    return (
      <SmartAuthRouter 
        authMethod={testScenario}
        selectedPlan={testPlan}
        showWelcomeMessage={true}
        onRedirectComplete={(destination) => {
          console.log(`✅ Test completado - Redirigido a: ${destination}`);
          alert(`Test completado - Redirigido a: ${destination}`);
          resetTest();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          🧪 Smart Auth Router Test
        </h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Estado actual:</h2>
          <div className="bg-gray-100 p-3 rounded">
            <p><strong>Usuario:</strong> {user ? user.email : 'No autenticado'}</p>
            <p><strong>ID:</strong> {user ? user.id : 'N/A'}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Plan de prueba:</h2>
          <div className="bg-blue-50 p-3 rounded">
            <p><strong>Plan:</strong> {testPlan.name}</p>
            <p><strong>Precio:</strong> €{testPlan.price}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">Probar escenarios:</h2>
          
          <button
            onClick={() => setTestScenario('email')}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
          >
            🔑 Simular Login con Email
          </button>
          
          <button
            onClick={() => setTestScenario('google')}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
          >
            🌐 Simular Login con Google
          </button>
          
          <button
            onClick={() => setTestScenario('register')}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition"
          >
            📝 Simular Registro + Pago
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            El SmartRouter decidirá automáticamente hacia dónde redirigir basándose en:
          </p>
          <ul className="text-xs text-gray-400 mt-2 space-y-1">
            <li>• Estado de autenticación</li>
            <li>• Estado de suscripción</li>
            <li>• Método de autenticación</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SmartAuthRouterTest; 
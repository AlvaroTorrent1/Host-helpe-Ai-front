// config/stripe-config.ts - Configuración centralizada de Stripe
// Permite cambiar fácilmente entre modo TEST, DEMO PRODUCCIÓN y PRODUCCIÓN REAL

/// <reference types="vite/client" />

export interface StripeConfig {
  publicKey: string;
  mode: 'test' | 'demo_production' | 'production';
  isProduction: boolean;
  isDemo: boolean;
}

// ============================================
// CONFIGURACIÓN DE STRIPE - 3 MODOS
// ============================================

// Configuración para MODO TEST (desarrollo)
const TEST_CONFIG: StripeConfig = {
  publicKey: 'pk_test_51QNuzlKpVJd2j1yPbsg080QS7mmqz68IIrjommi2AkMxLkIhi5PsaONdqSQsivUNkHTgcJAEfkjiMRP4BM5aXlKu00MLBpcYdQ',
  mode: 'test',
  isProduction: false,
  isDemo: false
};

// Configuración para MODO DEMO PRODUCCIÓN (testing UI producción)
const DEMO_PRODUCTION_CONFIG: StripeConfig = {
  publicKey: 'pk_test_51QNuzlKpVJd2j1yPbsg080QS7mmqz68IIrjommi2AkMxLkIhi5PsaONdqSQsivUNkHTgcJAEfkjiMRP4BM5aXlKu00MLBpcYdQ',
  mode: 'demo_production',
  isProduction: true, // UI de producción
  isDemo: true        // Pero con claves test
};

// Configuración para MODO PRODUCCIÓN REAL (pagos reales)
const PRODUCTION_CONFIG: StripeConfig = {
  publicKey: 'pk_live_CAMBIAR_POR_CLAVE_REAL', // 🚨 CAMBIAR POR CLAVE REAL
  mode: 'production',
  isProduction: true,
  isDemo: false
};

// ============================================
// CONFIGURACIÓN ACTIVA
// ============================================

// 🔧 CAMBIAR ESTA VARIABLE PARA ALTERNAR ENTRE MODOS:
// - 'test' = Modo TEST (con textos de test)
// - 'demo_production' = UI de producción con claves test (RECOMENDADO PARA TESTING)
// - 'production' = Modo PRODUCCIÓN REAL (necesita claves pk_live_...)
const CURRENT_MODE: StripeConfig['mode'] = 'demo_production';

// Obtener configuración activa
export const getStripeConfig = (): StripeConfig => {
  // Primero verificar variable de entorno
  const envKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  
  if (envKey) {
    // Si hay variable de entorno, usarla
    const isProduction = envKey.startsWith('pk_live_');
    return {
      publicKey: envKey,
      mode: isProduction ? 'production' : 'test',
      isProduction,
      isDemo: false
    };
  }
  
  // Si no hay variable de entorno, usar configuración manual
  switch (CURRENT_MODE) {
    case 'test':
      return TEST_CONFIG;
    case 'demo_production':
      return DEMO_PRODUCTION_CONFIG;
    case 'production':
      return PRODUCTION_CONFIG;
    default:
      return TEST_CONFIG;
  }
};

// Configuración activa
export const stripeConfig = getStripeConfig();

// Log de configuración para debugging
console.log(`🔧 Stripe Config: Modo ${stripeConfig.mode.toUpperCase()}`, {
  publicKey: stripeConfig.publicKey.substring(0, 15) + '...',
  isProduction: stripeConfig.isProduction,
  isDemo: stripeConfig.isDemo,
  source: import.meta.env.VITE_STRIPE_PUBLIC_KEY ? 'variable de entorno' : 'configuración manual'
});

// Warnings específicos según el modo
if (stripeConfig.isDemo) {
  console.warn('🎭 MODO DEMO: UI de producción con claves test - Perfect para testing!');
} else if (stripeConfig.isProduction && stripeConfig.publicKey.includes('CAMBIAR')) {
  console.error('🚨 ERROR: Usando placeholder en modo producción real!');
  console.error('🚨 Debes configurar una clave pk_live_... real para producción');
} else if (stripeConfig.isProduction) {
  console.log('🚀 MODO PRODUCCIÓN REAL: Usando claves live');
} else {
  console.log('🧪 MODO TEST: Desarrollo y testing');
}

export default stripeConfig; 
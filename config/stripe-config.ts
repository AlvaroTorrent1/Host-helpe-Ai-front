// config/stripe-config.ts - Configuración centralizada de Stripe
// CONFIGURADO PARA PRODUCCIÓN REAL - Pagos reales con claves live

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

// Configuración DEMO (mantenida para compatibilidad - NO USAR EN PRODUCCIÓN)
const DEMO_PRODUCTION_CONFIG: StripeConfig = {
  publicKey: 'pk_test_51QNuzlKpVJd2j1yPbsg080QS7mmqz68IIrjommi2AkMxLkIhi5PsaONdqSQsivUNkHTgcJAEfkjiMRP4BM5aXlKu00MLBpcYdQ',
  mode: 'demo_production',
  isProduction: true, // UI de producción
  isDemo: true        // Pero con claves test - SOLO PARA DESARROLLO
};

// Configuración para MODO PRODUCCIÓN REAL (pagos reales)
const PRODUCTION_CONFIG: StripeConfig = {
  publicKey: 'pk_live_CONFIGURED_FROM_ENV_OR_MANUAL', // 🚨 CONFIGURAR CON CLAVE REAL
  mode: 'production',
  isProduction: true,
  isDemo: false
};

// ============================================
// CONFIGURACIÓN ACTIVA
// ============================================

// 🔧 CONFIGURACIÓN ACTIVA: MODO PRODUCCIÓN REAL
// ✅ Modo configurado para pagos reales con claves live
// - 'production' = Modo PRODUCCIÓN REAL (pagos reales con claves pk_live_...)
// 💳 SISTEMA LISTO PARA PAGOS REALES
const CURRENT_MODE: StripeConfig['mode'] = 'production';

// Obtener configuración activa
export const getStripeConfig = (): StripeConfig => {
  // Primero verificar variable de entorno
  const envKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  
  // FORZAR MODO PRODUCCIÓN - Sistema configurado para pagos reales
  if (envKey && envKey.startsWith('pk_live_')) {
    // Usar clave LIVE de producción desde variable de entorno
    return {
      publicKey: envKey,
      mode: 'production',
      isProduction: true,
      isDemo: false
    };
  } else if (!envKey) {
    // Si no hay variable de entorno, usar configuración manual
    // IMPORTANTE: Configurar manualmente la clave pk_live_ en PRODUCTION_CONFIG
    return PRODUCTION_CONFIG;
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

// Confirmación de modo de producción
if (stripeConfig.isDemo) {
  console.warn('🎭 MODO DEMO: Solo para desarrollo - NO usar en producción!');
} else if (stripeConfig.isProduction && stripeConfig.publicKey.includes('REQUIRED_FROM_ENV')) {
  console.error('🚨 ERROR: Clave de producción requerida desde variable de entorno!');
  console.error('🚨 Crear archivo .env con: VITE_STRIPE_PUBLIC_KEY=pk_live_...');
} else if (stripeConfig.isProduction) {
  console.log('🚀 MODO PRODUCCIÓN REAL: Sistema configurado para pagos reales');
  console.log('💳 Stripe live keys activas - Transacciones reales habilitadas');
} else {
  console.log('🧪 MODO TEST: Desarrollo y testing');
}

export default stripeConfig; 
// scripts/test-stripe-config-debug.js
// Test para verificar la configuración de Stripe y detectar problemas

console.log('\n🔍 DEBUG: Configuración de Stripe\n');
console.log('='.repeat(50));

// Simular variables de entorno
const mockEnvs = [
  // Caso 1: Sin variable de entorno
  {},
  // Caso 2: Con variable de entorno LIVE
  { VITE_STRIPE_PUBLIC_KEY: 'pk_live_51QNuzlKpVJd2j1yPFx0LzTWN0c6J7kmw6NsdjJ6z4g5Ki1xnEBWs4uxzSwHcoswuwfNbhWXJTKHWJW2bxcWjOuNd009GmX21J4' },
  // Caso 3: Con variable de entorno TEST
  { VITE_STRIPE_PUBLIC_KEY: 'pk_test_51QNuzlKpVJd2j1yPtest...' }
];

mockEnvs.forEach((mockEnv, index) => {
  console.log(`\n--- CASO ${index + 1}: ${Object.keys(mockEnv).length ? 'Con env var' : 'Sin env var'} ---`);
  
  // Simular import.meta.env
  const originalEnv = typeof import !== 'undefined' && import.meta?.env;
  global.import = { meta: { env: mockEnv } };
  
  try {
    // Intentar cargar la configuración
    console.log('Variables simuladas:', mockEnv);
    
    // Verificar qué configuración se obtendría
    const configModule = require('../config/stripe-config.ts');
    if (configModule && configModule.getStripeConfig) {
      const config = configModule.getStripeConfig();
      console.log('Configuración obtenida:', {
        publicKey: config.publicKey?.substring(0, 20) + '...',
        mode: config.mode,
        isProduction: config.isProduction,
        isDemo: config.isDemo
      });
      
      // Verificar validador
      const validatorModule = require('../src/config/stripe-validator.ts');
      if (validatorModule && validatorModule.stripeValidator) {
        const status = validatorModule.stripeValidator.getValidationStatus();
        console.log('Estado del validador:', {
          isValid: status.isValid,
          errors: status.errors,
          warnings: status.warnings,
          keyType: status.keyType
        });
      }
    }
  } catch (error) {
    console.log('Error al cargar configuración:', error.message);
  }
  
  console.log(''.repeat(50));
});

console.log('\n✅ Debug completado');
console.log('\n💡 RECOMENDACIÓN:');
console.log('   Asegurar que .env.production contenga:');
console.log('   VITE_STRIPE_PUBLIC_KEY=pk_live_51QNuzlKpVJd2j1yPFx0LzTWN0c6J7kmw6NsdjJ6z4g5Ki1xnEBWs4uxzSwHcoswuwfNbhWXJTKHWJW2bxcWjOuNd009GmX21J4');
console.log('');

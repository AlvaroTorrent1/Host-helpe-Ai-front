#!/usr/bin/env node

/**
 * Script de Verificación para Configuración de Producción
 * Host Helper AI - Stripe Payment Flow
 * 
 * Ejecutar antes del despliegue para verificar configuraciones críticas
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

console.log('🔍 VERIFICACIÓN DE CONFIGURACIÓN DE PRODUCCIÓN');
console.log('=============================================\n');

let hasErrors = false;
let hasWarnings = false;

function logError(message) {
  console.log(`❌ ERROR: ${message}`);
  hasErrors = true;
}

function logWarning(message) {
  console.log(`⚠️  WARNING: ${message}`);
  hasWarnings = true;
}

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

function logInfo(message) {
  console.log(`ℹ️  ${message}`);
}

// 1. Verificar estructura de archivos críticos
console.log('📁 Verificando estructura de archivos...');

const criticalFiles = [
  'vite.config.ts',
  'src/config/environment.ts',
  'src/shared/contexts/PaymentFlowContext.tsx',
  'src/shared/components/RegisterModal.tsx',
  'src/features/auth/pages/AuthCallbackPage.tsx',
  'supabase/functions/create-payment-intent/index.ts',
  'supabase/functions/stripe-webhook/index.ts'
];

criticalFiles.forEach(file => {
  if (existsSync(file)) {
    logSuccess(`Archivo encontrado: ${file}`);
  } else {
    logError(`Archivo faltante: ${file}`);
  }
});

console.log('\n🔧 Verificando configuración de vite.config.ts...');

// 2. Verificar vite.config.ts
try {
  const viteConfig = readFileSync('vite.config.ts', 'utf8');
  
  if (viteConfig.includes('loadEnv')) {
    logSuccess('vite.config.ts usa loadEnv para variables dinámicas');
  } else {
    logError('vite.config.ts no está configurado para variables dinámicas');
  }
  
  if (viteConfig.includes('mode === \'production\'')) {
    logSuccess('vite.config.ts tiene validaciones para producción');
  } else {
    logWarning('vite.config.ts no tiene validaciones específicas para producción');
  }
  
  // Verificar si hay claves TEST hardcodeadas de manera problemática
  // (no como fallback para desarrollo)
  const hasProblematicHardcoding = viteConfig.includes('JSON.stringify(\'pk_test_') && 
                                    !viteConfig.includes('env.VITE_STRIPE_PUBLIC_KEY ||');
  
  if (hasProblematicHardcoding) {
    logError('vite.config.ts tiene claves TEST hardcodeadas sin usar variables de entorno');
  } else {
    logSuccess('vite.config.ts usa variables de entorno dinámicas');
  }
  
} catch (error) {
  logError(`No se pudo leer vite.config.ts: ${error.message}`);
}

console.log('\n⚙️  Verificando Edge Functions...');

// 3. Verificar Edge Functions
try {
  const createPaymentIntent = readFileSync('supabase/functions/create-payment-intent/index.ts', 'utf8');
  
  if (createPaymentIntent.includes('Deno.env.get(\'STRIPE_SECRET_KEY\')')) {
    logSuccess('create-payment-intent usa variables de entorno para Stripe');
  } else {
    logError('create-payment-intent no usa variables de entorno correctamente');
  }
  
  if (createPaymentIntent.includes('corsHeaders')) {
    logSuccess('create-payment-intent tiene configuración CORS');
  } else {
    logWarning('create-payment-intent puede tener problemas de CORS');
  }
  
} catch (error) {
  logError(`No se pudo leer create-payment-intent: ${error.message}`);
}

try {
  const stripeWebhook = readFileSync('supabase/functions/stripe-webhook/index.ts', 'utf8');
  
  if (stripeWebhook.includes('STRIPE_WEBHOOK_SECRET')) {
    logSuccess('stripe-webhook usa STRIPE_WEBHOOK_SECRET');
  } else {
    logError('stripe-webhook no está configurado para verificar webhooks');
  }
  
  if (stripeWebhook.includes('payment_intent.succeeded')) {
    logSuccess('stripe-webhook maneja payment_intent.succeeded');
  } else {
    logError('stripe-webhook no maneja eventos de pago exitoso');
  }
  
} catch (error) {
  logError(`No se pudo leer stripe-webhook: ${error.message}`);
}

console.log('\n🎯 Verificando componentes React...');

// 4. Verificar componentes React críticos
try {
  const registerModal = readFileSync('src/shared/components/RegisterModal.tsx', 'utf8');
  
  if (registerModal.includes('PaymentFlowContext')) {
    logSuccess('RegisterModal usa PaymentFlowContext');
  } else {
    logWarning('RegisterModal puede no estar usando PaymentFlowContext');
  }
  
  if (registerModal.includes('clearFlow')) {
    logSuccess('RegisterModal limpia el contexto de pago');
  } else {
    logWarning('RegisterModal puede no limpiar correctamente el estado');
  }
  
} catch (error) {
  logError(`No se pudo leer RegisterModal: ${error.message}`);
}

console.log('\n📋 CHECKLIST MANUAL REQUERIDO:');
console.log('========================================');

console.log('\n🔑 STRIPE LIVE CONFIGURATION:');
console.log('- [ ] Cuenta Stripe activada en modo LIVE');
console.log('- [ ] Productos Basic y Pro creados en Stripe LIVE');
console.log('- [ ] Clave pk_live_* obtenida');
console.log('- [ ] Clave sk_live_* obtenida');
console.log('- [ ] Webhook configurado en Stripe LIVE');
console.log('- [ ] Webhook secret whsec_* obtenido');

console.log('\n🌐 SUPABASE CONFIGURATION:');
console.log('- [ ] Variables de entorno actualizadas en Edge Functions');
console.log('- [ ] OAuth redirect URLs configuradas para producción');
console.log('- [ ] Site URL configurada para producción');

console.log('\n🚀 DEPLOYMENT:');
console.log('- [ ] Variables de entorno configuradas en servidor de producción');
console.log('- [ ] Build de producción exitoso');
console.log('- [ ] SSL activo en dominio de producción');

console.log('\n🧪 TESTING:');
console.log('- [ ] Test de OAuth con dominio de producción');
console.log('- [ ] Test de pago con tarjeta real (cantidad pequeña)');
console.log('- [ ] Verificación de webhook recibido');
console.log('- [ ] Verificación de suscripción creada en DB');

// 5. Resumen final
console.log('\n📊 RESUMEN DE VERIFICACIÓN:');
console.log('=============================');

if (hasErrors) {
  logError(`Se encontraron errores críticos. NO proceder con el despliegue.`);
  console.log('🔧 Solucionar todos los errores antes de continuar.\n');
  process.exit(1);
} else if (hasWarnings) {
  logWarning(`Se encontraron advertencias. Revisar antes del despliegue.`);
  console.log('⚠️  Es recomendable solucionar las advertencias.\n');
} else {
  logSuccess(`Configuración del código verificada correctamente.`);
  console.log('✅ El código está listo para despliegue a producción.\n');
}

console.log('📝 SIGUIENTE PASO:');
console.log('Completar la configuración manual siguiendo PRODUCTION_SETUP.md\n');

console.log('🚨 RECORDATORIO CRÍTICO:');
console.log('En modo LIVE se procesan pagos reales. Verificar todo dos veces.\n'); 
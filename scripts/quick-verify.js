#!/usr/bin/env node

/**
 * Verificación Rápida de Configuración para Producción
 * Host Helper AI - Stripe Payment Flow
 */

import { readFileSync, existsSync } from 'fs';

console.log('🔍 VERIFICACIÓN RÁPIDA - CONFIGURACIÓN DE PRODUCCIÓN');
console.log('================================================\n');

let errors = 0;
let warnings = 0;

function checkFile(file, description) {
  if (existsSync(file)) {
    console.log(`✅ ${description}`);
    return true;
  } else {
    console.log(`❌ ${description} - FALTANTE`);
    errors++;
    return false;
  }
}

function checkConfig(content, check, description) {
  if (content.includes(check)) {
    console.log(`✅ ${description}`);
    return true;
  } else {
    console.log(`❌ ${description} - FALTANTE`);
    errors++;
    return false;
  }
}

// Verificar archivos críticos
console.log('📁 ARCHIVOS CRÍTICOS:');
checkFile('vite.config.ts', 'vite.config.ts');
checkFile('src/shared/contexts/PaymentFlowContext.tsx', 'PaymentFlowContext.tsx');
checkFile('src/shared/components/RegisterModal.tsx', 'RegisterModal.tsx');
checkFile('supabase/functions/create-payment-intent/index.ts', 'create-payment-intent');
checkFile('supabase/functions/stripe-webhook/index.ts', 'stripe-webhook');

console.log('\n🔧 CONFIGURACIONES:');

// Verificar vite.config.ts
try {
  const viteConfig = readFileSync('vite.config.ts', 'utf8');
  checkConfig(viteConfig, 'loadEnv', 'Variables dinámicas en vite.config.ts');
  checkConfig(viteConfig, 'mode === \'production\'', 'Validaciones de producción');
} catch (error) {
  console.log(`❌ Error leyendo vite.config.ts`);
  errors++;
}

// Verificar Edge Functions
try {
  const paymentIntent = readFileSync('supabase/functions/create-payment-intent/index.ts', 'utf8');
  checkConfig(paymentIntent, 'STRIPE_SECRET_KEY', 'Edge Function usa variables de entorno');
} catch (error) {
  console.log(`❌ Error leyendo create-payment-intent`);
  errors++;
}

console.log('\n📋 CONFIGURACIÓN MANUAL PENDIENTE:');
console.log('- [ ] Stripe cuenta en modo LIVE');
console.log('- [ ] Productos creados en Stripe LIVE');
console.log('- [ ] Variables LIVE en Supabase Edge Functions');
console.log('- [ ] OAuth URLs configuradas para producción');
console.log('- [ ] Variables de entorno en servidor de producción');

console.log('\n📊 RESUMEN:');
if (errors > 0) {
  console.log(`❌ ${errors} errores encontrados - NO proceder`);
  process.exit(1);
} else {
  console.log(`✅ Verificación básica exitosa`);
  console.log('📝 Completar configuración manual siguiendo PRODUCTION_SETUP.md');
}

console.log('\n🚀 SIGUIENTE COMANDO:');
console.log('npm run pre-deploy'); 
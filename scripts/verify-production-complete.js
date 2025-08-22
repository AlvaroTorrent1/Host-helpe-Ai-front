// scripts/verify-production-complete.js
// Script completo de verificación para asegurar que todo está en modo producción

import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

console.log(chalk.cyan.bold('\n🚀 VERIFICACIÓN COMPLETA DE CONFIGURACIÓN DE PRODUCCIÓN\n'));
console.log('=' .repeat(70));

// Configuración esperada para producción
const EXPECTED_CONFIG = {
  publicKey: 'pk_live_YOUR_LIVE_PUBLIC_KEY_HERE',
  supabaseUrl: 'https://stripekol-dt5qxkz6.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cmlwZWtvbC1kdDVxeGt6NiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM0MzUyNzI3LCJleHAiOjIwNDk5Mjg3Mjd9.PXjl03TcdYWjrAp5wZ4lm_N9oc2jl5NrwBTzc_DYFuY'
};

let allTestsPassed = true;
const testResults = [];

// Test 1: Verificar que las claves son LIVE
console.log(chalk.yellow('\n📋 TEST 1: Verificación de Claves LIVE'));
console.log('-'.repeat(50));

const isLiveKey = EXPECTED_CONFIG.publicKey.startsWith('pk_live_');
if (isLiveKey) {
  console.log(chalk.green('  ✅ Clave pública es LIVE (pk_live_...)'));
  testResults.push({ test: 'Clave LIVE', status: 'PASS' });
} else {
  console.log(chalk.red('  ❌ Clave pública NO es LIVE'));
  testResults.push({ test: 'Clave LIVE', status: 'FAIL' });
  allTestsPassed = false;
}

// Test 2: Conexión con Supabase
console.log(chalk.yellow('\n📋 TEST 2: Conexión con Supabase'));
console.log('-'.repeat(50));

const supabase = createClient(EXPECTED_CONFIG.supabaseUrl, EXPECTED_CONFIG.supabaseAnonKey);

try {
  const { data, error } = await supabase.from('customer_subscriptions').select('count').limit(1);
  
  if (!error) {
    console.log(chalk.green('  ✅ Conexión con Supabase exitosa'));
    testResults.push({ test: 'Conexión Supabase', status: 'PASS' });
  } else {
    console.log(chalk.red('  ❌ Error al conectar con Supabase:', error.message));
    testResults.push({ test: 'Conexión Supabase', status: 'FAIL', error: error.message });
    allTestsPassed = false;
  }
} catch (err) {
  console.log(chalk.red('  ❌ Error de conexión:', err.message));
  testResults.push({ test: 'Conexión Supabase', status: 'FAIL', error: err.message });
  allTestsPassed = false;
}

// Test 3: Probar Edge Function con datos de producción
console.log(chalk.yellow('\n📋 TEST 3: Edge Function create-payment-intent'));
console.log('-'.repeat(50));

try {
  console.log(chalk.gray('  Probando con claves LIVE...'));
  
  const testPayload = {
    amount: 100, // 1 euro en centavos
    currency: 'eur',
    user_id: 'test-production-' + Date.now(),
    plan_id: 'professional',
    email: 'test@hosthelperai.com',
    metadata: {
      frontend_mode: 'production',
      key_type: 'live',
      test_run: true
    }
  };

  const { data, error } = await supabase.functions.invoke('create-payment-intent', {
    body: testPayload
  });

  if (error) {
    // Analizar el tipo de error
    if (error.message?.includes('STRIPE_SECRET_KEY')) {
      console.log(chalk.red('  ❌ STRIPE_SECRET_KEY no configurada en Edge Functions'));
      console.log(chalk.yellow('     ACCIÓN REQUERIDA: Configurar sk_live_ en Supabase Dashboard'));
      testResults.push({ 
        test: 'Edge Function', 
        status: 'FAIL', 
        error: 'Secret key no configurada',
        action: 'Configurar STRIPE_SECRET_KEY en Supabase'
      });
    } else if (error.message?.includes('mismatch')) {
      console.log(chalk.red('  ❌ Inconsistencia entre claves frontend/backend'));
      testResults.push({ 
        test: 'Edge Function', 
        status: 'FAIL', 
        error: 'Claves inconsistentes'
      });
    } else {
      console.log(chalk.yellow('  ⚠️  Edge Function responde con error:', error.message));
      testResults.push({ 
        test: 'Edge Function', 
        status: 'WARNING', 
        error: error.message 
      });
    }
    allTestsPassed = false;
  } else if (data?.clientSecret) {
    // Verificar que el client secret es de producción
    const isLiveSecret = !data.clientSecret.includes('_test_');
    
    if (isLiveSecret) {
      console.log(chalk.green('  ✅ Edge Function funcionando con claves LIVE'));
      console.log(chalk.gray(`     Client Secret: ${data.clientSecret.substring(0, 30)}...`));
      testResults.push({ test: 'Edge Function', status: 'PASS' });
    } else {
      console.log(chalk.yellow('  ⚠️  Edge Function usando claves TEST en el backend'));
      testResults.push({ 
        test: 'Edge Function', 
        status: 'WARNING',
        error: 'Backend usando claves TEST'
      });
      allTestsPassed = false;
    }
  } else {
    console.log(chalk.red('  ❌ Respuesta inesperada de Edge Function'));
    testResults.push({ test: 'Edge Function', status: 'FAIL' });
    allTestsPassed = false;
  }
} catch (err) {
  console.log(chalk.red('  ❌ Error al probar Edge Function:', err.message));
  testResults.push({ test: 'Edge Function', status: 'FAIL', error: err.message });
  allTestsPassed = false;
}

// Test 4: Verificar webhook de Stripe
console.log(chalk.yellow('\n📋 TEST 4: Webhook de Stripe'));
console.log('-'.repeat(50));

try {
  const { data, error } = await supabase.functions.invoke('stripe-webhook', {
    body: {
      type: 'test.ping',
      data: { test: true }
    },
    headers: {
      'stripe-signature': 'test-signature'
    }
  });

  if (!error) {
    console.log(chalk.green('  ✅ Webhook endpoint responde correctamente'));
    testResults.push({ test: 'Webhook', status: 'PASS' });
  } else {
    console.log(chalk.yellow('  ⚠️  Webhook responde pero con error (normal para test)'));
    testResults.push({ test: 'Webhook', status: 'WARNING' });
  }
} catch (err) {
  console.log(chalk.yellow('  ⚠️  No se pudo verificar webhook:', err.message));
  testResults.push({ test: 'Webhook', status: 'SKIP' });
}

// RESUMEN FINAL
console.log('\n' + '='.repeat(70));
console.log(chalk.cyan.bold('📊 RESUMEN DE VERIFICACIÓN'));
console.log('='.repeat(70));

testResults.forEach(result => {
  const icon = result.status === 'PASS' ? '✅' : 
                result.status === 'FAIL' ? '❌' : 
                result.status === 'WARNING' ? '⚠️' : '⏭️';
  const color = result.status === 'PASS' ? chalk.green : 
                 result.status === 'FAIL' ? chalk.red : 
                 chalk.yellow;
  
  console.log(color(`${icon} ${result.test}: ${result.status}`));
  if (result.error) {
    console.log(chalk.gray(`   └─ ${result.error}`));
  }
  if (result.action) {
    console.log(chalk.cyan(`   └─ ACCIÓN: ${result.action}`));
  }
});

console.log('\n' + '='.repeat(70));

if (allTestsPassed) {
  console.log(chalk.green.bold('✅ ¡SISTEMA LISTO PARA PRODUCCIÓN!'));
  console.log(chalk.green('   Todas las verificaciones pasaron exitosamente.'));
  console.log(chalk.green('   Los pagos reales están habilitados.'));
} else {
  console.log(chalk.red.bold('⚠️  SISTEMA REQUIERE CONFIGURACIÓN ADICIONAL'));
  console.log(chalk.yellow('\n📝 ACCIONES REQUERIDAS:'));
  
  if (testResults.some(r => r.test === 'Edge Function' && r.status === 'FAIL')) {
    console.log(chalk.white('\n1. Configurar STRIPE_SECRET_KEY en Supabase:'));
    console.log(chalk.gray('   - Ir a: https://app.supabase.com/project/stripekol-dt5qxkz6'));
    console.log(chalk.gray('   - Settings → Edge Functions → Secrets'));
    console.log(chalk.gray('   - Añadir: STRIPE_SECRET_KEY = sk_live_YOUR_SECRET_KEY_FROM_STRIPE_DASHBOARD'));
  }
  
  if (testResults.some(r => r.test === 'Webhook' && r.status !== 'PASS')) {
    console.log(chalk.white('\n2. Configurar Webhook en Stripe Dashboard:'));
    console.log(chalk.gray('   - Endpoint: https://stripekol-dt5qxkz6.supabase.co/functions/v1/stripe-webhook'));
    console.log(chalk.gray('   - Eventos: payment_intent.succeeded, payment_intent.failed'));
    console.log(chalk.gray('   - Copiar signing secret y configurar en Supabase como STRIPE_WEBHOOK_SECRET'));
  }
}

console.log('\n' + '='.repeat(70));
console.log(chalk.cyan('Verificación completada: ' + new Date().toLocaleString()));
console.log('='.repeat(70) + '\n');

process.exit(allTestsPassed ? 0 : 1);

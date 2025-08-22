// scripts/verify-stripe-production.js
// Script para verificar la configuración de Stripe en producción

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

// Cargar variables de entorno
dotenv.config();

console.log(chalk.cyan.bold('\n🔍 Verificación de Configuración de Stripe para Producción\n'));
console.log('=' .repeat(60));

let hasErrors = false;
let hasWarnings = false;

// 1. Verificar variables de entorno del frontend
console.log(chalk.yellow('\n📋 1. Variables de Entorno del Frontend:'));

const stripePublicKey = process.env.VITE_STRIPE_PUBLIC_KEY;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Verificar clave pública de Stripe
if (!stripePublicKey) {
  console.log(chalk.red('  ❌ VITE_STRIPE_PUBLIC_KEY no está configurada'));
  hasErrors = true;
} else if (stripePublicKey.startsWith('pk_test_')) {
  console.log(chalk.yellow('  ⚠️  VITE_STRIPE_PUBLIC_KEY es una clave de TEST'));
  console.log(chalk.yellow(`     Valor: ${stripePublicKey.substring(0, 20)}...`));
  hasWarnings = true;
} else if (stripePublicKey.startsWith('pk_live_')) {
  console.log(chalk.green('  ✅ VITE_STRIPE_PUBLIC_KEY es una clave LIVE de producción'));
  console.log(chalk.gray(`     Valor: ${stripePublicKey.substring(0, 20)}...`));
} else {
  console.log(chalk.red('  ❌ VITE_STRIPE_PUBLIC_KEY tiene un formato inválido'));
  console.log(chalk.red(`     Debe comenzar con pk_test_ o pk_live_`));
  hasErrors = true;
}

// Verificar Supabase
if (!supabaseUrl) {
  console.log(chalk.red('  ❌ VITE_SUPABASE_URL no está configurada'));
  hasErrors = true;
} else {
  console.log(chalk.green(`  ✅ VITE_SUPABASE_URL: ${supabaseUrl}`));
}

if (!supabaseAnonKey) {
  console.log(chalk.red('  ❌ VITE_SUPABASE_ANON_KEY no está configurada'));
  hasErrors = true;
} else {
  console.log(chalk.green('  ✅ VITE_SUPABASE_ANON_KEY configurada'));
}

// 2. Verificar conexión con Supabase
console.log(chalk.yellow('\n📡 2. Conexión con Supabase:'));

if (supabaseUrl && supabaseAnonKey) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.from('subscription_plans').select('id').limit(1);
    
    if (error) {
      console.log(chalk.red('  ❌ Error al conectar con Supabase:'), error.message);
      hasErrors = true;
    } else {
      console.log(chalk.green('  ✅ Conexión con Supabase exitosa'));
    }
  } catch (error) {
    console.log(chalk.red('  ❌ Error al conectar con Supabase:'), error.message);
    hasErrors = true;
  }
} else {
  console.log(chalk.yellow('  ⚠️  No se puede verificar la conexión (faltan credenciales)'));
}

// 3. Verificar Edge Functions
console.log(chalk.yellow('\n🚀 3. Edge Functions de Supabase:'));

if (supabaseUrl && supabaseAnonKey) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Intentar llamar a la función con parámetros de prueba
    console.log(chalk.gray('  Probando create-payment-intent...'));
    
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        amount: 100, // 1 euro en centavos
        currency: 'eur',
        user_id: 'test-user',
        plan_id: 'test-plan',
        email: 'test@example.com'
      }
    });
    
    if (error) {
      if (error.message?.includes('STRIPE_SECRET_KEY')) {
        console.log(chalk.red('  ❌ STRIPE_SECRET_KEY no está configurada en Edge Functions'));
        console.log(chalk.yellow('     Configurar en: Supabase Dashboard > Edge Functions > Secrets'));
        hasErrors = true;
      } else if (error.message?.includes('non-2xx status code')) {
        console.log(chalk.red('  ❌ Edge Function devuelve error (posible problema de configuración)'));
        console.log(chalk.gray(`     Error: ${error.message}`));
        hasErrors = true;
      } else {
        console.log(chalk.yellow('  ⚠️  Edge Function responde pero con error:'), error.message);
        hasWarnings = true;
      }
    } else if (data?.clientSecret) {
      console.log(chalk.green('  ✅ Edge Function create-payment-intent funciona correctamente'));
      
      // Verificar si es test o live basado en el client secret
      if (data.clientSecret.includes('_test_')) {
        console.log(chalk.yellow('     ⚠️  Usando claves de TEST en el backend'));
        hasWarnings = true;
      } else {
        console.log(chalk.green('     ✅ Usando claves LIVE en el backend'));
      }
    }
  } catch (error) {
    console.log(chalk.red('  ❌ Error al probar Edge Functions:'), error.message);
    hasErrors = true;
  }
} else {
  console.log(chalk.yellow('  ⚠️  No se pueden verificar las Edge Functions (faltan credenciales)'));
}

// 4. Recomendaciones
console.log(chalk.yellow('\n📝 4. Recomendaciones:'));

if (hasErrors) {
  console.log(chalk.red('\n⚠️  ERRORES CRÍTICOS ENCONTRADOS:\n'));
  
  if (!stripePublicKey || !stripePublicKey.startsWith('pk_live_')) {
    console.log(chalk.white('  1. Configurar clave pública de Stripe LIVE:'));
    console.log(chalk.gray('     - Obtener desde: https://dashboard.stripe.com/apikeys'));
    console.log(chalk.gray('     - Añadir a .env: VITE_STRIPE_PUBLIC_KEY=pk_live_...'));
  }
  
  console.log(chalk.white('\n  2. Configurar clave secreta en Supabase:'));
  console.log(chalk.gray('     - Ir a: Supabase Dashboard > Edge Functions > Secrets'));
  console.log(chalk.gray('     - Añadir: STRIPE_SECRET_KEY = sk_live_...'));
  
  console.log(chalk.white('\n  3. Verificar que ambas claves sean del mismo modo:'));
  console.log(chalk.gray('     - Ambas TEST (pk_test_ y sk_test_) para desarrollo'));
  console.log(chalk.gray('     - Ambas LIVE (pk_live_ y sk_live_) para producción'));
}

if (hasWarnings && !hasErrors) {
  console.log(chalk.yellow('\n⚠️  ADVERTENCIAS:'));
  console.log(chalk.gray('  - Verificar que las claves sean las correctas para el entorno'));
  console.log(chalk.gray('  - Considerar usar claves LIVE si es producción'));
}

if (!hasErrors && !hasWarnings) {
  console.log(chalk.green('\n✅ ¡Configuración de producción correcta!'));
  console.log(chalk.green('  Todas las verificaciones pasaron exitosamente.'));
}

// Resumen final
console.log('\n' + '='.repeat(60));
console.log(chalk.cyan.bold('Resumen de Verificación:'));
console.log(chalk.white(`  Estado: ${hasErrors ? chalk.red('❌ FALLÓ') : hasWarnings ? chalk.yellow('⚠️  CON ADVERTENCIAS') : chalk.green('✅ EXITOSO')}`));
console.log(chalk.white(`  Errores: ${hasErrors ? chalk.red('Sí') : chalk.green('No')}`));
console.log(chalk.white(`  Advertencias: ${hasWarnings ? chalk.yellow('Sí') : chalk.green('No')}`));
console.log('='.repeat(60) + '\n');

process.exit(hasErrors ? 1 : 0);

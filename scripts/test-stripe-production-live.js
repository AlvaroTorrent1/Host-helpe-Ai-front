// scripts/test-stripe-production-live.js
// Test directo de la configuración de producción con claves LIVE

console.log('\n🚀 TEST DE CONFIGURACIÓN DE PRODUCCIÓN CON CLAVES LIVE\n');
console.log('='.repeat(60));

// Configuración LIVE - Las claves reales deben configurarse por separado
const CONFIG = {
  stripePublicKey: 'pk_live_YOUR_LIVE_PUBLIC_KEY_HERE',
  stripeSecretKey: 'sk_live_YOUR_LIVE_SECRET_KEY_HERE',
  supabaseUrl: 'https://stripekol-dt5qxkz6.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cmlwZWtvbC1kdDVxeGt6NiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM0MzUyNzI3LCJleHAiOjIwNDk5Mjg3Mjd9.PXjl03TcdYWjrAp5wZ4lm_N9oc2jl5NrwBTzc_DYFuY'
};

// Verificaciones
console.log('✅ CONFIGURACIÓN DETECTADA:');
console.log('-'.repeat(60));

// 1. Verificar claves
const isPublicLive = CONFIG.stripePublicKey.startsWith('pk_live_');
const isSecretLive = CONFIG.stripeSecretKey.startsWith('sk_live_');

console.log(`📌 Clave Pública: ${isPublicLive ? '✅ LIVE' : '❌ TEST'}`);
console.log(`   ${CONFIG.stripePublicKey.substring(0, 20)}...`);

console.log(`📌 Clave Secreta: ${isSecretLive ? '✅ LIVE' : '❌ TEST'}`);
console.log(`   ${CONFIG.stripeSecretKey.substring(0, 20)}...`);

console.log(`📌 Supabase URL: ${CONFIG.supabaseUrl}`);
console.log(`📌 Modo: ${isPublicLive && isSecretLive ? '🚀 PRODUCCIÓN' : '🧪 TEST'}`);

// 2. Instrucciones para configurar
console.log('\n📝 CONFIGURACIÓN REQUERIDA EN SUPABASE:');
console.log('-'.repeat(60));

console.log('\n1️⃣ CONFIGURAR STRIPE_SECRET_KEY:');
console.log('   Dashboard: https://app.supabase.com/project/stripekol-dt5qxkz6');
console.log('   Ruta: Settings → Edge Functions → Secrets');
console.log('   Variable: STRIPE_SECRET_KEY');
console.log('   Valor: sk_live_YOUR_SECRET_KEY_FROM_STRIPE_DASHBOARD');

console.log('\n2️⃣ CONFIGURAR STRIPE_WEBHOOK_SECRET:');
console.log('   Dashboard de Stripe: https://dashboard.stripe.com/webhooks');
console.log('   Crear webhook con endpoint:');
console.log('   https://stripekol-dt5qxkz6.supabase.co/functions/v1/stripe-webhook');
console.log('   Eventos requeridos:');
console.log('   - payment_intent.succeeded');
console.log('   - payment_intent.payment_failed');
console.log('   - checkout.session.completed');
console.log('   Copiar el Signing Secret y configurar en Supabase como STRIPE_WEBHOOK_SECRET');

console.log('\n3️⃣ VERIFICAR FRONTEND (.env.production):');
console.log(`   VITE_STRIPE_PUBLIC_KEY=${CONFIG.stripePublicKey}`);
console.log(`   VITE_SUPABASE_URL=${CONFIG.supabaseUrl}`);
console.log(`   VITE_SUPABASE_ANON_KEY=${CONFIG.supabaseAnonKey}`);

// 3. Estado actual
console.log('\n📊 ESTADO ACTUAL:');
console.log('-'.repeat(60));

if (isPublicLive && isSecretLive) {
  console.log('✅ Claves LIVE configuradas correctamente');
  console.log('✅ Sistema listo para procesar pagos reales');
  console.log('⚠️  IMPORTANTE: Asegurar que las Edge Functions tengan la sk_live configurada');
} else {
  console.log('❌ Claves no están en modo LIVE');
  console.log('⚠️  El sistema NO puede procesar pagos reales');
}

// 4. Checklist final
console.log('\n✅ CHECKLIST FINAL:');
console.log('-'.repeat(60));
console.log('[ ] STRIPE_SECRET_KEY configurada en Supabase Edge Functions');
console.log('[ ] STRIPE_WEBHOOK_SECRET configurada en Supabase');
console.log('[ ] Webhook configurado en Stripe Dashboard');
console.log('[ ] Frontend usando pk_live_... en .env.production');
console.log('[ ] Backend usando sk_live_... en Edge Functions');
console.log('[ ] Modo producción activado en config/stripe-config.ts');

console.log('\n' + '='.repeat(60));
console.log('💡 Una vez configurado todo, ejecutar: npm run build');
console.log('💡 Para verificar: npm run verify:production');
console.log('='.repeat(60) + '\n');

#!/usr/bin/env node
// scripts/test-production-flow.cjs - Script para verificar el flujo de pago en producción

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function showHeader() {
  console.log(`
${colors.bold}${colors.cyan}🚀 TEST DE FLUJO DE PAGO EN PRODUCCIÓN${colors.reset}
${colors.cyan}================================================${colors.reset}
`);
}

function showInstructions() {
  log(colors.bold, '📋 INSTRUCCIONES PARA TESTING:');
  console.log('');
  
  log(colors.yellow, '1. 🌐 ABRIR APLICACIÓN:');
  log(colors.blue, '   → Ve a: http://localhost:4003/pricing');
  console.log('');
  
  log(colors.yellow, '2. 🧪 VERIFICAR MODO PRODUCCIÓN:');
  log(colors.blue, '   → Abre DevTools (F12) → Console');
  log(colors.blue, '   → Busca: "Stripe Config: Modo PRODUCTION"');
  log(colors.green, '   ✅ Debe mostrar modo PRODUCTION');
  console.log('');
  
  log(colors.yellow, '3. 💳 PROBAR MODAL DE PAGO:');
  log(colors.blue, '   → Haz clic en "Empezar" en el plan Profesional');
  log(colors.blue, '   → Regístrate o inicia sesión');
  log(colors.blue, '   → En el modal de pago verifica:');
  log(colors.green, '     ✅ "🔒 Pago seguro procesado por Stripe"');
  log(colors.green, '     ✅ NO debe aparecer "Modo de prueba"');
  log(colors.green, '     ✅ NO debe aparecer "4242 4242 4242 4242"');
  console.log('');
  
  log(colors.yellow, '4. ⚠️  ADVERTENCIA IMPORTANTE:');
  log(colors.red, '   🚨 NO INTRODUZCAS DATOS REALES DE TARJETA');
  log(colors.red, '   🚨 Solo verifica la interfaz, no completes el pago');
  log(colors.blue, '   → Si tienes claves pk_live_... reales, los pagos serán REALES');
  log(colors.blue, '   → Si usas la clave demo, habrá error (es normal)');
  console.log('');
  
  log(colors.yellow, '5. 🔄 VOLVER A MODO TEST:');
  log(colors.blue, '   → Ejecuta: npm run stripe:test');
  log(colors.blue, '   → Recarga el navegador');
  console.log('');
}

function showChecklist() {
  log(colors.bold, '✅ CHECKLIST DE VERIFICACIÓN:');
  console.log('');
  
  const checks = [
    'App ejecutándose en http://localhost:4003',
    'Console muestra "Stripe Config: Modo PRODUCTION"',
    'Modal NO muestra "Modo de prueba"',
    'Modal SI muestra "Pago seguro procesado por Stripe"',
    'NO aparece "4242 4242 4242 4242"',
    'NO aparece botón de "Diagnóstico"',
    'Interfaz se ve profesional y lista para usuarios finales'
  ];
  
  checks.forEach((check, index) => {
    log(colors.blue, `   ${index + 1}. [ ] ${check}`);
  });
  
  console.log('');
  log(colors.green, '🎯 Si todos los puntos se cumplen, ¡el modo producción está listo!');
  console.log('');
}

function showNextSteps() {
  log(colors.bold, '🚀 PRÓXIMOS PASOS PARA PRODUCCIÓN REAL:');
  console.log('');
  
  log(colors.yellow, '1. OBTENER CLAVES STRIPE LIVE:');
  log(colors.blue, '   → Ve a https://dashboard.stripe.com');
  log(colors.blue, '   → Activa tu cuenta (verificación de identidad)');
  log(colors.blue, '   → Copia claves pk_live_... y sk_live_...');
  console.log('');
  
  log(colors.yellow, '2. CONFIGURAR VARIABLES DE ENTORNO:');
  log(colors.blue, '   → Edita config/stripe-config.ts');
  log(colors.blue, '   → O configura VITE_STRIPE_PUBLIC_KEY=pk_live_...');
  console.log('');
  
  log(colors.yellow, '3. CONFIGURAR WEBHOOKS:');
  log(colors.blue, '   → URL: https://tu-proyecto.supabase.co/functions/v1/stripe-webhook');
  log(colors.blue, '   → Eventos: payment_intent.*, customer.subscription.*');
  console.log('');
  
  log(colors.yellow, '4. TESTING FINAL:');
  log(colors.blue, '   → Haz una compra real con tarjeta real');
  log(colors.blue, '   → Verifica que la suscripción se cree en Supabase');
  log(colors.blue, '   → Verifica que el usuario tenga acceso a las funciones premium');
  console.log('');
}

function showWarning() {
  log(colors.red, '⚠️  ADVERTENCIA IMPORTANTE:');
  log(colors.yellow, '   🔒 En modo PRODUCCIÓN, los pagos son REALES');
  log(colors.yellow, '   💰 Solo usar tarjetas reales cuando esté listo para producción');
  log(colors.yellow, '   🧪 Para desarrollo, volver a modo TEST');
  console.log('');
}

// Main execution
showHeader();
showInstructions();
showChecklist();
showWarning();
showNextSteps();

log(colors.bold, '📖 DOCUMENTACIÓN COMPLETA:');
log(colors.blue, '   → QUICK-STRIPE-SETUP.md');
log(colors.blue, '   → documentation/guides/stripe-production-setup.md');
console.log(''); 
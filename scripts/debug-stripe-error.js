// Script de debugging para el error del plan básico
// Este script verifica paso a paso qué está fallando

console.log('=== DEBUGGING ERROR PLAN BÁSICO ===\n');

// 1. Verificar formato de números
console.log('1. VERIFICACIÓN DE FORMATO NUMÉRICO:');
const price = 19.99;
console.log(`  Precio original: ${price}`);
console.log(`  Multiplicado por 100: ${price * 100}`);
console.log(`  Math.round(price * 100): ${Math.round(price * 100)}`);
console.log(`  Math.floor(price * 100): ${Math.floor(price * 100)}`);
console.log(`  parseInt(price * 100): ${parseInt(price * 100)}`);
console.log(`  Tipo de dato: ${typeof (price * 100)}`);

// Verificar si hay problema de precisión
const calculated = price * 100;
const isExact = calculated === 1999;
console.log(`  ¿Es exactamente 1999? ${isExact}`);
console.log(`  Valor real calculado: ${calculated}`);
console.log('');

// 2. Comparar con plan pro
console.log('2. COMPARACIÓN CON PLAN PRO:');
const proPriceAnnual = 49.99;
const basicPriceAnnual = 19.99;

console.log(`  Plan Pro: €${proPriceAnnual} = ${proPriceAnnual * 100} centavos`);
console.log(`  Plan Básico: €${basicPriceAnnual} = ${basicPriceAnnual * 100} centavos`);
console.log('');

// 3. Verificar si hay algún patrón en el error
console.log('3. ANÁLISIS DE PATRONES:');
console.log(`  Diferencia de precio: €${proPriceAnnual - basicPriceAnnual}`);
console.log(`  Ratio: ${proPriceAnnual / basicPriceAnnual}`);
console.log(`  ¿El plan básico es menor a €20? ${basicPriceAnnual < 20}`);
console.log(`  ¿El plan pro es mayor a €20? ${proPriceAnnual > 20}`);
console.log('');

// 4. Posibles validaciones de Stripe
console.log('4. VALIDACIONES DE STRIPE:');
console.log('  Monto mínimo para EUR: 50 centavos (€0.50)');
console.log(`  Plan básico cumple: ${basicPriceAnnual * 100 >= 50} ✅`);
console.log(`  Plan pro cumple: ${proPriceAnnual * 100 >= 50} ✅`);
console.log('');

// 5. Sugerencias de debugging
console.log('5. SUGERENCIAS DE DEBUGGING:');
console.log('');
console.log('📋 PASOS PARA DIAGNOSTICAR:');
console.log('');
console.log('1. Abre la consola del navegador y limpia todos los logs');
console.log('2. Intenta comprar el plan básico');
console.log('3. Busca en los logs:');
console.log('   - "🔄 Enviando request a Supabase Edge Function"');
console.log('   - El Payload completo que se envía');
console.log('   - "📨 Respuesta de Supabase"');
console.log('');
console.log('4. Copia el payload exacto y verifica:');
console.log('   - ¿El amount es exactamente 1999?');
console.log('   - ¿El plan_id es "basic"?');
console.log('   - ¿Todos los campos están presentes?');
console.log('');
console.log('5. Si el error es 500, el problema está en el backend');
console.log('   Necesitas verificar en Supabase:');
console.log('   - Dashboard > Edge Functions > create-payment-intent > Logs');
console.log('   - Buscar el error específico en los logs de la función');
console.log('');
console.log('=== FIN DEL ANÁLISIS ===');

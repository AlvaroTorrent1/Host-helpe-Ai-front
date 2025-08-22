// Script para verificar los montos exactos que se envían a Stripe
// Este script verifica la conversión de euros a centavos para ambos planes

console.log('=== VERIFICACIÓN DE MONTOS DE STRIPE ===\n');

// Precios de los planes
const plans = {
  basic: {
    monthly: 23.99,
    annual: 19.99
  },
  pro: {
    monthly: 59.99,
    annual: 49.99
  }
};

// Función para convertir a centavos (como lo hace el frontend)
function toCents(amount) {
  return Math.round(amount * 100);
}

console.log('PLAN BÁSICO:');
console.log(`  Mensual: €${plans.basic.monthly} = ${toCents(plans.basic.monthly)} centavos`);
console.log(`  Anual:   €${plans.basic.annual} = ${toCents(plans.basic.annual)} centavos`);
console.log('');

console.log('PLAN PROFESIONAL:');
console.log(`  Mensual: €${plans.pro.monthly} = ${toCents(plans.pro.monthly)} centavos`);
console.log(`  Anual:   €${plans.pro.annual} = ${toCents(plans.pro.annual)} centavos`);
console.log('');

// Verificar si hay algún problema con los montos
console.log('VERIFICACIÓN DE PROBLEMAS POTENCIALES:');

// Verificar montos mínimos de Stripe (50 centavos para EUR)
const minAmount = 50;
const allAmounts = [
  { plan: 'básico mensual', amount: toCents(plans.basic.monthly) },
  { plan: 'básico anual', amount: toCents(plans.basic.annual) },
  { plan: 'pro mensual', amount: toCents(plans.pro.monthly) },
  { plan: 'pro anual', amount: toCents(plans.pro.annual) }
];

allAmounts.forEach(({ plan, amount }) => {
  if (amount < minAmount) {
    console.log(`  ❌ ${plan}: ${amount} centavos está por debajo del mínimo (${minAmount})`);
  } else {
    console.log(`  ✅ ${plan}: ${amount} centavos está OK`);
  }
});

console.log('\n=== ANÁLISIS DE PRECISIÓN ===\n');

// Verificar problemas de precisión de punto flotante
console.log('Conversión directa vs Math.round:');
allAmounts.forEach(({ plan, amount }) => {
  const price = amount / 100;
  const directConversion = price * 100;
  const roundedConversion = Math.round(price * 100);
  
  console.log(`  ${plan}:`);
  console.log(`    Directo: ${directConversion}`);
  console.log(`    Redondeado: ${roundedConversion}`);
  console.log(`    Diferencia: ${Math.abs(directConversion - roundedConversion)}`);
});

console.log('\n=== COMPARACIÓN CON STRIPE ===\n');
console.log('Stripe espera montos en centavos enteros.');
console.log('Los montos calculados son:');
console.log(`  Plan básico anual: ${toCents(plans.basic.annual)} centavos (€19.99)`);
console.log(`  Plan pro anual: ${toCents(plans.pro.annual)} centavos (€49.99)`);
console.log('');
console.log('Ambos montos son válidos para Stripe en EUR.');

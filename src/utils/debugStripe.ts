// Utilidad temporal para debugging del error de Stripe
// Este archivo debe ser removido una vez resuelto el problema

export const debugStripePayment = (params: any) => {
  console.group('🔍 DEBUG STRIPE PAYMENT');
  
  // 1. Verificar el plan
  console.log('📌 PLAN SELECCIONADO:', params.plan_id);
  
  // 2. Verificar el monto
  console.log('💰 ANÁLISIS DEL MONTO:');
  console.log(`  - Monto enviado: ${params.amount} centavos`);
  console.log(`  - En euros: €${params.amount / 100}`);
  console.log(`  - Tipo de dato: ${typeof params.amount}`);
  console.log(`  - Es entero: ${Number.isInteger(params.amount)}`);
  
  // 3. Comparar con valores esperados
  const expectedAmounts = {
    basic: { annual: 1999, monthly: 2399 },
    pro: { annual: 4999, monthly: 5999 }
  };
  
  if (params.plan_id in expectedAmounts) {
    const expected = expectedAmounts[params.plan_id as keyof typeof expectedAmounts];
    console.log('✅ VALORES ESPERADOS PARA', params.plan_id.toUpperCase() + ':');
    console.log(`  - Anual: ${expected.annual} centavos`);
    console.log(`  - Mensual: ${expected.monthly} centavos`);
    
    const isValidAmount = params.amount === expected.annual || params.amount === expected.monthly;
    if (isValidAmount) {
      console.log('  ✅ El monto coincide con lo esperado');
    } else {
      console.error('  ❌ ADVERTENCIA: El monto NO coincide con lo esperado');
      console.error(`     Recibido: ${params.amount}`);
      console.error(`     Esperado: ${expected.annual} o ${expected.monthly}`);
    }
  }
  
  // 4. Verificar otros campos críticos
  console.log('🔐 OTROS CAMPOS:');
  console.log(`  - user_id: ${params.user_id ? '✅ Presente' : '❌ FALTA'}`);
  console.log(`  - email: ${params.email ? '✅ Presente' : '❌ FALTA'}`);
  console.log(`  - currency: ${params.currency}`);
  
  // 5. Detectar problemas comunes
  console.log('⚠️ DETECCIÓN DE PROBLEMAS:');
  
  if (params.amount < 50) {
    console.error('  ❌ Monto menor al mínimo de Stripe (50 centavos)');
  }
  
  if (!Number.isInteger(params.amount)) {
    console.error('  ❌ El monto no es un entero');
  }
  
  if (params.plan_id === 'basic' && params.amount === 1999) {
    console.log('  🎯 Configuración específica del plan básico anual detectada');
    console.log('  ℹ️ Este es el caso que está fallando');
  }
  
  // 6. Generar payload de prueba
  console.log('📋 PAYLOAD COMPLETO:');
  console.log(JSON.stringify(params, null, 2));
  
  console.groupEnd();
  
  return params;
};

// Función para comparar dos intentos de pago
export const comparePaymentAttempts = (basicAttempt: any, proAttempt: any) => {
  console.group('🔄 COMPARACIÓN PLAN BÁSICO vs PRO');
  
  console.log('DIFERENCIAS ENCONTRADAS:');
  
  // Comparar cada campo
  const keys = new Set([...Object.keys(basicAttempt), ...Object.keys(proAttempt)]);
  
  keys.forEach(key => {
    const basicValue = basicAttempt[key];
    const proValue = proAttempt[key];
    
    if (JSON.stringify(basicValue) !== JSON.stringify(proValue)) {
      console.log(`  ${key}:`);
      console.log(`    Básico: ${JSON.stringify(basicValue)}`);
      console.log(`    Pro: ${JSON.stringify(proValue)}`);
    }
  });
  
  console.groupEnd();
};

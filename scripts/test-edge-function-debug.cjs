// Script para depurar la Edge Function de create-payment-intent
// Prueba directa con los montos del plan básico y pro

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://blxngmtmknkdmikaflen.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseG5nbXRta25rZG1pa2FmbGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1MzA3MjEsImV4cCI6MjA0ODEwNjcyMX0.qnlBZiKCwCFQOGKfFNKZqOOQQTH8HQsQKGVJtf8VQSU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testPaymentIntent(planName, amount, planId) {
  console.log(`\n=== Probando ${planName} ===`);
  console.log(`Monto: €${amount/100} (${amount} centavos)`);
  
  try {
    // Simular el payload que envía el frontend
    const payload = {
      amount: amount,
      currency: 'eur',
      user_id: '3d0c10be-6aa4-432f-aef2-d480ccc802b8', // ID del usuario de prueba
      plan_id: planId,
      email: 'apoloproject.malaga@gmail.com',
      metadata: {
        frontend_mode: 'production',
        key_type: 'live',
        timestamp: new Date().toISOString(),
        environment: 'production'
      }
    };
    
    console.log('Enviando payload:', JSON.stringify(payload, null, 2));
    
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: payload
    });
    
    if (error) {
      console.error(`❌ Error para ${planName}:`, error);
      console.error('Detalles del error:', {
        message: error.message,
        status: error.status,
        details: error.details
      });
    } else {
      console.log(`✅ Éxito para ${planName}:`, {
        clientSecret: data.clientSecret ? 'Recibido' : 'No recibido',
        paymentIntentId: data.paymentIntentId || data.payment_intent_id || 'No recibido'
      });
    }
    
    return { success: !error, data, error };
  } catch (err) {
    console.error(`💥 Error inesperado para ${planName}:`, err);
    return { success: false, error: err };
  }
}

async function runTests() {
  console.log('=== INICIANDO PRUEBAS DE EDGE FUNCTION ===\n');
  console.log('URL de Supabase:', SUPABASE_URL);
  console.log('Timestamp:', new Date().toISOString());
  
  // Primero verificar que podemos conectar con Supabase
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  console.log('Estado de sesión:', sessionData ? 'Conectado' : 'No autenticado');
  
  // Probar plan básico anual
  const basicResult = await testPaymentIntent('Plan Básico Anual', 1999, 'basic');
  
  // Esperar un poco entre pruebas
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Probar plan pro anual
  const proResult = await testPaymentIntent('Plan Pro Anual', 4999, 'pro');
  
  // Resumen
  console.log('\n=== RESUMEN DE RESULTADOS ===');
  console.log('Plan Básico:', basicResult.success ? '✅ ÉXITO' : '❌ FALLO');
  console.log('Plan Pro:', proResult.success ? '✅ ÉXITO' : '❌ FALLO');
  
  if (!basicResult.success && proResult.success) {
    console.log('\n⚠️ PROBLEMA DETECTADO: El plan básico falla mientras el pro funciona.');
    console.log('Esto sugiere un problema específico con el monto o configuración del plan básico.');
  }
}

// Ejecutar las pruebas
runTests().catch(console.error);

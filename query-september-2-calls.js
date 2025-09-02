// Script para consultar llamadas del 2 de septiembre de 2025
// Usando las credenciales de Supabase del proyecto

const { createClient } = require('@supabase/supabase-js');

// URL del proyecto Supabase (extraída del código)
const supabaseUrl = 'https://blxngmtmknkdmikaflen.supabase.co';

// Nota: Necesitaremos la ANON_KEY para conectarnos
// Esta key debería estar en las variables de entorno
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY_HERE';

if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_ANON_KEY_HERE') {
  console.error('❌ ERROR: No se encontró VITE_SUPABASE_ANON_KEY');
  console.log('📝 Para obtener la key:');
  console.log('1. Ve a tu proyecto en supabase.com');
  console.log('2. Ve a Settings > API');
  console.log('3. Copia la anon/public key');
  console.log('4. Configúrala como variable de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function queryCallsForToday() {
  console.log('🔍 Consultando llamadas del 2 de septiembre de 2025...');
  console.log('📊 Tabla objetivo: agent_calls');
  
  try {
    // Consulta para el día específico
    const targetDate = '2025-09-02';
    
    // Consultar todas las llamadas del día
    const { data: calls, error: callsError } = await supabase
      .from('agent_calls')
      .select('*')
      .gte('started_at', `${targetDate}T00:00:00.000Z`)
      .lt('started_at', `${targetDate}T23:59:59.999Z`)
      .order('started_at', { ascending: false });

    if (callsError) {
      console.error('❌ Error consultando agent_calls:', callsError);
      return;
    }

    console.log(`\n📈 RESULTADOS PARA EL ${targetDate}:`);
    console.log(`📞 Total de llamadas encontradas: ${calls?.length || 0}`);
    
    if (calls && calls.length > 0) {
      console.log('\n📋 DETALLES DE LAS LLAMADAS:');
      calls.forEach((call, index) => {
        console.log(`\n${index + 1}. Llamada ID: ${call.id}`);
        console.log(`   🕐 Hora inicio: ${call.started_at}`);
        console.log(`   ⏱️  Duración: ${call.duration_seconds ? Math.round(call.duration_seconds / 60) : 'N/A'} minutos`);
        console.log(`   📊 Estado: ${call.status}`);
        console.log(`   🤖 Agente: ${call.agent_name || call.agent_id}`);
        console.log(`   👤 Usuario: ${call.user_id}`);
        console.log(`   💬 Conversación ID: ${call.conversation_id}`);
      });

      // Estadísticas del día
      const completedCalls = calls.filter(call => call.status === 'done');
      const totalMinutes = completedCalls.reduce((sum, call) => 
        sum + (call.duration_seconds ? Math.round(call.duration_seconds / 60) : 0), 0);
      
      console.log(`\n📊 ESTADÍSTICAS DEL DÍA:`);
      console.log(`   ✅ Llamadas completadas: ${completedCalls.length}`);
      console.log(`   ⏱️  Total minutos: ${totalMinutes}`);
      console.log(`   📈 Promedio por llamada: ${completedCalls.length > 0 ? Math.round(totalMinutes / completedCalls.length) : 0} min`);
    } else {
      console.log('📭 No se encontraron llamadas para esta fecha');
    }

    // También consultar tabla de uso mensual para septiembre 2025
    console.log('\n🗓️  CONSULTANDO ESTADÍSTICAS MENSUALES...');
    const { data: monthlyData, error: monthlyError } = await supabase
      .from('user_monthly_usage')
      .select('*')
      .eq('month_year', '2025-09-01');

    if (!monthlyError && monthlyData && monthlyData.length > 0) {
      console.log(`📊 Datos mensuales de septiembre 2025: ${monthlyData.length} usuarios`);
      const totalMonthlyCalls = monthlyData.reduce((sum, user) => sum + (user.total_calls || 0), 0);
      const totalMonthlyMinutes = monthlyData.reduce((sum, user) => sum + (user.total_minutes || 0), 0);
      console.log(`   📞 Total llamadas del mes: ${totalMonthlyCalls}`);
      console.log(`   ⏱️  Total minutos del mes: ${totalMonthlyMinutes}`);
    }

  } catch (error) {
    console.error('❌ Error ejecutando consulta:', error);
  }
}

// Ejecutar la consulta
queryCallsForToday();

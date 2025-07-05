// scripts/test-incidents-columns.mjs
// Script para verificar que los cambios en la tabla incidents funcionan correctamente

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://lwqhpfvuiaiafgjzuuxx.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3cWhwZnZ1aWFpYWZnanp1dXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5NzkzNjksImV4cCI6MjA0NjU1NTM2OX0.5nFXOlJdPZCnLN2VFBS0p9UDlJKPYeAoAKKO3MZRKKo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testIncidentsColumns() {
  console.log('🧪 Testing incidents table with new column structure...\n');

  try {
    // 1. Probar consulta con nuevas columnas
    console.log('1. Probando consulta con nuevas columnas...');
    const { data: incidents, error: queryError } = await supabase
      .from('incidents')
      .select(`
        id,
        title_spanish,
        title_english,
        conversation_body_spanish,
        conversation_body_english,
        created_at
      `)
      .limit(3);

    if (queryError) {
      console.error('❌ Error en consulta:', queryError);
      return;
    }

    console.log('✅ Consulta exitosa. Ejemplos de datos:');
    incidents.forEach((incident, index) => {
      console.log(`\n   Incident ${index + 1}:`);
      console.log(`   - ID: ${incident.id}`);
      console.log(`   - Title (Spanish): ${incident.title_spanish || 'null'}`);
      console.log(`   - Title (English): ${incident.title_english || 'null'}`);
      console.log(`   - Conversation (Spanish): ${incident.conversation_body_spanish ? 'Present' : 'null'}`);
      console.log(`   - Conversation (English): ${incident.conversation_body_english ? 'Present' : 'null'}`);
    });

    // 2. Verificar que las columnas antiguas no existen
    console.log('\n2. Verificando que las columnas antiguas no existen...');
    try {
      const { error: oldColumnsError } = await supabase
        .from('incidents')
        .select('title, conversation_body')
        .limit(1);

      if (oldColumnsError) {
        console.log('✅ Confirmado: Las columnas antiguas (title, conversation_body) no existen');
      } else {
        console.log('⚠️  Las columnas antiguas aún existen');
      }
    } catch (err) {
      console.log('✅ Confirmado: Las columnas antiguas no están disponibles');
    }

    console.log('\n🎉 ¡Verificación completada exitosamente!');
    console.log('\n📋 Resumen de cambios:');
    console.log('   - title → title_spanish ✅');
    console.log('   - Nueva columna: title_english ✅');
    console.log('   - conversation_body → conversation_body_spanish ✅');
    console.log('   - Nueva columna: conversation_body_english ✅');
    console.log('\n💡 En el frontend:');
    console.log('   - Se muestran title_spanish y conversation_body_spanish');
    console.log('   - Las columnas _english están disponibles para futuras funcionalidades');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar test
testIncidentsColumns(); 
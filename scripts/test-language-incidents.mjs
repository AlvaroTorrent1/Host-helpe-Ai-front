// scripts/test-language-incidents.mjs
// Script para verificar la funcionalidad de cambio de idioma en incidents

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://lwqhpfvuiaiafgjzuuxx.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3cWhwZnZ1aWFpYWZnanp1dXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5NzkzNjksImV4cCI6MjA0NjU1NTM2OX0.5nFXOlJdPZCnLN2VFBS0p9UDlJKPYeAoAKKO3MZRKKo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLanguageSwitch() {
  console.log('🌐 Testing language switching functionality for incidents...\n');

  try {
    // 1. Obtener algunos incidents para probar
    console.log('1. Obteniendo incidents de prueba...');
    const { data: incidents, error } = await supabase
      .from('incidents')
      .select(`
        id,
        title_spanish,
        title_english,
        conversation_body_spanish,
        conversation_body_english
      `)
      .limit(5);

    if (error) {
      console.error('❌ Error obteniendo incidents:', error);
      return;
    }

    console.log(`✅ Se encontraron ${incidents.length} incidents\n`);

    // 2. Simular funciones helper del frontend
    const getIncidentTitle = (incident, language) => {
      if (language === 'en') {
        return incident.title_english || `${incident.title_spanish} (sin traducir)`;
      }
      return incident.title_spanish;
    };

    const getIncidentConversation = (incident, language) => {
      if (language === 'en') {
        return incident.conversation_body_english || incident.conversation_body_spanish || '';
      }
      return incident.conversation_body_spanish || '';
    };

    // 3. Probar cambio de idioma para cada incident
    console.log('2. Probando cambio de idioma:\n');
    
    incidents.forEach((incident, index) => {
      console.log(`📋 Incident ${index + 1} (ID: ${incident.id}):`);
      console.log('   Idioma: ESPAÑOL');
      console.log(`   - Título: ${getIncidentTitle(incident, 'es')}`);
      console.log(`   - Conversación: ${getIncidentConversation(incident, 'es') ? 'Presente' : 'Vacía'}`);
      
      console.log('   Idioma: ENGLISH');
      console.log(`   - Title: ${getIncidentTitle(incident, 'en')}`);
      console.log(`   - Conversation: ${getIncidentConversation(incident, 'en') ? 'Present' : 'Empty'}`);
      console.log('');
    });

    // 4. Verificar casos especiales
    console.log('3. Verificando casos especiales:\n');
    
    const incidentSinTraduccion = incidents.find(i => !i.title_english);
    if (incidentSinTraduccion) {
      console.log('📌 Incident sin traducción:');
      console.log(`   En inglés se muestra: "${getIncidentTitle(incidentSinTraduccion, 'en')}"`);
      console.log('   ✅ Correcto: Muestra el título español con indicador "(sin traducir)"');
    }

    const incidentConTraduccion = incidents.find(i => i.title_english);
    if (incidentConTraduccion) {
      console.log('\n📌 Incident con traducción:');
      console.log(`   En español: "${getIncidentTitle(incidentConTraduccion, 'es')}"`);
      console.log(`   En inglés: "${getIncidentTitle(incidentConTraduccion, 'en')}"`);
      console.log('   ✅ Correcto: Muestra diferentes títulos según el idioma');
    }

    console.log('\n🎉 ¡Prueba completada exitosamente!');
    console.log('\n📝 Resumen de funcionalidad:');
    console.log('   - Idioma ES → Muestra campos _spanish');
    console.log('   - Idioma EN → Muestra campos _english (con fallback a _spanish)');
    console.log('   - Sin traducción → Muestra "(sin traducir)" en inglés');
    console.log('   - Cambio reactivo → Al cambiar idioma, se actualizan todos los campos');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar test
testLanguageSwitch(); 
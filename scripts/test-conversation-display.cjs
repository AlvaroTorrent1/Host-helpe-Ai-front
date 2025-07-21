// scripts/test-conversation-display.cjs
// Script para verificar que el contenido de conversaciones sea accesible

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qwhcuptrmdtyqzlowmxd.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3aGN1cHRybWR0eXF6bG93bXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MTQ1MDUsImV4cCI6MjA1MDE5MDUwNX0.w4yvpyqmhP_vJC4_Lj8qJ-nB8bOUfRZwvP8Sp5tEbag';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConversationDisplay() {
  console.log('💬 Testing Conversation Display...\n');

  try {
    // 1. Obtener incidencias con el mismo query que usa el dashboard
    console.log('📋 Step 1: Fetching incidents with same query as dashboard...');
    
    const { data: incidentsData, error: incidentsError } = await supabase
      .from('incidents')
      .select(`
        id,
        title_spanish,
        title_english,
        description,
        property_id,
        category,
        status,
        phone_number,
        conversation_body_spanish,
        conversation_body_english,
        created_at,
        properties!inner(
          name,
          user_id
        )
      `)
      .eq('property_id', '532e2df0-51f3-4c11-a431-d1ae7191784c')
      .order('created_at', { ascending: false })
      .limit(5);

    if (incidentsError) {
      console.error('❌ Error fetching incidents:', incidentsError);
      return;
    }

    console.log(`✅ Found ${incidentsData.length} incidents\n`);

    // 2. Test cada incidencia
    console.log('🔍 Step 2: Testing conversation content for each incident...\n');
    
    incidentsData.forEach((incident, index) => {
      console.log(`--- Incident ${index + 1}: ${incident.title_spanish} ---`);
      console.log(`Category: ${incident.category}`);
      console.log(`Status: ${incident.status}`);
      
      // Simular lógica de getIncidentConversation
      const conversationSpanish = incident.conversation_body_spanish?.trim() || '';
      const conversationEnglish = incident.conversation_body_english?.trim() || '';
      const description = incident.description?.trim() || '';
      
      console.log(`Conversation (Spanish): ${conversationSpanish ? 'YES' : 'NO'} (${conversationSpanish.length} chars)`);
      console.log(`Conversation (English): ${conversationEnglish ? 'YES' : 'NO'} (${conversationEnglish.length} chars)`);
      console.log(`Description: ${description ? 'YES' : 'NO'} (${description.length} chars)`);
      
      // Mostrar preview del contenido
      if (conversationSpanish) {
        console.log(`Preview: "${conversationSpanish.substring(0, 80)}${conversationSpanish.length > 80 ? '...' : ''}"`);
      } else if (description) {
        console.log(`Preview (fallback): "${description.substring(0, 80)}${description.length > 80 ? '...' : ''}"`);
      } else {
        console.log(`Preview: NO CONTENT AVAILABLE`);
      }
      
      console.log(''); // Línea en blanco
    });

    // 3. Test función parseConversation simulada
    console.log('🔧 Step 3: Testing parseConversation logic...\n');
    
    const sampleTexts = [
      // Texto plano (como nuestros datos de muestra)
      'Hola, soy María. Llegué a Casa María Flora pero el código que me enviaste no funciona.',
      
      // Formato estructurado
      'Usuario: Hola, tengo un problema\nAgente: ¿En qué puedo ayudarte?\nUsuario: No funciona el WiFi',
      
      // Texto vacío
      '',
      
      // Solo espacios
      '   \n  \t  '
    ];

    sampleTexts.forEach((text, index) => {
      console.log(`Test ${index + 1}: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
      
      // Simular parseConversation
      if (!text?.trim()) {
        console.log('  → Result: Empty array (no content)');
        return;
      }

      let messages = [];
      
      if (text.includes('Usuario:') || text.includes('Agente:')) {
        console.log('  → Detected: Structured format');
        // Simulación básica del parsing estructurado
        const parts = text.split(/(Usuario:|Agente:)/g);
        messages = [`Structured: ${parts.length} parts`];
      } else {
        console.log('  → Detected: Plain text format');
        messages = [{
          sender: 'usuario',
          text: text.trim()
        }];
      }
      
      console.log(`  → Result: ${messages.length} message(s)`);
      console.log('');
    });

    console.log('🎉 Conversation Display Test Complete!');
    console.log('\n💡 What to check in the dashboard:');
    console.log('   1. Click on any incident title with a chat icon');
    console.log('   2. Modal should open showing conversation content');
    console.log('   3. Content should appear as chat bubbles');
    console.log('   4. If no structured format, content shows as single user message');

  } catch (error) {
    console.error('❌ Unexpected error during test:', error);
  }
}

// Ejecutar test
testConversationDisplay(); 
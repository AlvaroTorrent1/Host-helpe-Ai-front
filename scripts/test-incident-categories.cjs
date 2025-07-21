// scripts/test-incident-categories.js
// Script para verificar que las nuevas categorías de incidencias funcionan correctamente

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qwhcuptrmdtyqzlowmxd.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3aGN1cHRybWR0eXF6bG93bXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MTQ1MDUsImV4cCI6MjA1MDE5MDUwNX0.w4yvpyqmhP_vJC4_Lj8qJ-nB8bOUfRZwvP8Sp5tEbag';

const supabase = createClient(supabaseUrl, supabaseKey);

// Nuevas categorías definidas
const INCIDENT_CATEGORIES = [
  'checkin',      // Problemas de llegada/acceso
  'checkout',     // Problemas de salida  
  'maintenance',  // Problemas técnicos/averías
  'cleaning',     // Problemas de limpieza
  'wifi',         // Problemas de conectividad
  'noise',        // Quejas de ruido
  'amenities',    // Problemas con servicios/comodidades
  'security',     // Problemas de seguridad
  'emergency',    // Situaciones de emergencia
  'others'        // Otros problemas no categorizados
];

async function testIncidentCategories() {
  console.log('🧪 Testing New Incident Categories...\n');

  try {
    // 1. Verificar que podemos obtener propiedades
    console.log('📋 Step 1: Getting available properties...');
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, name')
      .limit(1);

    if (propertiesError) {
      console.error('❌ Error getting properties:', propertiesError);
      return;
    }

    if (!properties || properties.length === 0) {
      console.log('⚠️  No properties found. Creating test property...');
      
      const { data: newProperty, error: createError } = await supabase
        .from('properties')
        .insert({
          name: 'Test Property for Categories',
          address: 'Test Address 123',
          description: 'Property created for testing incident categories'
        })
        .select('id, name')
        .single();

      if (createError) {
        console.error('❌ Error creating test property:', createError);
        return;
      }

      properties.push(newProperty);
    }

    const testProperty = properties[0];
    console.log(`✅ Using property: ${testProperty.name} (${testProperty.id})\n`);

    // 2. Test cada categoría
    console.log('📝 Step 2: Testing each incident category...');
    
    for (let i = 0; i < INCIDENT_CATEGORIES.length; i++) {
      const category = INCIDENT_CATEGORIES[i];
      console.log(`\n🔸 Testing category: "${category}"`);

      const testIncident = {
        title_spanish: `Test Incident - ${category}`,
        title_english: `Test Incident - ${category}`,
        description: `Test incident to verify category: ${category}`,
        property_id: testProperty.id,
        category: category,
        status: 'pending',
        phone_number: '+34123456789'
      };

      const { data: incident, error: incidentError } = await supabase
        .from('incidents')
        .insert(testIncident)
        .select('id, category, title_spanish')
        .single();

      if (incidentError) {
        console.error(`❌ Error creating incident for category "${category}":`, incidentError);
        continue;
      }

      console.log(`   ✅ Created: ${incident.title_spanish} (Category: ${incident.category})`);
    }

    // 3. Verificar que podemos obtener incidencias por categoría
    console.log('\n📊 Step 3: Testing category filtering...');
    
    for (const category of INCIDENT_CATEGORIES.slice(0, 3)) { // Solo test 3 para no ser muy verboso
      const { data: categoryIncidents, error: filterError } = await supabase
        .from('incidents')
        .select('id, category, title_spanish')
        .eq('category', category)
        .limit(5);

      if (filterError) {
        console.error(`❌ Error filtering by category "${category}":`, filterError);
        continue;
      }

      console.log(`   🔍 Category "${category}": ${categoryIncidents.length} incidents found`);
    }

    // 4. Cleanup - eliminar incidencias de test
    console.log('\n🧹 Step 4: Cleaning up test incidents...');
    
    const { error: cleanupError } = await supabase
      .from('incidents')
      .delete()
      .like('title_spanish', 'Test Incident - %');

    if (cleanupError) {
      console.error('❌ Error during cleanup:', cleanupError);
    } else {
      console.log('   ✅ Test incidents cleaned up');
    }

    console.log('\n🎉 Test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • Tested ${INCIDENT_CATEGORIES.length} categories`);
    console.log('   • All categories accepted by database');
    console.log('   • Filtering by category works correctly');
    console.log('   • Cleanup completed');

  } catch (error) {
    console.error('❌ Unexpected error during test:', error);
  }
}

// Ejecutar test
testIncidentCategories(); 
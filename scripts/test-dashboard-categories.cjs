// scripts/test-dashboard-categories.cjs
// Script para verificar que las categorías se muestran correctamente en el dashboard

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qwhcuptrmdtyqzlowmxd.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3aGN1cHRybWR0eXF6bG93bXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MTQ1MDUsImV4cCI6MjA1MDE5MDUwNX0.w4yvpyqmhP_vJC4_Lj8qJ-nB8bOUfRZwvP8Sp5tEbag';

const supabase = createClient(supabaseUrl, supabaseKey);

// Categorías que deben aparecer en el dashboard
const EXPECTED_CATEGORIES = [
  'checkin',      // Check-in
  'checkout',     // Check-out  
  'maintenance',  // Mantenimiento
  'cleaning',     // Limpieza
  'wifi',         // WiFi
  'noise',        // Ruido
  'amenities',    // Servicios
  'security',     // Seguridad
  'emergency',    // Emergencia
  'others'        // Otros
];

async function testDashboardCategories() {
  console.log('🖥️  Testing Dashboard Categories Display...\n');

  try {
    // 1. Crear algunas incidencias de muestra con las nuevas categorías
    console.log('📝 Step 1: Creating sample incidents with new categories...');
    
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, name')
      .limit(1);

    if (propertiesError || !properties?.length) {
      console.error('❌ No properties available for testing');
      return;
    }

    const testProperty = properties[0];
    console.log(`✅ Using property: ${testProperty.name}`);

    // Crear una incidencia para cada categoría
    const sampleIncidents = EXPECTED_CATEGORIES.map((category, index) => ({
      title_spanish: `Incidencia ${category} ${index + 1}`,
      title_english: `Incident ${category} ${index + 1}`,
      description: `Sample incident for category: ${category}`,
      property_id: testProperty.id,
      category: category,
      status: 'pending',
      phone_number: '+34123456789'
    }));

    const { data: createdIncidents, error: createError } = await supabase
      .from('incidents')
      .insert(sampleIncidents)
      .select('id, category, title_spanish');

    if (createError) {
      console.error('❌ Error creating sample incidents:', createError);
      return;
    }

    console.log(`✅ Created ${createdIncidents.length} sample incidents\n`);

    // 2. Verificar que el endpoint funciona correctamente
    console.log('🔍 Step 2: Testing incidents query...');
    
    const { data: incidents, error: queryError } = await supabase
      .from('incidents')
      .select(`
        id,
        title_spanish,
        category,
        status,
        phone_number,
        created_at,
        property_id
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (queryError) {
      console.error('❌ Error querying incidents:', queryError);
      return;
    }

    console.log(`✅ Found ${incidents.length} total incidents`);

    // 3. Verificar categorías únicas
    console.log('\n📊 Step 3: Analyzing available categories...');
    const uniqueCategories = [...new Set(incidents.map(incident => incident.category))];
    
    console.log('Available categories in database:');
    uniqueCategories.forEach(category => {
      const count = incidents.filter(inc => inc.category === category).length;
      console.log(`   • ${category}: ${count} incidents`);
    });

    // 4. Verificar que todas nuestras categorías están representadas
    console.log('\n✅ Step 4: Verification results...');
    const missingCategories = EXPECTED_CATEGORIES.filter(cat => !uniqueCategories.includes(cat));
    const extraCategories = uniqueCategories.filter(cat => !EXPECTED_CATEGORIES.includes(cat));

    if (missingCategories.length === 0) {
      console.log('✅ All expected categories are present!');
    } else {
      console.log(`⚠️  Missing categories: ${missingCategories.join(', ')}`);
    }

    if (extraCategories.length > 0) {
      console.log(`ℹ️  Additional categories found: ${extraCategories.join(', ')}`);
    }

    // 5. Test filtrado por categoría
    console.log('\n🔍 Step 5: Testing category filtering...');
    for (const category of EXPECTED_CATEGORIES.slice(0, 3)) {
      const { data: filtered, error: filterError } = await supabase
        .from('incidents')
        .select('id, title_spanish, category')
        .eq('category', category);

      if (filterError) {
        console.error(`❌ Error filtering by ${category}:`, filterError);
        continue;
      }

      console.log(`   • Filter "${category}": ${filtered.length} results`);
    }

    // 6. Cleanup
    console.log('\n🧹 Step 6: Cleaning up test data...');
    const testIncidentIds = createdIncidents.map(inc => inc.id);
    
    const { error: cleanupError } = await supabase
      .from('incidents')
      .delete()
      .in('id', testIncidentIds);

    if (cleanupError) {
      console.error('❌ Error during cleanup:', cleanupError);
    } else {
      console.log('✅ Test incidents cleaned up');
    }

    console.log('\n🎉 Dashboard Categories Test Complete!');
    console.log('\n📋 Summary:');
    console.log(`   • Expected categories: ${EXPECTED_CATEGORIES.length}`);
    console.log(`   • Categories in DB: ${uniqueCategories.length}`);
    console.log(`   • Missing: ${missingCategories.length}`);
    console.log(`   • Extra: ${extraCategories.length}`);
    console.log('\n💡 Next steps:');
    console.log('   • Check localhost:4001/dashboard to see the categories dropdown');
    console.log('   • Verify all 10 categories appear in the filter dropdown');
    console.log('   • Test filtering functionality in the UI');

  } catch (error) {
    console.error('❌ Unexpected error during test:', error);
  }
}

// Ejecutar test
testDashboardCategories(); 
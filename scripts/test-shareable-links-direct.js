// scripts/test-shareable-links-direct.js
// Script para probar la funcionalidad de shareable links directamente

// Función de validación de URL
function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

// Función principal de prueba usando fetch directo
async function runTest() {
  console.log('🧪 === INICIANDO PRUEBA DIRECTA DE SHAREABLE LINKS ===\n');
  
  try {
    // Configuración directa de Supabase
    const supabaseUrl = 'https://kgrzaavlubmfagwxxnjl.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncnphYXZsdWJtZmFnd3h4bmpsiwiuiWI5jb2xlIjoiYW5vbiIsImlhdCI6MTY5OTAwOTMwNCwiZXhwIjoyMDE0NTg1MzA0fQ.qFG0MjL9BZcgEeRc1wPvGG5xr7c6bkNq8kp1Dg2_1YM';
    
    // Verificar si ya existen enlaces para limpiar la prueba
    console.log('🧹 Verificando enlaces existentes...');
    
    const checkResponse = await fetch(`${supabaseUrl}/rest/v1/shareable_links?select=*&property_id=eq.7b3beac4-8fca-49c8-b7e8-77b9800d837d&link_type=eq.profile`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (checkResponse.ok) {
      const existingLinks = await checkResponse.json();
      console.log(`📋 Enlaces existentes encontrados: ${existingLinks.length}`);
      
      if (existingLinks.length > 0) {
        console.log('Eliminando enlaces existentes para limpiar la prueba...');
        for (const link of existingLinks) {
          await fetch(`${supabaseUrl}/rest/v1/shareable_links?id=eq.${link.id}`, {
            method: 'DELETE',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
            }
          });
        }
        console.log('✅ Enlaces existentes eliminados');
      }
    }
    
    // URLs de prueba (simular lo que vendría del formulario)
    const testUrls = [
      'https://business.google.com/test-property-1',
      'https://maps.google.com/test-property-1', 
      '', // URL vacía (debe ser filtrada)
      'invalid-url', // URL inválida (debe ser filtrada)
      'https://business.google.com/test-property-2'
    ];
    
    console.log('\n📝 URLs de entrada para la prueba:');
    testUrls.forEach((url, i) => {
      console.log(`  ${i + 1}. "${url}"`);
    });
    
    // Filtrar URLs válidas
    console.log('\n🔍 Validando URLs...');
    const validUrls = testUrls.filter(url => {
      const isValid = isValidUrl(url);
      console.log(`  URL "${url}" es válida: ${isValid}`);
      return isValid;
    });
    
    console.log(`\n📋 URLs válidas después del filtro: ${validUrls.length}/${testUrls.length}`);
    
    if (validUrls.length === 0) {
      throw new Error('No se proporcionaron URLs válidas');
    }
    
    // Crear objetos de links
    const links = validUrls.map((url, index) => ({
      property_id: '7b3beac4-8fca-49c8-b7e8-77b9800d837d', // ID de propiedad existente
      link_type: 'profile',
      public_url: url,
      title: `Google Business Profile ${index > 0 ? index + 1 : ''}`.trim(),
      description: 'Perfil de Google Business de la propiedad - PRUEBA',
      is_active: true,
      created_for: 'general',
      click_count: 0
    }));
    
    console.log('\n📋 Links a crear:');
    links.forEach((link, i) => {
      console.log(`  ${i + 1}. ${link.title}: ${link.public_url}`);
    });
    
    // Insertar en la base de datos usando API REST de Supabase
    console.log('\n💾 Insertando enlaces en la base de datos...');
    
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/shareable_links`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(links)
    });
    
    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      console.error('Error status:', insertResponse.status);
      console.error('Error response:', errorText);
      throw new Error(`Error ${insertResponse.status}: ${errorText}`);
    }
    
    const createdLinks = await insertResponse.json();
    
    console.log('\n✅ Enlaces creados exitosamente:');
    createdLinks.forEach(link => {
      console.log(`  - ID: ${link.id}, URL: ${link.public_url}`);
    });
    
    console.log(`\n🎉 PRUEBA EXITOSA: ${createdLinks.length} enlaces creados`);
    
    // Verificar que están en la base de datos
    console.log('\n🔍 Verificando enlaces en la base de datos...');
    const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/shareable_links?select=*&property_id=eq.7b3beac4-8fca-49c8-b7e8-77b9800d837d&link_type=eq.profile`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (verifyResponse.ok) {
      const dbLinks = await verifyResponse.json();
      console.log(`📊 Enlaces encontrados en BD: ${dbLinks.length}`);
      
      dbLinks.forEach(link => {
        console.log(`  - ${link.title}: ${link.public_url} (ID: ${link.id})`);
      });
    } else {
      console.error('Error verificando BD:', await verifyResponse.text());
    }
    
  } catch (error) {
    console.error('\n❌ PRUEBA FALLIDA:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Ejecutar la prueba
runTest(); 
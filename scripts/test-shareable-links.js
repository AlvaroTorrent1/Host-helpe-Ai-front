// scripts/test-shareable-links.js
// Script para probar la funcionalidad de shareable links

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase (usando las mismas variables que la app)
const supabaseUrl = 'https://kgrzaavlubmfagwxxnjl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncnphYXZsdWJtZmFnd3h4bmpsiwiw2V' + 
                   'yb2xlIjoiYW5vbiIsImlhdCI6MTY5OTAwOTMwNCwiZXhwIjoyMDE0NTg1MzA0fQ.qFG0MjL9BZcgEeRc1wPvGG5xr7c6bkNq8kp1Dg2_1YM';

const supabase = createClient(supabaseUrl, supabaseKey);

// Función de validación de URL (copiada de shareableLinkService)
function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

// Función para crear enlaces de Google Business (simplificada)
async function createGoogleBusinessLinks(propertyId, urls) {
  console.log('🔍 Iniciando prueba de creación de enlaces...');
  console.log('Property ID:', propertyId);
  console.log('URLs recibidas:', urls);
  
  try {
    // Filtrar URLs válidas
    const validUrls = urls.filter(url => {
      const isValid = isValidUrl(url);
      console.log(`URL "${url}" es válida: ${isValid}`);
      return isValid;
    });
    
    console.log(`URLs válidas después del filtro: ${validUrls.length}/${urls.length}`);
    
    if (validUrls.length === 0) {
      throw new Error('No se proporcionaron URLs válidas');
    }
    
    // Crear objetos de links
    const links = validUrls.map((url, index) => ({
      property_id: propertyId,
      link_type: 'profile',
      public_url: url,
      title: `Google Business Profile ${index > 0 ? index + 1 : ''}`.trim(),
      description: 'Perfil de Google Business de la propiedad',
      is_active: true,
      created_for: 'general',
      click_count: 0
    }));
    
    console.log('📋 Links a crear:');
    links.forEach((link, i) => {
      console.log(`  ${i + 1}. ${link.title}: ${link.public_url}`);
    });
    
    // Insertar en la base de datos
    const { data, error } = await supabase
      .from('shareable_links')
      .insert(links)
      .select();
    
    if (error) {
      console.error('❌ Error insertando en BD:', error);
      throw error;
    }
    
    console.log('✅ Enlaces creados exitosamente:');
    data.forEach(link => {
      console.log(`  - ID: ${link.id}, URL: ${link.public_url}`);
    });
    
    return data;
    
  } catch (error) {
    console.error('❌ Error en createGoogleBusinessLinks:', error);
    throw error;
  }
}

// Función principal de prueba
async function runTest() {
  console.log('🧪 === INICIANDO PRUEBA DE SHAREABLE LINKS ===\n');
  
  try {
    // Obtener una propiedad existente para usar en la prueba
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id, name')
      .limit(1);
    
    if (propError || !properties || properties.length === 0) {
      throw new Error('No se encontraron propiedades para la prueba');
    }
    
    const testProperty = properties[0];
    console.log(`🏠 Usando propiedad de prueba: ${testProperty.name} (${testProperty.id})\n`);
    
    // URLs de prueba (simular lo que vendría del formulario)
    const testUrls = [
      'https://business.google.com/property-1',
      'https://maps.google.com/property-1',
      '', // URL vacía (debe ser filtrada)
      'invalid-url', // URL inválida (debe ser filtrada)
      'https://business.google.com/property-2'
    ];
    
    console.log('📝 URLs de entrada para la prueba:');
    testUrls.forEach((url, i) => {
      console.log(`  ${i + 1}. "${url}"`);
    });
    console.log('');
    
    // Ejecutar la función de creación
    const createdLinks = await createGoogleBusinessLinks(testProperty.id, testUrls);
    
    console.log(`\n🎉 PRUEBA EXITOSA: ${createdLinks.length} enlaces creados`);
    
    // Verificar que están en la base de datos
    const { data: dbLinks, error: dbError } = await supabase
      .from('shareable_links')
      .select('*')
      .eq('property_id', testProperty.id)
      .eq('link_type', 'profile');
    
    if (dbError) {
      console.error('Error verificando BD:', dbError);
    } else {
      console.log(`\n🔍 Verificación en BD: ${dbLinks.length} enlaces encontrados para esta propiedad`);
    }
    
  } catch (error) {
    console.error('\n❌ PRUEBA FALLIDA:', error.message);
    
    if (error.details) {
      console.error('Detalles del error:', error.details);
    }
    
    if (error.hint) {
      console.error('Pista:', error.hint);
    }
  }
}

// Ejecutar la prueba
runTest(); 
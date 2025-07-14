// scripts/debug-shareable-links-browser.js
// Este script se debe ejecutar en la consola del navegador (F12 > Console)
// cuando la aplicación esté cargada para debuggear el problema de enlaces shareables

console.log('🔧 === DEBUG SHAREABLE LINKS ===');

// Función para probar la creación de enlaces manualmente
async function testShareableLinksCreation() {
  console.log('🧪 Iniciando prueba de shareable links...');
  
  try {
    // Verificar que shareableLinkService esté disponible
    if (typeof shareableLinkService === 'undefined') {
      console.error('❌ shareableLinkService no está disponible');
      console.log('Intentando importar...');
      
      // Intentar acceder al servicio desde el contexto de la aplicación
      const service = window.shareableLinkService;
      if (!service) {
        console.error('❌ No se pudo acceder al servicio. Asegúrate de estar en la página de creación de propiedades');
        return;
      }
    }
    
    // URLs de prueba
    const testUrls = [
      'https://business.google.com/debug-test-1',
      'https://maps.google.com/debug-test-2'
    ];
    
    // ID de propiedad existente (usar la primera disponible)
    const properties = await window.supabase
      .from('properties')
      .select('id, name')
      .limit(1);
    
    if (!properties.data || properties.data.length === 0) {
      console.error('❌ No hay propiedades disponibles para la prueba');
      return;
    }
    
    const testPropertyId = properties.data[0].id;
    console.log(`🏠 Usando propiedad ID: ${testPropertyId}`);
    
    // Intentar crear enlaces
    console.log('📤 Creando enlaces de prueba...');
    const result = await window.shareableLinkService.createGoogleBusinessLinks(
      testPropertyId,
      testUrls
    );
    
    console.log('✅ Resultado:', result);
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    console.error('Stack:', error.stack);
  }
}

// Función para verificar enlaces existentes
async function checkExistingLinks() {
  console.log('🔍 Verificando enlaces existentes...');
  
  try {
    const { data, error } = await window.supabase
      .from('shareable_links')
      .select('*')
      .eq('link_type', 'profile');
    
    if (error) {
      console.error('❌ Error consultando enlaces:', error);
      return;
    }
    
    console.log(`📊 Enlaces encontrados: ${data.length}`);
    data.forEach(link => {
      console.log(`  - ${link.title}: ${link.public_url} (Propiedad: ${link.property_id})`);
    });
    
  } catch (error) {
    console.error('❌ Error verificando enlaces:', error);
  }
}

// Función para verificar la estructura de datos del formulario
function debugFormData() {
  console.log('🔍 Debuggeando datos del formulario...');
  
  // Buscar inputs de Google Business URLs en el DOM
  const urlInputs = document.querySelectorAll('input[id^="google_business_url_"]');
  
  if (urlInputs.length === 0) {
    console.warn('⚠️ No se encontraron inputs de Google Business URLs. Asegúrate de estar en el paso 4 del formulario');
    return;
  }
  
  console.log(`📝 Inputs encontrados: ${urlInputs.length}`);
  
  urlInputs.forEach((input, index) => {
    console.log(`  Input ${index}: "${input.value}"`);
  });
  
  // Verificar si React DevTools está disponible para acceder al state
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('🔧 React DevTools detectado. Busca el componente PropertyForm para ver el state de googleBusinessUrls');
  }
}

// Función para interceptar llamadas al servicio
function interceptServiceCalls() {
  console.log('🕵️ Interceptando llamadas al servicio...');
  
  // Interceptar console.log para capturar logs del servicio
  const originalLog = console.log;
  console.log = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('🔗')) {
      console.warn('🎯 INTERCEPTED SHAREABLE LINK CALL:', ...args);
    }
    originalLog.apply(console, args);
  };
  
  console.log('✅ Interceptor activado. Ahora intenta crear una propiedad con enlaces de Google Business');
}

// Funciones disponibles
console.log('🛠️ Funciones disponibles:');
console.log('  - testShareableLinksCreation(): Prueba manual de creación');
console.log('  - checkExistingLinks(): Ver enlaces existentes');
console.log('  - debugFormData(): Debuggear datos del formulario');
console.log('  - interceptServiceCalls(): Interceptar llamadas del servicio');

// Auto-verificar el estado actual
checkExistingLinks();
debugFormData(); 
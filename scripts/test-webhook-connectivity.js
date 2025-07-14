// scripts/test-webhook-connectivity.js
// Script para verificar conectividad con el webhook de n8n corregido

console.log('🌐 === VERIFICANDO CONECTIVIDAD DEL WEBHOOK ===\n');

async function testWebhookConnectivity() {
  const webhookUrl = 'https://hosthelperai.app.n8n.cloud/webhook/pdf';
  
  try {
    console.log(`🎯 Probando conectividad con: ${webhookUrl}`);
    
    // Probar con GET primero (health check)
    console.log('📡 Enviando GET request (health check)...');
    const getResponse = await fetch(webhookUrl, {
      method: 'GET'
    });
    
    console.log(`📊 GET Response: ${getResponse.status} ${getResponse.statusText}`);
    
    if (getResponse.status === 405) {
      console.log('✅ Webhook está activo (405 = Method Not Allowed para GET es normal)');
    } else if (getResponse.status === 200) {
      console.log('✅ Webhook está activo (200 OK)');
    } else {
      console.log(`⚠️ Respuesta inesperada: ${getResponse.status}`);
    }
    
    // Crear un FormData de prueba simple
    console.log('\n📤 Probando envío con FormData de prueba...');
    const testFormData = new FormData();
    
    // Crear archivo de prueba muy simple
    const testContent = 'Test de conectividad webhook';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFile = new File([testBlob], 'test-connectivity.txt', { type: 'text/plain' });
    
    testFormData.append('file', testFile);
    testFormData.append('property_id', 'test-property-id');
    testFormData.append('test', 'connectivity-check');
    
    const postResponse = await fetch(webhookUrl, {
      method: 'POST',
      body: testFormData
    });
    
    console.log(`📊 POST Response: ${postResponse.status} ${postResponse.statusText}`);
    
    if (postResponse.ok) {
      const result = await postResponse.json();
      console.log('✅ Webhook procesó el archivo correctamente:', result);
    } else {
      const errorText = await postResponse.text();
      console.log(`❌ Error del webhook: ${errorText}`);
      
      if (postResponse.status === 404) {
        console.log('🚨 ERROR: Webhook no encontrado - verificar URL en n8n');
      } else if (postResponse.status >= 500) {
        console.log('🚨 ERROR: Problema del servidor n8n');
      }
    }
    
  } catch (error) {
    console.error('❌ Error de conectividad:', error.message);
    
    if (error.message.includes('fetch')) {
      console.error('🌐 Problema de red - verificar conexión a internet');
    }
  }
}

// Función para mostrar información de depuración
function showDebugInfo() {
  console.log('\n🔍 === INFORMACIÓN DE DEBUG ===');
  console.log('URL corregida del webhook:', 'https://hosthelperai.app.n8n.cloud/webhook/pdf');
  console.log('Path en n8n debe ser:', '"pdf"');
  console.log('Configuración FormData esperada:');
  console.log('  - file: [archivo binario]');
  console.log('  - property_id: [UUID de propiedad]');
  console.log('  - property_name: [nombre de propiedad]');
  console.log('  - document_name: [nombre del documento]');
  console.log('  - document_type: [tipo de documento]');
}

if (typeof fetch === 'undefined') {
  console.error('❌ Este script debe ejecutarse en un navegador con fetch disponible');
} else {
  console.log('🛠️ Funciones disponibles:');
  console.log('  - testWebhookConnectivity(): Probar conectividad');
  console.log('  - showDebugInfo(): Mostrar información de debug');
  
  // Ejecutar automáticamente
  testWebhookConnectivity();
  
  // Hacer funciones disponibles globalmente si estamos en el navegador
  if (typeof window !== 'undefined') {
    window.testWebhookConnectivity = testWebhookConnectivity;
    window.showDebugInfo = showDebugInfo;
  }
} 
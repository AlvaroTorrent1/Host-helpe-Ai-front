// scripts/test-webhook-debug.js
// Script para debuggear qué datos llegan al webhook de n8n y verificar el flujo completo

console.log('🔍 === DEBUG WEBHOOK N8N - VERIFICACIÓN DE DATOS ===\n');

// Función para crear un archivo de prueba simple
function createSimpleTestFile() {
  const content = `Documento de prueba para verificar property_id en n8n
Timestamp: ${new Date().toISOString()}
Este archivo debe procesarse correctamente.`;
  
  const blob = new Blob([content], { type: 'text/plain' });
  return new File([blob], 'test-property-id-debug.txt', { type: 'text/plain' });
}

// Función principal para probar el webhook
async function debugWebhookData() {
  try {
    console.log('🏠 Obteniendo datos de prueba...');
    
    // Obtener primera propiedad disponible
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id, name')
      .limit(1);
    
    if (propError || !properties || properties.length === 0) {
      throw new Error('No se encontraron propiedades. Crea una propiedad primero.');
    }
    
    const testProperty = properties[0];
    console.log(`✅ Propiedad de prueba: ${testProperty.name}`);
    console.log(`✅ Property ID: ${testProperty.id}`);
    
    // Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    
    console.log(`✅ Usuario: ${user.email} (${user.id})`);
    
    // Crear archivo de prueba
    const testFile = createSimpleTestFile();
    console.log(`✅ Archivo: ${testFile.name} (${testFile.size} bytes)`);
    
    // Preparar datos exactamente como los envía webhookDocumentService
    const formData = new FormData();
    formData.append('file', testFile);
    formData.append('property_id', testProperty.id);
    formData.append('property_name', testProperty.name);
    formData.append('user_id', user.id);
    formData.append('timestamp', new Date().toISOString());
    formData.append('document_name', 'Test Property ID Debug');
    formData.append('document_type', 'other');
    formData.append('document_description', 'Documento para verificar property_id en n8n');
    
    console.log('\n📊 === DATOS ENVIADOS AL WEBHOOK ===');
    console.log('FormData fields:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: [File] ${value.name} (${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}: "${value}"`);
      }
    }
    
    // Crear objeto para mostrar datos exactos
    const dataObject = {
      property_id: testProperty.id,
      property_name: testProperty.name,
      user_id: user.id,
      timestamp: new Date().toISOString(),
      document_name: 'Test Property ID Debug',
      document_type: 'other',
      document_description: 'Documento para verificar property_id en n8n',
      file_info: {
        name: testFile.name,
        size: testFile.size,
        type: testFile.type
      }
    };
    
    console.log('\n📋 === ESTRUCTURA DE DATOS ESPERADA EN N8N ===');
    console.log('$json.property_id:', dataObject.property_id);
    console.log('$json.property_name:', dataObject.property_name);
    console.log('$json.user_id:', dataObject.user_id);
    console.log('$json.document_name:', dataObject.document_name);
    console.log('$json.document_type:', dataObject.document_type);
    
    console.log('\n🎯 === CONFIGURACIÓN REQUERIDA EN N8N ===');
    console.log('En el nodo VectorStoreSupabase, sección Metadata:');
    console.log('  property_id: {{ $json.property_id }}');
    console.log('  property_name: {{ $json.property_name }}');
    console.log('  document_type: {{ $json.document_type }}');
    console.log('  document_name: {{ $json.document_name }}');
    
    // Verificar que los datos no estén vacíos
    console.log('\n🔍 === VALIDACIÓN DE DATOS ===');
    const validations = [
      { field: 'property_id', value: testProperty.id, valid: !!testProperty.id },
      { field: 'property_name', value: testProperty.name, valid: !!testProperty.name },
      { field: 'user_id', value: user.id, valid: !!user.id },
      { field: 'file', value: testFile.name, valid: testFile.size > 0 }
    ];
    
    validations.forEach(v => {
      const status = v.valid ? '✅' : '❌';
      console.log(`  ${status} ${v.field}: ${v.value} (${v.valid ? 'VÁLIDO' : 'INVÁLIDO'})`);
    });
    
    const allValid = validations.every(v => v.valid);
    
    if (!allValid) {
      console.error('\n❌ DATOS INVÁLIDOS - El webhook fallará');
      return;
    }
    
    console.log('\n✅ TODOS LOS DATOS SON VÁLIDOS');
    
    // Preguntar si enviar al webhook real
    const shouldSend = confirm('¿Enviar estos datos al webhook de n8n para probar? (Esto puede crear un documento en la BD)');
    
    if (!shouldSend) {
      console.log('⏹️ Prueba cancelada por el usuario');
      return;
    }
    
    // Enviar al webhook
    console.log('\n🚀 Enviando al webhook...');
    const webhookUrl = 'https://hosthelperai.app.n8n.cloud/webhook/file';
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData
    });
    
    console.log(`📡 Respuesta: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error del webhook:', errorText);
      
      if (errorText.includes('property_id')) {
        console.error('\n🎯 DIAGNÓSTICO: El error sigue siendo de property_id');
        console.error('   Esto significa que el nodo VectorStoreSupabase en n8n');
        console.error('   NO está configurado correctamente en la sección Metadata.');
        console.error('\n📋 ACCIÓN REQUERIDA:');
        console.error('   1. Abre https://hosthelperai.app.n8n.cloud');
        console.error('   2. Encuentra el nodo VectorStoreSupabase');
        console.error('   3. Configura la sección Metadata con property_id');
      }
      
      throw new Error(`Webhook error: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Respuesta exitosa:', result);
    
    console.log('\n🎉 WEBHOOK FUNCIONÓ CORRECTAMENTE');
    console.log('   El property_id se envió sin problemas.');
    console.log('   Si aún hay errores, revisa la configuración del nodo VectorStoreSupabase.');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    if (error.message.includes('property_id')) {
      console.error('\n🔧 SOLUCIÓN:');
      console.error('   El problema está en la configuración del nodo VectorStoreSupabase en n8n.');
      console.error('   Revisa: documentation/integrations/n8n-vectorstore-supabase-config.md');
    }
  }
}

// Función auxiliar para mostrar configuración JSON de n8n
function showN8nConfig() {
  console.log('\n📋 === CONFIGURACIÓN JSON PARA N8N ===');
  console.log(`
{
  "name": "Store Document Vector",
  "type": "@n8n/n8n-nodes-langchain.vectorStoreSupabase",
  "parameters": {
    "operation": "insert",
    "tableName": "documents",
    "metadata": {
      "property_id": "{{ $json.property_id }}",
      "property_name": "{{ $json.property_name }}",
      "document_type": "{{ $json.document_type }}",
      "document_name": "{{ $json.document_name }}"
    }
  }
}
  `);
}

// Verificar contexto
if (typeof supabase === 'undefined') {
  console.error('❌ Ejecuta este script en la consola del navegador con la app cargada');
} else {
  // Funciones disponibles
  console.log('🛠️ Funciones disponibles:');
  console.log('  - debugWebhookData(): Prueba completa del webhook');
  console.log('  - showN8nConfig(): Muestra configuración JSON para n8n');
  
  // Hacer funciones globales
  window.debugWebhookData = debugWebhookData;
  window.showN8nConfig = showN8nConfig;
  
  // Ejecutar automáticamente
  debugWebhookData();
} 
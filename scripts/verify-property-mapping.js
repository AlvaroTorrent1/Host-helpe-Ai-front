// scripts/verify-property-mapping.js
// Script para verificar que property_id y property_name llegan correctamente al webhook

console.log('🔍 === VERIFICACIÓN DE MAPEO PROPERTY_ID Y PROPERTY_NAME ===\n');

async function verifyPropertyMapping() {
  try {
    console.log('🏠 Obteniendo datos de propiedad...');
    
    // Obtener primera propiedad disponible
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id, name')
      .limit(1);
    
    if (propError || !properties || properties.length === 0) {
      throw new Error('No se encontraron propiedades. Crea una propiedad primero.');
    }
    
    const testProperty = properties[0];
    console.log(`✅ Propiedad de prueba: "${testProperty.name}"`);
    console.log(`✅ Property ID: ${testProperty.id}`);
    
    // Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    
    console.log(`✅ Usuario: ${user.email}`);
    
    // Crear documento de prueba específico para property mapping
    const testContent = `
# Documento de Verificación Property Mapping

Property ID: ${testProperty.id}
Property Name: ${testProperty.name}
Timestamp: ${new Date().toISOString()}

Este documento es para verificar que property_id y property_name 
se mapeen correctamente en la tabla documents.
`;
    
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFile = new File([testBlob], 'verify-property-mapping.txt', { type: 'text/plain' });
    
    console.log(`✅ Archivo de prueba: ${testFile.name} (${testFile.size} bytes)`);
    
    // Preparar FormData exactamente como webhookDocumentService
    const formData = new FormData();
    formData.append('file', testFile);
    formData.append('property_id', testProperty.id);
    formData.append('property_name', testProperty.name);
    formData.append('user_id', user.id);
    formData.append('timestamp', new Date().toISOString());
    formData.append('document_name', 'Verificación Property Mapping');
    formData.append('document_type', 'other');
    formData.append('document_description', 'Documento para verificar mapeo de property_id y property_name');
    
    console.log('\n📤 === DATOS QUE DEBEN LLEGAR A N8N ===');
    console.log('Campos FormData enviados:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`  ${key}: "${value}"`);
      }
    }
    
    console.log('\n🎯 === CONFIGURACIÓN REQUERIDA EN N8N ===');
    console.log('En el nodo VectorStoreSupabase, sección Metadata:');
    console.log(`  property_id: {{ $json.property_id }}  ← debe mapear a "${testProperty.id}"`);
    console.log(`  property_name: {{ $json.property_name }}  ← debe mapear a "${testProperty.name}"`);
    
    // Contar documentos existentes ANTES del envío
    const { data: docsBefore, error: beforeError } = await supabase
      .from('documents')
      .select('id, property_id, property_name')
      .eq('property_id', testProperty.id);
    
    const countBefore = docsBefore ? docsBefore.length : 0;
    console.log(`\n📊 Documentos existentes para esta propiedad: ${countBefore}`);
    
    // Preguntar si enviar
    const shouldSend = confirm(`¿Enviar documento de prueba para verificar property mapping?\n\nEsto creará un nuevo documento en la BD para verificar que property_id y property_name se mapeen correctamente.`);
    
    if (!shouldSend) {
      console.log('⏹️ Verificación cancelada por el usuario');
      return;
    }
    
    // Enviar al webhook
    console.log('\n🚀 Enviando al webhook para verificar mapping...');
    const webhookUrl = 'https://hosthelperai.app.n8n.cloud/webhook/file';
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData
    });
    
    console.log(`📡 Respuesta del webhook: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error del webhook:', errorText);
      throw new Error(`Webhook error: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Respuesta del webhook:', result);
    
    // Esperar un poco para que n8n procese
    console.log('\n⏳ Esperando 5 segundos para que n8n procese...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Verificar en base de datos
    console.log('\n🔍 Verificando resultado en base de datos...');
    
    const { data: docsAfter, error: afterError } = await supabase
      .from('documents')
      .select('id, property_id, property_name, content, created_at')
      .eq('property_id', testProperty.id)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (afterError) {
      console.error('❌ Error consultando documentos:', afterError);
      return;
    }
    
    const countAfter = docsAfter ? docsAfter.length : 0;
    console.log(`📊 Documentos después del envío: ${countAfter}`);
    
    if (countAfter > countBefore) {
      console.log('\n🎉 ¡NUEVO DOCUMENTO CREADO!');
      
      const newDoc = docsAfter[0];
      console.log('\n📋 === RESULTADO DEL MAPEO ===');
      console.log(`ID del documento: ${newDoc.id}`);
      console.log(`Property ID: ${newDoc.property_id} ${newDoc.property_id ? '✅' : '❌ NULL'}`);
      console.log(`Property Name: "${newDoc.property_name}" ${newDoc.property_name ? '✅' : '❌ NULL'}`);
      console.log(`Content preview: ${newDoc.content.substring(0, 100)}...`);
      console.log(`Created: ${newDoc.created_at}`);
      
      // Verificar si el mapeo funcionó
      const mappingWorked = newDoc.property_id && newDoc.property_name;
      
      if (mappingWorked) {
        console.log('\n🎉 ¡MAPEO EXITOSO! Property ID y Property Name se guardaron correctamente.');
        console.log('✅ El nodo VectorStoreSupabase está configurado correctamente.');
      } else {
        console.log('\n❌ MAPEO FALLIDO - Los campos siguen siendo null.');
        console.log('\n🔧 ACCIÓN REQUERIDA:');
        console.log('1. Abre https://hosthelperai.app.n8n.cloud');
        console.log('2. Encuentra el nodo VectorStoreSupabase');
        console.log('3. Configura la sección Metadata:');
        console.log('   - property_id: {{ $json.property_id }}');
        console.log('   - property_name: {{ $json.property_name }}');
        console.log('4. Guarda y prueba de nuevo');
      }
      
    } else {
      console.log('\n❌ NO SE CREÓ NUEVO DOCUMENTO');
      console.log('Posibles causas:');
      console.log('- Error en el webhook de n8n');
      console.log('- Problema en el nodo VectorStoreSupabase');
      console.log('- Error de conectividad');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR EN VERIFICACIÓN:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Función para mostrar documentos existentes
async function showExistingDocuments() {
  console.log('\n📋 === DOCUMENTOS EXISTENTES ===');
  
  try {
    const { data: docs, error } = await supabase
      .from('documents')
      .select('id, property_id, property_name, content, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log(`Total documentos: ${docs.length}`);
    
    docs.forEach((doc, index) => {
      const hasPropertyId = doc.property_id ? '✅' : '❌';
      const hasPropertyName = doc.property_name ? '✅' : '❌';
      console.log(`${index + 1}. ID: ${doc.id}`);
      console.log(`   Property ID: ${doc.property_id} ${hasPropertyId}`);
      console.log(`   Property Name: "${doc.property_name}" ${hasPropertyName}`);
      console.log(`   Created: ${doc.created_at}`);
      console.log(`   Content: ${doc.content.substring(0, 50)}...`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Verificar contexto
if (typeof supabase === 'undefined') {
  console.error('❌ Ejecuta este script en la consola del navegador con la app cargada');
} else {
  console.log('🛠️ Funciones disponibles:');
  console.log('  - verifyPropertyMapping(): Verificar mapeo completo');
  console.log('  - showExistingDocuments(): Mostrar documentos existentes');
  
  // Hacer funciones globales
  window.verifyPropertyMapping = verifyPropertyMapping;
  window.showExistingDocuments = showExistingDocuments;
  
  // Mostrar documentos existentes primero
  showExistingDocuments();
} 
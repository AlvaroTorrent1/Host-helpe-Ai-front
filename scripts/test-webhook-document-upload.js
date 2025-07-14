// scripts/test-webhook-document-upload.js
// Script para probar el upload de documentos al webhook n8n con property_id correcto

console.log('🧪 === PRUEBA DE UPLOAD DE DOCUMENTOS AL WEBHOOK ===\n');

// Función para crear un archivo de prueba
function createTestFile() {
  const content = `
# Guía de Uso de la Propiedad

Esta es una guía de prueba para verificar el procesamiento de documentos.

## Información importante:
- Property ID debe llegar correctamente a n8n
- El documento debe ser procesado y almacenado
- Los metadatos deben incluir property_id

Fecha de prueba: ${new Date().toISOString()}
`;
  
  const blob = new Blob([content], { type: 'text/plain' });
  return new File([blob], 'guia-prueba-property-id.txt', { type: 'text/plain' });
}

// Función principal de prueba
async function testDocumentUpload() {
  try {
    console.log('🏠 Obteniendo propiedad existente...');
    
    // Obtener primera propiedad disponible
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id, name')
      .limit(1);
    
    if (propError || !properties || properties.length === 0) {
      throw new Error('No se encontraron propiedades. Crea una propiedad primero.');
    }
    
    const testProperty = properties[0];
    console.log(`✅ Usando propiedad: ${testProperty.name} (ID: ${testProperty.id})`);
    
    // Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    
    console.log(`👤 Usuario autenticado: ${user.email} (ID: ${user.id})`);
    
    // Crear archivo de prueba
    const testFile = createTestFile();
    console.log(`📄 Archivo de prueba creado: ${testFile.name} (${testFile.size} bytes)`);
    
    // Preparar FormData con los campos corregidos (snake_case)
    const formData = new FormData();
    formData.append('file', testFile);
    formData.append('property_id', testProperty.id);  // ← CORREGIDO: snake_case
    formData.append('property_name', testProperty.name);
    formData.append('user_id', user.id);
    formData.append('timestamp', new Date().toISOString());
    formData.append('document_name', 'Guía de Prueba Property ID');
    formData.append('document_type', 'guide');
    formData.append('document_description', 'Documento de prueba para verificar property_id en n8n');
    
    console.log('\n📤 Datos que se enviarán al webhook:');
    console.log(`  - property_id: ${testProperty.id}`);
    console.log(`  - property_name: ${testProperty.name}`);
    console.log(`  - user_id: ${user.id}`);
    console.log(`  - document_name: Guía de Prueba Property ID`);
    console.log(`  - document_type: guide`);
    console.log(`  - file: ${testFile.name}`);
    
    // Enviar al webhook
    console.log('\n🚀 Enviando documento al webhook n8n...');
    const webhookUrl = 'https://hosthelperai.app.n8n.cloud/webhook/file';
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData
    });
    
    console.log(`📡 Respuesta del webhook: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en webhook:', errorText);
      throw new Error(`Webhook error ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Respuesta exitosa del webhook:');
    console.log(JSON.stringify(result, null, 2));
    
    // Verificar que el documento se guardó en la base de datos
    console.log('\n🔍 Verificando documento en la base de datos...');
    
    // Esperar un poco para que n8n procese
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('property_id', testProperty.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (docError) {
      console.error('❌ Error consultando documentos:', docError);
    } else {
      console.log(`📊 Documentos encontrados para la propiedad: ${documents.length}`);
      documents.forEach((doc, index) => {
        console.log(`  ${index + 1}. ID: ${doc.id}, Property ID: ${doc.property_id}`);
        console.log(`     Content preview: ${doc.content.substring(0, 100)}...`);
        console.log(`     Created: ${doc.created_at}`);
      });
    }
    
    console.log('\n🎉 PRUEBA COMPLETADA EXITOSAMENTE');
    
  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Verificar que estamos en el contexto correcto
if (typeof supabase === 'undefined') {
  console.error('❌ Esta prueba debe ejecutarse en la consola del navegador con la aplicación cargada');
  console.log('1. Abre http://localhost:4002');
  console.log('2. Inicia sesión');
  console.log('3. Abre Developer Tools (F12) > Console');
  console.log('4. Copia y pega este script');
} else {
  // Ejecutar la prueba
  testDocumentUpload();
}

// Función auxiliar para ejecutar manualmente
window.testDocumentUpload = testDocumentUpload; 
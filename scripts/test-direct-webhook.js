// File: scripts/test-direct-webhook.js
// Script para probar el envío directo de imágenes al webhook de n8n

import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const WEBHOOK_URL = 'https://hosthelperai.app.n8n.cloud/webhook/images';

async function testDirectWebhook() {
  console.log('🧪 Probando envío directo de imágenes al webhook...\n');
  console.log(`📍 URL del webhook: ${WEBHOOK_URL}`);

  try {
    // Crear FormData
    const formData = new FormData();
    
    // Agregar metadatos
    formData.append('property_id', 'test-property-123');
    formData.append('property_name', 'Test Property Direct');
    formData.append('total_images', '1');
    formData.append('timestamp', new Date().toISOString());

    // Crear una imagen de prueba (1x1 pixel PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );

    // Agregar la imagen como archivo binario
    formData.append('image_0', testImageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    formData.append('image_0_size', testImageBuffer.length.toString());
    formData.append('image_0_type', 'image/png');

    console.log('📤 Enviando FormData con imagen de prueba...');
    console.log('   - property_id: test-property-123');
    console.log('   - property_name: Test Property Direct');
    console.log('   - image: test-image.png (1x1 pixel)');

    // Enviar al webhook
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    console.log(`\n📡 Respuesta del webhook:`);
    console.log(`   - Status: ${response.status} ${response.statusText}`);
    console.log(`   - Headers:`, response.headers.raw());

    const responseText = await response.text();
    console.log(`   - Body: ${responseText}`);

    if (response.ok) {
      console.log('\n✅ El webhook respondió exitosamente!');
      
      // Intentar parsear como JSON
      try {
        const jsonResponse = JSON.parse(responseText);
        console.log('\n📊 Respuesta JSON:', JSON.stringify(jsonResponse, null, 2));
      } catch (e) {
        console.log('\n📝 La respuesta no es JSON válido');
      }
    } else {
      console.log('\n❌ El webhook devolvió un error');
    }

  } catch (error) {
    console.error('\n❌ Error al enviar al webhook:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 El webhook no está accesible. Posibles causas:');
      console.log('   1. El webhook no está activo en n8n');
      console.log('   2. La URL es incorrecta');
      console.log('   3. Hay un firewall bloqueando la conexión');
    }
  }

  console.log('\n📋 Resumen:');
  console.log('   - Si ves status 200: El webhook está activo y recibiendo datos');
  console.log('   - Si ves status 404: La URL del webhook es incorrecta');
  console.log('   - Si ves ECONNREFUSED: El servidor no está accesible');
  console.log('   - Si ves CORS error: Normal desde Node.js, prueba desde el navegador');
}

// Función para probar con una imagen real si existe
async function testWithRealImage(imagePath) {
  if (!fs.existsSync(imagePath)) {
    console.log(`\n⚠️  No se encontró la imagen: ${imagePath}`);
    return;
  }

  console.log(`\n🖼️  Probando con imagen real: ${imagePath}`);

  const formData = new FormData();
  formData.append('property_id', 'real-test-123');
  formData.append('property_name', 'Real Image Test');
  
  const imageStream = fs.createReadStream(imagePath);
  const stats = fs.statSync(imagePath);
  
  formData.append('image_0', imageStream, {
    filename: path.basename(imagePath),
    contentType: 'image/jpeg'
  });
  formData.append('image_0_size', stats.size.toString());
  formData.append('image_0_type', 'image/jpeg');

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    console.log(`   Respuesta: ${response.status} ${response.statusText}`);
  } catch (error) {
    console.error(`   Error: ${error.message}`);
  }
}

// Ejecutar pruebas
async function main() {
  await testDirectWebhook();
  
  // Opcional: probar con una imagen real si se proporciona como argumento
  const realImagePath = process.argv[2];
  if (realImagePath) {
    await testWithRealImage(realImagePath);
  }
}

main().catch(console.error); 
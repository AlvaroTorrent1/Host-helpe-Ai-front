// scripts/test-webhook-direct.js
// Script para probar conectividad directa con el webhook de n8n

const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// URLs
const N8N_WEBHOOK_URL = 'https://hosthelperai.app.n8n.cloud/webhook/images';
const SUPABASE_URL = 'https://qwhcuptrmdtyqzlowmxd.supabase.co';
const PROXY_WEBHOOK_URL = `${SUPABASE_URL}/functions/v1/proxy-n8n-webhook`;

// Configuración
const testConfig = {
  property_id: 'test-property-123',
  user_id: 'test-user-456',
  total_images: '1'
};

async function testDirectN8nWebhook() {
  console.log('🧪 Testing Direct n8n Webhook Connectivity\n');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Simple POST request to check if webhook is alive
    console.log('\n📡 Test 1: Basic connectivity check...');
    console.log(`URL: ${N8N_WEBHOOK_URL}`);
    
    const simpleResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: 'ping' })
    });

    console.log(`Response Status: ${simpleResponse.status} ${simpleResponse.statusText}`);
    const responseText = await simpleResponse.text();
    console.log(`Response Body: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
    
    // Test 2: FormData request (como lo envía el frontend)
    console.log('\n📦 Test 2: FormData request (simulating frontend)...');
    
    const formData = new FormData();
    formData.append('property_id', testConfig.property_id);
    formData.append('user_id', testConfig.user_id);
    formData.append('total_images', testConfig.total_images);
    
    // Crear una imagen de prueba simple (1x1 pixel PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );
    
    formData.append('image_0', testImageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    formData.append('path_0', 'property-files/test/test-image.png');

    const formDataResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    console.log(`Response Status: ${formDataResponse.status} ${formDataResponse.statusText}`);
    const formDataResponseText = await formDataResponse.text();
    console.log(`Response Body: ${formDataResponseText.substring(0, 200)}${formDataResponseText.length > 200 ? '...' : ''}`);

    // Test 3: Probar a través del proxy de Supabase
    console.log('\n🔄 Test 3: Testing through Supabase proxy...');
    console.log(`URL: ${PROXY_WEBHOOK_URL}`);
    
    const proxyFormData = new FormData();
    proxyFormData.append('property_id', testConfig.property_id);
    proxyFormData.append('user_id', testConfig.user_id);
    proxyFormData.append('total_images', testConfig.total_images);
    proxyFormData.append('image_0', testImageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    proxyFormData.append('path_0', 'property-files/test/test-image.png');

    const proxyResponse = await fetch(PROXY_WEBHOOK_URL, {
      method: 'POST',
      body: proxyFormData,
      headers: {
        ...proxyFormData.getHeaders(),
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3aGN1cHRybWR0eXF6bG93bXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MTQ1MDUsImV4cCI6MjA1MDE5MDUwNX0.w4yvpyqmhP_vJC4_Lj8qJ-nB8bOUfRZwvP8Sp5tEbag'
      }
    });

    console.log(`Response Status: ${proxyResponse.status} ${proxyResponse.statusText}`);
    const proxyResponseData = await proxyResponse.json();
    console.log(`Response Data:`, JSON.stringify(proxyResponseData, null, 2));

    // Análisis de resultados
    console.log('\n📊 Analysis:');
    console.log('=' .repeat(60));
    
    if (simpleResponse.status === 404 || formDataResponse.status === 404) {
      console.log('❌ n8n webhook endpoint not found (404)');
      console.log('   → Check if the webhook URL is correct');
      console.log('   → Verify the webhook is active in n8n');
    } else if (simpleResponse.status === 401 || formDataResponse.status === 401) {
      console.log('❌ Authentication error (401)');
      console.log('   → n8n webhook may require authentication');
      console.log('   → Check webhook settings in n8n');
    } else if (simpleResponse.status === 405) {
      console.log('⚠️  Method not allowed (405)');
      console.log('   → Webhook exists but may not accept the request method');
    } else if (simpleResponse.status >= 200 && simpleResponse.status < 300) {
      console.log('✅ n8n webhook is reachable!');
    } else {
      console.log(`⚠️  Unexpected status: ${simpleResponse.status}`);
    }

    if (proxyResponse.status >= 200 && proxyResponse.status < 300) {
      console.log('✅ Supabase proxy function is working!');
    } else {
      console.log('❌ Supabase proxy function failed');
      console.log('   → Check if proxy-n8n-webhook is deployed');
      console.log('   → Review Supabase function logs');
    }

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('   → Connection refused - endpoint may be down');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('   → Connection timeout - endpoint may be slow or unreachable');
    } else if (error.message.includes('CORS')) {
      console.log('   → CORS error - this is expected when calling from Node.js');
    }
  }

  console.log('\n🔍 Next steps:');
  console.log('1. Check n8n workflow configuration');
  console.log('2. Verify webhook URL and authentication settings');
  console.log('3. Deploy the updated proxy-n8n-webhook function');
  console.log('4. Test from the browser with real image upload');
}

// Ejecutar test
testDirectN8nWebhook(); 
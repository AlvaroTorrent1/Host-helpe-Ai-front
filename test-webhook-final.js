// test-webhook-final.js
// Test final del webhook n8n con el token correcto

const WEBHOOK_URL = 'https://blxngmtmknkdmikaflen.supabase.co/functions/v1/n8n-webhook';
const WEBHOOK_TOKEN = 'hosthelper-n8n-secure-token-2024';

// Payload de prueba simulando creación de propiedad
const testPayload = {
  property_id: '550e8400-e29b-41d4-a716-446655440000',
  user_id: 'test-user-123',
  property_data: {
    name: 'Apartamento Test Webhook',
    address: 'Calle Test 123',
    city: 'Madrid',
    state: 'Madrid',
    postal_code: '28001',
    country: 'España',
    property_type: 'apartment',
    num_bedrooms: 2,
    num_bathrooms: 1,
    max_guests: 4,
    description: 'Apartamento de prueba para webhook n8n',
    google_business_profile_url: 'https://g.page/test'
  },
  uploaded_files: {
    interni: [
      {
        filename: 'salon_principal.jpg',
        url: 'https://example.com/salon.jpg',
        type: 'image/jpeg',
        size: 1024000,
        description: 'Foto del salon principal con vista panoramica'
      }
    ],
    esterni: [
      {
        filename: 'terraza_exterior.jpg', 
        url: 'https://example.com/terraza.jpg',
        type: 'image/jpeg',
        size: 2048000,
        description: 'Terraza exterior con vistas al mar'
      }
    ],
    elettrodomestici_foto: [
      {
        filename: 'cocina_completa.jpg',
        url: 'https://example.com/cocina.jpg', 
        type: 'image/jpeg',
        size: 1536000,
        description: 'Cocina completa con todos los electrodomesticos'
      }
    ],
    documenti_casa: [
      {
        filename: 'contrato_alquiler.pdf',
        url: 'https://example.com/contrato.pdf',
        type: 'application/pdf', 
        size: 512000,
        description: 'Contrato de alquiler vacacional'
      }
    ],
    documenti_elettrodomestici: [
      {
        filename: 'manual_lavadora.pdf',
        url: 'https://example.com/manual.pdf',
        type: 'application/pdf',
        size: 256000, 
        description: 'Manual de instrucciones de la lavadora'
      }
    ]
  },
  timestamp: new Date().toISOString(),
  request_id: `test-${Date.now()}`
};

async function testWebhook() {
  console.log('🚀 Testing N8N Webhook with correct token...');
  console.log('📍 URL:', WEBHOOK_URL);
  console.log('🔑 Token:', WEBHOOK_TOKEN.substring(0, 10) + '...');
  
  try {
    console.log('\n📤 Sending test payload...');
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WEBHOOK_TOKEN}`
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log('📊 Response Status:', response.status, response.statusText);
    console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('\n📄 Response Body:', responseText);
    
    if (response.ok) {
      console.log('\n✅ TEST SUCCESSFUL! Webhook is working correctly');
      try {
        const jsonResponse = JSON.parse(responseText);
        console.log('📈 Categorization Summary:', jsonResponse.categorization_summary);
      } catch (e) {
        console.log('ℹ️ Response is not JSON format');
      }
    } else {
      console.log('\n❌ TEST FAILED! Status:', response.status);
      
      if (response.status === 401) {
        console.log('🔒 Issue: Token authentication failed');
      } else if (response.status === 405) {
        console.log('⚠️ Issue: Method not allowed (function might need redeployment)');
      } else if (response.status === 404) {
        console.log('🔍 Issue: Function not found or not deployed');
      }
    }
    
  } catch (error) {
    console.error('\n💥 Network/Connection Error:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('🌐 Possible issues:');
      console.log('   - Network connectivity');
      console.log('   - Supabase project status');
      console.log('   - Edge Function deployment');
    }
  }
}

// Health check test
async function testHealthCheck() {
  console.log('\n🏥 Testing webhook health (GET request)...');
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'GET'
    });
    
    console.log('📊 Health Check Status:', response.status);
    
    if (response.status === 405) {
      console.log('✅ Function is reachable (405 Method Not Allowed is expected for GET)');
      return true;
    } else {
      console.log('⚠️ Unexpected health check response:', response.status);
      return false;
    }
    
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
}

// Run tests
async function runAllTests() {
  console.log('🧪 Starting comprehensive webhook tests...\n');
  
  // First check if function is reachable
  const isHealthy = await testHealthCheck();
  
  if (!isHealthy) {
    console.log('\n🛑 Stopping tests - webhook is not reachable');
    return;
  }
  
  // Run the main webhook test
  await testWebhook();
  
  console.log('\n📋 Test Summary:');
  console.log('   - Health Check: Function is reachable');
  console.log('   - Token: Using correct N8N_WEBHOOK_TOKEN');
  console.log('   - Payload: Complete property data with files');
  console.log('   - Expected: AI categorization and database insertion');
}

// Execute tests
runAllTests().catch(console.error); 
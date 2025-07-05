// test-direct-console.js
// Código para probar el webhook n8n-v2 directamente en la consola del navegador

// Test 1: Verificar salud del webhook
async function testWebhookHealth() {
  console.log('🔧 Testing webhook health...');
  
  try {
    const response = await fetch('http://localhost:54321/functions/v1/n8n-webhook-v2', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
      }
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Expected: 405 (Method Not Allowed para GET)`);
    
    if (response.status === 405) {
      console.log('✅ Webhook endpoint is healthy!');
      return true;
    } else {
      console.log('❌ Unexpected response');
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

// Test 2: Probar creación de propiedad con webhook
async function testPropertyCreation() {
  console.log('🧪 Testing property creation via webhook...');
  
  const testPayload = {
    property: {
      name: "Test Property Console",
      address: "Calle Test 123, Madrid", 
      description: "Propiedad de prueba desde consola",
      type: "apartment",
      bedrooms: 2,
      bathrooms: 1,
      max_guests: 4,
      price_per_night: 85.00,
      amenities: ["wifi", "tv", "kitchen"]
    },
    files: [
      {
        url: "https://example.com/interior1.jpg",
        type: "image",
        description: "Salón principal con sofá y televisión"
      },
      {
        url: "https://example.com/contrato.pdf", 
        type: "document",
        description: "Contrato de alquiler temporal"
      },
      {
        url: "https://example.com/cocina.jpg",
        type: "image", 
        description: "Cocina completamente equipada con nevera y microondas"
      }
    ]
  };

  try {
    const response = await fetch('http://localhost:54321/functions/v1/n8n-webhook-v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
        'X-N8N-Token': 'hosthelper-n8n-secure-token-2024'
      },
      body: JSON.stringify(testPayload)
    });

    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Property created successfully!');
      console.log('📊 Response:', result);
      console.log('🎯 Property ID:', result.property_id);
      console.log('📁 Files processed:', result.files_processed);
      return result;
    } else {
      const error = await response.text();
      console.error('❌ Error creating property:', error);
      return null;
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return null;
  }
}

// Test 3: Verificar datos en la base de datos
async function verifyPropertyInDatabase(propertyId) {
  if (!propertyId) {
    console.log('❌ No property ID to verify');
    return;
  }
  
  console.log('🔍 Verifying property in database...');
  
  try {
    // Verificar propiedad
    const { data: supabase } = await import('./src/services/supabase.js');
    const { data: property } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();
    
    console.log('🏠 Property data:', property);
    
    // Verificar archivos media
    const { data: media } = await supabase
      .from('media')
      .select('*')
      .eq('property_id', propertyId);
    
    console.log('📁 Media files:', media);
    
    return { property, media };
  } catch (error) {
    console.error('❌ Error verifying database:', error);
    return null;
  }
}

// Ejecutar todos los tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive webhook tests...\n');
  
  // Test 1: Salud
  const healthOk = await testWebhookHealth();
  console.log('\n' + '='.repeat(50) + '\n');
  
  if (!healthOk) {
    console.log('❌ Webhook health check failed, stopping tests');
    return;
  }
  
  // Test 2: Creación
  const result = await testPropertyCreation();
  console.log('\n' + '='.repeat(50) + '\n');
  
  if (!result) {
    console.log('❌ Property creation failed, stopping tests');
    return;
  }
  
  // Test 3: Verificación
  await verifyPropertyInDatabase(result.property_id);
  
  console.log('\n🎉 All tests completed!');
  console.log('💡 Check your dashboard at http://localhost:4000/dashboard');
}

// Exportar funciones para uso individual
console.log('📋 Available test functions:');
console.log('🔧 testWebhookHealth() - Test webhook endpoint');
console.log('🧪 testPropertyCreation() - Test property creation');
console.log('🔍 verifyPropertyInDatabase(id) - Verify data in DB');
console.log('🚀 runAllTests() - Run complete test suite');
console.log('\n💡 Usage: Copy and paste any function name to run it'); 
// test-webhook-supabase-auth.js
// Test del webhook n8n usando autenticación de Supabase

const WEBHOOK_URL = 'https://blxngmtmknkdmikaflen.supabase.co/functions/v1/n8n-webhook';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseG5nbXRta25rZG1pa2FmbGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MDAzNjMsImV4cCI6MjA1Nzk3NjM2M30.iIyu_9vwjMO_SOCovMZEAf-c9cNanD0u_cu1ZURTyFQ';

// Payload de prueba simplificado
const testPayload = {
  property_id: '550e8400-e29b-41d4-a716-446655440000',
  user_id: 'test-user-123',
  property_data: {
    name: 'Test Property Supabase Auth',
    address: 'Test Address 123',
    city: 'Madrid',
    state: 'Madrid',
    postal_code: '28001',
    country: 'España',
    property_type: 'apartment',
    num_bedrooms: 2,
    num_bathrooms: 1,
    max_guests: 4,
    description: 'Test property with Supabase authentication'
  },
  uploaded_files: {
    interni: [
      {
        filename: 'test_interior.jpg',
        url: 'https://example.com/test.jpg',
        type: 'image/jpeg',
        size: 1024000,
        description: 'Test interior photo'
      }
    ],
    esterni: [],
    elettrodomestici_foto: [],
    documenti_casa: [],
    documenti_elettrodomestici: []
  },
  timestamp: new Date().toISOString(),
  request_id: `test-supabase-${Date.now()}`
};

async function testWithSupabaseAuth() {
  console.log('🔐 Testing N8N Webhook with Supabase Authentication...');
  console.log('📍 URL:', WEBHOOK_URL);
  console.log('🗝️ Using Supabase anon key');
  
  try {
    console.log('\n📤 Sending test payload with Supabase auth...');
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log('📊 Response Status:', response.status, response.statusText);
    
    const responseText = await response.text();
    console.log('\n📄 Response Body:', responseText);
    
    if (response.ok) {
      console.log('\n✅ SUCCESS! Webhook works with Supabase authentication');
      try {
        const jsonResponse = JSON.parse(responseText);
        if (jsonResponse.success) {
          console.log('🎉 Property processed successfully!');
          console.log('📁 Files processed:', jsonResponse.files_processed);
          console.log('🤖 Categorization:', jsonResponse.categorization_summary);
        }
      } catch (e) {
        console.log('ℹ️ Response is not JSON');
      }
    } else {
      console.log('\n❌ FAILED with Supabase auth. Status:', response.status);
      
      if (response.status === 401) {
        console.log('🔒 Still unauthorized - function may need custom auth logic');
      } else if (response.status === 400) {
        console.log('📝 Bad request - check payload structure');
      } else if (response.status === 500) {
        console.log('💥 Server error - check function logs');
      }
    }
    
  } catch (error) {
    console.error('\n💥 Request Error:', error.message);
  }
}

async function testHealthWithSupabaseAuth() {
  console.log('\n🏥 Testing health check with Supabase auth...');
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    
    console.log('📊 Health Status:', response.status);
    
    if (response.status === 405) {
      console.log('✅ Function accessible with Supabase auth (405 = Method Not Allowed for GET)');
      return true;
    } else if (response.status === 401) {
      console.log('❌ Still unauthorized with Supabase auth');
      return false;
    } else {
      console.log('ℹ️ Unexpected response:', response.status);
      return true; // Function is responding
    }
    
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
}

async function runSupabaseAuthTests() {
  console.log('🔐 Testing Webhook with Supabase Authentication\n');
  
  // Test health first
  const isHealthy = await testHealthWithSupabaseAuth();
  
  if (!isHealthy) {
    console.log('\n🛑 Function not accessible with Supabase auth');
    return;
  }
  
  // Test main functionality
  await testWithSupabaseAuth();
  
  console.log('\n📋 Summary:');
  console.log('   - Authentication: Supabase JWT (anon key)');
  console.log('   - Expected: Function should accept Supabase auth + validate custom logic');
}

runSupabaseAuthTests().catch(console.error); 
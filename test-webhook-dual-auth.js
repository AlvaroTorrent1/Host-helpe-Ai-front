// test-webhook-dual-auth.js
// Test con autenticación dual: Supabase JWT + token personalizado

const WEBHOOK_URL = 'https://blxngmtmknkdmikaflen.supabase.co/functions/v1/n8n-webhook';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseG5nbXRta25rZG1pa2FmbGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MDAzNjMsImV4cCI6MjA1Nzk3NjM2M30.iIyu_9vwjMO_SOCovMZEAf-c9cNanD0u_cu1ZURTyFQ';
const N8N_TOKEN = 'hosthelper-n8n-secure-token-2024';

const testPayload = {
  property_id: '550e8400-e29b-41d4-a716-446655440000',
  user_id: 'test-user-123',
  property_data: {
    name: 'Dual Auth Test Property',
    address: 'Test Address 123',
    city: 'Madrid',
    state: 'Madrid',
    postal_code: '28001',
    country: 'España',
    property_type: 'apartment',
    num_bedrooms: 2,
    num_bathrooms: 1,
    max_guests: 4,
    description: 'Testing dual authentication system'
  },
  uploaded_files: {
    interni: [
      {
        filename: 'test_dual_auth.jpg',
        url: 'https://example.com/test.jpg',
        type: 'image/jpeg',
        size: 1024000,
        description: 'Test dual auth photo'
      }
    ],
    esterni: [],
    elettrodomestici_foto: [],
    documenti_casa: [],
    documenti_elettrodomestici: []
  },
  timestamp: new Date().toISOString(),
  request_id: `test-dual-${Date.now()}`
};

async function testDualAuth() {
  console.log('🔐🔐 Testing Dual Authentication System...');
  console.log('📍 URL:', WEBHOOK_URL);
  console.log('🗝️ Supabase Auth: ✅');
  console.log('🔑 N8N Token: ✅');
  
  try {
    console.log('\n📤 Sending request with dual authentication...');
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'X-N8N-Token': N8N_TOKEN
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log('📊 Response Status:', response.status, response.statusText);
    
    const responseText = await response.text();
    console.log('\n📄 Response Body:', responseText);
    
    if (response.ok) {
      console.log('\n🎉 SUCCESS! Dual authentication working!');
      try {
        const jsonResponse = JSON.parse(responseText);
        if (jsonResponse.success) {
          console.log('✅ Property processed successfully');
          console.log('📁 Files processed:', jsonResponse.files_processed);
          console.log('🤖 AI Categorization:', jsonResponse.categorization_summary);
        }
      } catch (e) {
        console.log('ℹ️ Response is not JSON format');
      }
    } else {
      console.log('\n❌ FAILED. Status:', response.status);
      
      if (response.status === 401) {
        console.log('🔒 Authentication issue:');
        console.log('   - Supabase JWT might be invalid');
        console.log('   - Function might not be reading X-N8N-Token header');
        console.log('   - Custom auth logic might need updates');
      } else if (response.status === 400) {
        console.log('📝 Payload issue - check data structure');
      } else if (response.status === 500) {
        console.log('💥 Server error - check function implementation');
      }
    }
    
  } catch (error) {
    console.error('\n💥 Network Error:', error.message);
  }
}

async function testWithoutN8NToken() {
  console.log('\n🧪 Testing WITHOUT N8N token (only Supabase auth)...');
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
        // No X-N8N-Token header
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log('📊 Status without N8N token:', response.status);
    
    if (response.status === 401) {
      console.log('✅ Good! Function properly validates N8N token');
    } else {
      console.log('⚠️ Function accepted request without N8N token');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

async function runDualAuthTests() {
  console.log('🔐 Testing Dual Authentication System\n');
  
  // Test with both tokens
  await testDualAuth();
  
  // Test security - without N8N token
  await testWithoutN8NToken();
  
  console.log('\n📋 Test Summary:');
  console.log('   1. Supabase JWT: Required for Edge Function access');
  console.log('   2. X-N8N-Token: Custom validation inside function');
  console.log('   3. Expected: Both tokens required for success');
}

runDualAuthTests().catch(console.error); 
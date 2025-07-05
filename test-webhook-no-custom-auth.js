// test-webhook-no-custom-auth.js
// Test para verificar funcionalidad sin token personalizado

const WEBHOOK_URL = 'https://blxngmtmknkdmikaflen.supabase.co/functions/v1/n8n-webhook';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseG5nbXRta25rZG1pa2FmbGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MDAzNjMsImV4cCI6MjA1Nzk3NjM2M30.iIyu_9vwjMO_SOCovMZEAf-c9cNanD0u_cu1ZURTyFQ';

// Payload mínimo para test
const testPayload = {
  property_id: '550e8400-e29b-41d4-a716-446655440000',
  user_id: 'test-user-123',
  property_data: {
    name: 'Minimal Test Property',
    address: 'Test Address',
    city: 'Madrid',
    state: 'Madrid',
    postal_code: '28001',
    country: 'España',
    property_type: 'apartment',
    num_bedrooms: 1,
    num_bathrooms: 1,
    max_guests: 2,
    description: 'Minimal test'
  },
  uploaded_files: {
    interni: [],
    esterni: [],
    elettrodomestici_foto: [],
    documenti_casa: [],
    documenti_elettrodomestici: []
  },
  timestamp: new Date().toISOString(),
  request_id: `test-minimal-${Date.now()}`
};

async function testNoCustomAuth() {
  console.log('🔍 Testing function with ONLY Supabase authentication...');
  console.log('📍 URL:', WEBHOOK_URL);
  console.log('🗝️ Only using Supabase anon key');
  
  try {
    console.log('\n📤 Sending minimal payload...');
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
        // NO custom headers
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log('📊 Response Status:', response.status, response.statusText);
    
    const responseText = await response.text();
    console.log('\n📄 Response Body:', responseText);
    
    if (response.ok) {
      console.log('\n🎉 SUCCESS! Function works without custom auth');
      try {
        const jsonResponse = JSON.parse(responseText);
        console.log('✅ Response:', jsonResponse);
      } catch (e) {
        console.log('ℹ️ Response is not JSON');
      }
    } else {
      console.log('\n❌ Still failing. Status:', response.status);
      
      if (response.status === 401) {
        console.log('🔒 Function is enforcing custom token validation');
        console.log('💡 Need to modify function to read X-N8N-Token header');
      } else if (response.status === 400) {
        console.log('📝 Bad request - payload structure issue');
      } else if (response.status === 500) {
        console.log('💥 Server error - function implementation issue');
      }
    }
    
  } catch (error) {
    console.error('\n💥 Request Error:', error.message);
  }
}

// Test para verificar que el problema es específicamente la autenticación
async function debugAuthIssue() {
  console.log('\n🐛 Debugging authentication issue...');
  
  // Test 1: Sin Authorization header
  console.log('\n1️⃣ Testing without Authorization header...');
  try {
    const response1 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify(testPayload)
    });
    console.log('   Status without auth:', response1.status);
  } catch (e) {
    console.log('   Error:', e.message);
  }
  
  // Test 2: Con Authorization vacío
  console.log('\n2️⃣ Testing with empty Authorization...');
  try {
    const response2 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify(testPayload)
    });
    console.log('   Status with empty auth:', response2.status);
  } catch (e) {
    console.log('   Error:', e.message);
  }
  
  // Test 3: Con token correcto pero malformado
  console.log('\n3️⃣ Testing with malformed token...');
  try {
    const response3 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer hosthelper-n8n-secure-token-2024',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify(testPayload)
    });
    console.log('   Status with custom token in auth:', response3.status);
    if (response3.status !== 401) {
      const text = await response3.text();
      console.log('   Response:', text);
    }
  } catch (e) {
    console.log('   Error:', e.message);
  }
}

async function runNoCustomAuthTest() {
  console.log('🔍 Testing Edge Function Without Custom Authentication\n');
  
  await testNoCustomAuth();
  await debugAuthIssue();
  
  console.log('\n📋 Debug Summary:');
  console.log('   - Testing various authentication scenarios');
  console.log('   - Goal: Identify exact authentication requirements');
  console.log('   - Next: Update function to read X-N8N-Token header');
}

runNoCustomAuthTest().catch(console.error); 
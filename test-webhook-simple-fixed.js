// test-webhook-simple-fixed.js
// Test simple del webhook n8n-webhook-simple con datos básicos

const WEBHOOK_URL = 'https://blxngmtmknkdmikaflen.supabase.co/functions/v1/n8n-webhook-simple';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseG5nbXRta25rZG1pa2FmbGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzODI1MTAsImV4cCI6MjA1MDk1ODUxMH0.mGhBuEe5EjhQPTLVHxwMGEpMYgKhvTHDjKJJrWjcL4w';
const N8N_TOKEN = 'hosthelper-n8n-secure-token-2024';

const testPayload = {
  property_id: '550e8400-e29b-41d4-a716-446655440000',
  user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  property_data: {
    name: 'Apartamento Test Simple',
    address: 'Calle Test 123, Madrid',
    description: 'Apartamento de prueba para webhook simple',
    google_business_profile_url: 'https://g.page/test-simple'
  },
  uploaded_files: {
    interni: [{
      filename: 'salon.jpg',
      url: 'https://example.com/salon.jpg',
      type: 'image/jpeg',
      size: 1024000,
      description: 'Foto del salon principal'
    }],
    documenti_casa: [{
      filename: 'contrato.pdf',
      url: 'https://example.com/contrato.pdf',
      type: 'application/pdf',
      size: 512000,
      description: 'Contrato de alquiler'
    }]
  },
  timestamp: new Date().toISOString()
};

async function testWebhookSimple() {
  console.log('🧪 Testing n8n-webhook-simple...');
  console.log('📍 URL:', WEBHOOK_URL);
  console.log('🔑 Token:', N8N_TOKEN.substring(0, 15) + '...');
  
  try {
    console.log('\n📤 Sending test payload...');
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
        'apikey': ANON_KEY,
        'X-N8N-Token': N8N_TOKEN
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log('📊 Response Status:', response.status, response.statusText);
    
    const responseText = await response.text();
    console.log('\n📄 Response Body:', responseText);
    
    if (response.ok) {
      console.log('\n✅ TEST SUCCESSFUL! Webhook is working');
      try {
        const jsonResponse = JSON.parse(responseText);
        console.log('📈 Result:', jsonResponse);
      } catch (e) {
        console.log('ℹ️ Response is not JSON format');
      }
    } else {
      console.log('\n❌ TEST FAILED! Status:', response.status);
      
      if (response.status === 401) {
        console.log('🔒 Authentication failed');
      } else if (response.status === 500) {
        console.log('🔥 Internal server error - check function logs');
      }
    }
    
  } catch (error) {
    console.error('\n💥 Error:', error.message);
  }
}

// Run test
testWebhookSimple().catch(console.error); 
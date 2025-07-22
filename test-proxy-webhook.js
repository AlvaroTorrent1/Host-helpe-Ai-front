// test-proxy-webhook.js
// Script para probar que proxy-n8n-webhook funciona sin JWT

console.log('🧪 Testing proxy-n8n-webhook without JWT...\n');

const webhookUrl = 'https://blxngmtmknkdmikaflen.supabase.co/functions/v1/proxy-n8n-webhook';

// Crear FormData de prueba
const formData = new FormData();
formData.append('property_id', 'test-property-123');
formData.append('user_id', 'test-user-456');
formData.append('total_images', '1');
formData.append('test_field', 'Test value without JWT');

// Test 1: Sin Authorization header (debe funcionar si verify_jwt=false)
console.log('Test 1: Request WITHOUT Authorization header');
fetch(webhookUrl, {
  method: 'POST',
  body: formData
})
.then(async response => {
  console.log(`Status: ${response.status} ${response.statusText}`);
  const data = await response.json();
  console.log('Response:', JSON.stringify(data, null, 2));
  
  if (response.status === 401) {
    console.log('❌ ERROR: Still getting 401! The function still requires JWT.');
    console.log('Run deploy-proxy-webhook.bat to fix this.');
  } else if (response.ok) {
    console.log('✅ SUCCESS: Function accepts requests without JWT!');
  }
})
.catch(err => {
  console.error('❌ Fetch error:', err.message);
});

// Test 2: Con Authorization header vacío
setTimeout(() => {
  console.log('\n\nTest 2: Request with empty Authorization header');
  fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Authorization': ''
    },
    body: formData
  })
  .then(async response => {
    console.log(`Status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  })
  .catch(err => {
    console.error('❌ Fetch error:', err.message);
  });
}, 2000); 
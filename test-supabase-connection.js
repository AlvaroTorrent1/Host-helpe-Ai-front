// Test directo de conexión a Supabase
const supabaseUrl = 'https://blxngmtmknkdmikaflen.supabase.co';

// Usar curl directo para probar la conexión sin autenticación
const testUrl = `${supabaseUrl}/rest/v1/documents`;

console.log('Testing Supabase connection...');
console.log('URL:', testUrl);

// Test simple con fetch (si está disponible)
if (typeof fetch !== 'undefined') {
  fetch(testUrl)
    .then(response => {
      console.log('Status:', response.status);
      return response.text();
    })
    .then(data => {
      console.log('Response:', data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
} else {
  console.log('Fetch not available, use curl manually:');
  console.log(`curl ${testUrl}`);
}
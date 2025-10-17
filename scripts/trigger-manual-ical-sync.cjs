// scripts/trigger-manual-ical-sync.cjs
// Trigger manual de sincronización iCal llamando al Edge Function directamente

const https = require('https');

// Configuración
const EDGE_FUNCTION_URL = 'https://blxngmtmknkdmikaflen.supabase.co/functions/v1/sync-ical-bookings';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseG5nbXRta25rZG1pa2FmbGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQyNDY5NzAsImV4cCI6MjAzOTgyMjk3MH0.lR-wRX8hYkNx2BFKDnmZMf78zpchMVJhhr49qcxMWBw';

console.log('🔄 TRIGGER MANUAL - SINCRONIZACIÓN ICAL\n');
console.log('='.repeat(70));
console.log(`URL: ${EDGE_FUNCTION_URL}\n`);

const url = new URL(EDGE_FUNCTION_URL);

const options = {
  hostname: url.hostname,
  port: 443,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'apikey': SUPABASE_ANON_KEY
  }
};

const req = https.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log('📋 Headers:', res.headers);
  console.log('');

  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Response Body:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
      
      if (json.success) {
        console.log('\n✅ SINCRONIZACIÓN EXITOSA');
        console.log(`   Procesadas: ${json.processed || json.synced_count || 0}`);
        console.log(`   Errores: ${json.errors || 0}`);
      } else {
        console.log('\n❌ SINCRONIZACIÓN FALLIDA');
        console.log(`   Error: ${json.error || json.message || 'Desconocido'}`);
      }
    } catch (e) {
      console.log(data);
    }
    console.log('\n' + '='.repeat(70));
  });
});

req.on('error', (e) => {
  console.error('❌ Error en la request:', e.message);
});

// Enviar request vacío (POST sin body)
req.end();


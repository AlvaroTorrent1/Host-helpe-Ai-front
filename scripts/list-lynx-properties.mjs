// scripts/list-lynx-properties.mjs
/**
 * Script para listar todas las propiedades en Lynx Check-in
 * Ejecutar: node scripts/list-lynx-properties.mjs
 */

// Configuración de la API de Lynx
const LYNX_API_URL = 'https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/partners-api/v1';
const LYNX_ACCOUNT_ID = 'a190fff8-c5d0-49a2-80a8-79b38ce0f284';

console.log('🔍 Listando propiedades en Lynx Check-in...\n');
console.log(`📡 API URL: ${LYNX_API_URL}`);
console.log(`🏢 Account ID: ${LYNX_ACCOUNT_ID}\n`);

try {
  // Llamar a la API de Lynx
  const response = await fetch(
    `${LYNX_API_URL}/accounts/${LYNX_ACCOUNT_ID}/lodgings`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  console.log(`📊 Status: ${response.status} ${response.statusText}\n`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error en la API:', errorText);
    process.exit(1);
  }

  const data = await response.json();
  const lodgings = data.lodgings || [];

  console.log(`✅ Total propiedades encontradas: ${lodgings.length}\n`);
  console.log('='.repeat(80));

  // Buscar propiedades que empiezan con "ses"
  const sesProperties = lodgings.filter(l => 
    l.name.toLowerCase().startsWith('ses')
  );

  if (sesProperties.length > 0) {
    console.log('\n🎯 PROPIEDADES QUE EMPIEZAN CON "SES":\n');
    sesProperties.forEach((prop, index) => {
      console.log(`#${index + 1}: ${prop.name}`);
      console.log(`   ID (lodgingId): ${prop.id}`);
      console.log(`   Account ID: ${prop.accountId}`);
      console.log(`   Auth Connection ID: ${prop.authConnId}`);
      console.log(`   Establecimiento: ${prop.establishment?.name || 'N/A'}`);
      console.log(`   Tipo: ${prop.establishment?.type || 'N/A'}`);
      console.log(`   Dirección: ${prop.establishment?.address || 'N/A'}`);
      console.log(`   Ciudad: ${prop.establishment?.city || 'N/A'}`);
      console.log(`   Provincia: ${prop.establishment?.province || 'N/A'}`);
      console.log(`   País: ${prop.establishment?.country || 'N/A'}`);
      console.log('');
    });
    console.log('='.repeat(80));
  } else {
    console.log('\n⚠️  No se encontraron propiedades que empiecen con "ses"\n');
  }

  // Listar TODAS las propiedades
  console.log('\n📋 TODAS LAS PROPIEDADES:\n');
  lodgings.forEach((prop, index) => {
    console.log(`#${index + 1}: ${prop.name}`);
    console.log(`   ID: ${prop.id}`);
    console.log(`   AuthConnId: ${prop.authConnId}`);
    console.log(`   Tipo: ${prop.establishment?.type || 'N/A'} | Ciudad: ${prop.establishment?.city || 'N/A'}`);
    console.log('');
  });

  console.log('='.repeat(80));
  console.log('\n📝 PRÓXIMOS PASOS:');
  console.log('1. Identifica la propiedad que te indicó el proveedor');
  console.log('2. Copia su ID (lodgingId)');
  console.log('3. Comparte el ID conmigo para continuar\n');

  // Guardar JSON completo en un archivo
  const fs = await import('fs');
  const outputFile = 'lynx-properties-list.json';
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`💾 Datos completos guardados en: ${outputFile}\n`);

} catch (error) {
  console.error('\n❌ ERROR:', error.message);
  console.error('\nStack trace:', error.stack);
  process.exit(1);
}


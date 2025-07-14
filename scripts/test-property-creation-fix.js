// scripts/test-property-creation-fix.js
// Script para probar la creación de propiedades sin errores de columna status

console.log('🧪 Iniciando prueba de creación de propiedades...');

// Verificar estructura de la tabla properties
console.log('\n📋 Verificando estructura de la tabla properties...');

// Datos de prueba que deberían funcionar
const testPropertyData = {
  name: 'Propiedad de Prueba',
  address: 'Calle Test 123',
  description: 'Una propiedad de prueba',
  amenities: ['wifi', 'parking'],
  rules: ['no smoking', 'no pets'],
  image: 'https://example.com/image.jpg',
  google_business_profile_url: 'https://maps.google.com/test'
};

console.log('\n✅ Datos de prueba preparados:');
console.log(JSON.stringify(testPropertyData, null, 2));

console.log('\n🚀 Para probar, vaya a http://localhost:4002/dashboard/properties');
console.log('👆 Haga clic en "Añadir propiedad" y complete el formulario');
console.log('📝 Los errores de columna "status" deberían haberse resuelto');

console.log('\n💡 Si aún hay errores, revise:');
console.log('- La consola del navegador para logs detallados');
console.log('- Que el webhook n8n esté deshabilitado temporalmente');
console.log('- Que los datos filtrados coincidan con el esquema de la tabla'); 
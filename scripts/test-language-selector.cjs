// scripts/test-language-selector.js
// Script para verificar que el LanguageSelector migrado funciona correctamente

console.log('=== Test LanguageSelector Migration ===\n');

// Verificar que las traducciones existen en los archivos JSON
const fs = require('fs');
const path = require('path');

try {
  // Leer archivos JSON
  const esPath = path.join(__dirname, '../src/translations/es.json');
  const enPath = path.join(__dirname, '../src/translations/en.json');
  
  const esTranslations = JSON.parse(fs.readFileSync(esPath, 'utf8'));
  const enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  
  console.log('✅ Archivos JSON de traducción cargados correctamente');
  
  // Verificar claves requeridas para LanguageSelector
  const requiredKeys = [
    'common.language',
    'common.spanish', 
    'common.english',
    'common.loading'
  ];
  
  let allKeysPresent = true;
  
  requiredKeys.forEach(key => {
    const keys = key.split('.');
    let esValue = esTranslations;
    let enValue = enTranslations;
    
    // Navegar por las claves anidadas
    for (const k of keys) {
      if (esValue && typeof esValue === 'object') {
        esValue = esValue[k];
      } else {
        esValue = undefined;
      }
      
      if (enValue && typeof enValue === 'object') {
        enValue = enValue[k];
      } else {
        enValue = undefined;
      }
    }
    
    if (esValue && enValue) {
      console.log(`✅ ${key}: ES="${esValue}", EN="${enValue}"`);
    } else {
      console.log(`❌ ${key}: FALTANTE - ES="${esValue}", EN="${enValue}"`);
      allKeysPresent = false;
    }
  });
  
  if (allKeysPresent) {
    console.log('\n🎉 ÉXITO: Todas las traducciones necesarias están presentes');
    console.log('\n📋 Pasos de verificación manual:');
    console.log('1. Ejecutar la aplicación: npm run dev');
    console.log('2. Verificar que el selector de idioma se muestra correctamente');
    console.log('3. Probar cambio de ES ↔ EN');
    console.log('4. Verificar que las traducciones se muestran en el idioma correcto');
    console.log('5. Confirmar que no aparecen [CLAVE_NO_ENCONTRADA]');
  } else {
    console.log('\n❌ ERROR: Faltan traducciones. Revisar los archivos JSON.');
  }
  
} catch (error) {
  console.error('❌ ERROR al leer archivos de traducción:', error.message);
}

console.log('\n=== Fin del Test ==='); 
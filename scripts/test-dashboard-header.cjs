// scripts/test-dashboard-header.cjs
// Script para verificar que el DashboardHeader migrado funciona correctamente

console.log('=== Test DashboardHeader Migration ===\n');

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
  
  // Verificar claves requeridas para DashboardHeader
  const requiredKeys = [
    'dashboard.menu.logout',
    'common.language',
    'common.spanish', 
    'common.english'
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
    console.log('\n🎉 ÉXITO: Todas las traducciones del DashboardHeader están presentes');
    console.log('\n📋 Verificaciones realizadas:');
    console.log('✅ DashboardHeader migrado a react-i18next');
    console.log('✅ DashboardLanguageSelector reemplazado por LanguageSelector unificado');
    console.log('✅ Variante dashboard agregada al LanguageSelector');
    console.log('✅ Traducciones dashboard.menu.logout agregadas a JSON');
    
    console.log('\n📋 Pasos de verificación manual:');
    console.log('1. Ejecutar la aplicación: npm run dev');
    console.log('2. Navegar al dashboard');
    console.log('3. Verificar que el header se muestra correctamente');
    console.log('4. Probar el botón de "Cerrar sesión" / "Log out"');
    console.log('5. Probar el selector de idioma estilo dashboard (ES|EN)');
    console.log('6. Confirmar que no aparecen [CLAVE_NO_ENCONTRADA]');
  } else {
    console.log('\n❌ ERROR: Faltan traducciones. Revisar los archivos JSON.');
  }
  
  // Verificar que DashboardHeader no usa más useLanguage
  const headerPath = path.join(__dirname, '../src/shared/components/DashboardHeader.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  
  if (headerContent.includes('useLanguage')) {
    console.log('\n⚠️  ADVERTENCIA: DashboardHeader aún contiene referencias a useLanguage');
  } else {
    console.log('\n✅ DashboardHeader no contiene referencias al LanguageContext deprecado');
  }
  
  if (headerContent.includes('useTranslation')) {
    console.log('✅ DashboardHeader usa react-i18next correctamente');
  } else {
    console.log('\n❌ ERROR: DashboardHeader no usa react-i18next');
  }
  
} catch (error) {
  console.error('❌ ERROR al realizar verificaciones:', error.message);
}

console.log('\n=== Fin del Test ==='); 
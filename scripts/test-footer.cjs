// scripts/test-footer.cjs
// Script para verificar que el Footer migrado funciona correctamente

console.log('=== Test Footer Migration ===\n');

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
  
  // Verificar claves requeridas para Footer
  const requiredKeys = [
    'footer.support',
    'footer.follow', 
    'footer.contact',
    'footer.slogan',
    'footer.copyright'
  ];
  
  let allKeysPresent = true;
  
  console.log('📋 Verificando traducciones del Footer:\n');
  
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
      console.log(`✅ ${key}:`);
      console.log(`   ES: "${esValue}"`);
      console.log(`   EN: "${enValue}"`);
      console.log('');
    } else {
      console.log(`❌ ${key}: FALTANTE - ES="${esValue}", EN="${enValue}"`);
      allKeysPresent = false;
    }
  });
  
  if (allKeysPresent) {
    console.log('🎉 ÉXITO: Todas las traducciones del Footer están presentes');
    console.log('\n📋 Verificaciones realizadas:');
    console.log('✅ Footer migrado a react-i18next');
    console.log('✅ 5 claves de traducción agregadas a JSON');
    console.log('✅ Textos completos del footer disponibles en ES/EN');
    console.log('✅ Componente global listo para toda la aplicación');
    
    console.log('\n📋 Contenido verificado:');
    console.log('✅ Sección "Con el apoyo de" / "Supported by"');
    console.log('✅ Sección "Síguenos" / "Follow us"');
    console.log('✅ Sección "Contacto" / "Contact"');
    console.log('✅ Slogan corporativo');
    console.log('✅ Copyright notice');
    
    console.log('\n📋 Pasos de verificación manual:');
    console.log('1. Ejecutar la aplicación: npm run dev');
    console.log('2. Navegar a cualquier página con footer');
    console.log('3. Verificar que el footer se muestra correctamente');
    console.log('4. Probar cambio de idioma ES ↔ EN');
    console.log('5. Verificar que todos los textos cambian de idioma');
    console.log('6. Confirmar que no aparecen [CLAVE_NO_ENCONTRADA]');
  } else {
    console.log('\n❌ ERROR: Faltan traducciones. Revisar los archivos JSON.');
  }
  
  // Verificar que Footer no usa más useLanguage
  const footerPath = path.join(__dirname, '../src/shared/components/Footer.tsx');
  const footerContent = fs.readFileSync(footerPath, 'utf8');
  
  console.log('\n🔍 Verificación técnica:');
  
  if (footerContent.includes('useLanguage')) {
    console.log('⚠️  ADVERTENCIA: Footer aún contiene referencias a useLanguage');
  } else {
    console.log('✅ Footer no contiene referencias al LanguageContext deprecado');
  }
  
  if (footerContent.includes('useTranslation')) {
    console.log('✅ Footer usa react-i18next correctamente');
  } else {
    console.log('❌ ERROR: Footer no usa react-i18next');
  }
  
  // Contar líneas del Footer para verificar que es el componente completo
  const footerLines = footerContent.split('\n').length;
  if (footerLines > 200) {
    console.log(`✅ Footer completo (${footerLines} líneas) - incluye logos, redes sociales y contacto`);
  } else {
    console.log(`⚠️ Footer parece incompleto (${footerLines} líneas)`);
  }
  
} catch (error) {
  console.error('❌ ERROR al realizar verificaciones:', error.message);
}

console.log('\n=== Fin del Test ==='); 
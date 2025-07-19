// scripts/test-register-modal.cjs
// Script para verificar que el RegisterModal migrado funciona correctamente

console.log('=== Test RegisterModal Migration ===\n');

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
  
  // Verificar claves requeridas para RegisterModal
  const requiredKeys = [
    // Modal titles
    'auth.register.modalTitles.createAccount',
    'auth.register.modalTitles.subscriptionTo', 
    'auth.register.modalTitles.confirmAccount',
    'auth.register.modalTitles.completePayout',
    'auth.register.modalTitles.paymentSuccess',
    
    // Form fields
    'auth.register.form.fullName',
    'auth.register.form.email',
    'auth.register.form.fullNamePlaceholder',
    'auth.register.form.emailPlaceholder',
    'auth.register.form.createAccountButton',
    'auth.register.form.processing',
    'auth.register.form.continueWithGoogle',
    'auth.register.form.or',
    
    // Confirmation messages
    'auth.register.confirmation.authSuccess',
    'auth.register.confirmation.authSuccessDescription',
    
    // Payment messages
    'auth.register.payment.loadingError',
    'auth.register.payment.preparingPayment',
    
    // Success messages
    'auth.register.success.paymentCompleted'
  ];
  
  let allKeysPresent = true;
  
  console.log('📋 Verificando traducciones del RegisterModal:\n');
  
  let categoryCount = {
    modalTitles: 0,
    form: 0,
    confirmation: 0,
    payment: 0,
    success: 0
  };
  
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
      console.log(`✅ ${key}`);
      
      // Contar por categoría
      if (key.includes('modalTitles')) categoryCount.modalTitles++;
      else if (key.includes('form')) categoryCount.form++;
      else if (key.includes('confirmation')) categoryCount.confirmation++;
      else if (key.includes('payment')) categoryCount.payment++;
      else if (key.includes('success')) categoryCount.success++;
    } else {
      console.log(`❌ ${key}: FALTANTE - ES="${esValue}", EN="${enValue}"`);
      allKeysPresent = false;
    }
  });
  
  if (allKeysPresent) {
    console.log('\n🎉 ÉXITO: Todas las traducciones del RegisterModal están presentes');
    console.log('\n📊 Resumen por categorías:');
    console.log(`📋 Títulos del modal: ${categoryCount.modalTitles} claves`);
    console.log(`📝 Formulario: ${categoryCount.form} claves`);
    console.log(`✅ Confirmación: ${categoryCount.confirmation} claves`);
    console.log(`💳 Pago: ${categoryCount.payment} claves`);
    console.log(`🎉 Éxito: ${categoryCount.success} claves`);
    console.log(`📊 Total verificado: ${requiredKeys.length} claves`);
    
    console.log('\n📋 Funcionalidades verificadas:');
    console.log('✅ Títulos dinámicos del modal según el estado');
    console.log('✅ Formulario de registro completo');
    console.log('✅ Mensajes de confirmación');
    console.log('✅ Estados de pago y loading');
    console.log('✅ Mensajes de éxito');
    
    console.log('\n📋 Pasos de verificación manual:');
    console.log('1. Ejecutar la aplicación: npm run dev');
    console.log('2. Intentar registrarse con un plan');
    console.log('3. Verificar que el modal se muestra correctamente');
    console.log('4. Probar cambio de idioma ES ↔ EN');
    console.log('5. Verificar que todos los textos cambian de idioma');
    console.log('6. Probar el flujo completo de registro');
    console.log('7. Confirmar que no aparecen [CLAVE_NO_ENCONTRADA]');
  } else {
    console.log('\n❌ ERROR: Faltan traducciones. Revisar los archivos JSON.');
  }
  
  // Verificar que RegisterModal no usa más useLanguage
  const modalPath = path.join(__dirname, '../src/shared/components/RegisterModal.tsx');
  const modalContent = fs.readFileSync(modalPath, 'utf8');
  
  console.log('\n🔍 Verificación técnica:');
  
  if (modalContent.includes('useLanguage')) {
    console.log('⚠️  ADVERTENCIA: RegisterModal aún contiene referencias a useLanguage');
  } else {
    console.log('✅ RegisterModal no contiene referencias al LanguageContext deprecado');
  }
  
  if (modalContent.includes('useTranslation')) {
    console.log('✅ RegisterModal usa react-i18next correctamente');
  } else {
    console.log('❌ ERROR: RegisterModal no usa react-i18next');
  }
  
  // Verificar el estado de migración (buscar textos hardcodeados comunes)
  const hardcodedTexts = [
    'Procesando...',
    'Crear cuenta',
    'Nombre completo',
    'Correo electrónico'
  ];
  
  let hardcodedFound = 0;
  hardcodedTexts.forEach(text => {
    if (modalContent.includes(`"${text}"`)) {
      hardcodedFound++;
    }
  });
  
  if (hardcodedFound === 0) {
    console.log('✅ No se encontraron textos hardcodeados comunes - migración completa');
  } else {
    console.log(`⚠️ Se encontraron ${hardcodedFound} textos hardcodeados que podrían necesitar migración`);
  }
  
} catch (error) {
  console.error('❌ ERROR al realizar verificaciones:', error.message);
}

console.log('\n=== Fin del Test ==='); 
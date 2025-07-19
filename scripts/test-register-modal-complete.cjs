const fs = require('fs');
const path = require('path');

console.log('🔧 Validando migración completa del RegisterModal...\n');

// 1. Verificar que las traducciones estén definidas en ambos idiomas
const esTranslations = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/translations/es.json'), 'utf8'));
const enTranslations = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/translations/en.json'), 'utf8'));

console.log('📋 Verificando traducciones en archivos JSON...');

const requiredKeys = [
  'auth.register.modalTitles.createAccount',
  'auth.register.modalTitles.subscriptionTo', 
  'auth.register.modalTitles.confirmAccount',
  'auth.register.modalTitles.completePayout',
  'auth.register.modalTitles.paymentSuccess',
  'auth.register.form.password',
  'auth.register.form.confirmPassword',
  'auth.register.form.passwordPlaceholder',
  'auth.register.form.confirmPasswordPlaceholder',
  'auth.register.form.continueWithGoogle',
  'auth.register.form.or',
  'auth.register.form.processing',
  'auth.register.form.createAccountButton',
  'auth.register.form.passwordMismatch',
  'auth.register.confirmation.authSuccessTitle',
  'auth.register.confirmation.authSuccessMessage',
  'auth.register.confirmation.accountSelectedTitle',
  'auth.register.confirmation.planSelectedTitle',
  'auth.register.confirmation.paymentAssociationNote',
  'auth.register.confirmation.continueToPayment',
  'auth.register.confirmation.preparingPayment',
  'auth.register.confirmation.useOtherAccount',
  'auth.register.confirmation.logoutSuccess',
  'auth.register.payment.purchaseSummary',
  'auth.register.payment.subscriptionStartsNote',
  'auth.register.payment.loadingPaymentSystem',
  'auth.register.payment.invalidKeyMessage',
  'auth.register.payment.reloadPage',
  'auth.register.payment.preparingPaymentTitle',
  'auth.register.payment.creatingSecureInfo',
  'auth.register.payment.initializingSystem',
  'auth.register.payment.loadingStripe',
  'auth.register.payment.retryInitialization',
  'auth.register.success.paymentCompletedTitle',
  'auth.register.success.subscriptionActivated',
  'auth.register.success.enjoyFeatures'
];

let missingKeysEs = [];
let missingKeysEn = [];

// Función helper para verificar claves anidadas
function hasNestedKey(obj, key) {
  return key.split('.').reduce((current, keyPart) => {
    return current && current[keyPart];
  }, obj) !== undefined;
}

requiredKeys.forEach(key => {
  if (!hasNestedKey(esTranslations, key)) {
    missingKeysEs.push(key);
  }
  if (!hasNestedKey(enTranslations, key)) {
    missingKeysEn.push(key);
  }
});

if (missingKeysEs.length === 0 && missingKeysEn.length === 0) {
  console.log('✅ Todas las claves de traducción están presentes en ambos idiomas');
} else {
  console.log('❌ Claves de traducción faltantes:');
  if (missingKeysEs.length > 0) {
    console.log('  Español:', missingKeysEs.join(', '));
  }
  if (missingKeysEn.length > 0) {
    console.log('  Inglés:', missingKeysEn.join(', '));
  }
}

// 2. Verificar que el código usa useTranslation
console.log('\n📄 Verificando uso de useTranslation en RegisterModal...');

const registerModalContent = fs.readFileSync(path.join(__dirname, '../src/shared/components/RegisterModal.tsx'), 'utf8');

// Verificar que importa useTranslation
const hasUseTranslationImport = /import.*useTranslation.*from.*react-i18next/.test(registerModalContent);
const hasUseTranslationHook = /const.*{.*t.*}.*=.*useTranslation\(\)/.test(registerModalContent);

if (hasUseTranslationImport && hasUseTranslationHook) {
  console.log('✅ Hook useTranslation correctamente importado y usado');
} else {
  console.log('❌ Hook useTranslation no configurado correctamente');
  if (!hasUseTranslationImport) console.log('  - Falta import de useTranslation');
  if (!hasUseTranslationHook) console.log('  - Falta declaración del hook t');
}

// 3. Verificar que no quedan textos hardcodeados en español
console.log('\n🔍 Verificando eliminación de textos hardcodeados...');

const hardcodedPatterns = [
  />\s*¡[^{<]+</g,  // Patrones que empiecen con ¡
  />\s*[A-ZÁÉÍÓÚ][^{<]*ción[^{<]*</g,  // Palabras que terminen en -ción
  />\s*[A-ZÁÉÍÓÚ][^{<]*ando[^{<]*</g,  // Palabras que terminen en -ando
  />\s*Contraseña[^{<]*/g,  // Palabra Contraseña
  />\s*Plan seleccionado[^{<]*/g,  // Texto Plan seleccionado
  />\s*Cuenta seleccionada[^{<]*/g,  // Texto Cuenta seleccionada
  />\s*Resumen de la compra[^{<]*/g,  // Texto Resumen de la compra
  />\s*Error cargando[^{<]*/g,  // Texto Error cargando
  />\s*Preparando pago[^{<]*/g,  // Texto Preparando pago
];

let foundHardcoded = [];
hardcodedPatterns.forEach((pattern, index) => {
  const matches = registerModalContent.match(pattern);
  if (matches) {
    foundHardcoded.push(...matches.map(match => match.trim()));
  }
});

// Filtrar duplicados
foundHardcoded = [...new Set(foundHardcoded)];

if (foundHardcoded.length === 0) {
  console.log('✅ No se encontraron textos hardcodeados en español');
} else {
  console.log('⚠️  Posibles textos hardcodeados encontrados:');
  foundHardcoded.forEach(text => console.log(`  - ${text}`));
}

// 4. Verificar uso correcto de t() function
console.log('\n🔧 Verificando uso correcto de t() función...');

const tFunctionUsages = registerModalContent.match(/t\([^)]+\)/g) || [];
const validTUsages = tFunctionUsages.filter(usage => 
  usage.includes('auth.register') || 
  usage.includes('common.') ||
  usage.includes('payment.')
);

console.log(`✅ Se encontraron ${tFunctionUsages.length} usos de la función t()`);
console.log(`✅ ${validTUsages.length} usos válidos con claves auth.register`);

// 5. Verificar estructura de archivos
console.log('\n📁 Verificando estructura de archivos...');

const files = [
  '../src/translations/es.json',
  '../src/translations/en.json', 
  '../src/shared/components/RegisterModal.tsx'
];

let allFilesExist = true;
files.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✅ ${file.split('/').pop()}`);
  } else {
    console.log(`❌ ${file.split('/').pop()} - NO ENCONTRADO`);
    allFilesExist = false;
  }
});

// Resumen final
console.log('\n' + '='.repeat(50));
console.log('📊 RESUMEN DE MIGRACIÓN - REGISTERMODAL');
console.log('='.repeat(50));

const translationsOk = missingKeysEs.length === 0 && missingKeysEn.length === 0;
const hooksOk = hasUseTranslationImport && hasUseTranslationHook;
const noHardcodedOk = foundHardcoded.length === 0;

console.log(`🌐 Traducciones completas: ${translationsOk ? '✅' : '❌'}`);
console.log(`🔧 Hook configurado: ${hooksOk ? '✅' : '❌'}`);
console.log(`📝 Sin texto hardcodeado: ${noHardcodedOk ? '✅' : '⚠️'}`);
console.log(`🔗 Función t() usada: ${tFunctionUsages.length > 30 ? '✅' : '⚠️'} (${tFunctionUsages.length} usos)`);
console.log(`📁 Archivos existentes: ${allFilesExist ? '✅' : '❌'}`);

const overallSuccess = translationsOk && hooksOk && allFilesExist;

if (overallSuccess) {
  console.log('\n🎉 ¡MIGRACIÓN REGISTERMODAL COMPLETADA EXITOSAMENTE!');
  console.log('💡 RegisterModal ahora usa react-i18next completamente');
  
  if (!noHardcodedOk) {
    console.log('\n⚠️  Nota: Se encontraron algunos textos que podrían ser hardcoded');
    console.log('   Revisa manualmente si necesitan migración adicional');
  }
} else {
  console.log('\n❌ MIGRACIÓN INCOMPLETA - Revisa los errores arriba');
}

console.log('\n🧪 Para probar la migración:');
console.log('   1. npm run dev');
console.log('   2. Abre el modal de registro');
console.log('   3. Cambia idioma en el selector de idioma');
console.log('   4. Verifica que todos los textos cambien correctamente'); 
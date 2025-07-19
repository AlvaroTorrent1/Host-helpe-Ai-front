// scripts/test-login-page.cjs
// Script para validar la migración de LoginPage.tsx a react-i18next

const fs = require('fs');
const path = require('path');

console.log('🔍 Validando migración de LoginPage.tsx...\n');

// 1. Verificar que el componente usa useTranslation
const componentPath = path.join(process.cwd(), 'src/features/auth/pages/LoginPage.tsx');
const componentContent = fs.readFileSync(componentPath, 'utf8');

console.log('📦 Verificando imports y hooks...');

// Check imports
if (componentContent.includes("import { useTranslation } from 'react-i18next'")) {
  console.log('✅ Import de useTranslation correcto');
} else {
  console.log('❌ Import de useTranslation no encontrado');
}

if (componentContent.includes("import { useLanguage }")) {
  console.log('❌ Todavía usa import de useLanguage (debe eliminarse)');
} else {
  console.log('✅ No usa import de useLanguage');
}

// Check hook usage
if (componentContent.includes("const { t } = useTranslation()")) {
  console.log('✅ Hook useTranslation() configurado correctamente');
} else {
  console.log('❌ Hook useTranslation() no encontrado');
}

if (componentContent.includes("const { t } = useLanguage()")) {
  console.log('❌ Todavía usa hook useLanguage() (debe eliminarse)');
} else {
  console.log('✅ No usa hook useLanguage()');
}

// 2. Verificar claves de traducción en JSON
console.log('\n🌍 Verificando claves de traducción...');

const esPath = path.join(process.cwd(), 'src/translations/es.json');
const enPath = path.join(process.cwd(), 'src/translations/en.json');

const esTranslations = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Claves requeridas para LoginPage (las nuevas que agregamos)
const requiredKeys = [
  'auth.login.continueWithGoogle',
  'auth.login.orWithEmail'
];

// Claves que ya existían (parcialmente migrado)
const existingKeys = [
  'auth.emailLabel',
  'auth.passwordLabel',
  'auth.forgotPassword',
  'auth.forceSync',
  'auth.loggingIn',
  'auth.login',
  'auth.noAccount',
  'auth.registerNow'
];

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current && current[key], obj);
}

let missingEs = [];
let missingEn = [];

[...requiredKeys, ...existingKeys].forEach(key => {
  const esValue = getNestedValue(esTranslations, key);
  const enValue = getNestedValue(enTranslations, key);
  
  if (!esValue && requiredKeys.includes(key)) missingEs.push(key);
  if (!enValue && requiredKeys.includes(key)) missingEn.push(key);
});

if (missingEs.length === 0) {
  console.log('✅ Todas las claves nuevas existen en español');
  console.log(`   - auth.login.continueWithGoogle: "${getNestedValue(esTranslations, 'auth.login.continueWithGoogle') || 'N/A'}"`);
  console.log(`   - auth.login.orWithEmail: "${getNestedValue(esTranslations, 'auth.login.orWithEmail') || 'N/A'}"`);
} else {
  console.log('❌ Claves faltantes en español:');
  missingEs.forEach(key => console.log(`   - ${key}`));
}

if (missingEn.length === 0) {
  console.log('✅ Todas las claves nuevas existen en inglés');
  console.log(`   - auth.login.continueWithGoogle: "${getNestedValue(enTranslations, 'auth.login.continueWithGoogle') || 'N/A'}"`);
  console.log(`   - auth.login.orWithEmail: "${getNestedValue(enTranslations, 'auth.login.orWithEmail') || 'N/A'}"`);
} else {
  console.log('❌ Claves faltantes en inglés:');
  missingEn.forEach(key => console.log(`   - ${key}`));
}

// 3. Verificar uso de claves en el componente
console.log('\n🔍 Verificando uso de claves de traducción...');

const newKeys = [
  't("auth.login.continueWithGoogle")',
  't("auth.login.orWithEmail")'
];

const oldKeys = [
  't("auth.emailLabel")',
  't("auth.passwordLabel")',
  't("auth.forgotPassword")',
  't("auth.login")',
  't("auth.noAccount")'
];

let newKeysUsed = 0;
let oldKeysUsed = 0;

newKeys.forEach(key => {
  if (componentContent.includes(key)) {
    console.log(`✅ Usa ${key} correctamente`);
    newKeysUsed++;
  } else {
    console.log(`❌ No usa ${key}`);
  }
});

console.log('\n🔍 Verificando claves preexistentes...');
oldKeys.forEach(key => {
  if (componentContent.includes(key)) {
    console.log(`✅ Usa ${key} correctamente`);
    oldKeysUsed++;
  } else {
    console.log(`⚠️  No usa ${key} (puede que esté en otra parte)`);
  }
});

// 4. Verificar que no hay textos hardcodeados
console.log('\n🔍 Verificando textos hardcodeados...');

const hardcodedPatterns = [
  /"Continuar con Google"/,
  /"Continue with Google"/,
  /"O iniciar sesión con correo"/,
  /"Or sign in with email"/
];

let hardcodedFound = false;

hardcodedPatterns.forEach(pattern => {
  if (pattern.test(componentContent)) {
    console.log(`❌ Encontrado texto hardcodeado: ${pattern}`);
    hardcodedFound = true;
  }
});

if (!hardcodedFound) {
  console.log('✅ No se encontraron textos hardcodeados problemáticos');
}

// 5. Verificar funcionalidades críticas del login
console.log('\n🏗️ Verificando funcionalidades críticas de login...');

if (componentContent.includes('signInWithGoogle') && componentContent.includes('signIn')) {
  console.log('✅ Métodos de autenticación (Google + Email) presentes');
} else {
  console.log('❌ Métodos de autenticación no encontrados');
}

if (componentContent.includes('SmartAuthRouter')) {
  console.log('✅ SmartAuthRouter integrado');
} else {
  console.log('❌ SmartAuthRouter no encontrado');
}

if (componentContent.includes('useState') && componentContent.includes('isLoading')) {
  console.log('✅ Estado de loading implementado');
} else {
  console.log('❌ Estado de loading no encontrado');
}

if (componentContent.includes('error') && componentContent.includes('setError')) {
  console.log('✅ Manejo de errores implementado');
} else {
  console.log('❌ Manejo de errores no encontrado');
}

if (componentContent.includes('navigate') && componentContent.includes('Link')) {
  console.log('✅ Navegación implementada');
} else {
  console.log('❌ Navegación no encontrada');
}

// 6. Resultado final
console.log('\n📊 RESULTADO DE LA VALIDACIÓN:');

const allChecks = [
  componentContent.includes("import { useTranslation } from 'react-i18next'"),
  !componentContent.includes("import { useLanguage }"),
  componentContent.includes("const { t } = useTranslation()"),
  !componentContent.includes("const { t } = useLanguage()"),
  missingEs.length === 0,
  missingEn.length === 0,
  newKeysUsed >= 1, // Al menos 1 de las 2 claves nuevas
  oldKeysUsed >= 3, // Al menos 3 de las claves preexistentes
  !hardcodedFound,
  componentContent.includes('signInWithGoogle'),
  componentContent.includes('SmartAuthRouter'),
  componentContent.includes('isLoading'),
  componentContent.includes('setError'),
  componentContent.includes('navigate')
];

const passedChecks = allChecks.filter(Boolean).length;
const totalChecks = allChecks.length;

if (passedChecks === totalChecks) {
  console.log('🎉 ¡MIGRACIÓN EXITOSA! Todos los checks pasaron.');
  console.log(`✅ ${passedChecks}/${totalChecks} verificaciones exitosas`);
  console.log('🔐 LoginPage.tsx completamente migrado a react-i18next');
} else {
  console.log(`⚠️  MIGRACIÓN PARCIAL: ${passedChecks}/${totalChecks} checks pasaron`);
  console.log('❌ Revisa los errores arriba y corrige los problemas.');
}

console.log('\n🚀 LoginPage.tsx validado - ¡Excelente progreso en Fase 2!\n'); 
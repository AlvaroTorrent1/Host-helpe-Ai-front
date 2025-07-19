// scripts/test-callback-page.cjs
// Script para validar la migración de CallbackPage.tsx a react-i18next

const fs = require('fs');
const path = require('path');

console.log('🔍 Validando migración de CallbackPage.tsx...\n');

// 1. Verificar que el componente usa useTranslation
const componentPath = path.join(process.cwd(), 'src/features/auth/pages/CallbackPage.tsx');
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

console.log('\n🌍 Verificando claves de traducción...');

const esPath = path.join(process.cwd(), 'src/translations/es.json');
const enPath = path.join(process.cwd(), 'src/translations/en.json');

const esTranslations = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Claves usadas por CallbackPage
const requiredKeys = ['common.loadingAuth', 'common.loadingSubtext'];

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current && current[key], obj);
}

let missingEs = [];
let missingEn = [];

requiredKeys.forEach(key => {
  const esValue = getNestedValue(esTranslations, key);
  const enValue = getNestedValue(enTranslations, key);
  
  if (!esValue) missingEs.push(key);
  if (!enValue) missingEn.push(key);
});

if (missingEs.length === 0) {
  console.log('✅ Todas las claves existen en español');
  console.log(`   - common.loadingAuth: "${esTranslations.common.loadingAuth}"`);
  console.log(`   - common.loadingSubtext: "${esTranslations.common.loadingSubtext}"`);
} else {
  console.log('❌ Claves faltantes en español:');
  missingEs.forEach(key => console.log(`   - ${key}`));
}

if (missingEn.length === 0) {
  console.log('✅ Todas las claves existen en inglés');
  console.log(`   - common.loadingAuth: "${enTranslations.common.loadingAuth}"`);
  console.log(`   - common.loadingSubtext: "${enTranslations.common.loadingSubtext}"`);
} else {
  console.log('❌ Claves faltantes en inglés:');
  missingEn.forEach(key => console.log(`   - ${key}`));
}

console.log('\n🔍 Verificando uso de claves...');
const usedKeys = [
  "t('common.loadingAuth')",
  "t('common.loadingSubtext')"
];

let keysUsed = 0;
usedKeys.forEach(key => {
  if (componentContent.includes(key)) {
    console.log(`✅ Usa ${key} correctamente`);
    keysUsed++;
  } else {
    console.log(`❌ No usa ${key}`);
  }
});

console.log('\n🔍 Verificando ausencia de fallbacks hardcodeados...');
const hardcodedFallbacks = [
  /"Procesando tu inicio de sesión"/,
  /"Por favor, espera un momento"/,
  / \|\| "/  // Patrón de fallback
];

let fallbacksFound = 0;
hardcodedFallbacks.forEach(pattern => {
  if (pattern.test(componentContent)) {
    console.log(`❌ Encontrado fallback hardcodeado: ${pattern}`);
    fallbacksFound++;
  }
});

if (fallbacksFound === 0) {
  console.log('✅ No se encontraron fallbacks hardcodeados - migración limpia');
}

console.log('\n🏗️ Verificando funcionalidades del callback...');

if (componentContent.includes('LoadingScreen')) {
  console.log('✅ LoadingScreen presente');
} else {
  console.log('❌ LoadingScreen no encontrado');
}

if (componentContent.includes('supabase.auth.getSession()')) {
  console.log('✅ Autenticación de Supabase presente');
} else {
  console.log('❌ Autenticación de Supabase no encontrada');
}

if (componentContent.includes('navigate')) {
  console.log('✅ Navegación implementada');
} else {
  console.log('❌ Navegación no encontrada');
}

console.log('\n📊 RESULTADO DE LA VALIDACIÓN:');

const allChecks = [
  componentContent.includes("import { useTranslation } from 'react-i18next'"),
  !componentContent.includes("import { useLanguage }"),
  componentContent.includes("const { t } = useTranslation()"),
  missingEs.length === 0,
  missingEn.length === 0,
  keysUsed === 2,
  fallbacksFound === 0,
  componentContent.includes('LoadingScreen'),
  componentContent.includes('supabase.auth.getSession()'),
  componentContent.includes('navigate')
];

const passedChecks = allChecks.filter(Boolean).length;
const totalChecks = allChecks.length;

if (passedChecks === totalChecks) {
  console.log('🎉 ¡MIGRACIÓN EXITOSA! Todos los checks pasaron.');
  console.log(`✅ ${passedChecks}/${totalChecks} verificaciones exitosas`);
  console.log('🔄 CallbackPage.tsx completamente limpio y migrado');
} else {
  console.log(`⚠️  MIGRACIÓN PARCIAL: ${passedChecks}/${totalChecks} checks pasaron`);
  console.log('❌ Revisa los errores arriba y corrige los problemas.');
}

console.log('\n🚀 CallbackPage.tsx validado - ¡Cuarto éxito en Fase 2!\n'); 
// scripts/test-auth-callback-page.cjs
// Script para validar la migración de AuthCallbackPage.tsx a react-i18next

const fs = require('fs');
const path = require('path');

console.log('🔍 Validando migración de AuthCallbackPage.tsx (COMPONENTE CRÍTICO)...\n');

// 1. Verificar que el componente usa useTranslation
const componentPath = path.join(process.cwd(), 'src/features/auth/pages/AuthCallbackPage.tsx');
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

// Claves requeridas para AuthCallbackPage
const requiredKeys = [
  'auth.callback.processing',
  'auth.callback.success',
  'auth.callback.errorTitle',
  'auth.callback.backToLogin',
  'auth.callback.debugInfo',
  'auth.callback.localhostError',
  'common.loading'
];

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
  console.log(`   - auth.callback.processing: "${esTranslations.auth.callback.processing}"`);
  console.log(`   - auth.callback.success: "${esTranslations.auth.callback.success}"`);
  console.log(`   - auth.callback.errorTitle: "${esTranslations.auth.callback.errorTitle}"`);
  console.log(`   - auth.callback.backToLogin: "${esTranslations.auth.callback.backToLogin}"`);
} else {
  console.log('❌ Claves faltantes en español:');
  missingEs.forEach(key => console.log(`   - ${key}`));
}

if (missingEn.length === 0) {
  console.log('✅ Todas las claves existen en inglés');
  console.log(`   - auth.callback.processing: "${enTranslations.auth.callback.processing}"`);
  console.log(`   - auth.callback.success: "${enTranslations.auth.callback.success}"`);
  console.log(`   - auth.callback.errorTitle: "${enTranslations.auth.callback.errorTitle}"`);
  console.log(`   - auth.callback.backToLogin: "${enTranslations.auth.callback.backToLogin}"`);
} else {
  console.log('❌ Claves faltantes en inglés:');
  missingEn.forEach(key => console.log(`   - ${key}`));
}

// 3. Verificar uso de claves en el componente
console.log('\n🔍 Verificando uso de claves de traducción...');

const callbackKeys = [
  't("auth.callback.processing")',
  't("auth.callback.success")',
  't("auth.callback.errorTitle")',
  't("auth.callback.backToLogin")',
  't("auth.callback.debugInfo")',
  't("auth.callback.localhostError")'
];

let keysUsed = 0;
callbackKeys.forEach(key => {
  if (componentContent.includes(key)) {
    console.log(`✅ Usa ${key} correctamente`);
    keysUsed++;
  } else {
    console.log(`❌ No usa ${key}`);
  }
});

// 4. Verificar que no hay textos hardcodeados
console.log('\n🔍 Verificando textos hardcodeados...');

const hardcodedPatterns = [
  /"Procesando autenticación"/,
  /"¡Autenticación exitosa!/,
  /"Oops, algo salió mal"/,
  /"Volver al inicio de sesión"/,
  /"Información técnica"/,
  /"Error de redirección:/,
  /"Processing authentication"/,
  /"Authentication successful!/,
  /"Oops, something went wrong"/,
  /"Back to login"/,
  /"Technical information"/,
  /"Redirect error:"/
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

// 5. Verificar características críticas del callback de auth
console.log('\n🏗️ Verificando funcionalidades críticas de autenticación...');

if (componentContent.includes('supabase.auth.getSession()')) {
  console.log('✅ Obtención de sesión de Supabase presente');
} else {
  console.log('❌ Obtención de sesión de Supabase no encontrada');
}

if (componentContent.includes('navigate("/dashboard")')) {
  console.log('✅ Redirección al dashboard implementada');
} else {
  console.log('❌ Redirección al dashboard no encontrada');
}

if (componentContent.includes('LoadingScreen') && componentContent.includes('isLoading')) {
  console.log('✅ Estado de loading implementado');
} else {
  console.log('❌ Estado de loading no encontrado');
}

if (componentContent.includes('localhost') && componentContent.includes('environment.development')) {
  console.log('✅ Validación de entorno localhost implementada');
} else {
  console.log('❌ Validación de entorno localhost no encontrada');
}

if (componentContent.includes('debug') && componentContent.includes('import.meta.env.DEV')) {
  console.log('✅ Información de debug para desarrollo presente');
} else {
  console.log('❌ Información de debug no encontrada');
}

if (componentContent.includes('window.location.hash') && componentContent.includes('window.location.search')) {
  console.log('✅ Manejo de parámetros de URL implementado');
} else {
  console.log('❌ Manejo de parámetros de URL no encontrado');
}

if (componentContent.includes('AuthDebugInfo') && componentContent.includes('collectDebugInfo')) {
  console.log('✅ Sistema de debug estructurado implementado');
} else {
  console.log('❌ Sistema de debug estructurado no encontrado');
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
  keysUsed >= 4, // Al menos 4 de las 6 claves principales usadas
  !hardcodedFound,
  componentContent.includes('supabase.auth.getSession()'),
  componentContent.includes('navigate("/dashboard")'),
  componentContent.includes('LoadingScreen') && componentContent.includes('isLoading'),
  componentContent.includes('localhost') && componentContent.includes('environment.development'),
  componentContent.includes('debug') && componentContent.includes('import.meta.env.DEV'),
  componentContent.includes('window.location.hash'),
  componentContent.includes('AuthDebugInfo')
];

const passedChecks = allChecks.filter(Boolean).length;
const totalChecks = allChecks.length;

if (passedChecks === totalChecks) {
  console.log('🎉 ¡MIGRACIÓN EXITOSA! Todos los checks pasaron.');
  console.log(`✅ ${passedChecks}/${totalChecks} verificaciones exitosas`);
  console.log('🔐 AuthCallbackPage.tsx listo para autenticación segura');
} else {
  console.log(`⚠️  MIGRACIÓN PARCIAL: ${passedChecks}/${totalChecks} checks pasaron`);
  console.log('❌ Revisa los errores arriba y corrige los problemas.');
}

console.log('\n🚀 AuthCallbackPage.tsx validado - Fase 2 en progreso\n'); 
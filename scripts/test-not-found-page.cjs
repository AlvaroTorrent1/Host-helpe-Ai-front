// scripts/test-not-found-page.cjs
// Script para validar la migración de NotFoundPage.tsx a react-i18next

const fs = require('fs');
const path = require('path');

console.log('🔍 Validando migración de NotFoundPage.tsx...\n');

// 1. Verificar que el componente usa useTranslation
const componentPath = path.join(process.cwd(), 'src/shared/components/NotFoundPage.tsx');
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

// Claves requeridas para NotFoundPage
const requiredKeys = [
  'notFound.title',
  'notFound.description',
  'notFound.buttons.goHome',
  'notFound.buttons.goDashboard'
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
  console.log(`   - notFound.title: "${esTranslations.notFound.title}"`);
  console.log(`   - notFound.description: "${esTranslations.notFound.description.substring(0, 30)}..."`);
  console.log(`   - notFound.buttons.goHome: "${esTranslations.notFound.buttons.goHome}"`);
  console.log(`   - notFound.buttons.goDashboard: "${esTranslations.notFound.buttons.goDashboard}"`);
} else {
  console.log('❌ Claves faltantes en español:');
  missingEs.forEach(key => console.log(`   - ${key}`));
}

if (missingEn.length === 0) {
  console.log('✅ Todas las claves existen en inglés');
  console.log(`   - notFound.title: "${enTranslations.notFound.title}"`);
  console.log(`   - notFound.description: "${enTranslations.notFound.description.substring(0, 30)}..."`);
  console.log(`   - notFound.buttons.goHome: "${enTranslations.notFound.buttons.goHome}"`);
  console.log(`   - notFound.buttons.goDashboard: "${enTranslations.notFound.buttons.goDashboard}"`);
} else {
  console.log('❌ Claves faltantes en inglés:');
  missingEn.forEach(key => console.log(`   - ${key}`));
}

// 3. Verificar uso de claves en el componente
console.log('\n🔍 Verificando uso de claves de traducción...');

if (componentContent.includes('t("notFound.title")')) {
  console.log('✅ Usa la clave notFound.title correctamente');
} else {
  console.log('❌ No usa la clave notFound.title');
}

if (componentContent.includes('t("notFound.description")')) {
  console.log('✅ Usa la clave notFound.description correctamente');
} else {
  console.log('❌ No usa la clave notFound.description');
}

if (componentContent.includes('t("notFound.buttons.goHome")')) {
  console.log('✅ Usa la clave notFound.buttons.goHome correctamente');
} else {
  console.log('❌ No usa la clave notFound.buttons.goHome');
}

if (componentContent.includes('t("notFound.buttons.goDashboard")')) {
  console.log('✅ Usa la clave notFound.buttons.goDashboard correctamente');
} else {
  console.log('❌ No usa la clave notFound.buttons.goDashboard');
}

// 4. Verificar que no hay textos hardcodeados
console.log('\n🔍 Verificando textos hardcodeados...');

const hardcodedPatterns = [
  /"Página no encontrada"/,
  /"Page not found"/,
  /"Lo sentimos, la página"/,
  /"Sorry, the page"/,
  /"Volver al inicio"/,
  /"Go back home"/,
  /"Ir al dashboard"/,
  /"Go to dashboard"/
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

// 5. Verificar estructura del componente
console.log('\n🏗️ Verificando estructura del componente...');

if (componentContent.includes('404') && componentContent.includes('text-6xl')) {
  console.log('✅ Número 404 presente con estilos correctos');
} else {
  console.log('❌ Número 404 no encontrado o mal estilizado');
}

if (componentContent.includes('Link') && componentContent.includes('to="/"') && componentContent.includes('to="/dashboard"')) {
  console.log('✅ Enlaces de navegación correctamente configurados');
} else {
  console.log('❌ Enlaces de navegación no encontrados o mal configurados');
}

if (componentContent.includes('min-h-screen') && componentContent.includes('flex flex-col justify-center')) {
  console.log('✅ Layout centrado correctamente implementado');
} else {
  console.log('❌ Layout centrado no encontrado');
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
  componentContent.includes('t("notFound.title")'),
  componentContent.includes('t("notFound.description")'),
  componentContent.includes('t("notFound.buttons.goHome")'),
  componentContent.includes('t("notFound.buttons.goDashboard")'),
  !hardcodedFound,
  componentContent.includes('404') && componentContent.includes('text-6xl'),
  componentContent.includes('Link') && componentContent.includes('to="/"'),
  componentContent.includes('min-h-screen')
];

const passedChecks = allChecks.filter(Boolean).length;
const totalChecks = allChecks.length;

if (passedChecks === totalChecks) {
  console.log('🎉 ¡MIGRACIÓN EXITOSA! Todos los checks pasaron.');
  console.log(`✅ ${passedChecks}/${totalChecks} verificaciones exitosas`);
} else {
  console.log(`⚠️  MIGRACIÓN PARCIAL: ${passedChecks}/${totalChecks} checks pasaron`);
  console.log('❌ Revisa los errores arriba y corrige los problemas.');
}

console.log('\n🚀 NotFoundPage.tsx validado - ¡Excelente progreso en componentes simples!\n'); 
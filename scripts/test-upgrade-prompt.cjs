// scripts/test-upgrade-prompt.cjs
// Script para validar la migración de UpgradePrompt.tsx a react-i18next

const fs = require('fs');
const path = require('path');

console.log('🔍 Validando migración de UpgradePrompt.tsx...\n');

// 1. Verificar que el componente usa useTranslation
const componentPath = path.join(process.cwd(), 'src/shared/components/UpgradePrompt.tsx');
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

// Claves requeridas para UpgradePrompt
const requiredKeys = [
  'common.close',
  'upgrade.features.property.title',
  'upgrade.features.property.description',
  'upgrade.features.reservation.title',
  'upgrade.features.reservation.description', 
  'upgrade.features.analytics.title',
  'upgrade.features.analytics.description',
  'upgrade.features.export.title',
  'upgrade.features.export.description',
  'upgrade.features.custom.title',
  'upgrade.features.custom.description',
  'upgrade.plans.professional.recommend',
  'upgrade.plans.professional.features.properties',
  'upgrade.plans.professional.features.basic',
  'upgrade.plans.professional.features.priority',
  'upgrade.plans.professional.features.analytics',
  'upgrade.plans.professional.features.legal',
  'upgrade.plans.professional.features.automation',
  'upgrade.plans.pro.features.unlimited_properties',
  'upgrade.plans.pro.features.unlimited_reservations',
  'upgrade.plans.pro.features.advanced_analytics',
  'upgrade.plans.pro.features.data_export',
  'upgrade.plans.enterprise.features.everything_pro',
  'upgrade.plans.enterprise.features.priority_support',
  'upgrade.plans.enterprise.features.custom_integrations',
  'upgrade.actions.later',
  'upgrade.actions.viewPlans',
  'upgrade.freeReminder'
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
} else {
  console.log('❌ Claves faltantes en español:');
  missingEs.forEach(key => console.log(`   - ${key}`));
}

if (missingEn.length === 0) {
  console.log('✅ Todas las claves existen en inglés');
} else {
  console.log('❌ Claves faltantes en inglés:');
  missingEn.forEach(key => console.log(`   - ${key}`));
}

// 3. Verificar que no hay textos hardcodeados problemáticos
console.log('\n🔍 Verificando textos hardcodeados...');

const hardcodedPatterns = [
  /aria-label="[^{]/,  // aria-label hardcodeado
  /"Cerrar"/,          // "Cerrar" hardcodeado
  /"Más tarde"/,       // "Más tarde" hardcodeado
  /"Ver planes"/       // "Ver planes" hardcodeado
];

let hardcodedFound = false;

hardcodedPatterns.forEach(pattern => {
  if (pattern.test(componentContent)) {
    console.log(`❌ Encontrado texto hardcodeado que coincide con: ${pattern}`);
    hardcodedFound = true;
  }
});

if (!hardcodedFound) {
  console.log('✅ No se encontraron textos hardcodeados problemáticos');
}

// 4. Verificar estructura del componente
console.log('\n🏗️ Verificando estructura del componente...');

if (componentContent.includes('t(\'upgrade.features.')) {
  console.log('✅ Usa claves de traducción para features');
} else {
  console.log('❌ No usa claves de traducción para features');
}

if (componentContent.includes('t(\'upgrade.plans.')) {
  console.log('✅ Usa claves de traducción para plans');
} else {
  console.log('❌ No usa claves de traducción para plans');
}

if (componentContent.includes('t(\'upgrade.actions.')) {
  console.log('✅ Usa claves de traducción para actions');
} else {
  console.log('❌ No usa claves de traducción para actions');
}

// 5. Resultado final
console.log('\n📊 RESULTADO DE LA VALIDACIÓN:');

const allChecks = [
  componentContent.includes("import { useTranslation } from 'react-i18next'"),
  !componentContent.includes("import { useLanguage }"),
  componentContent.includes("const { t } = useTranslation()"),
  !componentContent.includes("const { t } = useLanguage()"),
  missingEs.length === 0,
  missingEn.length === 0,
  !hardcodedFound,
  componentContent.includes('t(\'upgrade.features.'),
  componentContent.includes('t(\'upgrade.plans.'),
  componentContent.includes('t(\'upgrade.actions.')
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

console.log('\n🚀 UpgradePrompt.tsx validado - Listo para continuar con CalendlyLink.tsx\n'); 
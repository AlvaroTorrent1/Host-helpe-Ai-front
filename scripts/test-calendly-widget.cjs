// scripts/test-calendly-widget.cjs
// Script para validar la migración de CalendlyWidget.tsx a react-i18next

const fs = require('fs');
const path = require('path');

console.log('🔍 Validando migración de CalendlyWidget.tsx...\n');

// 1. Verificar que el componente usa useTranslation
const componentPath = path.join(process.cwd(), 'src/shared/components/CalendlyWidget.tsx');
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

// Claves requeridas para CalendlyWidget
const requiredKeys = [
  'calendly.title',
  'calendly.subtitle',
  'calendly.linkText'
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
  console.log(`   - calendly.title: "${esTranslations.calendly.title}"`);
  console.log(`   - calendly.subtitle: "${esTranslations.calendly.subtitle.substring(0, 50)}..."`);
  console.log(`   - calendly.linkText: "${esTranslations.calendly.linkText}"`);
} else {
  console.log('❌ Claves faltantes en español:');
  missingEs.forEach(key => console.log(`   - ${key}`));
}

if (missingEn.length === 0) {
  console.log('✅ Todas las claves existen en inglés');
  console.log(`   - calendly.title: "${enTranslations.calendly.title}"`);
  console.log(`   - calendly.subtitle: "${enTranslations.calendly.subtitle.substring(0, 50)}..."`);
  console.log(`   - calendly.linkText: "${enTranslations.calendly.linkText}"`);
} else {
  console.log('❌ Claves faltantes en inglés:');
  missingEn.forEach(key => console.log(`   - ${key}`));
}

// 3. Verificar uso de claves en el componente
console.log('\n🔍 Verificando uso de claves de traducción...');

if (componentContent.includes('t("calendly.title")')) {
  console.log('✅ Usa la clave calendly.title correctamente');
} else {
  console.log('❌ No usa la clave calendly.title');
}

if (componentContent.includes('t("calendly.subtitle")')) {
  console.log('✅ Usa la clave calendly.subtitle correctamente');
} else {
  console.log('❌ No usa la clave calendly.subtitle');
}

// 4. Verificar que no hay textos hardcodeados
console.log('\n🔍 Verificando textos hardcodeados...');

// Buscar patrones de texto hardcodeado común para widgets de calendario
const hardcodedPatterns = [
  /"Programa tu Demo"/,
  /"Schedule Your Demo"/,
  /"Descubre cómo"/,
  /"Discover how"/,
  /"Calendly"/i
];

let hardcodedFound = false;

hardcodedPatterns.forEach(pattern => {
  if (pattern.test(componentContent)) {
    console.log(`❌ Encontrado posible texto hardcodeado: ${pattern}`);
    hardcodedFound = true;
  }
});

if (!hardcodedFound) {
  console.log('✅ No se encontraron textos hardcodeados problemáticos');
}

// 5. Verificar estructura del componente
console.log('\n🏗️ Verificando estructura del componente...');

if (componentContent.includes('useEffect') && componentContent.includes('document.createElement("script")')) {
  console.log('✅ useEffect para cargar script de Calendly presente');
} else {
  console.log('❌ useEffect para script de Calendly no encontrado');
}

if (componentContent.includes('calendly-inline-widget') && componentContent.includes('data-url')) {
  console.log('✅ Widget de Calendly correctamente configurado');
} else {
  console.log('❌ Widget de Calendly no encontrado o mal configurado');
}

if (componentContent.includes('text ||') && componentContent.includes('t("calendly.title")')) {
  console.log('✅ Prop text opcional con fallback a traducción');
} else {
  console.log('❌ Prop text no maneja fallback correctamente');
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
  componentContent.includes('t("calendly.title")'),
  componentContent.includes('t("calendly.subtitle")'),
  !hardcodedFound,
  componentContent.includes('useEffect') && componentContent.includes('document.createElement("script")'),
  componentContent.includes('calendly-inline-widget'),
  componentContent.includes('text ||') && componentContent.includes('t("calendly.title")')
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

console.log('\n🚀 CalendlyWidget.tsx validado - Completados los componentes de Calendly\n'); 
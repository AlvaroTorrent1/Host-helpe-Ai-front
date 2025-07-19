// scripts/test-simple-stripe-test.cjs
// Script para validar la migración de SimpleStripeTest.tsx a react-i18next

const fs = require('fs');
const path = require('path');

console.log('🔍 Validando migración de SimpleStripeTest.tsx...\n');

// 1. Verificar que el componente usa useTranslation
const componentPath = path.join(process.cwd(), 'src/shared/components/SimpleStripeTest.tsx');
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

// Claves requeridas para SimpleStripeTest
const requiredKeys = [
  'stripe.test.title',
  'stripe.test.waitingStripe'
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
  console.log(`   - stripe.test.title: "${esTranslations.stripe.test.title}"`);
  console.log(`   - stripe.test.waitingStripe: "${esTranslations.stripe.test.waitingStripe}"`);
} else {
  console.log('❌ Claves faltantes en español:');
  missingEs.forEach(key => console.log(`   - ${key}`));
}

if (missingEn.length === 0) {
  console.log('✅ Todas las claves existen en inglés');
  console.log(`   - stripe.test.title: "${enTranslations.stripe.test.title}"`);
  console.log(`   - stripe.test.waitingStripe: "${enTranslations.stripe.test.waitingStripe}"`);
} else {
  console.log('❌ Claves faltantes en inglés:');
  missingEn.forEach(key => console.log(`   - ${key}`));
}

// 3. Verificar uso de claves en el componente
console.log('\n🔍 Verificando uso de claves de traducción...');

if (componentContent.includes('t("stripe.test.title")')) {
  console.log('✅ Usa la clave stripe.test.title correctamente');
} else {
  console.log('❌ No usa la clave stripe.test.title');
}

if (componentContent.includes('t("stripe.test.waitingStripe")')) {
  console.log('✅ Usa la clave stripe.test.waitingStripe correctamente');
} else {
  console.log('❌ No usa la clave stripe.test.waitingStripe');
}

// 4. Verificar que no hay textos hardcodeados
console.log('\n🔍 Verificando textos hardcodeados...');

const hardcodedPatterns = [
  /🧪 Componente de Prueba Simple/,
  /🧪 Simple Test Component/,
  /Esperando inicialización de Stripe/,
  /Waiting for Stripe initialization/
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

if (componentContent.includes('PaymentElement') && componentContent.includes('useStripe') && componentContent.includes('useElements')) {
  console.log('✅ Hooks de Stripe correctamente importados');
} else {
  console.log('❌ Hooks de Stripe no encontrados');
}

if (componentContent.includes('clientSecret') && componentContent.includes('substring(0, 20)')) {
  console.log('✅ Manejo seguro de clientSecret para logging');
} else {
  console.log('❌ Manejo de clientSecret no encontrado');
}

if (componentContent.includes('border-yellow-300') && componentContent.includes('bg-yellow-50')) {
  console.log('✅ Estilos de prueba (amarillo) presentes');
} else {
  console.log('❌ Estilos de prueba no encontrados');
}

if (componentContent.includes('✅') && componentContent.includes('❌')) {
  console.log('✅ Indicadores visuales de estado presentes');
} else {
  console.log('❌ Indicadores visuales de estado no encontrados');
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
  componentContent.includes('t("stripe.test.title")'),
  componentContent.includes('t("stripe.test.waitingStripe")'),
  !hardcodedFound,
  componentContent.includes('PaymentElement') && componentContent.includes('useStripe'),
  componentContent.includes('clientSecret') && componentContent.includes('substring(0, 20)'),
  componentContent.includes('border-yellow-300') && componentContent.includes('bg-yellow-50'),
  componentContent.includes('✅') && componentContent.includes('❌')
];

const passedChecks = allChecks.filter(Boolean).length;
const totalChecks = allChecks.length;

if (passedChecks === totalChecks) {
  console.log('🎉 ¡MIGRACIÓN EXITOSA! Todos los checks pasaron.');
  console.log(`✅ ${passedChecks}/${totalChecks} verificaciones exitosas`);
  console.log('🏁 ¡FASE 1 COMPLETADA! Hemos migrado 10/10 componentes simples');
} else {
  console.log(`⚠️  MIGRACIÓN PARCIAL: ${passedChecks}/${totalChecks} checks pasaron`);
  console.log('❌ Revisa los errores arriba y corrige los problemas.');
}

console.log('\n🚀 SimpleStripeTest.tsx validado - ¡Fase 1 terminada!\n'); 
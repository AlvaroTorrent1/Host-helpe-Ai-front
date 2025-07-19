// scripts/test-modal.cjs
// Script para validar la migración de Modal.tsx a react-i18next

const fs = require('fs');
const path = require('path');

console.log('🔍 Validando migración de Modal.tsx (COMPONENTE CRÍTICO)...\n');

// 1. Verificar que el componente usa useTranslation
const componentPath = path.join(process.cwd(), 'src/shared/components/Modal.tsx');
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

// Claves requeridas para Modal
const requiredKeys = [
  'common.close',
  'common.closeModal'
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
  console.log(`   - common.close: "${esTranslations.common.close}"`);
  console.log(`   - common.closeModal: "${esTranslations.common.closeModal}"`);
} else {
  console.log('❌ Claves faltantes en español:');
  missingEs.forEach(key => console.log(`   - ${key}`));
}

if (missingEn.length === 0) {
  console.log('✅ Todas las claves existen en inglés');
  console.log(`   - common.close: "${enTranslations.common.close}"`);
  console.log(`   - common.closeModal: "${enTranslations.common.closeModal}"`);
} else {
  console.log('❌ Claves faltantes en inglés:');
  missingEn.forEach(key => console.log(`   - ${key}`));
}

// 3. Verificar uso de claves en el componente
console.log('\n🔍 Verificando uso de claves de traducción...');

if (componentContent.includes('t("common.close")')) {
  console.log('✅ Usa la clave common.close correctamente');
} else {
  console.log('❌ No usa la clave common.close');
}

if (componentContent.includes('t("common.closeModal")')) {
  console.log('✅ Usa la clave common.closeModal correctamente');
} else {
  console.log('❌ No usa la clave common.closeModal');
}

// 4. Verificar que no hay textos hardcodeados
console.log('\n🔍 Verificando textos hardcodeados...');

const hardcodedPatterns = [
  /"Cerrar modal"/,
  /"Close modal"/,
  /"Cerrar"/,
  /aria-label="[^{]/,  // aria-label hardcodeado
  /sr-only">Cerrar</,  // screen reader text hardcodeado
  /sr-only">Close</
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

// 5. Verificar características críticas del Modal
console.log('\n🏗️ Verificando funcionalidades críticas...');

if (componentContent.includes('useRef') && componentContent.includes('useEffect')) {
  console.log('✅ Hooks de React para gestión de modal presentes');
} else {
  console.log('❌ Hooks de React para gestión no encontrados');
}

if (componentContent.includes('role="dialog"') && componentContent.includes('aria-modal="true"')) {
  console.log('✅ Atributos de accesibilidad de modal presentes');
} else {
  console.log('❌ Atributos de accesibilidad de modal faltantes');
}

if (componentContent.includes('Escape') && componentContent.includes('onClose')) {
  console.log('✅ Funcionalidad de cerrar con ESC implementada');
} else {
  console.log('❌ Funcionalidad de cerrar con ESC no encontrada');
}

if (componentContent.includes('focus()') && componentContent.includes('closeButtonRef')) {
  console.log('✅ Gestión de focus implementada');
} else {
  console.log('❌ Gestión de focus no encontrada');
}

if (componentContent.includes('overflow = "hidden"') && componentContent.includes('overflow = ""')) {
  console.log('✅ Prevención de scroll del body implementada');
} else {
  console.log('❌ Prevención de scroll del body no encontrada');
}

if (componentContent.includes('size') && componentContent.includes('max-w-md') && componentContent.includes('max-w-xl')) {
  console.log('✅ Sistema de tamaños de modal implementado');
} else {
  console.log('❌ Sistema de tamaños de modal no encontrado');
}

if (componentContent.includes('noPadding') && componentContent.includes('children')) {
  console.log('✅ Opciones de padding y contenido flexibles');
} else {
  console.log('❌ Opciones de padding flexibles no encontradas');
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
  componentContent.includes('t("common.close")'),
  componentContent.includes('t("common.closeModal")'),
  !hardcodedFound,
  componentContent.includes('useRef') && componentContent.includes('useEffect'),
  componentContent.includes('role="dialog"') && componentContent.includes('aria-modal="true"'),
  componentContent.includes('Escape') && componentContent.includes('onClose'),
  componentContent.includes('focus()') && componentContent.includes('closeButtonRef'),
  componentContent.includes('overflow = "hidden"'),
  componentContent.includes('size') && componentContent.includes('max-w-md'),
  componentContent.includes('noPadding') && componentContent.includes('children')
];

const passedChecks = allChecks.filter(Boolean).length;
const totalChecks = allChecks.length;

if (passedChecks === totalChecks) {
  console.log('🎉 ¡MIGRACIÓN EXITOSA! Todos los checks pasaron.');
  console.log(`✅ ${passedChecks}/${totalChecks} verificaciones exitosas`);
  console.log('🚀 Modal.tsx está listo para usar en otros componentes');
} else {
  console.log(`⚠️  MIGRACIÓN PARCIAL: ${passedChecks}/${totalChecks} checks pasaron`);
  console.log('❌ Revisa los errores arriba y corrige los problemas.');
}

console.log('\n🎯 Modal.tsx validado - Componente crítico completado\n'); 
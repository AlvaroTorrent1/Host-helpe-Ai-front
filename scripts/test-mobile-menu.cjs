// scripts/test-mobile-menu.cjs
// Script para validar la migración de MobileMenu.tsx a react-i18next

const fs = require('fs');
const path = require('path');

console.log('🔍 Validando migración de MobileMenu.tsx...\n');

// 1. Verificar que el componente usa useTranslation
const componentPath = path.join(process.cwd(), 'src/shared/components/MobileMenu.tsx');
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

// Claves requeridas para MobileMenu
const requiredKeys = [
  'common.openMenu',
  'common.closeMenu',
  'common.mobileMenu'
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
  console.log(`   - common.openMenu: "${esTranslations.common.openMenu}"`);
  console.log(`   - common.closeMenu: "${esTranslations.common.closeMenu}"`);
  console.log(`   - common.mobileMenu: "${esTranslations.common.mobileMenu}"`);
} else {
  console.log('❌ Claves faltantes en español:');
  missingEs.forEach(key => console.log(`   - ${key}`));
}

if (missingEn.length === 0) {
  console.log('✅ Todas las claves existen en inglés');
  console.log(`   - common.openMenu: "${enTranslations.common.openMenu}"`);
  console.log(`   - common.closeMenu: "${enTranslations.common.closeMenu}"`);
  console.log(`   - common.mobileMenu: "${enTranslations.common.mobileMenu}"`);
} else {
  console.log('❌ Claves faltantes en inglés:');
  missingEn.forEach(key => console.log(`   - ${key}`));
}

// 3. Verificar uso de claves en el componente
console.log('\n🔍 Verificando uso de claves de traducción...');

if (componentContent.includes('t("common.openMenu")')) {
  console.log('✅ Usa la clave common.openMenu correctamente');
} else {
  console.log('❌ No usa la clave common.openMenu');
}

if (componentContent.includes('t("common.closeMenu")')) {
  console.log('✅ Usa la clave common.closeMenu correctamente');
} else {
  console.log('❌ No usa la clave common.closeMenu');
}

if (componentContent.includes('t("common.mobileMenu")')) {
  console.log('✅ Usa la clave common.mobileMenu correctamente');
} else {
  console.log('❌ No usa la clave common.mobileMenu');
}

// 4. Verificar que no hay textos hardcodeados
console.log('\n🔍 Verificando textos hardcodeados...');

const hardcodedPatterns = [
  /"Abrir menú"/,
  /"Cerrar menú"/,
  /"Menú móvil"/,
  /"Open menu"/,
  /"Close menu"/,
  /"Mobile menu"/
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

if (componentContent.includes('LanguageSelector') && componentContent.includes('isMobile={true}')) {
  console.log('✅ LanguageSelector integrado correctamente');
} else {
  console.log('❌ LanguageSelector no encontrado o mal configurado');
}

if (componentContent.includes('useState') && componentContent.includes('useRef') && componentContent.includes('useEffect')) {
  console.log('✅ Hooks de React correctamente implementados');
} else {
  console.log('❌ Hooks de React no encontrados');
}

if (componentContent.includes('aria-expanded') && componentContent.includes('aria-controls') && componentContent.includes('role="navigation"')) {
  console.log('✅ Atributos de accesibilidad presentes');
} else {
  console.log('❌ Atributos de accesibilidad faltantes');
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
  componentContent.includes('t("common.openMenu")'),
  componentContent.includes('t("common.closeMenu")'),
  componentContent.includes('t("common.mobileMenu")'),
  !hardcodedFound,
  componentContent.includes('LanguageSelector') && componentContent.includes('isMobile={true}'),
  componentContent.includes('useState') && componentContent.includes('useRef'),
  componentContent.includes('aria-expanded') && componentContent.includes('role="navigation"')
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

console.log('\n🚀 MobileMenu.tsx validado - Excelente progreso en Fase 1\n'); 
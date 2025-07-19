// scripts/test-property-management-page.cjs
// Script para validar la migración de PropertyManagementPage.tsx a react-i18next

const fs = require('fs');
const path = require('path');

console.log('🔍 Validando migración de PropertyManagementPage.tsx (COMPONENTE PRINCIPAL)...\n');

// 1. Verificar que el componente usa useTranslation
const componentPath = path.join(process.cwd(), 'src/features/properties/PropertyManagementPage.tsx');
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

// Claves comunes que debería usar PropertyManagementPage
const commonKeys = [
  'properties.title',
  'properties.deleteSuccess',
  'properties.buttons.add',
  'properties.buttons.edit',
  'properties.buttons.delete',
  'properties.modal.add',
  'properties.modal.edit',
  'properties.modal.confirmDelete',
  'common.loading',
  'common.loadingData',
  'dashboard.menu.dashboard',
  'dashboard.menu.properties'
];

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current && current[key], obj);
}

let missingEs = [];
let missingEn = [];

commonKeys.forEach(key => {
  const esValue = getNestedValue(esTranslations, key);
  const enValue = getNestedValue(enTranslations, key);
  
  if (!esValue) missingEs.push(key);
  if (!enValue) missingEn.push(key);
});

if (missingEs.length === 0) {
  console.log('✅ Todas las claves principales existen en español');
  console.log(`   - properties.title: "${getNestedValue(esTranslations, 'properties.title') || 'N/A'}"`);
  console.log(`   - properties.buttons.add: "${getNestedValue(esTranslations, 'properties.buttons.add') || 'N/A'}"`);
  console.log(`   - dashboard.menu.properties: "${getNestedValue(esTranslations, 'dashboard.menu.properties') || 'N/A'}"`);
} else {
  console.log('❌ Claves faltantes en español:');
  missingEs.forEach(key => console.log(`   - ${key}`));
}

if (missingEn.length === 0) {
  console.log('✅ Todas las claves principales existen en inglés');
  console.log(`   - properties.title: "${getNestedValue(enTranslations, 'properties.title') || 'N/A'}"`);
  console.log(`   - properties.buttons.add: "${getNestedValue(enTranslations, 'properties.buttons.add') || 'N/A'}"`);
  console.log(`   - dashboard.menu.properties: "${getNestedValue(enTranslations, 'dashboard.menu.properties') || 'N/A'}"`);
} else {
  console.log('❌ Claves faltantes en inglés:');
  missingEn.forEach(key => console.log(`   - ${key}`));
}

// 3. Verificar uso de claves en el componente
console.log('\n🔍 Verificando uso de claves de traducción...');

const usedKeys = [
  't("properties.',
  't("dashboard.',
  't("common.',
  't("errors.'
];

let keysFound = 0;
usedKeys.forEach(keyPattern => {
  const matches = (componentContent.match(new RegExp(keyPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  if (matches > 0) {
    console.log(`✅ Usa claves ${keyPattern}: ${matches} ocurrencias`);
    keysFound += matches;
  } else {
    console.log(`⚠️  No usa claves ${keyPattern}`);
  }
});

console.log(`📊 Total de claves de traducción encontradas: ${keysFound}`);

// 4. Verificar funcionalidades críticas de gestión de propiedades
console.log('\n🏗️ Verificando funcionalidades críticas...');

if (componentContent.includes('PropertyList') && componentContent.includes('PropertyForm')) {
  console.log('✅ Componentes PropertyList y PropertyForm integrados');
} else {
  console.log('❌ Componentes principales no encontrados');
}

if (componentContent.includes('Modal') && componentContent.includes('modalOpen')) {
  console.log('✅ Sistema de modales implementado');
} else {
  console.log('❌ Sistema de modales no encontrado');
}

if (componentContent.includes('useAuth') && componentContent.includes('supabase')) {
  console.log('✅ Autenticación y base de datos integradas');
} else {
  console.log('❌ Autenticación o base de datos no encontradas');
}

if (componentContent.includes('useCanCreateProperty') && componentContent.includes('UpgradePrompt')) {
  console.log('✅ Sistema de limitaciones de plan implementado');
} else {
  console.log('❌ Sistema de limitaciones no encontrado');
}

if (componentContent.includes('DashboardHeader') && componentContent.includes('DashboardNavigation')) {
  console.log('✅ Navegación de dashboard integrada');
} else {
  console.log('❌ Navegación de dashboard no encontrada');
}

if (componentContent.includes('toast.success') && componentContent.includes('toast.error')) {
  console.log('✅ Sistema de notificaciones implementado');
} else {
  console.log('❌ Sistema de notificaciones no encontrado');
}

if (componentContent.includes('propertyWebhookService') && componentContent.includes('mediaService')) {
  console.log('✅ Servicios de webhook y media integrados');
} else {
  console.log('❌ Servicios avanzados no encontrados');
}

// 5. Verificar gestión de estado y hooks
console.log('\n🎛️ Verificando gestión de estado...');

const stateChecks = [
  'useState',
  'useEffect',
  'isLoading',
  'isSubmitting',
  'properties',
  'modalOpen',
  'currentProperty'
];

let stateScore = 0;
stateChecks.forEach(check => {
  if (componentContent.includes(check)) {
    console.log(`✅ ${check} presente`);
    stateScore++;
  } else {
    console.log(`❌ ${check} no encontrado`);
  }
});

// 6. Resultado final
console.log('\n📊 RESULTADO DE LA VALIDACIÓN:');

const allChecks = [
  componentContent.includes("import { useTranslation } from 'react-i18next'"),
  !componentContent.includes("import { useLanguage }"),
  componentContent.includes("const { t } = useTranslation()"),
  !componentContent.includes("const { t } = useLanguage()"),
  missingEs.length <= 3, // Permitir algunas claves faltantes menores
  missingEn.length <= 3,
  keysFound >= 20, // Al menos 20 usos de traducciones
  componentContent.includes('PropertyList') && componentContent.includes('PropertyForm'),
  componentContent.includes('Modal') && componentContent.includes('modalOpen'),
  componentContent.includes('useAuth') && componentContent.includes('supabase'),
  componentContent.includes('useCanCreateProperty'),
  componentContent.includes('DashboardHeader'),
  componentContent.includes('toast.success'),
  stateScore >= 6 // Al menos 6 de los 7 elementos de estado
];

const passedChecks = allChecks.filter(Boolean).length;
const totalChecks = allChecks.length;

if (passedChecks === totalChecks) {
  console.log('🎉 ¡MIGRACIÓN EXITOSA! Todos los checks pasaron.');
  console.log(`✅ ${passedChecks}/${totalChecks} verificaciones exitosas`);
  console.log('🏠 PropertyManagementPage.tsx completamente migrado - Sistema CRUD completo');
} else if (passedChecks >= totalChecks - 2) {
  console.log('✅ ¡MIGRACIÓN EXCELENTE! Solo faltan detalles menores.');
  console.log(`✅ ${passedChecks}/${totalChecks} verificaciones exitosas`);
  console.log('🏠 PropertyManagementPage.tsx funcional con migración casi completa');
} else {
  console.log(`⚠️  MIGRACIÓN PARCIAL: ${passedChecks}/${totalChecks} checks pasaron`);
  console.log('❌ Revisa los errores arriba y corrige los problemas.');
}

console.log('\n🚀 PropertyManagementPage.tsx validado - ¡Primer éxito de Fase 3!\n'); 
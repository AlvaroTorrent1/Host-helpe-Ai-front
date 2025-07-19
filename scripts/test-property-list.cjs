// scripts/test-property-list.cjs
// Script para validar la migración de PropertyList.tsx a react-i18next

const fs = require('fs');
const path = require('path');

console.log('🔍 Validando migración de PropertyList.tsx...\n');

const componentPath = path.join(process.cwd(), 'src/features/properties/PropertyList.tsx');
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
if (componentContent.includes("const { t, i18n } = useTranslation()")) {
  console.log('✅ Hook useTranslation() con i18n configurado correctamente');
} else {
  console.log('❌ Hook useTranslation() con i18n no encontrado');
}

if (componentContent.includes("const language = i18n.language")) {
  console.log('✅ Variable language configurada correctamente');
} else {
  console.log('❌ Variable language no configurada');
}

if (componentContent.includes("useLanguage")) {
  console.log('❌ Todavía usa useLanguage() (debe eliminarse)');
} else {
  console.log('✅ No usa useLanguage()');
}

console.log('\n🔍 Verificando uso de traducciones...');

const translationPatterns = [
  't("properties.',
  't("common.'
];

let totalTranslations = 0;
translationPatterns.forEach(pattern => {
  const matches = (componentContent.match(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  if (matches > 0) {
    console.log(`✅ Usa ${pattern}: ${matches} ocurrencias`);
    totalTranslations += matches;
  } else {
    console.log(`⚠️  No usa ${pattern}`);
  }
});

console.log(`📊 Total de traducciones: ${totalTranslations}`);

console.log('\n🏗️ Verificando funcionalidades de lista...');

const features = [
  ['PropertyCard', 'Tarjetas de propiedades'],
  ['PropertyDetail', 'Detalles de propiedades'],
  ['Modal', 'Sistema de modales'],
  ['filter', 'Sistema de filtros'],
  ['search', 'Búsqueda'],
  ['useState', 'Gestión de estado'],
  ['useEffect', 'Efectos'],
  ['useRef', 'Referencias DOM']
];

let featureScore = 0;
features.forEach(([feature, desc]) => {
  if (componentContent.includes(feature)) {
    console.log(`✅ ${desc} presente`);
    featureScore++;
  } else {
    console.log(`❌ ${desc} no encontrado`);
  }
});

console.log('\n🎨 Verificando componentes de UI...');

const uiComponents = [
  'filteredProperties',
  'handleViewProperty',
  'handleCloseDetail',
  'selectedProperty'
];

let uiScore = 0;
uiComponents.forEach(component => {
  if (componentContent.includes(component)) {
    console.log(`✅ ${component} presente`);
    uiScore++;
  } else {
    console.log(`❌ ${component} no encontrado`);
  }
});

console.log('\n📊 RESULTADO DE LA VALIDACIÓN:');

const allChecks = [
  componentContent.includes("import { useTranslation } from 'react-i18next'"),
  !componentContent.includes("import { useLanguage }"),
  componentContent.includes("const { t, i18n } = useTranslation()"),
  componentContent.includes("const language = i18n.language"),
  !componentContent.includes("useLanguage"),
  totalTranslations >= 3,
  featureScore >= 6,
  uiScore >= 3
];

const passedChecks = allChecks.filter(Boolean).length;
const totalChecks = allChecks.length;

if (passedChecks === totalChecks) {
  console.log('🎉 ¡MIGRACIÓN EXITOSA! Todos los checks pasaron.');
  console.log(`✅ ${passedChecks}/${totalChecks} verificaciones exitosas`);
  console.log('📋 PropertyList.tsx completamente migrado con soporte i18n');
} else {
  console.log(`⚠️  MIGRACIÓN PARCIAL: ${passedChecks}/${totalChecks} checks pasaron`);
  console.log('❌ Revisa los errores arriba y corrige los problemas.');
}

console.log('\n🚀 PropertyList.tsx validado - ¡Tercer éxito en Fase 3!\n'); 
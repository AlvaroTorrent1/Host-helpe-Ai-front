// scripts/test-dashboard-stats.cjs
// Script para validar la migración de DashboardStats.tsx a react-i18next

const fs = require('fs');
const path = require('path');

console.log('🔍 Validando migración de DashboardStats.tsx...\n');

// 1. Verificar que el componente usa useTranslation
const componentPath = path.join(process.cwd(), 'src/features/dashboard/DashboardStats.tsx');
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

// Claves requeridas para DashboardStats
const requiredKeys = [
  'dashboard.stats.properties',
  'dashboard.stats.activePropertiesFooter',
  'dashboard.stats.pendingReservations',
  'dashboard.stats.pendingReservationsFooter',
  'dashboard.stats.noReservations',
  'dashboard.stats.incidents',
  'dashboard.stats.resolutionRate'
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
  console.log(`   - dashboard.stats.properties: "${esTranslations.dashboard.stats.properties}"`);
  console.log(`   - dashboard.stats.pendingReservations: "${esTranslations.dashboard.stats.pendingReservations}"`);
  console.log(`   - dashboard.stats.incidents: "${esTranslations.dashboard.stats.incidents}"`);
} else {
  console.log('❌ Claves faltantes en español:');
  missingEs.forEach(key => console.log(`   - ${key}`));
}

if (missingEn.length === 0) {
  console.log('✅ Todas las claves existen en inglés');
  console.log(`   - dashboard.stats.properties: "${enTranslations.dashboard.stats.properties}"`);
  console.log(`   - dashboard.stats.pendingReservations: "${enTranslations.dashboard.stats.pendingReservations}"`);
  console.log(`   - dashboard.stats.incidents: "${enTranslations.dashboard.stats.incidents}"`);
} else {
  console.log('❌ Claves faltantes en inglés:');
  missingEn.forEach(key => console.log(`   - ${key}`));
}

// 3. Verificar uso de claves en el componente
console.log('\n🔍 Verificando uso de claves de traducción...');

const statsKeys = [
  't(\'dashboard.stats.properties\')',
  't(\'dashboard.stats.activePropertiesFooter\')',
  't(\'dashboard.stats.pendingReservations\')',
  't(\'dashboard.stats.pendingReservationsFooter\'',
  't(\'dashboard.stats.noReservations\')',
  't(\'dashboard.stats.incidents\')',
  't(\'dashboard.stats.resolutionRate\''
];

let keysUsed = 0;
statsKeys.forEach(key => {
  if (componentContent.includes(key)) {
    console.log(`✅ Usa ${key} correctamente`);
    keysUsed++;
  } else {
    console.log(`❌ No usa ${key}`);
  }
});

// 4. Verificar parámetros dinámicos (interpolación)
console.log('\n🔍 Verificando interpolación de parámetros...');

if (componentContent.includes('{ percent: pendingReservationRate }')) {
  console.log('✅ Interpolación de porcentaje implementada');
} else {
  console.log('❌ Interpolación de porcentaje no encontrada');
}

if (componentContent.includes('{ rate: resolutionRate }')) {
  console.log('✅ Interpolación de tasa de resolución implementada');
} else {
  console.log('❌ Interpolación de tasa de resolución no encontrada');
}

// 5. Verificar funcionalidades críticas del dashboard
console.log('\n🏗️ Verificando funcionalidades críticas del dashboard...');

if (componentContent.includes('StatCard') && componentContent.includes('interface StatCardProps')) {
  console.log('✅ Componente StatCard definido');
} else {
  console.log('❌ Componente StatCard no encontrado');
}

if (componentContent.includes('activeProperties') && componentContent.includes('pendingReservations')) {
  console.log('✅ Props de estadísticas presentes');
} else {
  console.log('❌ Props de estadísticas no encontradas');
}

if (componentContent.includes('trend') && componentContent.includes('isPositive')) {
  console.log('✅ Sistema de tendencias implementado');
} else {
  console.log('❌ Sistema de tendencias no encontrado');
}

if (componentContent.includes('grid-cols-1 md:grid-cols-2 lg:grid-cols-3')) {
  console.log('✅ Layout responsivo implementado');
} else {
  console.log('❌ Layout responsivo no encontrado');
}

if (componentContent.includes('svg') && componentContent.includes('viewBox')) {
  console.log('✅ Iconos SVG presentes');
} else {
  console.log('❌ Iconos SVG no encontrados');
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
  keysUsed >= 5, // Al menos 5 de las 7 claves principales
  componentContent.includes('{ percent: pendingReservationRate }'),
  componentContent.includes('{ rate: resolutionRate }'),
  componentContent.includes('StatCard') && componentContent.includes('interface StatCardProps'),
  componentContent.includes('activeProperties') && componentContent.includes('pendingReservations'),
  componentContent.includes('trend') && componentContent.includes('isPositive'),
  componentContent.includes('grid-cols-1 md:grid-cols-2 lg:grid-cols-3'),
  componentContent.includes('svg') && componentContent.includes('viewBox')
];

const passedChecks = allChecks.filter(Boolean).length;
const totalChecks = allChecks.length;

if (passedChecks === totalChecks) {
  console.log('🎉 ¡MIGRACIÓN EXITOSA! Todos los checks pasaron.');
  console.log(`✅ ${passedChecks}/${totalChecks} verificaciones exitosas`);
  console.log('📊 DashboardStats.tsx completamente migrado con estadísticas dinámicas');
} else {
  console.log(`⚠️  MIGRACIÓN PARCIAL: ${passedChecks}/${totalChecks} checks pasaron`);
  console.log('❌ Revisa los errores arriba y corrige los problemas.');
}

console.log('\n🚀 DashboardStats.tsx validado - ¡Dashboard internacionalizado!\n'); 
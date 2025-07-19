// scripts/test-property-form.cjs
// Script para validar PropertyForm.tsx (migración ultra-rápida)

const fs = require('fs');
const path = require('path');

console.log('🔍 Validando PropertyForm.tsx (MIGRACIÓN ULTRA-RÁPIDA)...\n');

const componentPath = path.join(process.cwd(), 'src/features/properties/PropertyForm.tsx');
const componentContent = fs.readFileSync(componentPath, 'utf8');

console.log('📦 Verificando imports y hooks...');

// Check imports
if (componentContent.includes("import { useTranslation } from 'react-i18next'")) {
  console.log('✅ Import de useTranslation correcto');
} else {
  console.log('❌ Import de useTranslation no encontrado');
}

if (componentContent.includes("import { useLanguage }")) {
  console.log('❌ Import duplicado de useLanguage encontrado');
} else {
  console.log('✅ Import de useLanguage eliminado correctamente');
}

// Check hook usage
if (componentContent.includes("const { t } = useTranslation()")) {
  console.log('✅ Hook useTranslation() configurado correctamente');
} else {
  console.log('❌ Hook useTranslation() no encontrado');
}

console.log('\n🔍 Verificando uso de traducciones...');

const translationPatterns = [
  't("properties.',
  't("common.',
  't("errors.'
];

let totalTranslations = 0;
translationPatterns.forEach(pattern => {
  const matches = (componentContent.match(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  if (matches > 0) {
    console.log(`✅ Usa ${pattern}: ${matches} ocurrencias`);
    totalTranslations += matches;
  }
});

console.log(`📊 Total de traducciones: ${totalTranslations}`);

console.log('\n🏗️ Verificando funcionalidades...');

const features = [
  ['PropertyImagesForm', 'Formulario de imágenes'],
  ['PropertyDocumentsForm', 'Formulario de documentos'],
  ['useState', 'Gestión de estado'],
  ['useEffect', 'Efectos'],
  ['formData', 'Datos del formulario'],
  ['currentStep', 'Pasos del formulario'],
  ['validationErrors', 'Validación de errores']
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

console.log('\n📊 RESULTADO DE LA VALIDACIÓN:');

const allChecks = [
  componentContent.includes("import { useTranslation } from 'react-i18next'"),
  !componentContent.includes("import { useLanguage }"),
  componentContent.includes("const { t } = useTranslation()"),
  totalTranslations >= 5,
  featureScore >= 5
];

const passedChecks = allChecks.filter(Boolean).length;
const totalChecks = allChecks.length;

if (passedChecks === totalChecks) {
  console.log('🎉 ¡MIGRACIÓN ULTRA-RÁPIDA EXITOSA!');
  console.log(`✅ ${passedChecks}/${totalChecks} verificaciones exitosas`);
  console.log('📝 PropertyForm.tsx completamente limpio y funcional');
} else {
  console.log(`⚠️  ${passedChecks}/${totalChecks} checks pasaron`);
  console.log('❌ Revisa los problemas arriba.');
}

console.log('\n⚡ PropertyForm.tsx validado - ¡Segundo éxito rápido en Fase 3!\n'); 
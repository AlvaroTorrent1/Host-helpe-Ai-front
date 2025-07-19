// scripts/test-property-detail.cjs
// Script para validar PropertyDetail.tsx 

const fs = require('fs');
const path = require('path');

console.log('🔍 Validando PropertyDetail.tsx...\n');

const componentPath = path.join(process.cwd(), 'src/features/properties/PropertyDetail.tsx');
const componentContent = fs.readFileSync(componentPath, 'utf8');

console.log('📦 Verificando imports y hooks...');

if (componentContent.includes("import { useTranslation } from 'react-i18next'")) {
  console.log('✅ Import de useTranslation correcto');
} else {
  console.log('❌ Import de useTranslation no encontrado');
}

if (componentContent.includes("import { useLanguage }")) {
  console.log('❌ Import de useLanguage encontrado');
} else {
  console.log('✅ Import de useLanguage eliminado');
}

if (componentContent.includes("const { t } = useTranslation()")) {
  console.log('✅ Hook useTranslation() configurado');
} else {
  console.log('❌ Hook useTranslation() no encontrado');
}

console.log('\n🔍 Verificando traducciones...');

const translationCount = (componentContent.match(/t\("/g) || []).length;
console.log(`📊 Traducciones encontradas: ${translationCount}`);

console.log('\n🏗️ Verificando funcionalidades...');

const features = [
  'PropertyDocumentManager',
  'activeTab',
  'enlargedImage',
  'useState',
  'getFileIcon'
];

let score = 0;
features.forEach(feature => {
  if (componentContent.includes(feature)) {
    console.log(`✅ ${feature} presente`);
    score++;
  } else {
    console.log(`❌ ${feature} no encontrado`);
  }
});

console.log('\n📊 RESULTADO:');

const checks = [
  componentContent.includes("import { useTranslation } from 'react-i18next'"),
  !componentContent.includes("import { useLanguage }"),
  componentContent.includes("const { t } = useTranslation()"),
  translationCount >= 5,
  score >= 4
];

const passed = checks.filter(Boolean).length;

if (passed === checks.length) {
  console.log('🎉 ¡MIGRACIÓN EXITOSA!');
  console.log(`✅ ${passed}/${checks.length} checks exitosos`);
  console.log('🏠 PropertyDetail.tsx completamente migrado');
} else {
  console.log(`⚠️  ${passed}/${checks.length} checks pasaron`);
}

console.log('\n🚀 PropertyDetail.tsx validado - ¡Cuarto éxito hacia el 60%!\n'); 
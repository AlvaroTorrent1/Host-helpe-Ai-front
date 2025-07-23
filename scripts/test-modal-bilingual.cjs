// scripts/test-modal-bilingual.cjs
// Verificación de compatibilidad bilingüe del modal WhatsApp

const fs = require('fs');
const path = require('path');

function testBilingualSupport() {
  console.log('🌍 Verificando soporte bilingüe del modal WhatsApp...\n');

  try {
    // 1. Verificar traducciones en español
    console.log('📋 Step 1: Verificando traducciones en español...');
    const esPath = path.join(__dirname, '../src/translations/es.json');
    const esContent = JSON.parse(fs.readFileSync(esPath, 'utf8'));
    
    const esChat = esContent.dashboard.incidents.chat;
    const expectedKeys = ['user', 'agent', 'messages', 'hostHelper', 'noMessages', 'conversationCompleted', 'closeChat'];
    
    let esCount = 0;
    expectedKeys.forEach(key => {
      if (esChat[key]) {
        console.log(`✅ ES: ${key} = "${esChat[key]}"`);
        esCount++;
      } else {
        console.log(`❌ ES: ${key} FALTA`);
      }
    });

    // 2. Verificar traducciones en inglés
    console.log('\n📋 Step 2: Verificando traducciones en inglés...');
    const enPath = path.join(__dirname, '../src/translations/en.json');
    const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    
    const enChat = enContent.dashboard.incidents.chat;
    let enCount = 0;
    expectedKeys.forEach(key => {
      if (enChat[key]) {
        console.log(`✅ EN: ${key} = "${enChat[key]}"`);
        enCount++;
      } else {
        console.log(`❌ EN: ${key} FALTA`);
      }
    });

    // 3. Verificar uso correcto en el código
    console.log('\n📋 Step 3: Verificando uso de traducciones en el código...');
    const dashboardPath = path.join(__dirname, '../src/features/dashboard/DashboardPage.tsx');
    const codeContent = fs.readFileSync(dashboardPath, 'utf8');
    
    const translationUsage = [
      { key: 'dashboard.incidents.chat.user', found: codeContent.includes("t('dashboard.incidents.chat.user')") },
      { key: 'dashboard.incidents.chat.agent', found: codeContent.includes("t('dashboard.incidents.chat.agent')") },
      { key: 'dashboard.incidents.chat.messages', found: codeContent.includes("t('dashboard.incidents.chat.messages')") },
      { key: 'dashboard.incidents.chat.hostHelper', found: codeContent.includes("t('dashboard.incidents.chat.hostHelper')") },
      { key: 'dashboard.incidents.chat.noMessages', found: codeContent.includes("t('dashboard.incidents.chat.noMessages')") },
      { key: 'dashboard.incidents.chat.conversationCompleted', found: codeContent.includes("t('dashboard.incidents.chat.conversationCompleted')") },
      { key: 'dashboard.incidents.chat.closeChat', found: codeContent.includes("t('dashboard.incidents.chat.closeChat')") }
    ];

    translationUsage.forEach(usage => {
      console.log(`${usage.found ? '✅' : '❌'} Código usa: ${usage.key}`);
    });

    // 4. Verificar función getIncidentTitle
    console.log('\n📋 Step 4: Verificando función getIncidentTitle...');
    const hasBilingualTitle = codeContent.includes('getIncidentTitle') && 
                             codeContent.includes("language === 'en'") &&
                             codeContent.includes('title_english') &&
                             codeContent.includes('title_spanish');
    
    console.log(`${hasBilingualTitle ? '✅' : '❌'} getIncidentTitle maneja ambos idiomas`);

    // 5. Verificar que no hay strings hardcodeados
    console.log('\n📋 Step 5: Verificando strings hardcodeados...');
    const hardcodedStrings = [
      { text: '"Usuario"', found: codeContent.includes('"Usuario"') },
      { text: '"Agente"', found: codeContent.includes('"Agente"') },
      { text: '"User"', found: codeContent.includes('"User"') },
      { text: '"Agent"', found: codeContent.includes('"Agent"') },
      { text: '"mensajes"', found: codeContent.includes('"mensajes"') },
      { text: '"messages"', found: codeContent.includes('"messages"') }
    ];

    let hardcodedFound = false;
    hardcodedStrings.forEach(str => {
      if (str.found) {
        console.log(`⚠️ String hardcodeado encontrado: ${str.text}`);
        hardcodedFound = true;
      }
    });

    if (!hardcodedFound) {
      console.log('✅ No se encontraron strings hardcodeados');
    }

    // 6. Resumen final
    console.log('\n🎯 RESUMEN:');
    console.log(`📊 Traducciones ES: ${esCount}/${expectedKeys.length}`);
    console.log(`📊 Traducciones EN: ${enCount}/${expectedKeys.length}`);
    console.log(`📊 Uso en código: ${translationUsage.filter(u => u.found).length}/${translationUsage.length}`);
    console.log(`📊 Función bilingüe: ${hasBilingualTitle ? 'OK' : 'FALTA'}`);
    console.log(`📊 Sin hardcode: ${!hardcodedFound ? 'OK' : 'HAY STRINGS HARDCODEADOS'}`);

    const isFullyBilingual = esCount === expectedKeys.length && 
                            enCount === expectedKeys.length && 
                            translationUsage.every(u => u.found) && 
                            hasBilingualTitle && 
                            !hardcodedFound;

    console.log(`\n${isFullyBilingual ? '🎉' : '❌'} ESTADO: ${isFullyBilingual ? 'COMPLETAMENTE BILINGÜE' : 'NECESITA AJUSTES'}`);

    if (isFullyBilingual) {
      console.log('\n✨ El modal WhatsApp funciona perfectamente en español e inglés!');
      console.log('\n🧪 Para probar:');
      console.log('1. npm run dev');
      console.log('2. Cambiar idioma en el selector');
      console.log('3. Abrir modal de conversación');
      console.log('4. Verificar que todo el texto cambia de idioma');
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
  }
}

// Ejecutar verificación
testBilingualSupport(); 
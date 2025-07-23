// scripts/demo-modal-languages.cjs
// Demostración visual de las diferencias entre idiomas en el modal

const fs = require('fs');
const path = require('path');

function demoLanguageDifferences() {
  console.log('🌍 DEMO: Modal WhatsApp Bilingüe\n');

  try {
    const esPath = path.join(__dirname, '../src/translations/es.json');
    const enPath = path.join(__dirname, '../src/translations/en.json');
    
    const esContent = JSON.parse(fs.readFileSync(esPath, 'utf8'));
    const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    
    const esChat = esContent.dashboard.incidents.chat;
    const enChat = enContent.dashboard.incidents.chat;

    console.log('📱 VISTA PREVIA DEL MODAL EN AMBOS IDIOMAS:\n');

    console.log('🇪🇸 ESPAÑOL:');
    console.log('─'.repeat(50));
    console.log(`Header: "Solicitud de Dirección • 3 ${esChat.messages} • ${esChat.hostHelper}"`);
    console.log(`Burbujas: [${esChat.user}] [${esChat.agent}]`);
    console.log(`Sin mensajes: "${esChat.noMessages}"`);
    console.log(`Footer: "${esChat.conversationCompleted}"`);
    console.log(`Botón: "${esChat.closeChat}"`);

    console.log('\n🇺🇸 ENGLISH:');
    console.log('─'.repeat(50));
    console.log(`Header: "Address Request • 3 ${enChat.messages} • ${enChat.hostHelper}"`);
    console.log(`Bubbles: [${enChat.user}] [${enChat.agent}]`);
    console.log(`No messages: "${enChat.noMessages}"`);
    console.log(`Footer: "${enChat.conversationCompleted}"`);
    console.log(`Button: "${enChat.closeChat}"`);

    console.log('\n✨ CARACTERÍSTICAS IMPLEMENTADAS:');
    console.log('• 🎨 Gradientes dinámicos que cambian con scroll');
    console.log('• 🌍 Soporte completo para español e inglés');
    console.log('• 💬 Layout tipo WhatsApp con burbujas mejoradas');
    console.log('• 📱 Títulos bilingües automáticos');
    console.log('• 🎯 Sin strings hardcodeados');
    console.log('• ⚡ Transiciones suaves y efectos hover');

    console.log('\n🧪 PARA PROBAR CAMBIO DE IDIOMA:');
    console.log('1. npm run dev');
    console.log('2. Login al dashboard');
    console.log('3. Cambiar idioma con el selector (🌐)');
    console.log('4. Abrir modal de conversación');
    console.log('5. ¡Observar cómo todo cambia de idioma!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

demoLanguageDifferences(); 
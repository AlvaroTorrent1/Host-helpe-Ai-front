#!/usr/bin/env node
// scripts/stripe-mode-switcher.cjs - Script para cambiar modos de Stripe

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '../config/stripe-config.ts');

const modes = {
  1: { name: 'test', description: 'Modo TEST (desarrollo con textos de test)' },
  2: { name: 'demo_production', description: 'Modo DEMO PRODUCCIÓN (UI producción con claves test)' },
  3: { name: 'production', description: 'Modo PRODUCCIÓN REAL (necesita claves pk_live_...)' }
};

function showCurrentMode() {
  const content = fs.readFileSync(CONFIG_FILE, 'utf8');
  const match = content.match(/const CURRENT_MODE: StripeConfig\['mode'\] = '([^']+)'/);
  
  if (match) {
    const currentMode = match[1];
    console.log('\n🔧 MODO ACTUAL:', currentMode.toUpperCase());
    
    // Encontrar descripción
    const modeEntry = Object.values(modes).find(m => m.name === currentMode);
    if (modeEntry) {
      console.log('   ', modeEntry.description);
    }
  }
}

function changeMode(newMode) {
  const content = fs.readFileSync(CONFIG_FILE, 'utf8');
  const newContent = content.replace(
    /const CURRENT_MODE: StripeConfig\['mode'\] = '[^']+'/,
    `const CURRENT_MODE: StripeConfig['mode'] = '${newMode}'`
  );
  
  fs.writeFileSync(CONFIG_FILE, newContent);
  console.log(`\n✅ Modo cambiado a: ${newMode.toUpperCase()}`);
  console.log('🔄 Reinicia el servidor (npm run dev) para aplicar cambios');
}

function main() {
  const arg = process.argv[2];
  
  console.log('\n🎛️  STRIPE MODE SWITCHER\n');
  
  if (!arg) {
    showCurrentMode();
    console.log('\n📋 MODOS DISPONIBLES:');
    Object.entries(modes).forEach(([key, mode]) => {
      console.log(`   ${key}. ${mode.description}`);
    });
    console.log('\n💡 Uso: node stripe-mode-switcher.cjs <1|2|3>');
    return;
  }
  
  const selectedMode = modes[arg];
  if (!selectedMode) {
    console.log('❌ Modo inválido. Usa 1, 2 o 3');
    return;
  }
  
  changeMode(selectedMode.name);
}

main(); 
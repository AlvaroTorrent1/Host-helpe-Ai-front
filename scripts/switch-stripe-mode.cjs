#!/usr/bin/env node
// scripts/switch-stripe-mode.cjs - Script para cambiar entre modo TEST y PRODUCCIÓN

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../config/stripe-config.ts');

// Argumentos de línea de comandos
const args = process.argv.slice(2);
const mode = args[0]?.toLowerCase();

// Colores para terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function showHelp() {
  console.log(`
${colors.bold}🔧 Cambiar Modo de Stripe${colors.reset}

${colors.blue}Uso:${colors.reset}
  node scripts/switch-stripe-mode.cjs [modo]

${colors.blue}Modos disponibles:${colors.reset}
  ${colors.green}test${colors.reset}        - Modo TEST (para desarrollo y testing)
  ${colors.green}production${colors.reset}  - Modo PRODUCCIÓN (pagos reales)
  ${colors.green}prod${colors.reset}        - Alias para producción
  ${colors.green}status${colors.reset}      - Mostrar modo actual

${colors.blue}Ejemplos:${colors.reset}
  node scripts/switch-stripe-mode.cjs test
  node scripts/switch-stripe-mode.cjs production
  node scripts/switch-stripe-mode.cjs status

${colors.yellow}⚠️  Nota:${colors.reset} En modo producción necesitas configurar claves pk_live_... reales
  `);
}

function getCurrentMode() {
  try {
    const content = fs.readFileSync(configPath, 'utf8');
    const match = content.match(/const USE_PRODUCTION_MODE = (true|false);/);
    return match ? (match[1] === 'true' ? 'production' : 'test') : 'unknown';
  } catch (error) {
    log(colors.red, '❌ Error leyendo archivo de configuración');
    return 'unknown';
  }
}

function setMode(newMode) {
  try {
    let content = fs.readFileSync(configPath, 'utf8');
    const isProduction = newMode === 'production';
    
    // Actualizar la constante USE_PRODUCTION_MODE
    content = content.replace(
      /const USE_PRODUCTION_MODE = (true|false);/,
      `const USE_PRODUCTION_MODE = ${isProduction};`
    );
    
    fs.writeFileSync(configPath, content, 'utf8');
    
    log(colors.green, `✅ Modo cambiado a: ${newMode.toUpperCase()}`);
    
    // Mostrar información específica del modo
    if (isProduction) {
      log(colors.yellow, '⚠️  MODO PRODUCCIÓN activado:');
      log(colors.yellow, '   • Los pagos serán REALES');
      log(colors.yellow, '   • No se mostrarán textos de test');
      log(colors.yellow, '   • Asegúrate de tener claves pk_live_... configuradas');
    } else {
      log(colors.blue, '🧪 MODO TEST activado:');
      log(colors.blue, '   • Los pagos son simulados');
      log(colors.blue, '   • Se mostrarán textos de test');
      log(colors.blue, '   • Usar tarjeta 4242 4242 4242 4242 para pruebas');
    }
    
    log(colors.green, '\n🔄 Recarga la aplicación para ver los cambios');
    
  } catch (error) {
    log(colors.red, '❌ Error actualizando archivo de configuración:', error.message);
  }
}

function showStatus() {
  const currentMode = getCurrentMode();
  const modeColor = currentMode === 'production' ? colors.red : colors.blue;
  
  log(colors.bold, '📊 Estado actual de Stripe:');
  log(modeColor, `   Modo: ${currentMode.toUpperCase()}`);
  
  if (currentMode === 'production') {
    log(colors.yellow, '   ⚠️  Los pagos serán REALES');
  } else if (currentMode === 'test') {
    log(colors.blue, '   🧪 Los pagos son simulados');
  }
}

// Main
if (!mode || mode === 'help' || mode === '--help' || mode === '-h') {
  showHelp();
  process.exit(0);
}

switch (mode) {
  case 'test':
    setMode('test');
    break;
    
  case 'production':
  case 'prod':
    setMode('production');
    break;
    
  case 'status':
    showStatus();
    break;
    
  default:
    log(colors.red, `❌ Modo desconocido: ${mode}`);
    log(colors.yellow, '💡 Usa "node scripts/switch-stripe-mode.cjs help" para ver los modos disponibles');
    process.exit(1);
} 
#!/usr/bin/env node
// scripts/verify-config.cjs - Verificar configuración actual de Stripe

const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function readConfigFile() {
  const configPath = path.join(__dirname, '../config/stripe-config.ts');
  try {
    const content = fs.readFileSync(configPath, 'utf8');
    const match = content.match(/const USE_PRODUCTION_MODE = (true|false);/);
    return match ? (match[1] === 'true') : null;
  } catch (error) {
    return null;
  }
}

function checkEnvironmentVar() {
  // Simulamos lo que haría Vite
  const envFiles = ['.env.local', '.env', '.env.development'];
  let envKey = null;
  
  for (const envFile of envFiles) {
    try {
      const envPath = path.join(__dirname, '..', envFile);
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(/VITE_STRIPE_PUBLIC_KEY=(.+)/);
        if (match) {
          envKey = match[1].trim();
          break;
        }
      }
    } catch (error) {
      // Ignorar errores de archivos que no existen
    }
  }
  
  return envKey;
}

function main() {
  log(colors.bold, '🔍 VERIFICACIÓN DE CONFIGURACIÓN STRIPE');
  log(colors.cyan, '=====================================');
  console.log('');
  
  // Verificar configuración en archivo
  const useProductionMode = readConfigFile();
  log(colors.blue, '📁 Configuración en archivo (config/stripe-config.ts):');
  if (useProductionMode === true) {
    log(colors.green, '   ✅ USE_PRODUCTION_MODE = true (PRODUCCIÓN)');
  } else if (useProductionMode === false) {
    log(colors.yellow, '   🧪 USE_PRODUCTION_MODE = false (TEST)');
  } else {
    log(colors.red, '   ❌ No se pudo leer la configuración');
  }
  console.log('');
  
  // Verificar variable de entorno
  const envKey = checkEnvironmentVar();
  log(colors.blue, '🌍 Variable de entorno (VITE_STRIPE_PUBLIC_KEY):');
  if (envKey) {
    const isLive = envKey.startsWith('pk_live_');
    const keyPreview = envKey.substring(0, 15) + '...';
    
    if (isLive) {
      log(colors.green, `   ✅ pk_live_... detectada: ${keyPreview}`);
      log(colors.green, '   → Variable de entorno tomará precedencia (PRODUCCIÓN)');
    } else {
      log(colors.yellow, `   🧪 pk_test_... detectada: ${keyPreview}`);
      log(colors.yellow, '   → Variable de entorno tomará precedencia (TEST)');
    }
  } else {
    log(colors.blue, '   📝 No hay variable de entorno definida');
    log(colors.blue, '   → Se usará configuración manual del archivo');
  }
  console.log('');
  
  // Determinar modo efectivo
  let effectiveMode, reason;
  if (envKey) {
    effectiveMode = envKey.startsWith('pk_live_') ? 'PRODUCCIÓN' : 'TEST';
    reason = 'Variable de entorno';
  } else {
    effectiveMode = useProductionMode ? 'PRODUCCIÓN' : 'TEST';
    reason = 'Configuración manual';
  }
  
  log(colors.bold, '🎯 MODO EFECTIVO:');
  if (effectiveMode === 'PRODUCCIÓN') {
    log(colors.green, `   🚀 MODO PRODUCCIÓN (${reason})`);
    log(colors.yellow, '   ⚠️  Los pagos serán REALES');
  } else {
    log(colors.blue, `   🧪 MODO TEST (${reason})`);
    log(colors.green, '   ✅ Los pagos son simulados');
  }
  console.log('');
  
  // Recomendaciones
  log(colors.bold, '💡 RECOMENDACIONES:');
  
  if (envKey && !envKey.startsWith('pk_live_') && useProductionMode) {
    log(colors.yellow, '   ⚠️  Tienes configuración PRODUCCIÓN pero variable TEST');
    log(colors.blue, '   → Opción 1: Elimina VITE_STRIPE_PUBLIC_KEY de archivos .env');
    log(colors.blue, '   → Opción 2: Cambia VITE_STRIPE_PUBLIC_KEY a pk_live_...');
  } else if (!envKey && effectiveMode === 'PRODUCCIÓN') {
    log(colors.green, '   ✅ Configuración correcta para testing de producción');
    log(colors.blue, '   → Ve a: http://localhost:4003/pricing');
    log(colors.blue, '   → Verifica que NO aparezca "Modo de prueba"');
  } else if (effectiveMode === 'TEST') {
    log(colors.blue, '   🧪 En modo TEST - perfecto para desarrollo');
    log(colors.blue, '   → Para probar modo producción: npm run stripe:production');
  }
  
  console.log('');
  log(colors.bold, '🔧 COMANDOS ÚTILES:');
  log(colors.blue, '   npm run stripe:status     - Ver estado actual');
  log(colors.blue, '   npm run stripe:production - Cambiar a producción');
  log(colors.blue, '   npm run stripe:test       - Cambiar a test');
  log(colors.blue, '   npm run test:production   - Guía de testing');
  console.log('');
}

main(); 
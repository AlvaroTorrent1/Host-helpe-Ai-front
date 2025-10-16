#!/usr/bin/env node

/**
 * Script de diagnóstico para problemas de redirección OAuth
 * Este script ayuda a identificar problemas de configuración cuando Google OAuth
 * redirige a localhost en lugar del dominio de producción
 */

const fs = require('fs');

console.log('🔍 DIAGNÓSTICO DE REDIRECCIÓN OAUTH\n');
console.log('='.repeat(50));
console.log('\n📋 VERIFICANDO CONFIGURACIÓN...\n');

// Verificar variables de entorno
const checks = {
  passed: [],
  failed: [],
  warnings: []
};

// 1. Verificar que existe configuración de producción
console.log('1️⃣ Variables de Entorno de Producción:');
const prodEnvExists = fs.existsSync('.env.production');
if (prodEnvExists) {
  checks.passed.push('Archivo .env.production existe');
  console.log('   ✅ .env.production encontrado');
  
  // Leer y verificar contenido
  const envContent = fs.readFileSync('.env.production', 'utf-8');
  
  const hasSiteUrl = envContent.includes('VITE_SITE_URL');
  const hasProductionUrl = envContent.includes('hosthelperai.com');
  const hasLocalhost = envContent.includes('localhost');
  
  if (hasSiteUrl && hasProductionUrl) {
    checks.passed.push('VITE_SITE_URL configurada correctamente');
    console.log('   ✅ VITE_SITE_URL=https://hosthelperai.com');
  } else if (hasSiteUrl && !hasProductionUrl) {
    checks.failed.push('VITE_SITE_URL no apunta a hosthelperai.com');
    console.log('   ❌ VITE_SITE_URL no apunta a hosthelperai.com');
  } else {
    checks.failed.push('VITE_SITE_URL no está configurada');
    console.log('   ❌ VITE_SITE_URL no está configurada');
  }
  
  if (hasLocalhost) {
    checks.warnings.push('Archivo de producción contiene "localhost"');
    console.log('   ⚠️  ADVERTENCIA: El archivo contiene "localhost"');
  }
} else {
  checks.failed.push('Archivo .env.production no existe');
  console.log('   ❌ .env.production NO encontrado');
}

console.log('\n2️⃣ Configuración de GitHub Actions:');
const workflowPath = '.github/workflows/deploy.yml';
const workflowExists = fs.existsSync(workflowPath);

if (workflowExists) {
  const workflow = fs.readFileSync(workflowPath, 'utf-8');
  
  if (workflow.includes('VITE_SITE_URL: https://hosthelperai.com')) {
    checks.passed.push('GitHub Actions configurado con URL correcta');
    console.log('   ✅ VITE_SITE_URL en deploy.yml: https://hosthelperai.com');
  } else if (workflow.includes('localhost')) {
    checks.failed.push('GitHub Actions usa localhost');
    console.log('   ❌ GitHub Actions usa localhost en vez de dominio producción');
  } else {
    checks.warnings.push('GitHub Actions no tiene VITE_SITE_URL');
    console.log('   ⚠️  VITE_SITE_URL no encontrada en deploy.yml');
  }
} else {
  checks.warnings.push('No se encontró archivo de deploy');
  console.log('   ⚠️  deploy.yml no encontrado');
}

console.log('\n3️⃣ Configuración de código (signInWithGoogle):');
const supabaseServicePath = 'src/services/supabase.ts';
const serviceExists = fs.existsSync(supabaseServicePath);

if (serviceExists) {
  const serviceContent = fs.readFileSync(supabaseServicePath, 'utf-8');
  
  if (serviceContent.includes('window.location.origin')) {
    checks.passed.push('signInWithGoogle usa window.location.origin');
    console.log('   ✅ Usa window.location.origin (dinámico)');
  } else if (serviceContent.includes('localhost')) {
    checks.failed.push('signInWithGoogle tiene localhost hardcodeado');
    console.log('   ❌ URL de localhost hardcodeada en signInWithGoogle');
  }
} else {
  checks.failed.push('Archivo supabase.ts no encontrado');
  console.log('   ❌ src/services/supabase.ts no encontrado');
}

// Resumen
console.log('\n' + '='.repeat(50));
console.log('\n📊 RESUMEN DEL DIAGNÓSTICO:\n');

console.log(`✅ Pasadas: ${checks.passed.length}`);
checks.passed.forEach(check => console.log(`   • ${check}`));

if (checks.warnings.length > 0) {
  console.log(`\n⚠️  Advertencias: ${checks.warnings.length}`);
  checks.warnings.forEach(check => console.log(`   • ${check}`));
}

if (checks.failed.length > 0) {
  console.log(`\n❌ Fallidas: ${checks.failed.length}`);
  checks.failed.forEach(check => console.log(`   • ${check}`));
}

console.log('\n' + '='.repeat(50));
console.log('\n🔧 PASOS PARA SOLUCIONAR:\n');

console.log('1. SUPABASE DASHBOARD:');
console.log('   • Ve a: https://supabase.com/dashboard');
console.log('   • Authentication → URL Configuration');
console.log('   • Site URL: https://hosthelperai.com');
console.log('   • Redirect URLs:');
console.log('     - https://hosthelperai.com/auth/callback');
console.log('     - http://localhost:4000/auth/callback (para desarrollo)');

console.log('\n2. GOOGLE CLOUD CONSOLE:');
console.log('   • Ve a: https://console.cloud.google.com');
console.log('   • APIs & Services → Credentials');
console.log('   • OAuth 2.0 Client → Authorized redirect URIs:');
console.log('     - https://hosthelperai.com/auth/callback');
console.log('     - https://blxngmtmknkdmikaflen.supabase.co/auth/v1/callback');

console.log('\n3. REBUILD Y DEPLOY:');
console.log('   • Haz push de cualquier cambio a main');
console.log('   • Espera que GitHub Actions complete el deploy');
console.log('   • Limpia caché del navegador (Ctrl+Shift+Delete)');
console.log('   • Prueba en modo incógnito');

console.log('\n4. VERIFICAR EN PRODUCCIÓN:');
console.log('   • Ve a: https://hosthelperai.com');
console.log('   • Abre DevTools (F12) → Console');
console.log('   • Busca: "Inicializando cliente Supabase"');
console.log('   • Verifica que authRedirectUrl sea: https://hosthelperai.com/auth/callback');

console.log('\n' + '='.repeat(50));
console.log('\n📖 Más información:');
console.log('   Ver: documentation/fixes/google-oauth-localhost-redirect-fix.md\n');


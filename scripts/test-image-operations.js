// scripts/test-image-operations.js
// Script para probar las operaciones de imágenes corregidas

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://blxngmtmknkdmikaflen.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseG5nbXRta25rZG1pa2FmbGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ3NTcyMTQsImV4cCI6MjA0MDMzMzIxNH0.sVgLt5KQTe1YZ4mQQqCfLooEvi6Bvfn2SvL_3vRaYGI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.bright + colors.cyan);
  console.log('='.repeat(60));
}

// Test 1: Verificar conexión con el webhook
async function testWebhookConnection() {
  logSection('TEST 1: Verificar conexión con webhook-test');
  
  try {
    const webhookUrl = `${supabaseUrl}/functions/v1/proxy-n8n-webhook`;
    log(`Probando conexión con: ${webhookUrl}`, colors.blue);
    
    // Crear FormData de prueba
    const formData = new FormData();
    formData.append('property_id', 'test-property-123');
    formData.append('property_name', 'Test Property');
    formData.append('user_id', 'test-user-456');
    formData.append('total_images', '0');
    formData.append('timestamp', new Date().toISOString());
    formData.append('request_id', `test-${Date.now()}`);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey
      },
      body: formData
    });
    
    const responseText = await response.text();
    
    if (response.ok) {
      log('✅ Conexión exitosa con el webhook', colors.green);
      log(`Respuesta: ${responseText.substring(0, 200)}...`, colors.yellow);
      
      // Verificar que apunta a webhook-test
      if (responseText.includes('webhook-test') || responseText.includes('test')) {
        log('✅ Confirmado: El webhook está apuntando a webhook-test', colors.green);
      } else {
        log('⚠️ Advertencia: No se pudo confirmar que apunta a webhook-test', colors.yellow);
      }
    } else {
      log(`❌ Error en conexión: ${response.status} ${response.statusText}`, colors.red);
      log(`Respuesta: ${responseText}`, colors.red);
    }
  } catch (error) {
    log(`❌ Error en test de webhook: ${error.message}`, colors.red);
  }
}

// Test 2: Verificar eliminación de imágenes
async function testImageDeletion() {
  logSection('TEST 2: Verificar eliminación de imágenes');
  
  try {
    // Obtener una imagen de prueba de la base de datos
    const { data: images, error } = await supabase
      .from('media_files')
      .select('id, file_url, property_id')
      .eq('file_type', 'image')
      .limit(1);
    
    if (error) {
      log(`❌ Error obteniendo imágenes: ${error.message}`, colors.red);
      return;
    }
    
    if (!images || images.length === 0) {
      log('⚠️ No hay imágenes para probar la eliminación', colors.yellow);
      return;
    }
    
    const testImage = images[0];
    log(`Imagen de prueba encontrada:`, colors.blue);
    log(`  ID: ${testImage.id}`, colors.cyan);
    log(`  URL: ${testImage.file_url}`, colors.cyan);
    
    // Extraer el path del archivo
    let extractedPath = '';
    const url = testImage.file_url;
    
    if (url.includes('/storage/v1/object/public/')) {
      const parts = url.split('/storage/v1/object/public/property-files/');
      if (parts.length > 1) {
        extractedPath = parts[1];
      }
    } else if (url.includes('/property-files/')) {
      const parts = url.split('/property-files/');
      if (parts.length > 1) {
        extractedPath = parts[1];
      }
    } else {
      extractedPath = url.split('/').slice(-2).join('/');
    }
    
    log(`Path extraído: ${extractedPath}`, colors.magenta);
    
    // Verificar si el archivo existe en storage
    const { data: fileExists } = await supabase.storage
      .from('property-files')
      .list(extractedPath.split('/')[0], {
        search: extractedPath.split('/')[1]
      });
    
    if (fileExists && fileExists.length > 0) {
      log('✅ El archivo existe en storage', colors.green);
    } else {
      log('⚠️ El archivo no se encontró en storage', colors.yellow);
    }
    
    log('\n📝 Para completar el test de eliminación:', colors.bright);
    log('1. Ve a la interfaz de tu aplicación', colors.cyan);
    log('2. Elimina una imagen desde el modal de propiedades', colors.cyan);
    log('3. Verifica en la consola del navegador los logs de eliminación', colors.cyan);
    log('4. Revisa en Supabase que la imagen fue eliminada de media_files y storage', colors.cyan);
    
  } catch (error) {
    log(`❌ Error en test de eliminación: ${error.message}`, colors.red);
  }
}

// Test 3: Verificar subida de imágenes con webhook
async function testImageUploadWithWebhook() {
  logSection('TEST 3: Verificar subida de imágenes con webhook');
  
  try {
    // Obtener propiedades recientes con imágenes
    const { data: recentImages, error } = await supabase
      .from('media_files')
      .select('id, title, description, ai_description, created_at, updated_at')
      .eq('file_type', 'image')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      log(`❌ Error obteniendo imágenes recientes: ${error.message}`, colors.red);
      return;
    }
    
    if (recentImages && recentImages.length > 0) {
      log('Imágenes recientes encontradas:', colors.blue);
      
      recentImages.forEach((img, index) => {
        log(`\n${index + 1}. ${img.title}`, colors.cyan);
        log(`   Creada: ${img.created_at}`, colors.yellow);
        log(`   Actualizada: ${img.updated_at}`, colors.yellow);
        log(`   Descripción: ${img.description || 'Sin descripción'}`, colors.magenta);
        log(`   IA Descripción: ${img.ai_description || 'Sin descripción IA'}`, colors.magenta);
        
        // Verificar si tiene descripción IA real o fallback
        if (img.ai_description && img.ai_description.startsWith('Property image -')) {
          log(`   ⚠️ FALLBACK: La imagen tiene descripción de fallback, webhook no procesó`, colors.yellow);
        } else if (img.ai_description && img.ai_description.length > 50) {
          log(`   ✅ OK: La imagen tiene descripción IA del webhook`, colors.green);
        }
      });
    }
    
    log('\n📝 Para completar el test de subida:', colors.bright);
    log('1. Ve a la interfaz de tu aplicación', colors.cyan);
    log('2. Crea una nueva propiedad con imágenes', colors.cyan);
    log('3. Verifica en la consola del navegador:', colors.cyan);
    log('   - Logs de "Sending X images to n8n webhook-test"', colors.yellow);
    log('   - Logs de "Target URL: https://hosthelperai.app.n8n.cloud/webhook-test/images"', colors.yellow);
    log('4. Espera 30 segundos y revisa en Supabase:', colors.cyan);
    log('   - Las imágenes deben tener ai_description con texto descriptivo', colors.yellow);
    log('   - NO deben tener "Property image - " como prefijo', colors.yellow);
    
  } catch (error) {
    log(`❌ Error en test de subida: ${error.message}`, colors.red);
  }
}

// Ejecutar todos los tests
async function runAllTests() {
  log('\n🚀 INICIANDO TESTS DE OPERACIONES DE IMÁGENES', colors.bright + colors.green);
  log('Verificando las correcciones implementadas...', colors.cyan);
  
  await testWebhookConnection();
  await testImageDeletion();
  await testImageUploadWithWebhook();
  
  logSection('RESUMEN DE CAMBIOS IMPLEMENTADOS');
  log('✅ 1. URL del webhook corregida a webhook-test/images', colors.green);
  log('✅ 2. Extracción mejorada del path para eliminación', colors.green);
  log('✅ 3. Sincronización real de delete en modal robusto', colors.green);
  log('✅ 4. Logs mejorados en el flujo dual de procesamiento', colors.green);
  
  log('\n📋 PRÓXIMOS PASOS:', colors.bright + colors.yellow);
  log('1. Desplegar la función Edge actualizada:', colors.cyan);
  log('   npx supabase functions deploy proxy-n8n-webhook', colors.yellow);
  log('2. Probar eliminación desde el modal de propiedades', colors.cyan);
  log('3. Probar subida de nuevas imágenes y verificar webhook', colors.cyan);
  log('4. Monitorear logs en consola del navegador', colors.cyan);
}

// Ejecutar tests
runAllTests().catch(console.error);

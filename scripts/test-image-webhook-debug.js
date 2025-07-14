// File: scripts/test-image-webhook-debug.js
// Script para debuggear el flujo de procesamiento de imágenes

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Debug del flujo de procesamiento de imágenes\n');

async function checkRecentProperties() {
  console.log('1️⃣ Verificando propiedades recientes con estado pending_media_processing...');
  
  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, name, status, created_at')
    .eq('status', 'pending_media_processing')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Error al obtener propiedades:', error);
    return null;
  }

  console.log(`✅ Encontradas ${properties?.length || 0} propiedades pendientes:`);
  properties?.forEach(p => {
    console.log(`   - ${p.name} (${p.id}) - Creada: ${new Date(p.created_at).toLocaleString()}`);
  });

  return properties?.[0]?.id;
}

async function checkMediaFiles(propertyId) {
  if (!propertyId) return;

  console.log(`\n2️⃣ Verificando archivos media para propiedad ${propertyId}...`);
  
  const { data: mediaFiles, error } = await supabase
    .from('media_files')
    .select('id, title, file_url, n8n_processing_status, ai_description, description_source')
    .eq('property_id', propertyId)
    .eq('file_type', 'image');

  if (error) {
    console.error('❌ Error al obtener media files:', error);
    return;
  }

  console.log(`✅ Encontrados ${mediaFiles?.length || 0} archivos de imagen:`);
  mediaFiles?.forEach(m => {
    console.log(`   - ${m.title} (${m.id})`);
    console.log(`     Estado n8n: ${m.n8n_processing_status}`);
    console.log(`     Descripción AI: ${m.ai_description ? 'Sí' : 'No'}`);
    console.log(`     Fuente: ${m.description_source || 'N/A'}`);
    console.log(`     URL: ${m.file_url.substring(0, 50)}...`);
  });
}

async function testDirectWebhook() {
  console.log('\n3️⃣ Probando webhook directamente...');
  
  const testPayload = {
    batch_id: 'test-' + Date.now(),
    property_id: 'test-property',
    images: [{
      media_file_id: 'test-media-id',
      filename: 'test.jpg',
      supabase_url: 'https://example.com/test.jpg',
      property_context: {
        property_id: 'test-property',
        property_name: 'Test Property',
        property_type: 'apartment',
        room_context: 'living room'
      }
    }],
    processing_options: {
      generate_description: true,
      max_description_length: 200,
      focus_areas: ['features', 'condition', 'usability', 'style'],
      language: 'es'
    }
  };

  try {
    // Probar Edge Function
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/process-images-webhook`;
    console.log(`   Probando Edge Function: ${edgeFunctionUrl}`);
    
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify(testPayload)
    });

    console.log(`   Respuesta status: ${response.status}`);
    const responseText = await response.text();
    console.log(`   Respuesta:`, responseText);

    // Probar webhook directo (solo para comparar)
    console.log('\n   Probando webhook n8n directo...');
    const directResponse = await fetch('https://hosthelperai.app.n8n.cloud/webhook/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    console.log(`   Respuesta directa status: ${directResponse.status}`);
    if (!directResponse.ok) {
      console.log(`   ⚠️  El webhook directo falló, esto confirma que necesitamos el proxy`);
    }

  } catch (error) {
    console.error('❌ Error al probar webhook:', error.message);
  }
}

async function checkSupabaseLogs() {
  console.log('\n4️⃣ Verificando logs de Supabase...');
  console.log('   Para ver los logs de la Edge Function:');
  console.log('   1. Ve a https://app.supabase.com/project/[tu-proyecto]/functions');
  console.log('   2. Haz clic en "process-images-webhook"');
  console.log('   3. Ve a la pestaña "Logs"');
}

async function main() {
  console.log('🔧 Configuración:');
  console.log(`   Supabase URL: ${supabaseUrl}`);
  console.log(`   Edge Function URL: ${supabaseUrl}/functions/v1/process-images-webhook`);
  console.log(`   n8n Webhook: https://hosthelperai.app.n8n.cloud/webhook/images\n`);

  const propertyId = await checkRecentProperties();
  await checkMediaFiles(propertyId);
  await testDirectWebhook();
  await checkSupabaseLogs();

  console.log('\n📋 Resumen de posibles problemas:');
  console.log('   1. Si no hay propiedades pendientes → El frontend no está creando propiedades con el estado correcto');
  console.log('   2. Si no hay media files → Las imágenes no se están subiendo a Supabase Storage');
  console.log('   3. Si el webhook directo falla → Problema de CORS o webhook no activo');
  console.log('   4. Si la Edge Function falla → Necesita ser desplegada primero');
  console.log('\n💡 Solución: Desplegar la Edge Function con:');
  console.log('   supabase functions deploy process-images-webhook');
}

main().catch(console.error); 
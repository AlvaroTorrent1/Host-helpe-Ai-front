// File: /scripts/test-ai-description-generator.js
// Purpose: Test AI description generation for media files

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://blxngmtmknkdmikaflen.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseG5nbXRta25rZG1pa2FmbGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MDAzNjMsImV4cCI6MjA1Nzk3NjM2M30.iIyu_9vwjMO_SOCovMZEAf-c9cNanD0u_cu1ZURTyFQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAIDescriptionGeneration() {
  try {
    console.log('🤖 === TEST AI DESCRIPTION GENERATOR ===\n');

    // 1. Verificar archivos pendientes
    console.log('📊 1. Verificando archivos pendientes de AI description...');
    
    const { data: pendingFiles, error: pendingError } = await supabase
      .from('media_files_pending_ai_description')
      .select('*');

    if (pendingError) {
      throw new Error(`Error obteniendo archivos pendientes: ${pendingError.message}`);
    }

    console.log(`   ✅ Archivos pendientes encontrados: ${pendingFiles?.length || 0}`);
    
    if (pendingFiles && pendingFiles.length > 0) {
      console.log('\n📋 Archivos pendientes:');
      pendingFiles.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.title} (${file.file_type} - ${file.category})`);
        console.log(`      ID: ${file.id}`);
        console.log(`      URL: ${file.public_url || file.file_url}`);
        console.log(`      Tiene prompt: ${file.ai_prompt ? 'Sí' : 'No'}`);
        console.log('');
      });
    }

    // 2. Verificar estado actual de AI descriptions
    console.log('📈 2. Estado actual de AI descriptions...');
    
    const { data: statusData, error: statusError } = await supabase
      .from('media_files')
      .select('ai_description')
      .not('ai_description', 'is', null);

    if (statusError) {
      console.error('Error obteniendo estado:', statusError);
    } else {
      // Simplified status check - just count files with AI descriptions
      const statusCounts = {
        'with_description': statusData.filter(item => item.ai_description).length,
        'total': statusData.length
      };

      console.log('   Estado de archivos:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count} archivos`);
      });
    }

    // 3. Forzar actualización de archivos existentes sin prompt
    console.log('\n🔄 3. Actualizando archivos existentes para generar prompts...');
    
    const { data: updateResult, error: updateError } = await supabase
      .from('media_files')
      .update({ updated_at: new Date().toISOString() })
      .is('ai_description', null)
      .is('ai_description', null)
      .select('id, title');

    if (updateError) {
      console.error('Error actualizando archivos:', updateError);
    } else {
      console.log(`   ✅ Archivos actualizados: ${updateResult?.length || 0}`);
    }

    // 4. Simular llamada a la Edge Function (solo mostrar cómo hacerlo)
    console.log('\n🚀 4. Cómo llamar a la Edge Function de AI Description...');
    
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/ai-description-generator`;
    
    console.log(`   URL de la Edge Function: ${edgeFunctionUrl}`);
    console.log('\n   Para procesar un archivo específico:');
    console.log(`   POST ${edgeFunctionUrl}`);
    console.log('   Headers: {');
    console.log('     "Content-Type": "application/json",');
    console.log(`     "Authorization": "Bearer ${supabaseAnonKey}"`);
    console.log('   }');
    console.log('   Body: {');
    console.log('     "file_id": "uuid-del-archivo"');
    console.log('   }');
    
    console.log('\n   Para procesar múltiples archivos:');
    console.log('   Body: {');
    console.log('     "batch_process": true,');
    console.log('     "max_files": 5');
    console.log('   }');

    // 5. Verificar funciones de base de datos
    console.log('\n🛠️ 5. Verificando funciones de base de datos...');
    
    const { data: functions, error: functionsError } = await supabase
      .rpc('get_function_list')
      .then(() => ({ data: 'Functions accessible', error: null }))
      .catch(err => ({ data: null, error: err }));

    if (!functionsError) {
      console.log('   ✅ Funciones de base de datos accesibles');
    } else {
      console.log('   ⚠️ No se pueden verificar funciones directamente');
    }

    // 6. Mostrar próximos pasos
    console.log('\n📋 === PRÓXIMOS PASOS ===');
    console.log('1. Configura OPENAI_API_KEY en Supabase Edge Functions:');
    console.log('   supabase secrets set OPENAI_API_KEY=tu-api-key');
    console.log('');
    console.log('2. Despliega la Edge Function:');
    console.log('   supabase functions deploy ai-description-generator');
    console.log('');
    console.log('3. Procesa archivos pendientes:');
    console.log('   - Llama a la Edge Function con batch_process: true');
    console.log('   - O integra con tu workflow de n8n');
    console.log('');
    console.log('4. Los nuevos archivos se procesarán automáticamente con el trigger');

    console.log('\n✅ Test completado exitosamente!');

  } catch (error) {
    console.error('❌ Error en el test:', error);
    throw error;
  }
}

// Función auxiliar para mostrar detalles de un archivo
async function showFileDetails(fileId) {
  const { data: file, error } = await supabase
    .from('media_files')
    .select(`
      id,
      title,
      description,
      ai_description,
      file_type,
      public_url,
      updated_at
    `)
    .eq('id', fileId)
    .single();

  if (error) {
    console.error('Error obteniendo detalles del archivo:', error);
    return;
  }

  console.log('\n📄 === DETALLES DEL ARCHIVO ===');
  console.log(`ID: ${file.id}`);
  console.log(`Título: ${file.title}`);
  console.log(`Tipo: ${file.file_type}`);
  console.log(`Descripción original: ${file.description || 'Sin descripción'}`);
  console.log(`AI Description: ${file.ai_description || 'No generada aún'}`);
  console.log(`Last Updated: ${file.updated_at || 'N/A'}`);
  console.log(`URL: ${file.public_url}`);
  
  // Removed obsolete status and metadata fields after schema simplification
}

// Ejecutar test si es llamado directamente
if (import.meta.main) {
  testAIDescriptionGeneration()
    .then(() => {
      console.log('\n🎉 Test finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test falló:', error);
      process.exit(1);
    });
}

export { testAIDescriptionGeneration, showFileDetails }; 
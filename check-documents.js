// Script para verificar contenido de documentos FAQs
const { createClient } = require('@supabase/supabase-js');

// Usemos las URLs conocidas
const supabaseUrl = 'https://blxngmtmknkdmikaflen.supabase.co';

// La anon key debería estar en las variables de entorno
// Si no está, usaremos el service role token que tenemos
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sbp_14888d63f86c3e52498f822bc1877646e31f94cb';

console.log('🔍 Verificando contenido de documentos FAQs...');
console.log('📍 Supabase URL:', supabaseUrl);
console.log('🔑 Using key:', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDocuments() {
  try {
    console.log('\n1️⃣ Verificando conexión a Supabase...');
    
    // Primero, intentar obtener todas las tablas
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.log('❌ Error obteniendo tablas:', tablesError.message);
      
      // Si falla, intentar directamente con documents
      console.log('\n2️⃣ Intentando acceso directo a tabla documents...');
      const { data: docs, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .limit(5);
      
      if (docsError) {
        console.log('❌ Error accediendo a documents:', docsError.message);
        return;
      }
      
      console.log('✅ Acceso directo a documents funcionó!');
      console.log('📄 Documentos encontrados:', docs?.length || 0);
      
      if (docs && docs.length > 0) {
        console.log('\n📋 Primeros documentos:');
        docs.forEach((doc, index) => {
          console.log(`\n📄 Documento ${index + 1}:`);
          console.log('- ID:', doc.id);
          console.log('- Contenido (primeros 200 chars):', doc.content?.substring(0, 200) + '...');
          
          // Buscar información de WiFi
          if (doc.content && doc.content.toLowerCase().includes('wifi')) {
            console.log('🎯 ¡ESTE DOCUMENTO CONTIENE INFO DE WIFI!');
          }
        });
      }
      
    } else {
      console.log('✅ Conexión exitosa! Tablas encontradas:', tables?.length || 0);
    }
    
  } catch (error) {
    console.error('💥 Error general:', error.message);
  }
}

checkDocuments();
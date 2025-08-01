// scripts/test-property-detail-data.js
// Script para verificar que los datos se cargan correctamente en PropertyDetail

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://blxngmtmknkdmikaflen.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseG5nbXRta25rZG1pa2FmbGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNDI0NjcsImV4cCI6MjA1MTkxODQ2N30.QI6VxrKa0FzQ0K2cTl2xdz_kGHNPFzZXDdpjL5wbLYY';

const supabase = createClient(supabaseUrl, supabaseKey);

// Simular getProperties()
async function testGetProperties() {
  console.log('🔍 Testing getProperties() con shareable_links...');
  
  try {
    const { data, error } = await supabase
      .from("properties")
      .select(`
        *,
        media_files(*),
        shareable_links(*)
      `)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0) {
      const property = data[0];
      console.log('✅ Propiedad cargada:', property.name);
      console.log('📸 Media files:', property.media_files?.length || 0);
      console.log('🔗 Shareable links:', property.shareable_links?.length || 0);
      
      // Mapear datos como en getProperties()
      const mediaFiles = property.media_files || [];
      const images = mediaFiles.filter(file => file.file_type === 'image');
      const documents = mediaFiles.filter(file => file.file_type === 'document');
      
      const mappedProperty = {
        ...property,
        additional_images: images.map(file => ({
          id: file.id,
          property_id: file.property_id,
          file_url: file.file_url || file.public_url,
          description: file.description || file.title,
          uploaded_at: file.created_at
        })),
        documents: documents.map(file => ({
          id: file.id,
          property_id: file.property_id,
          type: file.category?.replace('document_', '') || 'other',
          name: file.title,
          file_url: file.file_url || file.public_url,
          description: file.description,
          uploaded_at: file.created_at,
          file_type: file.mime_type || 'other'
        })),
        shareable_links: property.shareable_links || []
      };
      
      console.log('📊 Datos mapeados:');
      console.log('  - additional_images:', mappedProperty.additional_images.length);
      console.log('  - documents:', mappedProperty.documents.length);
      console.log('  - shareable_links:', mappedProperty.shareable_links.length);
      
      return mappedProperty;
    }
  } catch (error) {
    console.error('❌ Error en getProperties():', error);
  }
}

// Simular getPropertyById()
async function testGetPropertyById(propertyId) {
  console.log('\n🔍 Testing getPropertyById() individual...');
  
  try {
    // Obtener propiedad básica
    const { data: property, error: propError } = await supabase
      .from("properties")
      .select("*")
      .eq("id", propertyId)
      .single();

    if (propError) throw propError;

    // Obtener media_files
    const { data: mediaFiles, error: mediaError } = await supabase
      .from("media_files")
      .select("*")
      .eq("property_id", propertyId)
      .order("sort_order", { ascending: true });

    if (mediaError) throw mediaError;

    // Obtener enlaces compartibles
    const { data: shareableLinks, error: linksError } = await supabase
      .from("shareable_links")
      .select("*")
      .eq("property_id", propertyId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (linksError) throw linksError;

    // Mapear datos
    const images = (mediaFiles || [])
      .filter(file => file.file_type === 'image')
      .map(file => ({
        id: file.id,
        property_id: file.property_id,
        file_url: file.file_url || file.public_url,
        description: file.description || file.title,
        uploaded_at: file.created_at,
        title: file.title,
        sort_order: file.sort_order
      }));

    const documents = (mediaFiles || [])
      .filter(file => file.file_type === 'document')
      .map(file => ({
        id: file.id,
        property_id: file.property_id,
        type: file.subcategory || 'other',
        name: file.title,
        file_url: file.file_url || file.public_url,
        description: file.description,
        uploaded_at: file.created_at,
        file_type: file.mime_type || 'other'
      }));

    const fullProperty = {
      ...property,
      additional_images: images,
      documents: documents,
      shareable_links: shareableLinks || []
    };

    console.log('✅ getPropertyById() exitoso:');
    console.log('  - additional_images:', fullProperty.additional_images.length);
    console.log('  - documents:', fullProperty.documents.length);
    console.log('  - shareable_links:', fullProperty.shareable_links.length);
    
    return fullProperty;
  } catch (error) {
    console.error('❌ Error en getPropertyById():', error);
  }
}

// Ejecutar pruebas
async function runTests() {
  console.log('🚀 INICIANDO PRUEBAS DE DATOS PARA PROPERTY DETAIL\n');
  
  // Test 1: getProperties()
  const propertyFromList = await testGetProperties();
  
  if (propertyFromList) {
    // Test 2: getPropertyById()
    const propertyFromDetail = await testGetPropertyById(propertyFromList.id);
    
    // Comparar resultados
    console.log('\n📊 COMPARACIÓN DE RESULTADOS:');
    console.log('getProperties()  - Images:', propertyFromList.additional_images.length, '| Links:', propertyFromList.shareable_links.length);
    console.log('getPropertyById()- Images:', propertyFromDetail?.additional_images.length || 0, '| Links:', propertyFromDetail?.shareable_links.length || 0);
    
    if (propertyFromList.additional_images.length === propertyFromDetail?.additional_images.length &&
        propertyFromList.shareable_links.length === propertyFromDetail?.shareable_links.length) {
      console.log('✅ AMBOS MÉTODOS DEVUELVEN LOS MISMOS DATOS');
    } else {
      console.log('⚠️  DIFERENCIAS ENTRE MÉTODOS DETECTADAS');
    }
  }
  
  console.log('\n🏁 PRUEBAS COMPLETADAS');
}

// Ejecutar si es llamado directamente
if (typeof window === 'undefined') {
  runTests().catch(console.error);
}

export { testGetProperties, testGetPropertyById, runTests }; 
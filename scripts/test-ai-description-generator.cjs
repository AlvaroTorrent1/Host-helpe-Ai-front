// scripts/test-ai-description-generator.js
// Script para generar descripciones AI para imágenes que ya están en media_files

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://blnuemtvokdlfarlen.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbnVlbXR2b2tkbGZhcmxlbiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM3MDMxNjkzLCJleHAiOjIwNTI2MDc2OTN9.JQq2AsFNJBjyh3N8YuLOQ2L1u7v6tnxSjsGgWdGPCcQ';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Generar descripciones inteligentes basadas en el nombre del archivo y contexto
 */
function generateSmartDescription(mediaFile, propertyName) {
  const filename = mediaFile.title.toLowerCase();
  
  // Kitchen-related images
  if (filename.includes('kitchen') || filename.includes('cocina') || filename.includes('cook')) {
    return `Modern kitchen at ${propertyName} with contemporary appliances and cooking facilities. Fully equipped for guest convenience with all necessary utensils and amenities.`;
  }
  
  // Bathroom images
  if (filename.includes('bathroom') || filename.includes('baño') || filename.includes('bath') || filename.includes('shower')) {
    return `Clean and modern bathroom at ${propertyName} featuring contemporary fixtures and amenities. Includes shower facilities and all necessary toiletries for guests.`;
  }
  
  // Bedroom images
  if (filename.includes('bedroom') || filename.includes('dormitorio') || filename.includes('bed') || filename.includes('room')) {
    return `Comfortable and well-appointed bedroom at ${propertyName} with quality bedding and furnishings. Designed for optimal rest and relaxation during your stay.`;
  }
  
  // Living room/common areas
  if (filename.includes('living') || filename.includes('salon') || filename.includes('lounge') || filename.includes('common')) {
    return `Inviting living space at ${propertyName} with comfortable seating and modern amenities. Perfect for relaxation and social gatherings during your stay.`;
  }
  
  // Exterior/views
  if (filename.includes('view') || filename.includes('vista') || filename.includes('exterior') || filename.includes('balcon') || filename.includes('terrace')) {
    return `Beautiful exterior view from ${propertyName} showcasing the surrounding area and local architecture. Enjoy the scenic atmosphere from your accommodation.`;
  }
  
  // Pool/recreational
  if (filename.includes('pool') || filename.includes('piscina') || filename.includes('swim')) {
    return `Recreation area at ${propertyName} featuring pool facilities for guest enjoyment. Perfect for relaxation and leisure activities during your stay.`;
  }
  
  // Default description for unrecognized images
  return `Professional interior image from ${propertyName} showcasing the quality accommodations and attention to detail. This space exemplifies the comfort and style guests can expect during their stay.`;
}

async function generateDescriptionsForProperty(propertyId) {
  try {
    console.log(`🎯 Generating AI descriptions for property: ${propertyId}`);

    // Get property info
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('name')
      .eq('id', propertyId)
      .single();

    if (propertyError) {
      throw new Error(`Error fetching property: ${propertyError.message}`);
    }

    console.log(`🏠 Property: ${property.name}`);

    // Get media files that need AI descriptions
    const { data: mediaFiles, error: fetchError } = await supabase
      .from('media_files')
      .select('*')
      .eq('property_id', propertyId)
      .or('ai_description.is.null,ai_description.eq.property image');

    if (fetchError) {
      throw new Error(`Error fetching media files: ${fetchError.message}`);
    }

    if (!mediaFiles || mediaFiles.length === 0) {
      console.log('✅ No images need AI descriptions');
      return;
    }

    console.log(`📸 Found ${mediaFiles.length} images to process:`);
    mediaFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.title} (current: "${file.ai_description || 'null'}")`);
    });

    console.log('\n🤖 Generating AI descriptions...\n');

    // Generate AI descriptions for each image
    let updatedCount = 0;

    for (const mediaFile of mediaFiles) {
      try {
        // Generate smart description based on file name and property context
        const aiDescription = generateSmartDescription(mediaFile, property.name);
        
        console.log(`📝 ${mediaFile.title}:`);
        console.log(`   Old: "${mediaFile.ai_description || 'null'}"`);
        console.log(`   New: "${aiDescription}"`);
        
        // Update the media file with AI description
        const { error: updateError } = await supabase
          .from('media_files')
          .update({
            ai_description: aiDescription,
            description: aiDescription,
            updated_at: new Date().toISOString()
          })
          .eq('id', mediaFile.id);

        if (updateError) {
          console.log(`   ❌ Error: ${updateError.message}`);
        } else {
          console.log(`   ✅ Updated successfully`);
          updatedCount++;
        }
        
        console.log(''); // Blank line for readability
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    console.log(`🎉 Completed: ${updatedCount}/${mediaFiles.length} images updated`);

  } catch (error) {
    console.error('❌ Script error:', error.message);
  }
}

async function findPropertiesWithImages() {
  try {
    console.log('🔍 Finding properties with images...\n');

    const { data: properties, error } = await supabase
      .from('properties')
      .select(`
        id,
        name,
        media_files!inner(
          id,
          title,
          ai_description
        )
      `)
      .limit(10);

    if (error) {
      throw new Error(`Error fetching properties: ${error.message}`);
    }

    if (!properties || properties.length === 0) {
      console.log('No properties with images found');
      return;
    }

    console.log('Found properties with images:');
    properties.forEach((property, index) => {
      const imageCount = property.media_files?.length || 0;
      const needsDescriptions = property.media_files?.filter(
        file => !file.ai_description || file.ai_description === 'property image'
      ).length || 0;
      
      console.log(`${index + 1}. ${property.name} (${property.id})`);
      console.log(`   📸 ${imageCount} images, ${needsDescriptions} need descriptions`);
    });

    // Process the first property as example
    if (properties.length > 0) {
      const firstProperty = properties[0];
      console.log(`\n🚀 Processing first property: ${firstProperty.name}`);
      await generateDescriptionsForProperty(firstProperty.id);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar el script
const propertyId = process.argv[2];

if (propertyId) {
  console.log('🎯 Processing specific property...\n');
  generateDescriptionsForProperty(propertyId);
} else {
  console.log('🔍 No property ID provided, finding properties with images...\n');
  findPropertiesWithImages();
} 
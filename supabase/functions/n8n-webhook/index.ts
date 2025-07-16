// supabase/functions/n8n-webhook/index.ts
// Edge Function para procesar webhooks de creación de propiedades con IA

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Configuración de Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Token de autenticación para seguridad
const WEBHOOK_TOKEN = Deno.env.get('N8N_WEBHOOK_TOKEN') || 'hosthelper-n8n-secure-token-2024';

// Interfaces para los datos
interface PropertyWebhookPayload {
  property_id: string;
  user_id: string;
  property_data: {
    name: string;
    address: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    property_type?: string;
    num_bedrooms?: number;
    num_bathrooms?: number;
    max_guests?: number;
    description?: string;
    google_business_profile_url?: string;
  };
  uploaded_files: {
    interni: Array<UploadedFile>;
    esterni: Array<UploadedFile>;
    elettrodomestici_foto: Array<UploadedFile>;
    documenti_casa: Array<UploadedFile>;
    documenti_elettrodomestici: Array<UploadedFile>;
  };
  timestamp: string;
  request_id: string;
}

interface UploadedFile {
  filename: string;
  url: string;
  type?: string;
  size?: number;
  description?: string;
}

interface ProcessedFile {
  property_id: string;
  file_type: 'image' | 'document';
    category: string;
  subcategory: string;
  title: string;
  file_url: string;
  public_url: string;
  file_size?: number;
  mime_type?: string;
}

Deno.serve(async (req: Request) => {
  // Manejar CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-n8n-token',
      },
    });
  }

  // Solo permitir POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    console.log('🔍 Starting webhook processing...');
    
    // Verificar autenticación usando header X-N8N-Token
    const customToken = req.headers.get('x-n8n-token');
    if (!customToken || customToken !== WEBHOOK_TOKEN) {
      console.error('❌ Unauthorized: Invalid or missing N8N token');
      return new Response('Unauthorized: Invalid or missing N8N token', { status: 401 });
    }

    console.log('✅ N8N token validation successful');

    // Parsear el payload del webhook con mejor error handling
    let payload: PropertyWebhookPayload;
    try {
      const rawPayload = await req.text();
      console.log('📝 Raw payload size:', rawPayload.length, 'characters');
      payload = JSON.parse(rawPayload);
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError);
      return new Response('Invalid JSON payload', { status: 400 });
    }
    
    console.log('🏠 Received property webhook:', {
      property_id: payload.property_id,
      user_id: payload.user_id,
      property_name: payload.property_data?.name,
      total_files: Object.values(payload.uploaded_files || {}).flat().length
    });

    // Validar datos requeridos con más detalle
    if (!payload.property_id) {
      console.error('❌ Missing property_id');
      return new Response('Missing property_id', { status: 400 });
    }
    if (!payload.user_id) {
      console.error('❌ Missing user_id');
      return new Response('Missing user_id', { status: 400 });
    }
    if (!payload.property_data) {
      console.error('❌ Missing property_data');
      return new Response('Missing property_data', { status: 400 });
    }

    console.log('✅ Payload validation successful');

    // Procesar archivos con categorización inteligente
    let processedFiles;
    try {
      console.log('🤖 Starting AI file processing...');
      processedFiles = await processFilesWithAI(payload);
      console.log('✅ AI processing completed, files processed:', processedFiles.length);
    } catch (aiError) {
      console.error('❌ AI processing failed:', aiError);
      return new Response(JSON.stringify({
        success: false,
        error: 'AI processing failed: ' + aiError.message,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    // Crear la propiedad y archivos en una transacción atómica
    let result;
    try {
      console.log('💾 Starting atomic property creation...');
      result = await createPropertyWithFiles(payload, processedFiles);
      console.log('✅ Property created successfully:', result.property_id);
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Database operation failed: ' + dbError.message,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Respuesta exitosa
    const successResponse = {
      success: true,
      property_id: result.property_id,
      files_processed: processedFiles.length,
      categorization_summary: generateCategorizationSummary(processedFiles),
      message: 'Property and files processed successfully',
      timestamp: new Date().toISOString()
    };

    console.log('🎉 Webhook completed successfully:', successResponse);

    return new Response(JSON.stringify(successResponse), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error('❌ Unexpected error in webhook processing:', error);
    console.error('❌ Error stack:', error.stack);
    
    return new Response(JSON.stringify({
      success: false,
      error: `Unexpected error: ${error.message}`,
      error_type: error.constructor.name,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});

/**
 * Categorización inteligente de archivos usando IA
 */
async function processFilesWithAI(payload: PropertyWebhookPayload): Promise<ProcessedFile[]> {
  try {
    console.log('🔍 Starting file categorization...');
    
    const categorizer = new SmartPropertyCategorizer();
    const processedFiles: ProcessedFile[] = [];

    // Validar que uploaded_files existe
    if (!payload.uploaded_files) {
      console.log('⚠️ No uploaded_files in payload, returning empty array');
      return processedFiles;
    }

    // Procesar cada categoría de archivos
    for (const [sourceCategory, files] of Object.entries(payload.uploaded_files)) {
      console.log(`📁 Processing category: ${sourceCategory}, files: ${files?.length || 0}`);
      
      if (!Array.isArray(files)) {
        console.warn(`⚠️ Invalid files array for category ${sourceCategory}`);
        continue;
      }

      for (const file of files) {
        try {
          console.log(`📄 Processing file: ${file.filename}, URL: ${file.url?.substring(0, 50)}...`);
          
          // Validar que el archivo tiene las propiedades necesarias
          if (!file.filename || !file.url) {
            console.warn(`⚠️ Skipping invalid file: missing filename or url`);
            continue;
          }

          // Determinar tipo de archivo
          const isImage = sourceCategory.includes('foto') || file.type?.startsWith('image/') || 
                         file.filename.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
          
          const fileType = isImage ? 'image' : 'document';
          
          // Categorizar el archivo usando IA
          const categorization = categorizer.categorizeFile(
            file.filename,
            file.description || '',
            fileType,
            sourceCategory
          );
          
          // Crear registro procesado
          const processedFile: ProcessedFile = {
            property_id: payload.property_id,
            file_type: categorization.file_type,
            category: categorization.category,
            subcategory: categorization.subcategory,
            title: file.description || file.filename,
            file_url: file.url,
            public_url: file.url, // En producción, podría ser una URL optimizada
            file_size: file.size,
            mime_type: file.type,
          };
          
          console.log(`✅ File processed: ${file.filename} -> ${categorization.category}/${categorization.subcategory}`);
          processedFiles.push(processedFile);
          
        } catch (fileError) {
          console.error(`❌ Error processing file ${file.filename}:`, fileError);
          // Continuar con el siguiente archivo en lugar de fallar completamente
        }
      }
    }

    console.log(`🎯 Total files processed: ${processedFiles.length}`);
    return processedFiles;
    
  } catch (error) {
    console.error('❌ Error in processFilesWithAI:', error);
    throw new Error(`File processing failed: ${error.message}`);
  }
}

/**
 * Crear propiedad y archivos usando stored procedure atómica
 */
async function createPropertyWithFiles(payload: PropertyWebhookPayload, processedFiles: ProcessedFile[]) {
  try {
    console.log('🔍 Starting atomic property creation...');
    
    // Preparar datos de la propiedad como JSONB
    const propertyData = {
      name: payload.property_data.name,
      address: payload.property_data.address,
      city: payload.property_data.city,
      state: payload.property_data.state,
      postal_code: payload.property_data.postal_code,
      country: payload.property_data.country,
      property_type: payload.property_data.property_type,
      num_bedrooms: payload.property_data.num_bedrooms,
      num_bathrooms: payload.property_data.num_bathrooms,
      max_guests: payload.property_data.max_guests,
      description: payload.property_data.description,
      google_business_profile_url: payload.property_data.google_business_profile_url
    };

    console.log('📋 Property data prepared:', {
      name: propertyData.name,
      address: propertyData.address,
      files_count: processedFiles.length
    });

    // Preparar archivos como array de JSONB
    const mediaFilesArray = processedFiles.map((file, index) => ({
      file_type: file.file_type,
      category: file.category,
      subcategory: file.subcategory,
      title: file.title,
      file_url: file.file_url,
      public_url: file.public_url,
      file_size: file.file_size,
      mime_type: file.mime_type,
      sort_order: index
    }));

    console.log('📁 Media files array prepared, count:', mediaFilesArray.length);

    // Ejecutar stored procedure atómica
    console.log('💾 Calling stored procedure...');
    const { data, error } = await supabase.rpc('create_property_with_media', {
      p_property_id: payload.property_id,
      p_user_id: payload.user_id,
      p_property_data: propertyData,
      p_media_files: mediaFilesArray
    });

    if (error) {
      console.error('❌ Stored procedure error:', error);
      throw new Error(`Database operation failed: ${error.message} (Details: ${JSON.stringify(error.details || {})})`);
    }

    const result = data?.[0];
    if (!result?.success) {
      console.error('❌ Stored procedure returned failure:', result);
      throw new Error(`Property creation failed: ${result?.message || 'Unknown error'}`);
    }

    console.log('✅ Property created atomically:', result.message);

    return {
      property_id: payload.property_id,
      files_count: processedFiles.length
    };

  } catch (error) {
    console.error('❌ Error in atomic property creation:', error);
    throw error;
  }
}

/**
 * Generar resumen de categorización
 */
function generateCategorizationSummary(processedFiles: ProcessedFile[]) {
  const summary = {
    images_by_category: {} as Record<string, number>,
    documents_by_category: {} as Record<string, number>,
    total_images: 0,
    total_documents: 0
  };

  processedFiles.forEach(file => {
    if (file.file_type === 'image') {
      summary.total_images++;
      summary.images_by_category[file.subcategory] = 
        (summary.images_by_category[file.subcategory] || 0) + 1;
    } else {
      summary.total_documents++;
      summary.documents_by_category[file.category] = 
        (summary.documents_by_category[file.category] || 0) + 1;
    }
  });

  return summary;
}

/**
 * Sistema de categorización inteligente (copiado del código n8n)
 */
class SmartPropertyCategorizer {
  private patterns: any;

  constructor() {
    this.patterns = {
      gallery: {
        'Sala de estar': [
          { regex: /\b(sala|living|soggiorno|salón|estar)\b/i, weight: 10 },
          { regex: /\b(salotto|lounge|salone)\b/i, weight: 8 },
          { regex: /\b(divano|sofá|camino|tv|televisión)\b/i, weight: 6 }
        ],
        'Cocina': [
          { regex: /\b(cucina|kitchen|cocina)\b/i, weight: 10 },
          { regex: /\b(fornelli|fogones|piano cottura|vitrocerámica|placa)\b/i, weight: 8 },
          { regex: /\b(frigorifero|nevera|lavastoviglie|lavavajillas|horno)\b/i, weight: 6 }
        ],
        'Dormitorio': [
          { regex: /\b(camera|bedroom|letto|dormitorio|habitación)\b/i, weight: 10 },
          { regex: /\b(matrimoniale|matrimonio|singola|individual|cama)\b/i, weight: 8 },
          { regex: /\b(armario|closet|guardarropa)\b/i, weight: 6 }
        ],
        'Baño': [
          { regex: /\b(bagno|bathroom|wc|baño|aseo)\b/i, weight: 10 },
          { regex: /\b(doccia|ducha|vasca|bañera|shower)\b/i, weight: 8 },
          { regex: /\b(lavabo|sink|espejo|mirror)\b/i, weight: 6 }
        ],
        'Exterior': [
          { regex: /\b(exterior|outside|fuera|terraza|balcón)\b/i, weight: 10 },
          { regex: /\b(giardino|jardín|garden|verde|patio)\b/i, weight: 8 },
          { regex: /\b(piscina|pool|swimming|jacuzzi)\b/i, weight: 9 },
          { regex: /\b(facciata|fachada|facade|entrada)\b/i, weight: 7 }
        ],
        'Electrodomésticos': [
          { regex: /\b(electrodoméstico|appliance|lavadora|washing)\b/i, weight: 10 },
          { regex: /\b(microonde|microondas|cafetera|coffee)\b/i, weight: 8 }
        ]
      },
      documents: {
        'Contrato': [
          { regex: /\b(contratto|contrato|contract|lease|alquiler)\b/i, weight: 10 },
          { regex: /\b(rental|arrendamiento)\b/i, weight: 8 }
        ],
        'Planos': [
          { regex: /\b(planimetria|plano|blueprint|floor plan)\b/i, weight: 10 },
          { regex: /\b(mapa|layout|distribución)\b/i, weight: 7 }
        ],
        'Manual': [
          { regex: /\b(manual|guide|guía|instrucciones)\b/i, weight: 10 },
          { regex: /\b(instructions|uso|usage)\b/i, weight: 8 }
        ],
        'Garantía': [
          { regex: /\b(garanzia|garantía|warranty)\b/i, weight: 10 }
        ],
        'Inventario': [
          { regex: /\b(inventario|inventory|lista|list)\b/i, weight: 10 },
          { regex: /\b(equipamiento|equipment)\b/i, weight: 8 }
        ]
      }
    };
  }

  categorizeFile(filename: string, description: string, fileType: 'image' | 'document', sourceCategory: string) {
    const text = `${filename} ${description}`.toLowerCase();
    let bestMatch = null;
    let maxScore = 0;

    const patternSet = fileType === 'image' ? this.patterns.gallery : this.patterns.documents;
    
    for (const [category, patterns] of Object.entries(patternSet)) {
      let score = 0;
      
      for (const pattern of patterns) {
        if (pattern.regex.test(text)) {
          score += pattern.weight;
        }
      }
      
      if (sourceCategory && sourceCategory.includes(category.toLowerCase())) {
        score += 5;
      }
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = category;
      }
    }

    return this.mapToProductionEnums(bestMatch, fileType, sourceCategory);
  }

  private mapToProductionEnums(category: string | null, fileType: 'image' | 'document', sourceCategory: string) {
    if (fileType === 'image') {
      return {
        file_type: 'image' as const,
        category: 'gallery',
        subcategory: category || this.mapSourceToSubcategory(sourceCategory)
      };
    } else {
      const docCategory = this.mapDocumentCategory(category);
      return {
        file_type: 'document' as const,
        category: docCategory,
        subcategory: category || 'General'
      };
    }
  }

  private mapSourceToSubcategory(sourceCategory: string): string {
    const mapping: Record<string, string> = {
      'interni': 'Interior',
      'esterni': 'Exterior', 
      'elettrodomestici_foto': 'Electrodomésticos',
      'documenti_casa': 'Casa',
      'documenti_elettrodomestici': 'Electrodomésticos'
    };
    return mapping[sourceCategory] || 'General';
  }

  private mapDocumentCategory(category: string | null): string {
    const mapping: Record<string, string> = {
      'Contrato': 'document_contract',
      'Planos': 'document_general',
      'Manual': 'document_manual',
      'Garantía': 'document_manual',
      'Inventario': 'document_general'
    };
    return mapping[category || ''] || 'document_general';
  }
} 
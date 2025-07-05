/**
 * CÓDIGO N8N - PROCESAMIENTO INTELIGENTE DE PROPIEDADES
 * Versión adaptada para estructura de producción con tabla media_files
 * 
 * Este código se ejecuta en el nodo "Code" de n8n después del webhook
 * y antes del nodo "Postgres" para insertar en la base de datos
 */

// Datos recibidos del webhook
const property_id = $json.body.property_id;
const user_id = $json.body.user_id;
const property_data = $json.body.property_data;
const uploaded_files = $json.body.uploaded_files;
const timestamp = $json.body.timestamp;
const request_id = $json.body.request_id;

console.log(`🚀 Procesando propiedad: ${property_data.name} (ID: ${property_id})`);
console.log(`👤 Usuario: ${user_id}`);
console.log(`📁 Archivos recibidos:`, Object.keys(uploaded_files).map(key => `${key}: ${uploaded_files[key].length}`));

// ==== SISTEMA DE CATEGORIZACIÓN INTELIGENTE ====
class SmartPropertyCategorizer {
  constructor() {
    // Patrones de categorización adaptados a la estructura española
    this.patterns = {
      // IMÁGENES - Categorías principales
      'gallery': {
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
      
      // DOCUMENTOS - Categorías por tipo
      'documents': {
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

  // Función principal de categorización
  categorizeFile(filename, description, fileType, sourceCategory) {
    const text = `${filename} ${description}`.toLowerCase();
    let bestMatch = null;
    let maxScore = 0;

    // Seleccionar patrones según el tipo de archivo
    const patternSet = fileType === 'image' ? this.patterns.gallery : this.patterns.documents;
    
    // Buscar la mejor coincidencia
    for (const [category, patterns] of Object.entries(patternSet)) {
      let score = 0;
      
      for (const pattern of patterns) {
        if (pattern.regex.test(text)) {
          score += pattern.weight;
        }
      }
      
      // Bonus por categoría fuente del frontend
      if (sourceCategory && sourceCategory.includes(category.toLowerCase())) {
        score += 5;
      }
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = category;
      }
    }

    // Mapear a enums de la base de datos
    return this.mapToProductionEnums(bestMatch, fileType, sourceCategory);
  }

  // Mapear categorías a los enums de producción
  mapToProductionEnums(category, fileType, sourceCategory) {
    if (fileType === 'image') {
      // Para imágenes, usar category = 'gallery' y subcategory específica
      return {
        file_type: 'image',
        category: 'gallery', // Enum: featured, gallery, document_general, document_contract, document_manual, document_cadastral
        subcategory: category || this.mapSourceToSubcategory(sourceCategory)
      };
    } else {
      // Para documentos, mapear a categorías específicas
      const docCategory = this.mapDocumentCategory(category);
      return {
        file_type: 'document',
        category: docCategory,
        subcategory: category || 'General'
      };
    }
  }

  mapSourceToSubcategory(sourceCategory) {
    const mapping = {
      'interni': 'Interior',
      'esterni': 'Exterior', 
      'elettrodomestici_foto': 'Electrodomésticos',
      'documenti_casa': 'Casa',
      'documenti_elettrodomestici': 'Electrodomésticos'
    };
    return mapping[sourceCategory] || 'General';
  }

  mapDocumentCategory(category) {
    const mapping = {
      'Contrato': 'document_contract',
      'Planos': 'document_general',
      'Manual': 'document_manual',
      'Garantía': 'document_manual',
      'Inventario': 'document_general'
    };
    return mapping[category] || 'document_general';
  }
}

// ==== PROCESAMIENTO PRINCIPAL ====

// Instanciar categorizador
const categorizer = new SmartPropertyCategorizer();

// Arrays para almacenar los archivos procesados
let processedImages = [];
let processedDocuments = [];
let allMediaFiles = [];

// Contador para tracking
let totalFiles = 0;
let processedCount = 0;

// Procesar cada categoría de archivos
for (const [sourceCategory, files] of Object.entries(uploaded_files)) {
  console.log(`📂 Procesando categoría: ${sourceCategory} (${files.length} archivos)`);
  
  for (const file of files) {
    totalFiles++;
    
    // Determinar tipo de archivo
    const isImage = sourceCategory.includes('foto') || file.type === 'image' || 
                   file.filename.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
    
    const fileType = isImage ? 'image' : 'document';
    
    // Categorizar el archivo
    const categorization = categorizer.categorizeFile(
      file.filename,
      file.description || '',
      fileType,
      sourceCategory
    );
    
    // Crear registro para media_files
    const mediaFile = {
      property_id: property_id,
      file_type: categorization.file_type,
      category: categorization.category,
      subcategory: categorization.subcategory,
      title: file.description || file.filename,
      file_url: file.url, // URL original del archivo
      public_url: file.url, // URL pública para mensajería
      file_size: file.size || null,
      mime_type: file.type || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    allMediaFiles.push(mediaFile);
    
    // Separar por tipo para compatibilidad
    if (fileType === 'image') {
      processedImages.push(mediaFile);
    } else {
      processedDocuments.push(mediaFile);
    }
    
    processedCount++;
    
    console.log(`✅ Procesado: ${file.filename} -> ${categorization.category}/${categorization.subcategory}`);
  }
}

// ==== GENERAR SQL TRANSACCIONAL ====

// SQL para crear la propiedad
const createPropertySQL = `
INSERT INTO properties (
  id, user_id, name, address, city, state, postal_code, country,
  property_type, num_bedrooms, num_bathrooms, max_guests, description,
  google_business_profile_url, status, created_at, updated_at
) VALUES (
  '${property_id}',
  '${user_id}',
  '${property_data.name.replace(/'/g, "''")}',
  '${property_data.address.replace(/'/g, "''")}',
  ${property_data.city ? `'${property_data.city.replace(/'/g, "''")}'` : 'NULL'},
  ${property_data.state ? `'${property_data.state.replace(/'/g, "''")}'` : 'NULL'},
  ${property_data.postal_code ? `'${property_data.postal_code}'` : 'NULL'},
  ${property_data.country ? `'${property_data.country.replace(/'/g, "''")}'` : 'NULL'},
  ${property_data.property_type ? `'${property_data.property_type}'` : 'NULL'},
  ${property_data.num_bedrooms || 'NULL'},
  ${property_data.num_bathrooms || 'NULL'},
  ${property_data.max_guests || 'NULL'},
  ${property_data.description ? `'${property_data.description.replace(/'/g, "''")}'` : 'NULL'},
  ${property_data.google_business_profile_url ? `'${property_data.google_business_profile_url}'` : 'NULL'},
  'active',
  '${timestamp}',
  '${timestamp}'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  updated_at = EXCLUDED.updated_at;
`;

// SQL para insertar archivos multimedia
let insertMediaFilesSQL = '';
if (allMediaFiles.length > 0) {
  const mediaValues = allMediaFiles.map(file => {
    return `(
      '${crypto.randomUUID()}',
      '${file.property_id}',
      '${file.file_type}',
      '${file.category}',
      '${file.subcategory}',
      '${file.title.replace(/'/g, "''")}',
      '${file.file_url}',
      '${file.public_url}',
      ${file.file_size || 'NULL'},
      ${file.mime_type ? `'${file.mime_type}'` : 'NULL'},
      '${file.created_at}',
      '${file.updated_at}'
    )`;
  }).join(',\n    ');

  insertMediaFilesSQL = `
INSERT INTO media_files (
  id, property_id, file_type, category, subcategory, title,
  file_url, public_url, file_size, mime_type, created_at, updated_at
) VALUES
    ${mediaValues}
ON CONFLICT (property_id, file_url) DO UPDATE SET
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  title = EXCLUDED.title,
  updated_at = EXCLUDED.updated_at;
`;
}

// SQL transaccional completo
const fullSQL = `
BEGIN;

-- 1. Crear la propiedad
${createPropertySQL}

-- 2. Insertar archivos multimedia (si existen)
${insertMediaFilesSQL}

COMMIT;
`;

// ==== RESULTADO FINAL ====

const result = {
  success: true,
  property_id: property_id,
  user_id: user_id,
  request_id: request_id,
  processed_files: {
    total: totalFiles,
    images: processedImages.length,
    documents: processedDocuments.length
  },
  categorization_summary: {
    images_by_category: processedImages.reduce((acc, img) => {
      acc[img.subcategory] = (acc[img.subcategory] || 0) + 1;
      return acc;
    }, {}),
    documents_by_category: processedDocuments.reduce((acc, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + 1;
      return acc;
    }, {})
  },
  sql_query: fullSQL,
  timestamp: new Date().toISOString(),
  // URLs listas para mensajería
  messaging_ready_urls: {
    images: processedImages.map(img => ({
      url: img.public_url,
      category: img.subcategory,
      title: img.title
    })),
    documents: processedDocuments.map(doc => ({
      url: doc.public_url,
      category: doc.subcategory,
      title: doc.title
    }))
  }
};

console.log('🎉 Procesamiento completado:');
console.log(`   ✅ ${processedImages.length} imágenes categorizadas`);
console.log(`   ✅ ${processedDocuments.length} documentos categorizados`);
console.log(`   ✅ ${allMediaFiles.length} URLs listas para mensajería`);

// Retornar el resultado para el siguiente nodo (Postgres)
return result; 
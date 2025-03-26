import supabase from './supabase';
import { v4 as uuidv4 } from 'uuid';
import { PropertyDocument } from '../types/property';

const BUCKET_NAME = 'property-documents';
const CDN_URL = 'https://blxngmtmknkdmikaflen.supabase.co/storage/v1/object/public/';

// Almacén temporal para documentos cuando no hay propertyId válido
const tempDocumentsStore: Record<string, PropertyDocument> = {};

// Asegurar que el bucket existe
const ensureBucket = async () => {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find(bucket => bucket.name === BUCKET_NAME)) {
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB límite
    });
  }
};

// Inicializar el servicio (llamar durante la inicialización de la app)
export const initDocumentService = async () => {
  await ensureBucket();
};

/**
 * Sube un documento y guarda sus metadatos
 */
export const uploadDocument = async (
  propertyId: string,
  file: File,
  documentData: {
    name: string;
    description?: string;
    type: 'faq' | 'guide' | 'house_rules' | 'inventory' | 'other';
  }
): Promise<PropertyDocument> => {
  await ensureBucket();
  
  try {
    // Determinar tipo de archivo
    let fileType: 'pdf' | 'doc' | 'txt' | 'other' = 'other';
    if (file.type === 'application/pdf') {
      fileType = 'pdf';
    } else if (file.type.includes('word') || file.type.includes('doc')) {
      fileType = 'doc';
    } else if (file.type === 'text/plain') {
      fileType = 'txt';
    }
    
    // Generar un nombre único para el archivo
    const fileExt = file.name.split('.').pop();
    const docId = uuidv4();
    
    // Verificar si estamos trabajando con una propiedad temporal
    if (propertyId === 'temp') {
      // Para propiedades temporales, generamos una estructura de documento sin subir el archivo
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onload = () => {
          try {
            const result = reader.result as string;
            const tempDocument: PropertyDocument = {
              id: docId,
              property_id: 'temp',
              name: documentData.name,
              description: documentData.description || '',
              type: documentData.type,
              file_url: result, // Guardamos el contenido como data URL
              file_type: fileType,
              uploaded_at: new Date().toISOString()
            };
            
            // Almacenar en la memoria temporal
            tempDocumentsStore[docId] = tempDocument;
            
            resolve(tempDocument);
          } catch (error) {
            reject(error);
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Error al leer el archivo'));
        };
        
        reader.readAsDataURL(file);
      });
    }
    
    // Para propiedades reales, continuamos con el proceso normal
    const fileName = `${propertyId}/${docId}.${fileExt}`;
    
    // Subir el archivo a Supabase Storage
    const { data: _, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, { 
        cacheControl: '3600',
        upsert: false 
      });
    
    if (error) throw error;
    
    // Crear URL pública
    const url = `${CDN_URL}${BUCKET_NAME}/${fileName}`;
    
    // Guardar metadatos en la base de datos
    const { data: docData, error: docError } = await supabase
      .from('property_documents')
      .insert({
        property_id: propertyId,
        name: documentData.name,
        description: documentData.description || '',
        type: documentData.type,
        file_url: url,
        file_type: fileType,
        file_name: fileName,
        uploaded_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (docError) throw docError;
    
    // Convertir de snake_case a camelCase si es necesario
    return docData as unknown as PropertyDocument;
  } catch (error) {
    console.error('Error subiendo documento:', error);
    throw error;
  }
};

/**
 * Obtiene todos los documentos de una propiedad
 */
export const getDocumentsByProperty = async (propertyId: string): Promise<PropertyDocument[]> => {
  // Si es una propiedad temporal, devolvemos los documentos del almacén temporal
  if (propertyId === 'temp') {
    return Object.values(tempDocumentsStore).filter(doc => doc.property_id === 'temp');
  }
  
  try {
    const { data, error } = await supabase
      .from('property_documents')
      .select('*')
      .eq('property_id', propertyId)
      .order('uploaded_at', { ascending: false });
    
    if (error) throw error;
    
    return data as unknown as PropertyDocument[];
  } catch (error) {
    console.error('Error cargando documentos:', error);
    throw error;
  }
};

/**
 * Elimina un documento
 */
export const deleteDocument = async (documentId: string): Promise<void> => {
  // Verificar si es un documento temporal
  if (tempDocumentsStore[documentId]) {
    delete tempDocumentsStore[documentId];
    return;
  }
  
  try {
    const { data, error } = await supabase
      .from('property_documents')
      .select('file_name')
      .eq('id', documentId)
      .single();
    
    if (error) throw error;
    
    // Eliminar archivo de Storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([data.file_name]);
    
    if (storageError) throw storageError;
    
    // Eliminar entrada de la base de datos
    const { error: dbError } = await supabase
      .from('property_documents')
      .delete()
      .eq('id', documentId);
    
    if (dbError) throw dbError;
  } catch (error) {
    console.error('Error eliminando documento:', error);
    throw error;
  }
};

/**
 * Actualiza los IDs de propiedad de los documentos temporales cuando se guarda la propiedad
 */
export const updateTempDocumentsPropertyId = async (newPropertyId: string): Promise<PropertyDocument[]> => {
  const tempDocs = Object.values(tempDocumentsStore).filter(
    doc => doc.property_id === 'temp'
  );
  
  if (tempDocs.length === 0) {
    return [];
  }
  
  const updatedDocs: PropertyDocument[] = [];
  
  for (const doc of tempDocs) {
    try {
      // Crear un nuevo documento para la propiedad
      const fileData = doc.file;
      if (!fileData) {
        continue;
      }
      
      // Generar nombre de archivo seguro
      const fileExt = doc.name.split('.').pop() || '';
      const fileName = `${doc.type.toLowerCase()}_${newPropertyId}_${Date.now()}.${fileExt}`;
      
      // Determinar el tipo de contenido para la subida
      let contentType = 'application/pdf';
      if (typeof doc.file_type === 'string' && doc.file_type.includes('image')) {
        contentType = doc.file_type;
      }
      
      // Subir a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('property-documents')
        .upload(`${newPropertyId}/${fileName}`, fileData, {
          cacheControl: '3600',
          upsert: false,
          contentType
        });
      
      if (uploadError) {
        throw new Error(`Error al subir archivo: ${uploadError.message}`);
      }
      
      // Guardar metadatos en la base de datos
      const { data: savedDoc, error: dbError } = await supabase
        .from('property_documents')
        .insert({
          property_id: newPropertyId,
          name: doc.name,
          file_type: doc.file_type,
          file_path: uploadData?.path || '',
          description: doc.description || '',
          type: doc.type, // Use el campo type existente en vez de document_type
          uploaded_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (dbError) {
        throw new Error(`Error al guardar metadatos: ${dbError.message}`);
      }
      
      // Agregar a la lista de documentos actualizados
      updatedDocs.push(savedDoc);
      
      // Eliminar del almacén temporal
      delete tempDocumentsStore[doc.id];
    } catch {
      // Se mantiene un error silencioso para permitir continuar con otros documentos
    }
  }
  
  return updatedDocs;
};

// Exportar todas las funciones
const documentService = {
  initDocumentService,
  uploadDocument,
  getDocumentsByProperty,
  deleteDocument,
  updateTempDocumentsPropertyId
};

export default documentService; 
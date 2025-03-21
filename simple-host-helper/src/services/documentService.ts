import supabase from './supabase';
import { v4 as uuidv4 } from 'uuid';
import { PropertyDocument } from '../types/property';

const BUCKET_NAME = 'property-documents';
const CDN_URL = 'https://blxngmtmknkdmikaflen.supabase.co/storage/v1/object/public/';

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
    const fileName = `${propertyId}/${uuidv4()}.${fileExt}`;
    
    // Subir el archivo a Supabase Storage
    const { data, error } = await supabase.storage
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

// Exportar todas las funciones
const documentService = {
  initDocumentService,
  uploadDocument,
  getDocumentsByProperty,
  deleteDocument
};

export default documentService; 
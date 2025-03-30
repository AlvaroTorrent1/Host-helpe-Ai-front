/**
 * src/services/documentService.ts
 * Service for managing property documents: uploads, retrieval, and deletion
 */

import supabase from "./supabase";
import { v4 as uuidv4 } from "uuid";
import { PropertyDocument } from "../types/property";
import { tryCatch, formatFileSize } from "../utils";
import { storageConfig, fileTypes } from "../config/environment";

// Document bucket name
const BUCKET_NAME = storageConfig.documentsBucket;

// Temporary store for documents when there's no valid propertyId
const tempDocumentsStore: Record<string, PropertyDocument> = {};

/**
 * Ensure storage bucket exists
 */
const ensureBucket = async (): Promise<void> => {
  await tryCatch(async () => {
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find((bucket) => bucket.name === BUCKET_NAME)) {
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: storageConfig.documentSizeLimit,
      });
    }
  }, undefined);
};

/**
 * Initialize the document service (call during app initialization)
 */
export const initDocumentService = async (): Promise<void> => {
  await ensureBucket();
};

/**
 * Determine file type based on MIME type
 * @param file The file to check
 * @returns The determined file type
 */
const getFileType = (file: File): "pdf" | "doc" | "txt" | "other" => {
  if (file.type === "application/pdf") {
    return "pdf";
  } else if (file.type.includes("word") || file.type.includes("doc")) {
    return "doc";
  } else if (file.type === "text/plain") {
    return "txt";
  }
  return "other";
};

/**
 * Uploads a document and saves its metadata
 * @param propertyId The property ID to associate with the document
 * @param file The file to upload
 * @param documentData The document metadata
 * @returns The created document object
 */
export const uploadDocument = async (
  propertyId: string,
  file: File,
  documentData: {
    name: string;
    description?: string;
    type: "faq" | "guide" | "house_rules" | "inventory" | "other";
  },
): Promise<PropertyDocument | null> => {
  await ensureBucket();
  
  // Handle temporary properties
  if (propertyId === "temp") {
    return await handleTempPropertyDocument(file, documentData);
  }
  
  // For regular properties, upload to Supabase
  return await tryCatch(async () => {
    // Determine file type and generate unique name
    const fileType = getFileType(file);
    const fileExt = file.name.split(".").pop() || "";
    const docId = uuidv4();
    const fileName = `${propertyId}/${docId}.${fileExt}`;
    
    // Upload file to Supabase Storage
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, { 
        cacheControl: "3600",
        upsert: false,
      });
    
    if (error) throw error;
    
    // Get the public URL from getPublicUrl
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);
    
    // Save metadata to database
    const { data: docData, error: docError } = await supabase
      .from("property_documents")
      .insert({
        property_id: propertyId,
        name: documentData.name,
        description: documentData.description || "",
        type: documentData.type,
        file_url: publicUrlData.publicUrl,
        file_type: fileType,
        file_name: fileName,
        size: file.size,
        formatted_size: formatFileSize(file.size),
        uploaded_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (docError) throw docError;
    
    return docData as PropertyDocument;
  }, null);
};

/**
 * Handle document for temporary property
 * @param file The file to process
 * @param documentData The document metadata
 * @returns The temporary document object
 */
const handleTempPropertyDocument = async (
  file: File,
  documentData: {
    name: string;
    description?: string;
    type: "faq" | "guide" | "house_rules" | "inventory" | "other";
  }
): Promise<PropertyDocument | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const result = reader.result as string;
        const fileSize = file.size;
        const tempDocument: PropertyDocument = {
          id: uuidv4(),
          property_id: "temp",
          name: documentData.name,
          description: documentData.description || "",
          type: documentData.type,
          file_url: result, // Store content as data URL
          file_type: getFileType(file),
          size: fileSize,
          formatted_size: formatFileSize(fileSize),
          uploaded_at: new Date().toISOString(),
        };
        
        // Store in temporary memory
        tempDocumentsStore[tempDocument.id] = tempDocument;
        
        resolve(tempDocument);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Gets all documents for a property
 * @param propertyId The property ID to get documents for
 * @returns Array of property documents
 */
export const getDocumentsByProperty = async (
  propertyId: string,
): Promise<PropertyDocument[]> => {
  // If it's a temporary property, return documents from temporary store
  if (propertyId === "temp") {
    return Object.values(tempDocumentsStore).filter(
      (doc) => doc.property_id === "temp",
    );
  }
  
  return tryCatch(async () => {
    const { data, error } = await supabase
      .from("property_documents")
      .select("*")
      .eq("property_id", propertyId)
      .order("uploaded_at", { ascending: false });
    
    if (error) throw error;
    
    return data.map(doc => ({
      ...doc,
      formatted_size: doc.formatted_size || formatFileSize(doc.size || 0)
    })) as PropertyDocument[];
  }, [] as PropertyDocument[]);
};

/**
 * Gets a document by ID
 * @param documentId The document ID to retrieve
 * @returns The document or null if not found
 */
export const getDocumentById = async (
  documentId: string
): Promise<PropertyDocument | null> => {
  // Check if it's in the temporary store
  if (tempDocumentsStore[documentId]) {
    return tempDocumentsStore[documentId];
  }
  
  return tryCatch(async () => {
    const { data, error } = await supabase
      .from("property_documents")
      .select("*")
      .eq("id", documentId)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      ...data,
      formatted_size: data.formatted_size || formatFileSize(data.size || 0)
    } as PropertyDocument;
  }, null);
};

/**
 * Deletes a document
 * @param documentId The document ID to delete
 */
export const deleteDocument = async (documentId: string): Promise<void> => {
  // Check if it's a temporary document
  if (tempDocumentsStore[documentId]) {
    delete tempDocumentsStore[documentId];
    return;
  }
  
  return tryCatch(async () => {
    const { data, error } = await supabase
      .from("property_documents")
      .select("file_name")
      .eq("id", documentId)
      .single();
    
    if (error) throw error;
    
    // Delete file from Storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([data.file_name]);
    
    if (storageError) throw storageError;
    
    // Delete entry from database
    const { error: dbError } = await supabase
      .from("property_documents")
      .delete()
      .eq("id", documentId);
    
    if (dbError) throw dbError;
  }, undefined);
};

/**
 * Updates property ID of temporary documents when the property is saved
 * @param newPropertyId The new property ID to update documents with
 * @returns Array of updated documents
 */
export const updateTempDocumentsPropertyId = async (
  newPropertyId: string,
): Promise<PropertyDocument[]> => {
  const tempDocs = Object.values(tempDocumentsStore).filter(
    (doc) => doc.property_id === "temp",
  );

  if (tempDocs.length === 0) {
    return [];
  }
  
  const updatedDocs: PropertyDocument[] = [];

  for (const doc of tempDocs) {
    try {
      console.log(`Processing temporary document: ${doc.name} with ID: ${doc.id}`);
      
      // Extract the data URL from the file_url
      const dataUrl = doc.file_url;
      
      // Skip if not a data URL
      if (!dataUrl.startsWith('data:')) {
        console.error(`Document ${doc.id} does not have a valid data URL`);
        continue;
      }
      
      // Convert data URL to Blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      
      // Create a File object
      const fileExt = doc.file_type || 'pdf';
      const filePath = `${newPropertyId}/${doc.id}.${fileExt}`;
      const file = new File([blob], filePath, { type: blob.type });
      
      console.log(`Converted data URL to file: ${filePath}, size: ${file.size} bytes`);
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true
        });
      
      if (uploadError) {
        throw new Error(`Error uploading file: ${uploadError.message}`);
      }
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);
      
      // Save metadata to database
      const { data: savedDoc, error: dbError } = await supabase
        .from("property_documents")
        .insert({
          property_id: newPropertyId,
          name: doc.name,
          description: doc.description || "",
          type: doc.type,
          file_url: publicUrlData.publicUrl, // Use the publicUrl from the response
          file_type: doc.file_type,
          file_name: filePath,
          size: doc.size || 0,
          formatted_size: doc.formatted_size || formatFileSize(doc.size || 0),
          uploaded_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (dbError) {
        throw new Error(`Error saving document metadata: ${dbError.message}`);
      }
      
      console.log(`Successfully updated document: ${doc.name} with new property ID: ${newPropertyId}`);
      
      // Add to list of updated documents
      updatedDocs.push(savedDoc);
      
      // Remove from temporary store
      delete tempDocumentsStore[doc.id];
    } catch (error) {
      console.error(`Error processing document ${doc.id}:`, error);
    }
  }
  
  return updatedDocs;
};

// Export service as a unified object
const documentService = {
  initDocumentService,
  uploadDocument,
  getDocumentsByProperty,
  getDocumentById,
  deleteDocument,
  updateTempDocumentsPropertyId,
};

export default documentService; 

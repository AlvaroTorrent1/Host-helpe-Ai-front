import supabase from "./supabase";
import { Property } from "../types/property";

/**
 * Obtiene todas las propiedades del usuario
 */
export const getProperties = async (): Promise<Property[]> => {
  try {
    // Verificar si el usuario está autenticado
    const { data: userAuth, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error("Error de autenticación:", authError);
      throw authError;
    }

    if (!userAuth?.user) {
      console.error("Usuario no autenticado");
      throw new Error("Usuario no autenticado");
    }

    console.log("Usuario autenticado:", userAuth.user.email, "ID:", userAuth.user.id);

    // CAMBIO CRÍTICO: Hacer consultas separadas como en getPropertyById()
    // 1. Obtener propiedades básicas
    const { data: properties, error: propError } = await supabase
      .from("properties")
      .select("*")
      .eq('user_id', userAuth.user.id)
      .order("created_at", { ascending: false });

    if (propError) {
      console.error("Error obteniendo propiedades:", propError);
      throw propError;
    }

    console.log("Propiedades básicas obtenidas:", properties);

    if (!properties || properties.length === 0) {
      console.log("No se encontraron propiedades para el usuario");
      return [];
    }

    // 2. Obtener todos los media_files para estas propiedades
    const propertyIds = properties.map(p => p.id);
    const { data: allMediaFiles, error: mediaError } = await supabase
      .from("media_files")
      .select("*")
      .in("property_id", propertyIds)
      .order("sort_order", { ascending: true });

    if (mediaError) {
      console.error("Error obteniendo media_files:", mediaError);
      throw mediaError;
    }

    // 3. Obtener todos los shareable_links para estas propiedades
    const { data: allShareableLinks, error: linksError } = await supabase
      .from("shareable_links")
      .select("*")
      .in("property_id", propertyIds)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (linksError) {
      console.error("Error obteniendo shareable_links:", linksError);
      throw linksError;
    }

    console.log("Media files obtenidos:", allMediaFiles?.length || 0);
    console.log("Shareable links obtenidos:", allShareableLinks?.length || 0);

    // 4. Mapear cada propiedad con sus archivos y enlaces asociados
    const mappedProperties = properties.map(property => {
      const mediaFiles = (allMediaFiles || []).filter(file => file.property_id === property.id);
      const shareableLinks = (allShareableLinks || []).filter(link => link.property_id === property.id);
      
      // Separar imágenes de documentos basado en file_type
      const images = mediaFiles
        .filter(file => file.file_type === 'image')
        .map(file => ({
          id: file.id,
          property_id: file.property_id,
          file_url: file.file_url || file.public_url,
          description: file.description || file.title,
          uploaded_at: file.created_at
        }));

      const documents = mediaFiles
        .filter(file => file.file_type === 'document')
        .map(file => ({
          id: file.id,
          property_id: file.property_id,
          type: 'faq', // Por defecto FAQ, ya que no tenemos subcategory en la tabla
          name: file.title || 'Documento sin título',
          file_url: file.public_url || file.file_url, // Priorizar public_url pero usar file_url como fallback
          description: file.description || '',
          uploaded_at: file.created_at,
          file_type: file.mime_type?.includes('pdf') ? 'pdf' : 
                     file.mime_type?.includes('doc') ? 'doc' : 
                     file.mime_type?.includes('text') ? 'txt' : 'other'
        }));

      return {
        ...property,
        image: images[0]?.file_url || property.image,
        additional_images: images,
        documents: documents,
        shareable_links: shareableLinks
      };
    });

    console.log("Propiedades finales mapeadas:", mappedProperties.length);
    return mappedProperties as Property[];

  } catch (error) {
    console.error("Error obteniendo propiedades:", error);
    throw error;
  }
};

/**
 * Obtiene una propiedad por su ID con todos sus archivos multimedia y enlaces
 */
export const getPropertyById = async (id: string): Promise<Property> => {
  try {
    // Obtener propiedad básica
    const { data: property, error: propError } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();

    if (propError) throw propError;

    // Obtener media_files (imágenes y documentos)
    const { data: mediaFiles, error: mediaError } = await supabase
      .from("media_files")
      .select("*")
      .eq("property_id", id)
      .order("sort_order", { ascending: true });

    if (mediaError) throw mediaError;

    // Obtener enlaces compartibles
    const { data: shareableLinks, error: linksError } = await supabase
      .from("shareable_links")
      .select("*")
      .eq("property_id", id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (linksError) throw linksError;

    // Mapear imágenes desde media_files
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

    // Mapear documentos desde media_files
    const documents = (mediaFiles || [])
      .filter(file => file.file_type === 'document')
      .map(file => ({
        id: file.id,
        property_id: file.property_id,
        type: 'faq', // Por defecto FAQ, ya que no tenemos subcategory en la tabla
        name: file.title || 'Documento sin título',
        file_url: file.public_url || file.file_url, // Priorizar public_url pero usar file_url como fallback
        description: file.description || '',
        uploaded_at: file.created_at,
        file_type: file.mime_type?.includes('pdf') ? 'pdf' : 
                   file.mime_type?.includes('doc') ? 'doc' : 
                   file.mime_type?.includes('text') ? 'txt' : 'other'
      }));

    return {
      ...property,
      // Mantener compatibilidad con campo legacy image
      image: images[0]?.file_url || property.image,
      additional_images: images,
      documents: documents,
      shareable_links: shareableLinks || []
    } as Property;

  } catch (error) {
    console.error(`Error obteniendo propiedad con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Sincroniza la foto de portada de una propiedad con la primera imagen
 */
export const syncPropertyCoverPhoto = async (propertyId: string): Promise<{
  success: boolean;
  updated: boolean;
  message: string;
  oldCover?: string;
  newCover?: string;
}> => {
  try {
    const { data, error } = await supabase.rpc('sync_property_cover_photo', {
      p_property_id: propertyId
    });

    if (error) {
      console.error('Error syncing cover photo:', error);
      return {
        success: false,
        updated: false,
        message: `Error: ${error.message}`
      };
    }

    return {
      success: data.success,
      updated: data.updated,
      message: data.message,
      oldCover: data.old_cover,
      newCover: data.new_cover
    };
  } catch (error) {
    console.error('Error in syncPropertyCoverPhoto:', error);
    return {
      success: false,
      updated: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Sincroniza las fotos de portada de todas las propiedades del usuario
 */
export const syncUserCoverPhotos = async (): Promise<{
  success: boolean;
  totalUpdated: number;
  propertiesProcessed: number;
  message: string;
}> => {
  try {
    // Obtener el usuario actual
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Usuario no autenticado');
    }

    const { data, error } = await supabase.rpc('sync_user_cover_photos', {
      p_user_id: user.id
    });

    if (error) {
      console.error('Error syncing user cover photos:', error);
      return {
        success: false,
        totalUpdated: 0,
        propertiesProcessed: 0,
        message: `Error: ${error.message}`
      };
    }

    return {
      success: data.success,
      totalUpdated: data.total_updated,
      propertiesProcessed: data.properties_processed,
      message: data.message
    };
  } catch (error) {
    console.error('Error in syncUserCoverPhotos:', error);
    return {
      success: false,
      totalUpdated: 0,
      propertiesProcessed: 0,
      message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Crea una nueva propiedad
 */
export const createProperty = async (
  property: Omit<Property, "id">,
): Promise<Property> => {
  try {
    // Extraer los datos que no van directamente a la tabla de propiedades
    const { additional_images, documents, ...propertyData } = property;

    // 🔍 LOG DETALLADO: Verificar datos SES antes de guardar
    console.log('📋 CREANDO PROPIEDAD - Datos SES recibidos:', {
      ses_landlord_code: propertyData.ses_landlord_code,
      ses_username: propertyData.ses_username,
      ses_api_password: propertyData.ses_api_password ? '***' : undefined,
      ses_establishment_code: propertyData.ses_establishment_code,
    });

    // Crear la propiedad
    const { data, error } = await supabase
      .from("properties")
      .insert([
        {
          ...propertyData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // ✅ LOG: Confirmar datos guardados en Supabase
    console.log('✅ PROPIEDAD CREADA - Datos SES guardados en BD:', {
      id: data.id,
      ses_landlord_code: data.ses_landlord_code,
    });

    // La propiedad creada inicialmente no tiene imágenes ni documentos asociados
    const newProperty: Property = {
      ...data,
      additional_images: [],
      documents: [],
    };

    return newProperty;
  } catch (error) {
    console.error("Error creando propiedad:", error);
    throw error;
  }
};

/**
 * Actualiza una propiedad existente
 */
export const updateProperty = async (property: Property): Promise<Property> => {
  try {
    // Extraer los datos que no van directamente a la tabla de propiedades
    const { id, additional_images, documents, ...propertyData } = property;

    // 🔍 LOG DETALLADO: Verificar datos SES antes de actualizar
    console.log('📝 ACTUALIZANDO PROPIEDAD - Datos SES recibidos:', {
      id,
      ses_landlord_code: propertyData.ses_landlord_code,
      ses_username: propertyData.ses_username,
      ses_api_password: propertyData.ses_api_password ? '***' : undefined,
      ses_establishment_code: propertyData.ses_establishment_code,
    });

    // Actualizar la propiedad
    const { data, error } = await supabase
      .from("properties")
      .update({
        ...propertyData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // ✅ LOG: Confirmar datos actualizados en Supabase
    console.log('✅ PROPIEDAD ACTUALIZADA - Datos SES guardados en BD:', {
      id: data.id,
      ses_landlord_code: data.ses_landlord_code,
    });

    // Devolver la propiedad actualizada con las relaciones
    return {
      ...data,
      additional_images: additional_images || [],
      documents: documents || [],
    } as Property;
  } catch (error) {
    console.error(`Error actualizando propiedad con ID ${property.id}:`, error);
    throw error;
  }
};

/**
 * Elimina una propiedad
 */
export const deleteProperty = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase.from("properties").delete().eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error(`Error eliminando propiedad con ID ${id}:`, error);
    throw error;
  }
};

// Exportar todas las funciones
const propertyService = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
};

export default propertyService;

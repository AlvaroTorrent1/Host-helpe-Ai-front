import supabase from "./supabase";
import { Property } from "../types/property";

/**
 * Obtiene todas las propiedades del usuario
 */
export const getProperties = async (): Promise<Property[]> => {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("*, additional_images(*), documents(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data as Property[];
  } catch (error) {
    console.error("Error obteniendo propiedades:", error);
    throw error;
  }
};

/**
 * Obtiene una propiedad por su ID
 */
export const getPropertyById = async (id: string): Promise<Property> => {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("*, additional_images(*), documents(*)")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data as Property;
  } catch (error) {
    console.error(`Error obteniendo propiedad con ID ${id}:`, error);
    throw error;
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

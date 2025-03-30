/**
 * Servicio para gestión de propiedades
 * Proporciona funcionalidades para crear, leer, actualizar y eliminar propiedades
 */

import { supabase } from './security.service';
import { getStorage } from '../utils';
import { formatDate, getDaysDifference } from '../utils/dateUtils';

// Configuración de almacenamiento local para caché
const storage = getStorage('local');
const PROPERTIES_CACHE_KEY = 'properties';
const PROPERTY_CACHE_PREFIX = 'property_';
const CACHE_EXPIRY = 15 * 60 * 1000; // 15 minutos en milisegundos

// Tipos de propiedades
export interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  price_per_night: number;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  amenities: string[];
  images: string[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
  availability?: Availability[];
  average_rating?: number;
  total_reviews?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Availability {
  start_date: string;
  end_date: string;
}

export interface PropertyFilter {
  city?: string;
  state?: string;
  country?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  min_guests?: number;
  amenities?: string[];
  start_date?: string;
  end_date?: string;
}

/**
 * Clase de servicio de propiedades
 */
export class PropertyService {
  /**
   * Obtiene todas las propiedades activas
   */
  async getAllProperties(filters?: PropertyFilter): Promise<Property[]> {
    // Intentar obtener de caché si no hay filtros
    if (!filters) {
      const cachedProperties = this.getCachedProperties();
      if (cachedProperties) return cachedProperties;
    }

    try {
      let query = supabase
        .from('properties')
        .select(`
          *,
          availability(*),
          reviews(count)
        `)
        .eq('is_active', true);

      // Aplicar filtros si existen
      if (filters) {
        if (filters.city) query = query.ilike('city', `%${filters.city}%`);
        if (filters.state) query = query.ilike('state', `%${filters.state}%`);
        if (filters.country) query = query.ilike('country', `%${filters.country}%`);
        if (filters.min_price) query = query.gte('price_per_night', filters.min_price);
        if (filters.max_price) query = query.lte('price_per_night', filters.max_price);
        if (filters.bedrooms) query = query.eq('bedrooms', filters.bedrooms);
        if (filters.bathrooms) query = query.eq('bathrooms', filters.bathrooms);
        if (filters.min_guests) query = query.gte('max_guests', filters.min_guests);
        if (filters.amenities && filters.amenities.length > 0) {
          query = query.contains('amenities', filters.amenities);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      // Procesar los resultados
      const properties = (data || []).map((property) => this.processPropertyData(property));

      // Filtrar por disponibilidad si se proporcionan fechas
      if (filters?.start_date && filters?.end_date) {
        return this.filterByAvailability(properties, filters.start_date, filters.end_date);
      }

      // Guardar en caché si no hay filtros
      if (!filters) {
        this.cacheProperties(properties);
      }

      return properties;
    } catch (error) {
      console.error('Error al obtener propiedades:', error);
      return [];
    }
  }

  /**
   * Obtiene propiedades por ID de propietario
   */
  async getPropertiesByOwner(ownerId: string): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          availability(*),
          reviews(count)
        `)
        .eq('owner_id', ownerId);

      if (error) throw error;

      return (data || []).map((property) => this.processPropertyData(property));
    } catch (error) {
      console.error('Error al obtener propiedades del propietario:', error);
      return [];
    }
  }

  /**
   * Obtiene una propiedad por su ID
   */
  async getPropertyById(id: string): Promise<Property | null> {
    // Intentar obtener de caché primero
    const cachedProperty = this.getCachedProperty(id);
    if (cachedProperty) return cachedProperty;

    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          availability(*),
          reviews(count, rating)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      const property = this.processPropertyData(data);
      
      // Guardar en caché
      this.cacheProperty(property);
      
      return property;
    } catch (error) {
      console.error('Error al obtener propiedad por ID:', error);
      return null;
    }
  }

  /**
   * Crea una nueva propiedad
   */
  async createProperty(propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property | null> {
    try {
      const now = new Date().toISOString();
      
      // Preparar datos para la inserción
      const newProperty = {
        ...propertyData,
        created_at: now,
        updated_at: now,
        is_active: true
      };
      
      const { data, error } = await supabase
        .from('properties')
        .insert(newProperty)
        .select()
        .single();

      if (error) throw error;
      if (!data) return null;

      // Limpiar caché de propiedades
      this.clearPropertiesCache();

      return this.processPropertyData(data);
    } catch (error) {
      console.error('Error al crear propiedad:', error);
      return null;
    }
  }

  /**
   * Actualiza una propiedad existente
   */
  async updateProperty(id: string, propertyData: Partial<Property>): Promise<Property | null> {
    try {
      // Asegurarnos de no actualizar campos que no deberían cambiar
      const { id: propId, owner_id, created_at, ...updateData } = propertyData;
      
      const now = new Date().toISOString();
      const updates = {
        ...updateData,
        updated_at: now
      };
      
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) return null;

      // Actualizar caché
      this.invalidatePropertyCache(id);
      this.clearPropertiesCache();

      return this.processPropertyData(data);
    } catch (error) {
      console.error('Error al actualizar propiedad:', error);
      return null;
    }
  }

  /**
   * Elimina una propiedad (marcándola como inactiva)
   */
  async deleteProperty(id: string): Promise<boolean> {
    try {
      // Soft delete - marcar como inactivo en lugar de eliminar
      const { error } = await supabase
        .from('properties')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // Limpiar caché
      this.invalidatePropertyCache(id);
      this.clearPropertiesCache();

      return true;
    } catch (error) {
      console.error('Error al eliminar propiedad:', error);
      return false;
    }
  }

  /**
   * Obtiene la disponibilidad de una propiedad
   */
  async getPropertyAvailability(propertyId: string): Promise<Availability[]> {
    try {
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('property_id', propertyId);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error al obtener disponibilidad:', error);
      return [];
    }
  }

  /**
   * Actualiza la disponibilidad de una propiedad
   */
  async updateAvailability(propertyId: string, availability: Availability[]): Promise<boolean> {
    try {
      // Primero eliminar disponibilidad existente
      const { error: deleteError } = await supabase
        .from('availability')
        .delete()
        .eq('property_id', propertyId);

      if (deleteError) throw deleteError;

      // Luego insertar nueva disponibilidad
      if (availability.length > 0) {
        const availabilityWithPropertyId = availability.map(period => ({
          property_id: propertyId,
          start_date: period.start_date,
          end_date: period.end_date
        }));

        const { error: insertError } = await supabase
          .from('availability')
          .insert(availabilityWithPropertyId);

        if (insertError) throw insertError;
      }

      // Invalidar caché
      this.invalidatePropertyCache(propertyId);

      return true;
    } catch (error) {
      console.error('Error al actualizar disponibilidad:', error);
      return false;
    }
  }

  /**
   * Verifica si una propiedad está disponible en un rango de fechas
   */
  isPropertyAvailable(
    property: Property,
    startDate: string,
    endDate: string
  ): boolean {
    if (!property.availability || property.availability.length === 0) {
      return false;
    }

    return property.availability.some(period => {
      const periodStart = new Date(period.start_date);
      const periodEnd = new Date(period.end_date);
      const requestedStart = new Date(startDate);
      const requestedEnd = new Date(endDate);

      return (
        requestedStart >= periodStart &&
        requestedEnd <= periodEnd
      );
    });
  }

  /**
   * Procesa datos de propiedad para incluir valores calculados
   */
  private processPropertyData(data: Record<string, unknown>): Property {
    // Calcular valoración media y total de reseñas
    let averageRating = 0;
    let totalReviews = 0;

    if (data.reviews) {
      if (Array.isArray(data.reviews)) {
        totalReviews = data.reviews.length;
        averageRating = data.reviews.reduce(
          (sum: number, review: { rating?: number }) => sum + (review.rating || 0),
          0
        ) / (totalReviews || 1);
      } else if (typeof data.reviews === 'object') {
        totalReviews = (data.reviews as { count?: number }).count || 0;
        // Si la consulta incluye rating, calculamos el promedio
        if ((data.reviews as { rating?: number }).rating) {
          averageRating = totalReviews > 0 ? (data.reviews as { rating: number }).rating / totalReviews : 0;
        }
      }
    }

    const propertyData: Property = {
      id: data.id as string,
      owner_id: data.owner_id as string,
      title: data.title as string,
      description: data.description as string,
      address: data.address as string,
      city: data.city as string,
      state: data.state as string,
      country: data.country as string,
      zip_code: data.zip_code as string,
      price_per_night: data.price_per_night as number,
      bedrooms: data.bedrooms as number,
      bathrooms: data.bathrooms as number,
      max_guests: data.max_guests as number,
      amenities: (data.amenities as string[]) || [],
      images: (data.images as string[]) || [],
      created_at: data.created_at as string,
      updated_at: data.updated_at as string,
      is_active: data.is_active as boolean,
      average_rating: averageRating,
      total_reviews: totalReviews,
      availability: (data.availability as Availability[]) || []
    };

    // Añadir coordenadas si existen
    if (data.coordinates) {
      propertyData.coordinates = data.coordinates as { latitude: number; longitude: number };
    }

    return propertyData;
  }

  /**
   * Filtra propiedades por disponibilidad
   */
  private filterByAvailability(
    properties: Property[],
    startDate: string,
    endDate: string
  ): Property[] {
    return properties.filter(property => 
      this.isPropertyAvailable(property, startDate, endDate)
    );
  }

  /**
   * Obtiene propiedades en caché
   */
  private getCachedProperties(): Property[] | null {
    const cached = storage.getItem<{
      data: Property[];
      timestamp: number;
    }>(PROPERTIES_CACHE_KEY);

    if (!cached) return null;

    // Verificar si la caché ha expirado
    if (Date.now() - cached.timestamp > CACHE_EXPIRY) {
      storage.removeItem(PROPERTIES_CACHE_KEY);
      return null;
    }

    return cached.data;
  }

  /**
   * Almacena propiedades en caché
   */
  private cacheProperties(properties: Property[]): void {
    storage.setItem(PROPERTIES_CACHE_KEY, {
      data: properties,
      timestamp: Date.now()
    });
  }

  /**
   * Obtiene una propiedad de la caché
   */
  private getCachedProperty(id: string): Property | null {
    const cached = storage.getItem<{
      data: Property;
      timestamp: number;
    }>(`${PROPERTY_CACHE_PREFIX}${id}`);

    if (!cached) return null;

    // Verificar si la caché ha expirado
    if (Date.now() - cached.timestamp > CACHE_EXPIRY) {
      storage.removeItem(`${PROPERTY_CACHE_PREFIX}${id}`);
      return null;
    }

    return cached.data;
  }

  /**
   * Almacena una propiedad en caché
   */
  private cacheProperty(property: Property): void {
    storage.setItem(`${PROPERTY_CACHE_PREFIX}${property.id}`, {
      data: property,
      timestamp: Date.now()
    });
  }

  /**
   * Invalida la caché de una propiedad específica
   */
  private invalidatePropertyCache(id: string): void {
    storage.removeItem(`${PROPERTY_CACHE_PREFIX}${id}`);
  }

  /**
   * Limpia la caché de todas las propiedades
   */
  private clearPropertiesCache(): void {
    storage.removeItem(PROPERTIES_CACHE_KEY);
  }

  /**
   * Calcula el precio total para una estancia
   */
  calculateTotalPrice(property: Property, startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const nights = getDaysDifference(start, end);
    
    return property.price_per_night * nights;
  }

  /**
   * Formatea fechas de disponibilidad para mostrar
   */
  formatAvailabilityDate(date: string): string {
    return formatDate(new Date(date));
  }

  /**
   * Búsqueda de propiedades por término
   */
  async searchProperties(term: string): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          availability(*),
          reviews(count)
        `)
        .eq('is_active', true)
        .or(
          `title.ilike.%${term}%,description.ilike.%${term}%,address.ilike.%${term}%,
          city.ilike.%${term}%,state.ilike.%${term}%,country.ilike.%${term}%`
        );

      if (error) throw error;

      return (data || []).map((property) => this.processPropertyData(property));
    } catch (error) {
      console.error('Error al buscar propiedades:', error);
      return [];
    }
  }

  /**
   * Obtiene propiedades destacadas 
   */
  async getFeaturedProperties(): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          availability(*),
          reviews(count, rating)
        `)
        .eq('is_active', true)
        .order('price_per_night', { ascending: false })
        .limit(6);

      if (error) throw error;

      return (data || []).map((property) => this.processPropertyData(property));
    } catch (error) {
      console.error('Error al obtener propiedades destacadas:', error);
      return [];
    }
  }
}

// Exportamos una instancia única del servicio
export const propertyService = new PropertyService(); 
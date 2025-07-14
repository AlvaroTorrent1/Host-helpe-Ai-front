// src/services/shareableLinkService.ts
// Service for managing shareable links (Google Business, social media, etc.)

import { supabase } from './supabase';

export type LinkType = 'image' | 'gallery' | 'document' | 'profile';
export type PlatformType = 'whatsapp' | 'telegram' | 'email' | 'general';

export interface ShareableLinkData {
  link_type: LinkType;
  public_url: string;
  title: string;
  description?: string;
  is_active?: boolean;
  expires_at?: string;
  created_for?: PlatformType;
  metadata?: Record<string, any>;
}

export interface ShareableLink extends ShareableLinkData {
  id: string;
  property_id: string;
  target_id?: string;
  click_count: number;
  last_accessed_at?: string;
  created_at: string;
  updated_at: string;
}

class ShareableLinkService {
  /**
   * Crear un nuevo link compartible
   */
  async createShareableLink(
    propertyId: string,
    linkData: ShareableLinkData
  ): Promise<ShareableLink> {
    try {
      // Validar URL
      if (!this.isValidUrl(linkData.public_url)) {
        throw new Error('URL inválida. Debe comenzar con http:// o https://');
      }

      // Validar que la propiedad existe
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('id, name')
        .eq('id', propertyId)
        .single();

      if (propertyError || !property) {
        throw new Error('Propiedad no encontrada');
      }

      console.log(`📎 Creando link compartible para propiedad: ${property.name}`);

      // Insertar link en la base de datos
      const { data, error } = await supabase
        .from('shareable_links')
        .insert({
          property_id: propertyId,
          link_type: linkData.link_type,
          public_url: linkData.public_url,
          title: linkData.title,
          description: linkData.description,
          is_active: linkData.is_active !== false, // Default true
          expires_at: linkData.expires_at,
          created_for: linkData.created_for || 'general',
          metadata: linkData.metadata || {},
          click_count: 0
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando link compartible:', error);
        throw new Error(`Error al crear link: ${error.message}`);
      }

      console.log('✅ Link compartible creado:', data.id);
      return data as ShareableLink;

    } catch (error) {
      console.error('❌ Error en createShareableLink:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los links de una propiedad
   */
  async getPropertyLinks(propertyId: string): Promise<ShareableLink[]> {
    try {
      const { data, error } = await supabase
        .from('shareable_links')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error al obtener links: ${error.message}`);
      }

      return data as ShareableLink[];

    } catch (error) {
      console.error('❌ Error en getPropertyLinks:', error);
      throw error;
    }
  }

  /**
   * Obtener links por tipo
   */
  async getPropertyLinksByType(
    propertyId: string, 
    linkType: LinkType
  ): Promise<ShareableLink[]> {
    try {
      const { data, error } = await supabase
        .from('shareable_links')
        .select('*')
        .eq('property_id', propertyId)
        .eq('link_type', linkType)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error al obtener links por tipo: ${error.message}`);
      }

      return data as ShareableLink[];

    } catch (error) {
      console.error('❌ Error en getPropertyLinksByType:', error);
      throw error;
    }
  }

  /**
   * Actualizar un link existente
   */
  async updateShareableLink(
    linkId: string,
    updates: Partial<ShareableLinkData>
  ): Promise<ShareableLink> {
    try {
      // Validar URL si se está actualizando
      if (updates.public_url && !this.isValidUrl(updates.public_url)) {
        throw new Error('URL inválida');
      }

      const { data, error } = await supabase
        .from('shareable_links')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', linkId)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al actualizar link: ${error.message}`);
      }

      console.log('✅ Link actualizado:', linkId);
      return data as ShareableLink;

    } catch (error) {
      console.error('❌ Error en updateShareableLink:', error);
      throw error;
    }
  }

  /**
   * Eliminar un link
   */
  async deleteShareableLink(linkId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('shareable_links')
        .delete()
        .eq('id', linkId);

      if (error) {
        throw new Error(`Error al eliminar link: ${error.message}`);
      }

      console.log('✅ Link eliminado:', linkId);

    } catch (error) {
      console.error('❌ Error en deleteShareableLink:', error);
      throw error;
    }
  }

  /**
   * Registrar click en un link (incrementar contador)
   */
  async recordLinkClick(linkId: string): Promise<void> {
    try {
      // Usar RPC para incremento atómico
      const { error } = await supabase.rpc('increment_link_clicks', {
        link_id: linkId
      });

      if (error) {
        // Si la función RPC no existe, hacer actualización manual
        const { data: currentLink } = await supabase
          .from('shareable_links')
          .select('click_count')
          .eq('id', linkId)
          .single();

        if (currentLink) {
          await supabase
            .from('shareable_links')
            .update({
              click_count: (currentLink.click_count || 0) + 1,
              last_accessed_at: new Date().toISOString()
            })
            .eq('id', linkId);
        }
      }

    } catch (error) {
      console.error('❌ Error registrando click:', error);
      // No lanzar error para no interrumpir la navegación del usuario
    }
  }

  /**
   * Crear múltiples links de Google Business de una vez
   */
  async createGoogleBusinessLinks(
    propertyId: string,
    urls: string[]
  ): Promise<ShareableLink[]> {
    console.log('🔗 createGoogleBusinessLinks iniciando...');
    console.log('Property ID:', propertyId);
    console.log('URLs recibidas:', urls);
    console.log('Total URLs:', urls.length);
    
    try {
      // Log de validación de URLs
      console.log('🔍 Validando URLs...');
      const validationResults = urls.map(url => ({
        url,
        isValid: this.isValidUrl(url),
        isEmpty: !url || url.trim() === ''
      }));
      
      validationResults.forEach(result => {
        console.log(`  URL: "${result.url}" - Válida: ${result.isValid}, Vacía: ${result.isEmpty}`);
      });
      
      const links: ShareableLinkData[] = urls
        .filter(url => {
          const isValid = this.isValidUrl(url);
          console.log(`Filtrando URL "${url}": ${isValid ? 'INCLUIDA' : 'EXCLUIDA'}`);
          return isValid;
        })
        .map((url, index) => ({
          link_type: 'profile' as LinkType,
          public_url: url,
          title: `Google Business Profile ${index > 0 ? index + 1 : ''}`.trim(),
          description: 'Perfil de Google Business de la propiedad',
          is_active: true,
          created_for: 'general' as PlatformType
        }));

      console.log(`📋 Enlaces válidos después del filtro: ${links.length}/${urls.length}`);
      
      if (links.length === 0) {
        console.warn('⚠️ No hay URLs válidas para procesar');
        throw new Error('No se proporcionaron URLs válidas');
      }

      const createdLinks: ShareableLink[] = [];

      // Crear links uno por uno para manejar errores individualmente
      console.log('💾 Creando enlaces en la base de datos...');
      for (let i = 0; i < links.length; i++) {
        const linkData = links[i];
        console.log(`  ${i + 1}/${links.length}: Creando link "${linkData.title}" - ${linkData.public_url}`);
        
        try {
          const created = await this.createShareableLink(propertyId, linkData);
          createdLinks.push(created);
          console.log(`  ✅ Link creado con ID: ${created.id}`);
        } catch (error) {
          console.error(`  ❌ Error creando link ${linkData.public_url}:`, error);
          console.error(`  Error details:`, {
            message: error instanceof Error ? error.message : 'Unknown error',
            propertyId,
            linkData
          });
        }
      }

      console.log(`🎉 Proceso completado: ${createdLinks.length}/${links.length} enlaces creados exitosamente`);
      return createdLinks;

    } catch (error) {
      console.error('❌ Error en createGoogleBusinessLinks:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
      throw error;
    }
  }

  /**
   * Validar formato de URL
   */
  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }
}

// Exportar instancia singleton
export const shareableLinkService = new ShareableLinkService(); 
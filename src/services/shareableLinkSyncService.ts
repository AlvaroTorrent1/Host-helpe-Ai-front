// src/services/shareableLinkSyncService.ts
// Servicio para sincronización idempotente de enlaces compartibles

import { shareableLinkService, ShareableLink, ShareableLinkData } from './shareableLinkService';
import { normalizeUrl, areUrlsEquivalent } from '../utils/urlNormalization';

export interface LinkDiff {
  unchanged: ShareableLink[];
  toUpdate: { link: ShareableLink; updates: Partial<ShareableLinkData> }[];
  toCreate: ShareableLinkData[];
  toDelete: ShareableLink[];
}

export interface BusinessLinkInput {
  id?: string; // Para enlaces existentes
  url: string;
  title?: string;
}

class ShareableLinkSyncService {
  /**
   * Sincroniza enlaces de Google Business de forma idempotente
   */
  async syncGoogleBusinessLinks(
    propertyId: string,
    newLinks: BusinessLinkInput[]
  ): Promise<ShareableLink[]> {
    console.log('🔄 Iniciando sincronización idempotente de enlaces');
    console.log('Property ID:', propertyId);
    console.log('Enlaces nuevos recibidos:', newLinks);

    try {
      // 1. Obtener enlaces existentes
      const existingLinks = await shareableLinkService.getPropertyLinksByType(propertyId, 'profile');
      console.log('📋 Enlaces existentes en DB:', existingLinks.length);

      // 2. Calcular diferencias
      const diff = this.calculateLinkDiff(existingLinks, newLinks);
      console.log('📊 Diff calculado:', {
        unchanged: diff.unchanged.length,
        toUpdate: diff.toUpdate.length,
        toCreate: diff.toCreate.length,
        toDelete: diff.toDelete.length
      });

      // 3. Aplicar cambios si es necesario
      if (diff.toDelete.length === 0 && diff.toUpdate.length === 0 && diff.toCreate.length === 0) {
        console.log('✅ No hay cambios que aplicar');
        return existingLinks;
      }

      // 4. Ejecutar operaciones
      await this.applyLinkDiff(propertyId, diff);

      // 5. Obtener y retornar estado final
      const finalLinks = await shareableLinkService.getPropertyLinksByType(propertyId, 'profile');
      console.log('✅ Sincronización completada:', finalLinks.length, 'enlaces finales');
      
      return finalLinks;

    } catch (error) {
      console.error('❌ Error en sincronización de enlaces:', error);
      throw error;
    }
  }

  /**
   * Calcula las diferencias entre enlaces existentes y nuevos
   */
  private calculateLinkDiff(
    existingLinks: ShareableLink[],
    newLinks: BusinessLinkInput[]
  ): LinkDiff {
    const diff: LinkDiff = {
      unchanged: [],
      toUpdate: [],
      toCreate: [],
      toDelete: []
    };

    // Filtrar URLs válidas y remover duplicados
    const validNewLinks = newLinks
      .filter(link => link.url && link.url.trim() !== '')
      .filter(link => this.isValidUrl(link.url));

    // Normalizar para comparación
    const normalizedNew = validNewLinks.map(link => ({
      ...link,
      normalizedUrl: normalizeUrl(link.url)
    }));

    const normalizedExisting = existingLinks.map(link => ({
      ...link,
      normalizedUrl: normalizeUrl(link.public_url)
    }));

    // Remover duplicados en nuevos enlaces
    const uniqueNewLinks = normalizedNew.filter((link, index, array) => 
      array.findIndex(l => l.normalizedUrl === link.normalizedUrl) === index
    );

    console.log('🔍 Enlaces únicos después de filtrado:', uniqueNewLinks.length);

    // Procesar cada enlace existente
    for (const existingLink of normalizedExisting) {
      const matchingNew = uniqueNewLinks.find(newLink => 
        newLink.id === existingLink.id || 
        newLink.normalizedUrl === existingLink.normalizedUrl
      );

      if (!matchingNew) {
        // Enlace para eliminar
        diff.toDelete.push(existingLink);
      } else {
        // Verificar si necesita actualización
        const needsUpdate = 
          existingLink.public_url !== matchingNew.url ||
          existingLink.title !== (matchingNew.title || `Google Business Profile`);

        if (needsUpdate) {
          diff.toUpdate.push({
            link: existingLink,
            updates: {
              public_url: matchingNew.url,
              title: matchingNew.title || `Google Business Profile`
            }
          });
        } else {
          diff.unchanged.push(existingLink);
        }
      }
    }

    // Procesar enlaces nuevos para crear
    for (const newLink of uniqueNewLinks) {
      const existingMatch = normalizedExisting.find(existing => 
        newLink.id === existing.id || 
        newLink.normalizedUrl === existing.normalizedUrl
      );

      if (!existingMatch) {
        diff.toCreate.push({
          link_type: 'profile',
          public_url: newLink.url,
          title: newLink.title || 'Google Business Profile',
          description: 'Perfil de Google Business de la propiedad',
          is_active: true,
          created_for: 'general'
        });
      }
    }

    return diff;
  }

  /**
   * Aplica las diferencias calculadas
   */
  private async applyLinkDiff(propertyId: string, diff: LinkDiff): Promise<void> {
    console.log('🔨 Aplicando cambios...');

    // 1. Eliminar enlaces
    for (const linkToDelete of diff.toDelete) {
      console.log(`🗑️ Eliminando enlace: ${linkToDelete.public_url}`);
      await shareableLinkService.deleteShareableLink(linkToDelete.id);
    }

    // 2. Actualizar enlaces existentes
    for (const { link, updates } of diff.toUpdate) {
      console.log(`✏️ Actualizando enlace: ${link.public_url} -> ${updates.public_url}`);
      await shareableLinkService.updateShareableLink(link.id, updates);
    }

    // 3. Crear nuevos enlaces
    for (const newLinkData of diff.toCreate) {
      console.log(`➕ Creando nuevo enlace: ${newLinkData.public_url}`);
      await shareableLinkService.createShareableLink(propertyId, newLinkData);
    }
  }

  /**
   * Validar formato de URL
   */
  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url.includes('://') ? url : `https://${url}`);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }
}

// Exportar instancia singleton
export const shareableLinkSyncService = new ShareableLinkSyncService();

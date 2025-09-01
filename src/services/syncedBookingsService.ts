// src/services/syncedBookingsService.ts
// Servicio para manejar reservas sincronizadas desde iCal

import { supabase } from './supabase';
import { Reservation } from '../types/reservation';

export interface SyncedBooking {
  id: string;
  property_id: string;
  booking_uid: string;
  booking_source: string;
  check_in_date: string;
  check_out_date: string;
  booking_status: string;
  guest_name?: string | null;
  guest_phone?: string | null;
  guest_email?: string | null;
  booking_number?: string | null;
  total_price?: number | null;
  raw_ical_event?: any;
  created_at: string;
  updated_at: string;
  user_properties?: {
    property_name: string;
  };
  ical_configs?: {
    ical_name: string;
  };
}

export interface SyncStats {
  total_configs: number;
  total_processed: number;
  total_created: number;
  total_updated: number;
  duration_ms: number;
  errors?: string[];
}

class SyncedBookingsService {
  /**
   * Obtener todas las reservas sincronizadas del usuario
   */
  async getSyncedBookings(): Promise<SyncedBooking[]> {
    try {
      const { data: bookings, error } = await supabase
        .from('synced_bookings')
        .select(`
          *,
          user_properties(property_name),
          ical_configs(ical_name)
        `)
        .order('check_in_date', { ascending: false });

      if (error) {
        console.error('Error fetching synced bookings:', error);
        throw new Error(`Error al obtener las reservas sincronizadas: ${error.message}`);
      }

      return bookings || [];
    } catch (error) {
      console.error('Error in getSyncedBookings:', error);
      throw error;
    }
  }

  /**
   * Obtener reservas sincronizadas de una propiedad específica
   */
  async getSyncedBookingsByProperty(propertyId: string): Promise<SyncedBooking[]> {
    try {
      const { data: bookings, error } = await supabase
        .from('synced_bookings')
        .select(`
          *,
          user_properties(property_name),
          ical_configs(ical_name)
        `)
        .eq('property_id', propertyId)
        .order('check_in_date', { ascending: false });

      if (error) {
        console.error('Error fetching synced bookings by property:', error);
        throw new Error(`Error al obtener las reservas sincronizadas de la propiedad: ${error.message}`);
      }

      return bookings || [];
    } catch (error) {
      console.error('Error in getSyncedBookingsByProperty:', error);
      throw error;
    }
  }

  /**
   * Obtener configuraciones de iCal del usuario
   */
  async getICalConfigs() {
    try {
      const { data: configs, error } = await supabase
        .from('ical_configs')
        .select(`
          *,
          user_properties(property_name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching iCal configs:', error);
        throw new Error(`Error al obtener las configuraciones de iCal: ${error.message}`);
      }

      return configs || [];
    } catch (error) {
      console.error('Error in getICalConfigs:', error);
      throw error;
    }
  }

  /**
   * Ejecutar sincronización manual
   */
  async triggerManualSync(): Promise<SyncStats> {
    try {
      // Llamar a la Edge Function de sincronización
      const { data, error } = await supabase.functions.invoke('sync-ical-bookings', {
        body: {}
      });

      if (error) {
        console.error('Error triggering manual sync:', error);
        throw new Error(`Error al ejecutar sincronización manual: ${error.message}`);
      }

      return data as SyncStats;
    } catch (error) {
      console.error('Error in triggerManualSync:', error);
      throw error;
    }
  }

  /**
   * Obtener logs de sincronización recientes
   */
  async getSyncLogs(limit: number = 10) {
    try {
      const { data: logs, error } = await supabase
        .from('sync_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching sync logs:', error);
        throw new Error(`Error al obtener los logs de sincronización: ${error.message}`);
      }

      return logs || [];
    } catch (error) {
      console.error('Error in getSyncLogs:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de sincronización
   */
  async getSyncStats() {
    try {
      // Obtener conteos básicos
      const { data: totalBookings, error: totalError } = await supabase
        .from('synced_bookings')
        .select('id', { count: 'exact', head: true });

      if (totalError) throw totalError;

      const { data: activeConfigs, error: configError } = await supabase
        .from('ical_configs')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);

      if (configError) throw configError;

      // Obtener último log de sincronización
      const { data: lastSync, error: logError } = await supabase
        .from('sync_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (logError && logError.code !== 'PGRST116') throw logError; // PGRST116 = no rows

      return {
        total_bookings: totalBookings || 0,
        active_configs: activeConfigs || 0,
        last_sync: lastSync,
        last_sync_status: lastSync?.sync_status || 'never'
      };
    } catch (error) {
      console.error('Error in getSyncStats:', error);
      throw error;
    }
  }

  /**
   * Agregar nueva configuración de iCal
   */
  async addICalConfig(config: {
    property_id: string;
    ical_url: string;
    ical_name: string;
    sync_interval_minutes?: number;
  }) {
    try {
      const { data, error } = await supabase
        .from('ical_configs')
        .insert([{
          ...config,
          sync_interval_minutes: config.sync_interval_minutes || 30,
          is_active: true
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding iCal config:', error);
        throw new Error(`Error al agregar configuración de iCal: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in addICalConfig:', error);
      throw error;
    }
  }

  /**
   * Desactivar configuración de iCal
   */
  async deactivateICalConfig(configId: string) {
    try {
      const { error } = await supabase
        .from('ical_configs')
        .update({ is_active: false })
        .eq('id', configId);

      if (error) {
        console.error('Error deactivating iCal config:', error);
        throw new Error(`Error al desactivar configuración de iCal: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deactivateICalConfig:', error);
      throw error;
    }
  }
}

export const syncedBookingsService = new SyncedBookingsService();
export default syncedBookingsService;



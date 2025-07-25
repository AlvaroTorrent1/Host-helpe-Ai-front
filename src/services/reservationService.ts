// src/services/reservationService.ts
// Servicio para manejar las operaciones de reservas con Supabase

import { supabase } from './supabase';
import { 
  Reservation as FrontendReservation, 
  ReservationCreateData as FrontendReservationCreateData,
  Guest,
  ReservationStatus 
} from '../types/reservation';

// Interfaz que coincide con la estructura de la base de datos
export interface DbReservation {
  id: number;
  property_id: string;
  property_name?: string | null;
  guest_name: string;
  guest_surname: string;
  phone_number?: string | null;
  nationality: string;
  checkin_date: string;
  checkout_date: string;
  notes?: string | null;
  status: 'active' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface CreateReservationData {
  property_id: string;
  property_name?: string;
  guest_name: string;
  guest_surname: string;
  phone_number?: string | null;
  nationality: string;
  checkin_date: string;
  checkout_date: string;
  notes?: string | null;
  status?: 'active' | 'cancelled' | 'completed';
}

class ReservationService {
  /**
   * Mapear de la estructura de DB a la estructura del frontend
   */
  private mapDbToFrontend(dbReservation: DbReservation): FrontendReservation {
    // Mapear status de DB a frontend
    const statusMap: { [key: string]: ReservationStatus } = {
      'active': 'confirmed',
      'cancelled': 'cancelled',
      'completed': 'completed'
    };

    // Crear el huésped principal
    const mainGuest: Guest = {
      id: `guest-${dbReservation.id}`,
      firstName: dbReservation.guest_name,
      lastName: dbReservation.guest_surname,
      email: '', // No tenemos email en la DB por ahora
      phone: dbReservation.phone_number || undefined,
      birthDate: '', // No tenemos fecha de nacimiento en la DB
      nationality: dbReservation.nationality
    };

    return {
      id: dbReservation.id.toString(),
      propertyId: dbReservation.property_id,
      guests: [mainGuest],
      mainGuestId: mainGuest.id,
      checkInDate: dbReservation.checkin_date,
      checkOutDate: dbReservation.checkout_date,
      status: statusMap[dbReservation.status] || 'pending',
      totalGuests: 1, // Por ahora solo soportamos un huésped
      bookingSource: 'direct',
      notes: dbReservation.notes || undefined,
      createdAt: dbReservation.created_at,
      updatedAt: dbReservation.updated_at
    };
  }

  /**
   * Crear una nueva reserva
   */
  async createReservation(data: CreateReservationData): Promise<FrontendReservation> {
    try {
      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert([{
          ...data,
          status: data.status || 'active'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating reservation:', error);
        throw new Error(`Error al crear la reserva: ${error.message}`);
      }

      return this.mapDbToFrontend(reservation);
    } catch (error) {
      console.error('Error in createReservation:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las reservas del usuario
   */
  async getReservations(): Promise<FrontendReservation[]> {
    try {
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('*')
        .order('checkin_date', { ascending: false });

      if (error) {
        console.error('Error fetching reservations:', error);
        throw new Error(`Error al obtener las reservas: ${error.message}`);
      }

      return (reservations || []).map(r => this.mapDbToFrontend(r));
    } catch (error) {
      console.error('Error in getReservations:', error);
      throw error;
    }
  }

  /**
   * Obtener reservas de una propiedad específica
   */
  async getPropertyReservations(propertyId: string): Promise<FrontendReservation[]> {
    try {
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('property_id', propertyId)
        .order('checkin_date', { ascending: false });

      if (error) {
        console.error('Error fetching property reservations:', error);
        throw new Error(`Error al obtener las reservas de la propiedad: ${error.message}`);
      }

      return (reservations || []).map(r => this.mapDbToFrontend(r));
    } catch (error) {
      console.error('Error in getPropertyReservations:', error);
      throw error;
    }
  }

  /**
   * Obtener una reserva por ID
   */
  async getReservationById(id: string): Promise<FrontendReservation | null> {
    try {
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        throw new Error('ID de reserva inválido');
      }

      const { data: reservation, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('id', numericId)
        .single();

      if (error) {
        console.error('Error fetching reservation:', error);
        throw new Error(`Error al obtener la reserva: ${error.message}`);
      }

      return reservation ? this.mapDbToFrontend(reservation) : null;
    } catch (error) {
      console.error('Error in getReservationById:', error);
      throw error;
    }
  }

  /**
   * Actualizar una reserva
   */
  async updateReservation(id: string, data: Partial<CreateReservationData>): Promise<FrontendReservation> {
    try {
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        throw new Error('ID de reserva inválido');
      }

      const { data: reservation, error } = await supabase
        .from('reservations')
        .update(data)
        .eq('id', numericId)
        .select()
        .single();

      if (error) {
        console.error('Error updating reservation:', error);
        throw new Error(`Error al actualizar la reserva: ${error.message}`);
      }

      return this.mapDbToFrontend(reservation);
    } catch (error) {
      console.error('Error in updateReservation:', error);
      throw error;
    }
  }

  /**
   * Cancelar una reserva
   */
  async cancelReservation(id: string): Promise<FrontendReservation> {
    try {
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        throw new Error('ID de reserva inválido');
      }

      const { data: reservation, error } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', numericId)
        .select()
        .single();

      if (error) {
        console.error('Error cancelling reservation:', error);
        throw new Error(`Error al cancelar la reserva: ${error.message}`);
      }

      return this.mapDbToFrontend(reservation);
    } catch (error) {
      console.error('Error in cancelReservation:', error);
      throw error;
    }
  }

  /**
   * Completar una reserva
   */
  async completeReservation(id: string): Promise<FrontendReservation> {
    try {
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        throw new Error('ID de reserva inválido');
      }

      const { data: reservation, error } = await supabase
        .from('reservations')
        .update({ status: 'completed' })
        .eq('id', numericId)
        .select()
        .single();

      if (error) {
        console.error('Error completing reservation:', error);
        throw new Error(`Error al completar la reserva: ${error.message}`);
      }

      return this.mapDbToFrontend(reservation);
    } catch (error) {
      console.error('Error in completeReservation:', error);
      throw error;
    }
  }

  /**
   * Eliminar una reserva
   */
  async deleteReservation(id: string): Promise<void> {
    try {
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        throw new Error('ID de reserva inválido');
      }

      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', numericId);

      if (error) {
        console.error('Error deleting reservation:', error);
        throw new Error(`Error al eliminar la reserva: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteReservation:', error);
      throw error;
    }
  }

  /**
   * Buscar disponibilidad de una propiedad en un rango de fechas
   */
  async checkAvailability(
    propertyId: string, 
    checkinDate: string, 
    checkoutDate: string,
    excludeReservationId?: string
  ): Promise<boolean> {
    try {
      // ✅ LÓGICA CORREGIDA: Detectar solapamientos reales
      // Dos rangos se solapan si: inicio1 < fin2 AND fin1 > inicio2
      // Para detectar conflictos: checkin_existente < checkout_nuevo AND checkout_existente > checkin_nuevo
      let query = supabase
        .from('reservations')
        .select('id')
        .eq('property_id', propertyId)
        .neq('status', 'cancelled')
        .lt('checkin_date', checkoutDate)  // checkin_existente < checkout_nuevo
        .gt('checkout_date', checkinDate); // checkout_existente > checkin_nuevo

      // Excluir una reserva específica (útil al editar)
      if (excludeReservationId) {
        const numericId = parseInt(excludeReservationId);
        if (!isNaN(numericId)) {
          query = query.neq('id', numericId);
        }
      }

      const { data: conflicts, error } = await query;

      if (error) {
        console.error('Error checking availability:', error);
        throw new Error(`Error al verificar disponibilidad: ${error.message}`);
      }

      // Si no hay conflictos, la propiedad está disponible
      return !conflicts || conflicts.length === 0;
    } catch (error) {
      console.error('Error in checkAvailability:', error);
      throw error;
    }
  }

  /**
   * Obtener reservas activas de una propiedad
   */
  async getActiveReservations(propertyId: string): Promise<FrontendReservation[]> {
    try {
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('property_id', propertyId)
        .eq('status', 'active')
        .gte('checkout_date', new Date().toISOString().split('T')[0])
        .order('checkin_date', { ascending: true });

      if (error) {
        console.error('Error fetching active reservations:', error);
        throw new Error(`Error al obtener las reservas activas: ${error.message}`);
      }

      return (reservations || []).map(r => this.mapDbToFrontend(r));
    } catch (error) {
      console.error('Error in getActiveReservations:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de reservas
   */
  async getReservationStats(propertyId?: string) {
    try {
      let query = supabase.from('reservations').select('status');
      
      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }

      const { data: reservations, error } = await query;

      if (error) {
        console.error('Error fetching reservation stats:', error);
        throw new Error(`Error al obtener estadísticas: ${error.message}`);
      }

      const stats = {
        total: reservations?.length || 0,
        active: reservations?.filter(r => r.status === 'active').length || 0,
        completed: reservations?.filter(r => r.status === 'completed').length || 0,
        cancelled: reservations?.filter(r => r.status === 'cancelled').length || 0
      };

      return stats;
    } catch (error) {
      console.error('Error in getReservationStats:', error);
      throw error;
    }
  }
}

export const reservationService = new ReservationService();
export default reservationService; 
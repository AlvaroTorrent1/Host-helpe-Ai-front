// src/services/propertyIcalService.ts
// Servicio puente para conectar properties con user_properties/ical_configs

import { supabase } from './supabase';

export interface IcalConfig {
  id?: string;
  property_id: string;
  user_id: string;
  ical_url: string;
  ical_name: string;
  platform: 'booking' | 'airbnb';
  sync_interval_minutes?: number;
  last_sync_at?: string;
  sync_status?: 'pending' | 'active' | 'error' | 'disabled';
  error_message?: string;
  is_active?: boolean;
}

export interface UserProperty {
  id?: string;
  user_id: string;
  property_name: string;
  property_type?: string;
  description?: string;
  main_property_id?: string; // Referencia a la tabla properties principal
}

class PropertyIcalService {
  /**
   * Crear o actualizar user_property cuando se guarda una property
   */
  async createOrUpdateUserProperty(propertyData: {
    id?: string;
    name: string;
    user_id: string;
  }): Promise<UserProperty> {
    try {
      // Buscar si ya existe un user_property para esta property
      const { data: existingUserProperty } = await supabase
        .from('user_properties')
        .select('*')
        .eq('main_property_id', propertyData.id)
        .eq('user_id', propertyData.user_id)
        .single();

      if (existingUserProperty) {
        // Actualizar existente
        const { data: updatedUserProperty, error } = await supabase
          .from('user_properties')
          .update({
            property_name: propertyData.name,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUserProperty.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating user_property:', error);
          throw new Error(`Error al actualizar user_property: ${error.message}`);
        }

        return updatedUserProperty;
      } else {
        // Crear nuevo user_property
        const { data: newUserProperty, error } = await supabase
          .from('user_properties')
          .insert({
            user_id: propertyData.user_id,
            property_name: propertyData.name,
            property_type: 'rental',
            main_property_id: propertyData.id
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating user_property:', error);
          throw new Error(`Error al crear user_property: ${error.message}`);
        }

        return newUserProperty;
      }
    } catch (error) {
      console.error('Error in createOrUpdateUserProperty:', error);
      throw error;
    }
  }

  /**
   * Guardar configuraciones iCal para una propiedad
   */
  async saveIcalConfigs(data: {
    propertyId: string;
    userId: string;
    userPropertyId: string;
    bookingIcalUrl?: string;
    airbnbIcalUrl?: string;
  }): Promise<void> {
    try {
      console.log('🔗 Guardando configuraciones iCal:', data);

      // Obtener configuraciones existentes
      const { data: existingConfigs } = await supabase
        .from('ical_configs')
        .select('*')
        .eq('property_id', data.userPropertyId)
        .eq('user_id', data.userId);

      const existingBooking = existingConfigs?.find(config => config.ical_name?.includes('Booking.com'));
      const existingAirbnb = existingConfigs?.find(config => config.ical_name?.includes('Airbnb'));

      // Procesar Booking.com
      if (data.bookingIcalUrl) {
        if (existingBooking) {
          // Actualizar existente
          const { error } = await supabase
            .from('ical_configs')
            .update({
              ical_url: data.bookingIcalUrl,
              sync_status: 'pending',
              error_message: null,
              is_active: true
            })
            .eq('id', existingBooking.id);

          if (error) {
            console.error('Error updating Booking.com iCal config:', error);
            throw new Error(`Error al actualizar configuración de Booking.com: ${error.message}`);
          }
        } else {
          // Crear nuevo
          const { error } = await supabase
            .from('ical_configs')
            .insert({
              property_id: data.userPropertyId,
              user_id: data.userId,
              ical_url: data.bookingIcalUrl,
              ical_name: 'Booking.com',
              sync_interval_minutes: 30,
              sync_status: 'pending',
              is_active: true
            });

          if (error) {
            console.error('Error creating Booking.com iCal config:', error);
            throw new Error(`Error al crear configuración de Booking.com: ${error.message}`);
          }
        }
      } else if (existingBooking) {
        // Desactivar si se eliminó la URL
        const { error } = await supabase
          .from('ical_configs')
          .update({ is_active: false })
          .eq('id', existingBooking.id);

        if (error) {
          console.error('Error deactivating Booking.com iCal config:', error);
        }
      }

      // Procesar Airbnb
      if (data.airbnbIcalUrl) {
        console.log('📍 Procesando URL de Airbnb:', data.airbnbIcalUrl);
        
        if (existingAirbnb) {
          // Actualizar existente
          console.log('🔄 Actualizando configuración existente de Airbnb, ID:', existingAirbnb.id);
          const { error } = await supabase
            .from('ical_configs')
            .update({
              ical_url: data.airbnbIcalUrl,
              sync_status: 'pending',
              error_message: null,
              is_active: true
            })
            .eq('id', existingAirbnb.id);

          if (error) {
            console.error('❌ Error updating Airbnb iCal config:', error);
            throw new Error(`Error al actualizar configuración de Airbnb: ${error.message}`);
          }
          console.log('✅ Configuración de Airbnb actualizada correctamente');
        } else {
          // Crear nuevo
          console.log('➕ Creando nueva configuración de Airbnb');
          const { error } = await supabase
            .from('ical_configs')
            .insert({
              property_id: data.userPropertyId,
              user_id: data.userId,
              ical_url: data.airbnbIcalUrl,
              ical_name: 'Airbnb',
              sync_interval_minutes: 30,
              sync_status: 'pending',
              is_active: true
            });

          if (error) {
            console.error('❌ Error creating Airbnb iCal config:', error);
            throw new Error(`Error al crear configuración de Airbnb: ${error.message}`);
          }
          console.log('✅ Nueva configuración de Airbnb creada correctamente');
        }
      } else if (existingAirbnb) {
        // Desactivar si se eliminó la URL
        console.log('⏸️ Desactivando configuración de Airbnb (URL vacía)');
        const { error } = await supabase
          .from('ical_configs')
          .update({ is_active: false })
          .eq('id', existingAirbnb.id);

        if (error) {
          console.error('❌ Error deactivating Airbnb iCal config:', error);
        }
      }

      console.log('✅ Configuraciones iCal guardadas exitosamente');
    } catch (error) {
      console.error('Error in saveIcalConfigs:', error);
      throw error;
    }
  }

  /**
   * Obtener configuraciones iCal de una propiedad
   */
  async getPropertyIcalConfigs(propertyId: string, userId: string): Promise<{
    bookingUrl?: string;
    airbnbUrl?: string;
    bookingStatus?: string;
    airbnbStatus?: string;
  }> {
    try {
      // Buscar user_property asociado
      const { data: userProperty } = await supabase
        .from('user_properties')
        .select('id')
        .eq('main_property_id', propertyId)
        .eq('user_id', userId)
        .single();

      if (!userProperty) {
        return {};
      }

      // Obtener configuraciones iCal
      const { data: configs } = await supabase
        .from('ical_configs')
        .select('*')
        .eq('property_id', userProperty.id)
        .eq('user_id', userId)
        .eq('is_active', true);

      const bookingConfig = configs?.find(config => config.ical_name?.includes('Booking.com'));
      const airbnbConfig = configs?.find(config => config.ical_name?.includes('Airbnb'));

      return {
        bookingUrl: bookingConfig?.ical_url || undefined,
        airbnbUrl: airbnbConfig?.ical_url || undefined,
        bookingStatus: bookingConfig?.sync_status || undefined,
        airbnbStatus: airbnbConfig?.sync_status || undefined,
      };
    } catch (error) {
      console.error('Error in getPropertyIcalConfigs:', error);
      return {};
    }
  }

  /**
   * Validar enlace iCal haciendo un test fetch
   */
  async validateIcalUrl(url: string): Promise<{ isValid: boolean; error?: string }> {
    try {
      // TODO: Implementar validación real mediante edge function
      // Por ahora, validación básica de formato
      
      if (!url || !url.trim()) {
        return { isValid: false, error: "URL vacía" };
      }

      // Validación para Booking: debe contener "booking.com" e "ical"
      const isBookingUrl = url.includes('booking.com') && url.includes('ical');
      
      // Validación para Airbnb: debe contener "airbnb" y ("ical" O "calendar")
      // Acepta URLs de cualquier dominio de Airbnb (.com, .es, etc.)
      const isAirbnbUrl = url.includes('airbnb') && (url.includes('ical') || url.includes('calendar'));

      if (!isBookingUrl && !isAirbnbUrl) {
        console.log('⚠️ URL rechazada en validación:', url);
        return { isValid: false, error: "URL no es de Booking.com o Airbnb" };
      }

      // Simulación de validación exitosa
      console.log('✅ URL validada correctamente:', url);
      return { isValid: true };
    } catch (error) {
      console.error('❌ Error validating iCal URL:', error);
      return { isValid: false, error: "Error al validar el enlace" };
    }
  }
}

export const propertyIcalService = new PropertyIcalService();

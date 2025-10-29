// src/services/travelerFormsService.ts
/**
 * Service for managing traveler registration forms
 * Handles CRUD operations for traveler_form_requests and traveler_form_data
 */

import { supabase } from './supabase';

// Types for traveler form requests
export interface TravelerFormRequest {
  id: string;
  user_id: string;
  property_id: string;
  reservation_id: number | null;
  token: string;
  check_in_date: string;
  check_out_date: string;
  property_name: string;
  guest_email: string;
  guest_phone: string | null;
  num_travelers_expected: number;
  num_travelers_completed: number;
  status: 'pending' | 'completed' | 'expired' | 'cancelled';
  expires_at: string;
  sent_at: string;
  completed_at: string | null;
  lynx_submission_id: string | null;
  lynx_submitted_at: string | null;
  lynx_payload: any | null;
  lynx_response: any | null;
  created_at: string;
  updated_at: string;
}

// Types for traveler form data
export interface TravelerFormData {
  id: string;
  form_request_id: string;
  first_name: string;
  last_name: string;
  document_type: 'DNI' | 'NIE' | 'PASSPORT';
  document_number: string;
  nationality: string; // ISO 3166-1 alpha-2
  birth_date: string;
  gender: 'M' | 'F' | 'Other' | null;
  email: string;
  phone: string | null;
  address_street: string;
  address_city: string;
  address_postal_code: string;
  address_country: string; // ISO 3166-1 alpha-2
  address_additional: string | null;
  payment_method: 'TRANS' | 'CASH' | 'CARD' | 'OTHER' | null;
  payment_holder: string | null;
  payment_identifier: string | null;
  payment_date: string | null;
  signature_data: string;
  consent_accepted: boolean;
  consent_accepted_at: string;
  consent_ip_address: string | null;
  pdf_generated_at: string | null;
  pdf_url: string | null;
  submitted_at: string;
  created_at: string;
}

// Filters for listing requests
export interface TravelerFormFilters {
  propertyId?: string;
  status?: 'pending' | 'completed' | 'expired' | 'cancelled';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

class TravelerFormsService {
  /**
   * List traveler form requests for authenticated user (dashboard)
   * Uses RLS - only returns user's own forms
   */
  async listRequests(
    filters: TravelerFormFilters = {},
    page: number = 0,
    pageSize: number = 20
  ): Promise<{ data: TravelerFormRequest[]; count: number }> {
    try {
      let query = supabase
        .from('traveler_form_requests')
        .select('*', { count: 'exact' })
        .order('check_in_date', { ascending: false });

      // Apply filters
      if (filters.propertyId && filters.propertyId !== 'all') {
        query = query.eq('property_id', filters.propertyId);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.dateFrom) {
        query = query.gte('check_in_date', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('check_in_date', filters.dateTo);
      }

      // Search by guest email or property name
      if (filters.search) {
        query = query.or(`guest_email.ilike.%${filters.search}%,property_name.ilike.%${filters.search}%`);
      }

      // Pagination
      const start = page * pageSize;
      const end = start + pageSize - 1;
      query = query.range(start, end);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching traveler form requests:', error);
        throw new Error('Error al cargar los partes de viajeros');
      }

      return {
        data: data || [],
        count: count || 0,
      };
    } catch (error) {
      console.error('Error in listRequests:', error);
      throw error;
    }
  }

  /**
   * Get single form request by ID
   * Uses RLS - only returns if user owns it
   */
  async getRequestById(id: string): Promise<TravelerFormRequest | null> {
    try {
      const { data, error } = await supabase
        .from('traveler_form_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching request by ID:', error);
      throw error;
    }
  }

  /**
   * Get traveler data for a specific form request
   * Returns all travelers who completed the form
   * Uses RPC function to bypass RLS while maintaining security
   */
  async getTravelerData(formRequestId: string): Promise<TravelerFormData[]> {
    try {
      // Usar función RPC que bypasea RLS de forma segura
      const { data, error } = await supabase
        .rpc('get_traveler_data_for_dashboard', {
          p_form_request_id: formRequestId
        });

      if (error) {
        console.error('Error fetching traveler data via RPC:', error);
        throw new Error('Error al cargar los datos de los viajeros');
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTravelerData:', error);
      throw error;
    }
  }

  /**
   * Get form request by token
   * @param token - Unique token for the form request
   * @param includeCompleted - If true, returns completed forms (for dashboard). If false, returns null for completed forms (for public form access)
   */
  async getRequestByToken(token: string, includeCompleted: boolean = false): Promise<TravelerFormRequest | null> {
    try {
      const { data, error } = await supabase
        .from('traveler_form_requests')
        .select('*')
        .eq('token', token)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      // Check if expired (solo para acceso público)
      if (!includeCompleted && data && new Date(data.expires_at) < new Date()) {
        return null;
      }

      // Check if already completed (solo para acceso público)
      // Dashboard necesita acceder a formularios completados para ver detalles y generar PDFs
      if (!includeCompleted && data && data.status === 'completed') {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching request by token:', error);
      return null;
    }
  }

  /**
   * Create a new traveler form request
   * Used by gestors or n8n to create new forms
   */
  async createRequest(data: {
    property_id: string;
    reservation_id?: number;
    check_in_date: string;
    check_out_date: string;
    property_name: string;
    guest_email: string;
    guest_phone?: string;
    num_travelers_expected?: number;
    expires_in_days?: number;
  }): Promise<TravelerFormRequest> {
    try {
      // Generate unique token
      const token = crypto.randomUUID();

      // Calculate expiration (default 30 days)
      const expiresInDays = data.expires_in_days || 30;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const insertData = {
        user_id: user.id,
        property_id: data.property_id,
        reservation_id: data.reservation_id || null,
        token,
        check_in_date: data.check_in_date,
        check_out_date: data.check_out_date,
        property_name: data.property_name,
        guest_email: data.guest_email,
        guest_phone: data.guest_phone || null,
        num_travelers_expected: data.num_travelers_expected || 1,
        expires_at: expiresAt.toISOString(),
        status: 'pending' as const,
      };

      const { data: created, error } = await supabase
        .from('traveler_form_requests')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating traveler form request:', error);
        throw new Error('Error al crear solicitud de parte de viajero');
      }

      return created;
    } catch (error) {
      console.error('Error in createRequest:', error);
      throw error;
    }
  }

  /**
   * Delete a form request
   * Cascade deletes associated traveler data
   */
  async deleteRequest(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('traveler_form_requests')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting form request:', error);
        throw new Error('Error al eliminar solicitud');
      }
    } catch (error) {
      console.error('Error in deleteRequest:', error);
      throw error;
    }
  }

  /**
   * Submit traveler form data (PUBLIC - via Edge Function)
   * 
   * This method calls the Supabase Edge Function which:
   * - Validates the token
   * - Checks if form is not expired and not completed
   * - Inserts into traveler_form_data using service_role (bypasses RLS)
   * - Returns success/error
   * 
   * Edge Function: supabase/functions/submit-traveler-form
   */
  async submitTravelerData(
    token: string,
    travelerData: Omit<TravelerFormData, 'id' | 'form_request_id' | 'submitted_at' | 'created_at'>
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      // Get Supabase URL from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration missing');
      }

      // Call Edge Function
      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/submit-traveler-form`;

      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          token,
          travelerData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Edge Function error:', result);
        return {
          success: false,
          error: result.error || 'Error al enviar el formulario',
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error('Error submitting traveler data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de red al enviar formulario',
      };
    }
  }
}

// Export singleton instance
export const travelerFormsService = new TravelerFormsService();
export default travelerFormsService;


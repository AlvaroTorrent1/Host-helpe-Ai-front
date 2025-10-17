// src/features/sesregistro/services/sesRegistroService.ts
/**
 * Servicio para comunicación con el API del proveedor SES
 * Maneja todas las llamadas relacionadas con el check-in de viajeros
 */

import { Reservation, Traveler, ReservationResponse, TravelerResponse, CheckinSubmitResponse } from '../types';

// Base URL del API del proveedor (configurar en variables de entorno)
const API_BASE_URL = import.meta.env.VITE_SES_API_BASE_URL || 'https://api-provider.example.com';

/**
 * Obtener datos de la reserva
 * GET /check-in/{propertyId}/{reservationId}/{token}
 */
export const fetchReservationData = async (
  propertyId: string,
  reservationId: string,
  token: string
): Promise<Reservation> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/check-in/${propertyId}/${reservationId}/${token}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('LINK_INVALID');
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error('LINK_EXPIRED');
      }
      if (response.status === 410) {
        throw new Error('LINK_USED');
      }
      throw new Error('SERVER_ERROR');
    }

    const data: ReservationResponse = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error('INVALID_RESPONSE');
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('NETWORK_ERROR');
  }
};

/**
 * Añadir un nuevo viajero
 * POST /check-in/{propertyId}/{reservationId}/{token}/traveler
 */
export const addTraveler = async (
  propertyId: string,
  reservationId: string,
  token: string,
  traveler: Traveler
): Promise<Traveler> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/check-in/${propertyId}/${reservationId}/${token}/traveler`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(traveler),
      }
    );

    if (!response.ok) {
      if (response.status === 422) {
        throw new Error('VALIDATION_ERROR');
      }
      throw new Error('SERVER_ERROR');
    }

    const data: TravelerResponse = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error('INVALID_RESPONSE');
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('NETWORK_ERROR');
  }
};

/**
 * Actualizar un viajero existente
 * PUT /check-in/{propertyId}/{reservationId}/{token}/traveler/{travelerId}
 */
export const updateTraveler = async (
  propertyId: string,
  reservationId: string,
  token: string,
  travelerId: string,
  traveler: Traveler
): Promise<Traveler> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/check-in/${propertyId}/${reservationId}/${token}/traveler/${travelerId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(traveler),
      }
    );

    if (!response.ok) {
      if (response.status === 422) {
        throw new Error('VALIDATION_ERROR');
      }
      throw new Error('SERVER_ERROR');
    }

    const data: TravelerResponse = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error('INVALID_RESPONSE');
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('NETWORK_ERROR');
  }
};

/**
 * Eliminar un viajero
 * DELETE /check-in/{propertyId}/{reservationId}/{token}/traveler/{travelerId}
 */
export const deleteTraveler = async (
  propertyId: string,
  reservationId: string,
  token: string,
  travelerId: string
): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/check-in/${propertyId}/${reservationId}/${token}/traveler/${travelerId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('SERVER_ERROR');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('NETWORK_ERROR');
  }
};

/**
 * Enviar el check-in completo al Ministerio del Interior
 * POST /check-in/{propertyId}/{reservationId}/{token}/submit
 */
export const submitCheckin = async (
  propertyId: string,
  reservationId: string,
  token: string
): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/check-in/${propertyId}/${reservationId}/${token}/submit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 422) {
        throw new Error('INCOMPLETE_DATA');
      }
      throw new Error('SERVER_ERROR');
    }

    const data: CheckinSubmitResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'SUBMIT_ERROR');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('NETWORK_ERROR');
  }
};

/**
 * Mapear errores del servicio a mensajes traducibles
 */
export const mapErrorToMessage = (error: Error): string => {
  const errorMap: Record<string, string> = {
    'LINK_INVALID': 'sesRegistro.errors.linkInvalid',
    'LINK_EXPIRED': 'sesRegistro.errors.linkExpired',
    'LINK_USED': 'sesRegistro.errors.linkUsed',
    'NETWORK_ERROR': 'sesRegistro.errors.networkError',
    'SERVER_ERROR': 'sesRegistro.errors.serverError',
    'VALIDATION_ERROR': 'sesRegistro.errors.loadingError',
    'INCOMPLETE_DATA': 'sesRegistro.travelers.required',
  };

  return errorMap[error.message] || 'sesRegistro.errors.serverError';
};

















// src/types/reservation.ts
import { Property } from "./property";

export type ReservationStatus =
  | "confirmed"
  | "pending"
  | "cancelled"
  | "completed";

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate: string; // formato ISO: YYYY-MM-DD
  nationality: string;
  sesSent?: boolean; // Si los datos se han enviado al sistema SES
  sesResponseCode?: string; // Código de respuesta del sistema SES
}

export interface Reservation {
  id: string;
  propertyId: string;
  property?: Property; // Relación con la propiedad
  guests: Guest[]; // Huésped principal y acompañantes
  mainGuestId: string; // ID del huésped principal
  checkInDate: string; // formato ISO: YYYY-MM-DD
  checkOutDate: string; // formato ISO: YYYY-MM-DD
  status: ReservationStatus;
  totalGuests: number;
  totalAmount?: number; // Importe total de la reserva
  paymentStatus?: "paid" | "partial" | "pending";
  bookingSource?: "direct" | "airbnb" | "booking" | "other";
  bookingSourceReference?: string; // Referencia externa (ej. ID en Airbnb)
  notes?: string;
  createdAt: string; // formato ISO
  updatedAt?: string; // formato ISO
}

// Filtros para la búsqueda de reservas
export interface ReservationFilters {
  propertyId?: string;
  startDate?: string; // fecha desde
  endDate?: string; // fecha hasta
  searchTerm?: string; // búsqueda por nombre/email del huésped, etc.
}

// Datos necesarios para crear una nueva reserva
export type ReservationCreateData = Omit<
  Reservation,
  "id" | "createdAt" | "updatedAt" | "property"
> & {
  mainGuest: Omit<Guest, "id">; // Datos del huésped principal
  additionalGuests?: Omit<Guest, "id">[]; // Datos de huéspedes adicionales
};

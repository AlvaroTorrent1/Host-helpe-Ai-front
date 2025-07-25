// src/features/reservations/utils/reservationFilters.ts

import { Reservation } from "../../../types/reservation";

// Tipo para las pestañas de reservas
export type ReservationTabType = 'current' | 'past';

/**
 * Filtra las reservas según el tipo de pestaña seleccionada
 * @param reservations Lista de reservas
 * @param tabType Tipo de pestaña: 'current' para actuales, 'past' para pasadas
 * @returns Reservas filtradas según el tipo
 */
export const filterReservationsByTab = (
  reservations: Reservation[],
  tabType: ReservationTabType
): Reservation[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Resetear hora para comparar solo fechas

  return reservations.filter((reservation) => {
    // Parsear la fecha de checkout
    const checkoutDate = new Date(reservation.checkOutDate);
    checkoutDate.setHours(0, 0, 0, 0);

    if (tabType === 'current') {
      // Reservas actuales: checkout es hoy o en el futuro
      return checkoutDate >= today;
    } else {
      // Reservas pasadas: checkout es antes de hoy
      return checkoutDate < today;
    }
  });
};

/**
 * Cuenta las reservas por tipo de pestaña
 * @param reservations Lista de reservas
 * @returns Objeto con el conteo de reservas actuales y pasadas
 */
export const getReservationCounts = (reservations: Reservation[]) => {
  const currentReservations = filterReservationsByTab(reservations, 'current');
  const pastReservations = filterReservationsByTab(reservations, 'past');

  return {
    current: currentReservations.length,
    past: pastReservations.length,
  };
}; 
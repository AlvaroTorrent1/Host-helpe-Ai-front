import React from 'react';
import Modal from '@shared/components/Modal';
import { Reservation } from '@/types/reservation';
import { Property } from '@/types/property';
import { useTranslation } from 'react-i18next';
import { CalendarDaysIcon, PhoneIcon, UserIcon, HomeIcon } from '@heroicons/react/24/outline';

interface DayDetailsModalProps {
  isOpen: boolean;
  selectedDate: Date | null;
  reservations: Reservation[];
  properties: Property[];
  onClose: () => void;
  onViewReservation?: (reservationId: string) => void;
}

interface ReservationWithProperty extends Reservation {
  property: Property | undefined;
  reservationStatus: 'check-in' | 'check-out' | 'stay' | 'unavailable';
}

const DayDetailsModal: React.FC<DayDetailsModalProps> = ({
  isOpen,
  selectedDate,
  reservations,
  properties,
  onClose,
  onViewReservation,
}) => {
  const { t } = useTranslation();

  // Formatear fecha para mostrar
  const formatSelectedDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Determinar el estado de la reserva para el día seleccionado
  const getReservationStatus = (reservation: Reservation, selectedDate: Date): 'check-in' | 'check-out' | 'stay' | 'unavailable' => {
    const checkIn = new Date(reservation.checkInDate);
    const checkOut = new Date(reservation.checkOutDate);
    const selected = new Date(selectedDate);
    
    // Normalizar fechas para comparación (solo día, mes, año)
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);

    if (selected.getTime() === checkIn.getTime()) {
      return 'check-in';
    } else if (selected.getTime() === checkOut.getTime()) {
      return 'check-out';
    } else if (selected > checkIn && selected < checkOut) {
      return 'stay';
    } else {
      return 'unavailable';
    }
  };

  // Filtrar y enriquecer reservas para el día seleccionado
  const getReservationsForSelectedDate = (): ReservationWithProperty[] => {
    if (!selectedDate) return [];

    return reservations
      .filter(reservation => {
        const checkIn = new Date(reservation.checkInDate);
        const checkOut = new Date(reservation.checkOutDate);
        return selectedDate >= checkIn && selectedDate <= checkOut;
      })
      .map(reservation => ({
        ...reservation,
        property: properties.find(p => p.id === reservation.propertyId),
        reservationStatus: getReservationStatus(reservation, selectedDate)
      }))
      .sort((a, b) => {
        // Ordenar: check-ins primero, luego check-outs, luego estancias
        const statusOrder = { 'check-in': 1, 'check-out': 2, 'stay': 3, 'unavailable': 4 };
        return statusOrder[a.reservationStatus] - statusOrder[b.reservationStatus];
      });
  };

  // Obtener el color del badge según el estado
  const getStatusBadge = (status: 'check-in' | 'check-out' | 'stay' | 'unavailable') => {
    switch (status) {
      case 'check-in':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          icon: '🟢',
          text: 'Check-in hoy'
        };
      case 'check-out':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          icon: '🔵',
          text: 'Check-out hoy'
        };
      case 'stay':
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          icon: '🟡',
          text: 'En estancia'
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: '⚫',
          text: 'No disponible'
        };
    }
  };

  // Obtener el huésped principal
  const getMainGuest = (reservation: Reservation) => {
    return reservation.guests.find(guest => guest.id === reservation.mainGuestId) || reservation.guests[0];
  };

  const selectedDateReservations = getReservationsForSelectedDate();

  const modalTitle = selectedDate ? 
    `📅 ${formatSelectedDate(selectedDate)}` : 
    'Detalles del día';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="lg"
    >
      <div className="space-y-4">
        {selectedDateReservations.length === 0 ? (
          /* Estado vacío */
          <div className="text-center py-8">
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No hay reservas para este día
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Este día no tiene ninguna actividad de reservas programada.
            </p>
          </div>
        ) : (
          /* Lista de reservas */
          <div className="space-y-3">
            <div className="text-sm text-gray-600 mb-4">
              {selectedDateReservations.length === 1 ? 
                '1 reserva activa' : 
                `${selectedDateReservations.length} reservas activas`
              }
            </div>

            {selectedDateReservations.map((reservation) => {
              const mainGuest = getMainGuest(reservation);
              const statusBadge = getStatusBadge(reservation.reservationStatus);

              return (
                                  <div
                    key={reservation.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer sm:p-6"
                    onClick={() => onViewReservation?.(reservation.id)}
                  >
                  {/* Header con propiedad y estado */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <HomeIcon className="h-5 w-5 text-gray-500" />
                      <h4 className="font-semibold text-gray-900">
                        {reservation.property?.name || 'Propiedad no encontrada'}
                      </h4>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.bgColor} ${statusBadge.textColor}`}
                    >
                      <span className="mr-1">{statusBadge.icon}</span>
                      {statusBadge.text}
                    </span>
                  </div>

                  {/* Información del huésped */}
                  {mainGuest && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {mainGuest.firstName} {mainGuest.lastName}
                        </span>
                        {mainGuest.nationality && (
                          <span className="text-sm text-gray-500">
                            • {mainGuest.nationality}
                          </span>
                        )}
                      </div>

                      {mainGuest.phone && (
                        <div className="flex items-center space-x-2">
                          <PhoneIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {mainGuest.phone}
                          </span>
                        </div>
                      )}

                      {/* Fechas de la reserva */}
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(reservation.checkInDate).toLocaleDateString('es-ES')} - {new Date(reservation.checkOutDate).toLocaleDateString('es-ES')}
                        {reservation.totalGuests > 1 && (
                          <span className="ml-2">• {reservation.totalGuests} huéspedes</span>
                        )}
                      </div>
                    </div>
                  )}


                </div>
              );
            })}
          </div>
        )}

        {/* Footer con resumen */}
        {selectedDateReservations.length > 0 && (
          <div className="border-t border-gray-200 pt-4 mt-6">
            <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span>Check-ins: {selectedDateReservations.filter(r => r.reservationStatus === 'check-in').length}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span>Check-outs: {selectedDateReservations.filter(r => r.reservationStatus === 'check-out').length}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                <span>En estancia: {selectedDateReservations.filter(r => r.reservationStatus === 'stay').length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DayDetailsModal; 
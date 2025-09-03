import React from 'react';
import Modal from '@shared/components/Modal';
import { Reservation } from '@/types/reservation';
import { Property } from '@/types/property';
import { useTranslation } from 'react-i18next';
import { PhoneIcon, UserIcon, HomeIcon } from '@heroicons/react/24/outline';

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
  reservationStatus: 'check-in' | 'check-out' | 'stay' | 'pending' | 'completed';
}

const DayDetailsModal: React.FC<DayDetailsModalProps> = ({
  isOpen,
  selectedDate,
  reservations,
  properties,
  onClose,
  onViewReservation,
}) => {
  const { t, i18n } = useTranslation();

  // Formatear fecha para mostrar
  const formatSelectedDate = (date: Date | null): string => {
    if (!date) return '';
    const locale = i18n.language === 'es' ? 'es-ES' : 'en-US';
    return date.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Determinar el estado de la reserva considerando "hoy" y el día seleccionado
  const getReservationStatus = (
    reservation: Reservation,
    selectedDate: Date
  ): 'check-in' | 'check-out' | 'stay' | 'pending' | 'completed' => {
    const today = new Date();
    const checkIn = new Date(reservation.checkInDate);
    const checkOut = new Date(reservation.checkOutDate);
    const selected = new Date(selectedDate);

    // Normalizar fechas (solo día, mes, año)
    today.setHours(0, 0, 0, 0);
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);

    // Estado global respecto a hoy
    if (today < checkIn) {
      return 'pending';
    }
    if (today > checkOut) {
      return 'completed';
    }

    // Activa hoy: ajustar por día seleccionado
    if (selected.getTime() === checkIn.getTime()) {
      return 'check-in';
    }
    if (selected.getTime() === checkOut.getTime()) {
      return 'check-out';
    }
    return 'stay';
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
        // Ordenar: check-ins, check-outs, estancias, pendientes, completadas
        const statusOrder: Record<string, number> = {
          'check-in': 1,
          'check-out': 2,
          'stay': 3,
          'pending': 4,
          'completed': 5,
        };
        return (statusOrder[a.reservationStatus] || 99) - (statusOrder[b.reservationStatus] || 99);
      });
  };

  // Obtener el color del badge según el estado
  const getStatusBadge = (status: 'check-in' | 'check-out' | 'stay' | 'pending' | 'completed') => {
    switch (status) {
      case 'check-in':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          dotClass: 'inline-block w-2 h-2 rounded-full bg-green-500 ring-1 ring-green-600',
          text: t('reservations.dayDetails.checkInToday')
        };
      case 'check-out':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          dotClass: 'inline-block w-2 h-2 rounded-full bg-blue-500 ring-1 ring-blue-600',
          text: t('reservations.dayDetails.checkOutToday')
        };
      case 'pending':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          dotClass: 'inline-block w-2 h-2 rounded-full bg-blue-500 ring-1 ring-blue-600',
          text: t('reservations.calendar.status.pending')
        };
      case 'stay':
        return {
          // Fondo claro + punto intenso (dos tonos como checkout)
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-800',
          // Usamos el mismo naranja del calendario general
          dotClass: 'inline-block w-2 h-2 rounded-full bg-amber-500 ring-1 ring-amber-600',
          text: t('reservations.dayDetails.inStay')
        };
      case 'completed':
        return {
          bgColor: 'bg-slate-100',
          textColor: 'text-slate-700',
          dotClass: 'inline-block w-2 h-2 rounded-full bg-slate-400 ring-1 ring-slate-500',
          text: t('reservations.calendar.status.completed')
        };
    }
  };

  // Obtener el huésped principal
  const getMainGuest = (reservation: Reservation) => {
    return reservation.guests.find(guest => guest.id === reservation.mainGuestId) || reservation.guests[0];
  };

  const selectedDateReservations = getReservationsForSelectedDate();

  const modalTitle = selectedDate ? 
    formatSelectedDate(selectedDate) : 
    t('reservations.dayDetails.title');

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
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-2xl text-gray-400">📋</span>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {t('reservations.dayDetails.noReservations')}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('reservations.dayDetails.noReservationsDescription')}
            </p>
          </div>
        ) : (
          /* Lista de reservas */
          <div className="space-y-3">
            <div className="text-sm text-gray-600 mb-4">
              {selectedDateReservations.length === 1 ? 
                t('reservations.dayDetails.oneActiveReservation') : 
                t('reservations.dayDetails.multipleActiveReservations', { count: selectedDateReservations.length })
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
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium no-underline ${statusBadge.bgColor} ${statusBadge.textColor}`}
                    >
                      <span className={`mr-1 ${statusBadge.dotClass}`}></span>
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
                        {new Date(reservation.checkInDate).toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US')} - {new Date(reservation.checkOutDate).toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US')}
                        {reservation.totalGuests > 1 && (
                          <span className="ml-2">• {reservation.totalGuests} {t('reservations.calendar.guests')}</span>
                        )}
                      </div>
                    </div>
                  )}


                </div>
              );
            })}
          </div>
        )}


      </div>
    </Modal>
  );
};

export default DayDetailsModal; 
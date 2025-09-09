import React from "react";
import Button from "@/components/ui/Button";
import { Reservation, ReservationStatus, Guest } from "../../types/reservation";
import { Property } from "../../types/property";
import { LoadingInline, LoadingSize, LoadingVariant } from "../../shared/components/loading";

interface ReservationDetailProps {
  reservation: Reservation;
  property?: Property;
  onEdit: () => void;
  onSendToSES?: () => void;
  isSendingToSES?: boolean;
}

const ReservationDetail: React.FC<ReservationDetailProps> = ({
  reservation,
  property,
  onEdit,
  onSendToSES,
  isSendingToSES = false,
}) => {
  // Encontrar el huésped principal
  const mainGuest = reservation.guests.find(
    (g) => g.id === reservation.mainGuestId,
  );

  // Huéspedes adicionales
  const additionalGuests = reservation.guests.filter(
    (g) => g.id !== reservation.mainGuestId,
  );

  // Formatear fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Fecha no disponible";
    }
  };

  // Traducir estado de reserva
  const getStatusLabel = (status: ReservationStatus) => {
    const statusMap: Record<ReservationStatus, string> = {
      confirmed: "Confirmada",
      pending: "Pendiente",
      cancelled: "Cancelada",
      completed: "Completada",
    };
    return statusMap[status];
  };

  // Obtener color según estado
  const getStatusColor = (status: ReservationStatus) => {
    const colorMap: Record<ReservationStatus, string> = {
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
    };
    return colorMap[status];
  };

  // Renderizar datos de un huésped
  const renderGuestDetails = (guest: Guest, isPrimary = false) => (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg divide-y divide-gray-200">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {isPrimary ? "Huésped principal" : "Huésped adicional"}
        </h3>
        {isPrimary && guest.sesSent && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <svg
              className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400"
              fill="currentColor"
              viewBox="0 0 8 8"
            >
              <circle cx="4" cy="4" r="3" />
            </svg>
            Enviado a SES
          </span>
        )}
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <h4 className="text-sm font-medium text-gray-500">
              Nombre completo
            </h4>
            <p className="mt-1 text-sm text-gray-900">
              {guest.firstName} {guest.lastName}
            </p>
          </div>
          <div className="sm:col-span-3">
            <h4 className="text-sm font-medium text-gray-500">Email</h4>
            <p className="mt-1 text-sm text-gray-900">{guest.email}</p>
          </div>
          <div className="sm:col-span-3">
            <h4 className="text-sm font-medium text-gray-500">Teléfono</h4>
            <p className="mt-1 text-sm text-gray-900">{guest.phone || "-"}</p>
          </div>
          <div className="sm:col-span-3">
            <h4 className="text-sm font-medium text-gray-500">Documento</h4>
            <p className="mt-1 text-sm text-gray-900">
              {guest.documentType === "dni"
                ? "DNI"
                : guest.documentType === "passport"
                  ? "Pasaporte"
                  : "Otro"}
              : {guest.documentNumber}
            </p>
          </div>
          <div className="sm:col-span-3">
            <h4 className="text-sm font-medium text-gray-500">
              Fecha de nacimiento
            </h4>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(guest.birthDate)}
            </p>
          </div>
          <div className="sm:col-span-3">
            <h4 className="text-sm font-medium text-gray-500">Nacionalidad</h4>
            <p className="mt-1 text-sm text-gray-900">{guest.nationality}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Cabecera con acciones */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-xl font-semibold text-gray-900">
          Detalles de la reserva
        </h2>
        <div className="flex space-x-3">
          {mainGuest && !mainGuest.sesSent && onSendToSES && (
            <Button
              type="button"
              onClick={onSendToSES}
              disabled={isSendingToSES}
              variant="primary"
              size="sm"
            >
              {isSendingToSES ? (
                <>
                  {(() => {
  
                    return <LoadingInline size={LoadingSize.SM} variant={LoadingVariant.WHITE} className="-ml-1 mr-2" />;
                  })()}
                  Enviando a SES...
                </>
              ) : (
                <>
                  <svg
                    className="-ml-0.5 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  Enviar a SES
                </>
              )}
            </Button>
          )}
          <Button
            type="button"
            onClick={onEdit}
            variant="secondary"
            size="sm"
          >
            <svg
              className="-ml-0.5 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Editar reserva
          </Button>
        </div>
      </div>

      {/* Detalles básicos de la reserva */}
      <div className="bg-white overflow-hidden shadow-sm rounded-lg divide-y divide-gray-200">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Información de la reserva
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <h4 className="text-sm font-medium text-gray-500">Estado</h4>
              <p className="mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}
                >
                  {getStatusLabel(reservation.status)}
                </span>
              </p>
            </div>
            <div className="sm:col-span-3">
              <h4 className="text-sm font-medium text-gray-500">Propiedad</h4>
              <p className="mt-1 text-sm text-gray-900">
                {property ? property.name : "N/A"}
              </p>
            </div>
            <div className="sm:col-span-3">
              <h4 className="text-sm font-medium text-gray-500">
                Fecha de entrada
              </h4>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(reservation.checkInDate)}
              </p>
            </div>
            <div className="sm:col-span-3">
              <h4 className="text-sm font-medium text-gray-500">
                Fecha de salida
              </h4>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(reservation.checkOutDate)}
              </p>
            </div>
            <div className="sm:col-span-3">
              <h4 className="text-sm font-medium text-gray-500">
                Número de huéspedes
              </h4>
              <p className="mt-1 text-sm text-gray-900">
                {reservation.totalGuests}
              </p>
            </div>
            {reservation.bookingSource && (
              <div className="sm:col-span-3">
                <h4 className="text-sm font-medium text-gray-500">
                  Origen de la reserva
                </h4>
                <p className="mt-1 text-sm text-gray-900">
                  {reservation.bookingSource === "direct"
                    ? "Directa"
                    : reservation.bookingSource === "airbnb"
                      ? "Airbnb"
                      : reservation.bookingSource === "booking"
                        ? "Booking.com"
                        : "Otro"}
                  {reservation.bookingSourceReference &&
                    ` (Ref: ${reservation.bookingSourceReference})`}
                </p>
              </div>
            )}
            {reservation.notes && (
              <div className="sm:col-span-6">
                <h4 className="text-sm font-medium text-gray-500">Notas</h4>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                  {reservation.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Información del huésped principal */}
      {mainGuest && renderGuestDetails(mainGuest, true)}

      {/* Huéspedes adicionales */}
      {additionalGuests.length > 0 && (
        <>
          <h3 className="text-lg font-medium text-gray-900">
            Huéspedes adicionales ({additionalGuests.length})
          </h3>
          <div className="space-y-4">
            {additionalGuests.map((guest) => (
              <div key={guest.id}>{renderGuestDetails(guest)}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ReservationDetail;

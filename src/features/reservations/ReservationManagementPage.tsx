import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@shared/contexts/AuthContext";
import { Reservation, ReservationCreateData, Guest } from "@/types/reservation";
import { Property } from "@/types/property";
import ReservationList from "./ReservationList";
import ReservationForm from "./ReservationForm";
import ReservationDetail from "./ReservationDetail";
import DashboardNavigation from "@features/dashboard/DashboardNavigation";
import DashboardHeader from "@shared/components/DashboardHeader";
import { useLanguage } from "@shared/contexts/LanguageContext";
import { PlusIcon } from "@heroicons/react/24/outline";

// Definimos un enum para el estado de las reservas
enum ReservationStatus {
  CONFIRMED = "confirmed",
  PENDING = "pending",
  CANCELED = "canceled"
}

enum ViewMode {
  LIST,
  DETAIL,
  FORM,
}

interface ReservationManagementPageProps {
  onSignOut?: () => void;
}

const ReservationManagementPage: React.FC<ReservationManagementPageProps> = ({ onSignOut }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { reservationId } = useParams<{ reservationId?: string }>();
  const { t } = useLanguage();

  // Estados
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LIST);
  const [isLoading, setIsLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentReservation, setCurrentReservation] = useState<
    Reservation | undefined
  >(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingToSES, setIsSendingToSES] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cargar datos
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulamos una carga de datos desde una API
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Datos vacíos para propiedades y reservas
      const mockProperties: Property[] = [];
      const mockGuests: Guest[] = [];
      const mockReservations: Reservation[] = [];

      setProperties(mockProperties);
      setReservations(mockReservations);

      // Si hay un ID de reserva en la URL, mostrar un mensaje de error
      if (reservationId) {
        setErrorMessage(t("reservations.errors.reservationNotFound"));
        navigate("/dashboard/reservations");
      }
    } catch (error) {
      console.error("Error al cargar los datos:", error);
      setErrorMessage(t("reservations.errors.loadingData"));
    } finally {
      setIsLoading(false);
    }
  }, [t, reservationId, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Manejar creación de nueva reserva
  const handleCreateReservation = (data: ReservationCreateData) => {
    setIsSubmitting(true);

    // En una implementación real, llamaríamos a Supabase:
    // async function createReservation() {
    //   try {
    //     // 1. Crear la reserva
    //     const { data: reservationData, error: reservationError } = await supabase
    //       .from('reservations')
    //       .insert({
    //         property_id: data.propertyId,
    //         check_in_date: data.checkInDate,
    //         check_out_date: data.checkOutDate,
    //         status: data.status,
    //         total_guests: data.totalGuests,
    //         // ... otros campos
    //       })
    //       .select()
    //       .single();
    //
    //     if (reservationError) throw reservationError;
    //
    //     // 2. Crear el huésped principal
    //     const { data: mainGuestData, error: mainGuestError } = await supabase
    //       .from('guests')
    //       .insert({
    //         ...data.mainGuest,
    //         reservation_id: reservationData.id
    //       })
    //       .select()
    //       .single();
    //
    //     // ... etc.
    //   }
    // }

    // Simulación de creación para el MVP
    setTimeout(() => {
      try {
        // Generar IDs únicos
        const reservationId = `res_${Math.random().toString(36).substr(2, 9)}`;
        const mainGuestId = `guest_${Math.random().toString(36).substr(2, 9)}`;

        // Preparar el huésped principal
        const mainGuest: Guest = {
          id: mainGuestId,
          ...data.mainGuest,
        };

        // Preparar huéspedes adicionales si existen
        const additionalGuests: Guest[] = (data.additionalGuests || []).map(
          (guest) => ({
            id: `guest_${Math.random().toString(36).substr(2, 9)}`,
            ...guest,
          }),
        );

        // Crear la nueva reserva
        const newReservation: Reservation = {
          id: reservationId,
          propertyId: data.propertyId,
          mainGuestId: mainGuest.id,
          guests: [mainGuest, ...additionalGuests],
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
          status: data.status,
          totalGuests: data.totalGuests,
          totalAmount: data.totalAmount,
          paymentStatus: data.paymentStatus,
          bookingSource: data.bookingSource,
          bookingSourceReference: data.bookingSourceReference,
          notes: data.notes,
          createdAt: new Date().toISOString(),
        };

        // Actualizar el estado
        setReservations((prev) => [...prev, newReservation]);
        setSuccessMessage(t("reservations.success.created"));

        // Volver a la lista
        setViewMode(ViewMode.LIST);
      } catch (error) {
        console.error("Error al crear la reserva:", error);
        setErrorMessage(t("reservations.errors.saving"));
      } finally {
        setIsSubmitting(false);
      }
    }, 1000); // Simular latencia de red
  };

  // Manejar edición de reserva
  const handleUpdateReservation = (data: ReservationCreateData) => {
    if (!currentReservation) return;

    setIsSubmitting(true);

    // Simulación de actualización para el MVP
    setTimeout(() => {
      try {
        // Preparar huésped principal (mantener el ID original)
        const mainGuest: Guest = {
          ...data.mainGuest,
          id: currentReservation.mainGuestId,
        };

        // Encontrar huéspedes adicionales existentes (mantener sus IDs)
        const existingAdditionalGuests = currentReservation.guests.filter(
          (g) => g.id !== currentReservation.mainGuestId,
        );

        // Preparar huéspedes adicionales nuevos y existentes
        const additionalGuests: Guest[] = (data.additionalGuests || []).map(
          (guest, index) => {
            // Si hay un huésped existente en esta posición, mantener su ID
            if (existingAdditionalGuests[index]) {
              return {
                ...guest,
                id: existingAdditionalGuests[index].id,
              };
            }

            // Sino, crear un nuevo ID
            return {
              ...guest,
              id: `guest_${Math.random().toString(36).substr(2, 9)}`,
            };
          },
        );

        // Crear la reserva actualizada
        const updatedReservation: Reservation = {
          ...currentReservation,
          propertyId: data.propertyId,
          guests: [mainGuest, ...additionalGuests],
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
          status: data.status,
          totalGuests: data.totalGuests,
          totalAmount: data.totalAmount,
          paymentStatus: data.paymentStatus,
          bookingSource: data.bookingSource,
          bookingSourceReference: data.bookingSourceReference,
          notes: data.notes,
          updatedAt: new Date().toISOString(),
        };

        // Actualizar el estado
        setReservations((prev) =>
          prev.map((r) =>
            r.id === currentReservation.id ? updatedReservation : r,
          ),
        );
        setCurrentReservation(updatedReservation);
        setSuccessMessage(t("reservations.success.updated"));

        // Volver a la vista de detalles
        setViewMode(ViewMode.DETAIL);
      } catch (error) {
        console.error("Error al actualizar la reserva:", error);
        setErrorMessage(t("reservations.errors.saving"));
      } finally {
        setIsSubmitting(false);
      }
    }, 1000); // Simular latencia de red
  };

  // Manejar envío a SES
  const handleSendToSES = () => {
    if (!currentReservation) return;

    setIsSendingToSES(true);

    // Simulación de envío a SES para el MVP
    setTimeout(() => {
      try {
        // Actualizar estado del huésped principal
        const updatedGuests = currentReservation.guests.map((guest) => {
          if (guest.id === currentReservation.mainGuestId) {
            return {
              ...guest,
              sesSent: true,
              sesResponseCode: "SES" + Math.floor(Math.random() * 10000),
            };
          }
          return guest;
        });

        // Actualizar reserva
        const updatedReservation: Reservation = {
          ...currentReservation,
          guests: updatedGuests,
          updatedAt: new Date().toISOString(),
        };

        // Actualizar estado
        setReservations((prev) =>
          prev.map((r) =>
            r.id === currentReservation.id ? updatedReservation : r,
          ),
        );
        setCurrentReservation(updatedReservation);
        setSuccessMessage(t("reservations.success.sentToSES"));
      } catch (error) {
        console.error("Error al enviar datos a SES:", error);
        setErrorMessage(t("reservations.errors.sendingToSES"));
      } finally {
        setIsSendingToSES(false);
      }
    }, 2000); // Simular latencia de red
  };

  // Mostrar formulario para crear nueva reserva
  const handleAddReservation = () => {
    setCurrentReservation(undefined);
    setViewMode(ViewMode.FORM);
  };

  // Mostrar detalles de reserva
  const handleViewReservation = (reservationId: string) => {
    const reservation = reservations.find((r) => r.id === reservationId);
    if (reservation) {
      setCurrentReservation(reservation);
      setViewMode(ViewMode.DETAIL);
      navigate(`/reservations/${reservationId}`);
    }
  };

  // Mostrar formulario para editar reserva
  const handleEditReservation = () => {
    if (currentReservation) {
      setViewMode(ViewMode.FORM);
    }
  };

  // Volver a la lista
  const handleBackToList = () => {
    setViewMode(ViewMode.LIST);
    setCurrentReservation(undefined);
    navigate("/reservations");
  };

  // Cerrar mensajes de alerta
  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Encontrar la propiedad asociada a la reserva actual
  const currentProperty = currentReservation
    ? properties.find((p) => p.id === currentReservation.propertyId)
    : undefined;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <DashboardHeader onSignOut={onSignOut} />

      {/* Navegación secundaria */}
      <DashboardNavigation />

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Migas de pan */}
        <nav className="mb-6">
          <ol className="flex space-x-2 text-sm text-gray-500">
            <li>
              <Link to="/dashboard" className="hover:text-primary-600">
                Dashboard
              </Link>
            </li>
            <li className="flex items-center">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </li>
            <li>
              {viewMode !== ViewMode.LIST ? (
                <button
                  onClick={handleBackToList}
                  className="hover:text-primary-600 text-gray-800 font-medium text-left"
                >
                  Reservas
                </button>
              ) : (
                <span className="text-gray-800 font-medium">Reservas</span>
              )}
            </li>
            {viewMode === ViewMode.DETAIL && currentReservation && (
              <>
                <li className="flex items-center">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </li>
                <li className="text-gray-800 font-medium">
                  Detalles de reserva
                </li>
              </>
            )}
            {viewMode === ViewMode.FORM && (
              <>
                <li className="flex items-center">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </li>
                <li className="text-gray-800 font-medium">
                  {currentReservation ? "Editar reserva" : "Nueva reserva"}
                </li>
              </>
            )}
          </ol>
        </nav>

        {/* Mensajes de alerta */}
        {(errorMessage || successMessage) && (
          <div
            className={`rounded-md p-4 mb-6 ${errorMessage ? "bg-red-50" : "bg-green-50"}`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {errorMessage ? (
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${errorMessage ? "text-red-800" : "text-green-800"}`}
                >
                  {errorMessage || successMessage}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={clearMessages}
                    className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      errorMessage
                        ? "bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600"
                        : "bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600"
                    }`}
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenido según el modo de visualización */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-t-4 border-b-4 border-primary-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {viewMode === ViewMode.LIST && (
              <>
                {reservations.length === 0 ? (
                  <div className="bg-white shadow rounded-lg p-10 text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t("dashboard.reservations.emptyState")}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {t("dashboard.reservations.emptyStateDescription")}
                    </p>
                    <button
                      type="button"
                      onClick={handleAddReservation}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                      {t("dashboard.reservations.actions.create")}
                    </button>
                  </div>
                ) : (
                  <ReservationList
                    reservations={reservations}
                    properties={properties}
                    onViewDetails={handleViewReservation}
                    onAddReservation={handleAddReservation}
                  />
                )}
              </>
            )}

            {viewMode === ViewMode.DETAIL && currentReservation && (
              <div>
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={handleBackToList}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Volver a reservas
                  </button>
                </div>

                <ReservationDetail
                  reservation={currentReservation}
                  property={currentProperty}
                  onEdit={handleEditReservation}
                  onSendToSES={handleSendToSES}
                  isSendingToSES={isSendingToSES}
                />
              </div>
            )}

            {viewMode === ViewMode.FORM && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {currentReservation ? "Editar reserva" : "Nueva reserva"}
                    </h3>
                    <button
                      type="button"
                      onClick={handleBackToList}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Cancelar
                    </button>
                  </div>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <ReservationForm
                    reservation={currentReservation}
                    properties={properties}
                    onSubmit={
                      currentReservation
                        ? handleUpdateReservation
                        : handleCreateReservation
                    }
                    onCancel={handleBackToList}
                    isSubmitting={isSubmitting}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ReservationManagementPage;

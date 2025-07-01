import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@shared/contexts/AuthContext";
import { Reservation, ReservationCreateData, Guest } from "@/types/reservation";
import { Property } from "@/types/property";
import ReservationList from "./ReservationList";
import ReservationForm from "./ReservationForm";
import ReservationDetail from "./ReservationDetail";
import Calendar from "./Calendar";
import DashboardNavigation from "@features/dashboard/DashboardNavigation";
import DashboardHeader from "@shared/components/DashboardHeader";
import { useLanguage } from "@shared/contexts/LanguageContext";
import { PlusIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/services/supabase";

// Enum eliminado - se usa el tipo ReservationStatus del archivo types/reservation.ts

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

  // Cargar datos reales desde Supabase
  const loadData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Consultar propiedades del usuario autenticado
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (propertiesError) {
        console.error('Error loading properties:', propertiesError);
        throw propertiesError;
      }

      // Por ahora, inicializamos reservas como array vacío
      // TODO: Implementar consulta de reservas cuando esté la tabla en Supabase
      const reservationsData: Reservation[] = [];

      // Actualizar estado con datos reales
      setProperties(propertiesData || []);
      setReservations(reservationsData);

      // Si hay un ID de reserva en la URL pero no existe, mostrar error
      if (reservationId) {
        const foundReservation = reservationsData.find(r => r.id === reservationId);
        if (!foundReservation) {
          setErrorMessage(t("reservations.errors.reservationNotFound"));
          navigate("/dashboard/reservations");
        }
      }

    } catch (error) {
      console.error("Error al cargar los datos desde Supabase:", error);
      setErrorMessage(t("reservations.errors.loadingData"));
      // En caso de error, usar arrays vacíos en lugar de datos mock
      setProperties([]);
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, t, reservationId, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Manejar creación de nueva reserva
  const handleCreateReservation = async (data: ReservationCreateData) => {
    setIsSubmitting(true);

    try {
      // TODO: Implementar creación real de reservas cuando tengamos las tablas en Supabase
      // Por ahora mostrar mensaje informativo
      setErrorMessage("La funcionalidad de crear reservas está pendiente de implementar. Necesitamos crear las tablas 'reservations' y 'guests' en Supabase.");
      
      // Volver a la lista
      setTimeout(() => {
        setViewMode(ViewMode.LIST);
      }, 2000);

    } catch (error) {
      console.error("Error al crear la reserva:", error);
      setErrorMessage(t("reservations.errors.saving"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar edición de reserva
  const handleUpdateReservation = async (data: ReservationCreateData) => {
    if (!currentReservation) return;

    setIsSubmitting(true);

    try {
      // TODO: Implementar actualización real de reservas cuando tengamos las tablas en Supabase
      setErrorMessage("La funcionalidad de editar reservas está pendiente de implementar. Necesitamos crear las tablas 'reservations' y 'guests' en Supabase.");
      
      // Volver a la lista
      setTimeout(() => {
        setViewMode(ViewMode.LIST);
      }, 2000);

    } catch (error) {
      console.error("Error al actualizar la reserva:", error);
      setErrorMessage(t("reservations.errors.saving"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar envío a SES
  const handleSendToSES = async () => {
    if (!currentReservation) return;

    setIsSendingToSES(true);

    try {
      // TODO: Implementar envío real a SES cuando tengamos las tablas y la funcionalidad
      setErrorMessage("La funcionalidad de envío a SES está pendiente de implementar. Necesitamos crear las tablas 'reservations' y 'guests' en Supabase.");
      
    } catch (error) {
      console.error("Error al enviar datos a SES:", error);
      setErrorMessage(t("reservations.errors.sendingToSES"));
    } finally {
      setIsSendingToSES(false);
    }
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
{t("dashboard.reservations.reservationsTitle")}
                </button>
              ) : (
                <span className="text-gray-800 font-medium">{t("dashboard.reservations.reservationsTitle")}</span>
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
                  {t("dashboard.reservations.reservationDetails")}
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
                  {currentReservation ? t("dashboard.reservations.editReservation") : t("dashboard.reservations.newReservation")}
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

        {/* Calendario mensual */}
        {!isLoading && (
          <div className="mb-8">
            <Calendar 
              reservations={reservations}
              onDateClick={(date) => {
                // Opcional: agregar funcionalidad al hacer clic en una fecha
                console.log('Fecha seleccionada:', date);
              }}
            />
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
{t("dashboard.reservations.backToReservations")}
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
                      {currentReservation ? t("dashboard.reservations.editReservation") : t("dashboard.reservations.newReservation")}
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
{t("dashboard.reservations.cancel")}
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

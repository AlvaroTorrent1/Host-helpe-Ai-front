import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@shared/contexts/AuthContext";
import { Reservation, ReservationCreateData, Guest } from "@/types/reservation";
import { Property } from "@/types/property";
import ReservationList from "./ReservationList";
import ReservationForm from "./ReservationForm";
import ReservationDetail from "./ReservationDetail";
import Calendar from "./Calendar";
import DayDetailsModal from "./DayDetailsModal";
import DashboardNavigation from "@features/dashboard/DashboardNavigation";
import DashboardHeader from "@shared/components/DashboardHeader";
import { useTranslation } from "react-i18next";
import { PlusIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/services/supabase";
import { LoadingInlineVariants } from "@shared/components/loading";
import { reservationService } from "@/services/reservationService";
import ReservationTabs from "./components/ReservationTabs";
import Button from "@/components/ui/Button";
import {
  ReservationTabType,
  filterReservationsByTab,
  getReservationCounts,
} from "./utils/reservationFilters";
import toast from "react-hot-toast";
import { travelerFormsService } from "@/services/travelerFormsService";
import TravelerReportDetailsModal, { TravelerReportDetails } from "@features/sesregistro/components/TravelerReportDetailsModal";
import { downloadTravelerReportPDF } from "@features/sesregistro/utils/pdfGenerator";
import { TravelerReportPDFData } from "@features/sesregistro/components/TravelerReportPDF";
import { prepareSignatureForPDF } from "@features/sesregistro/utils/svgToPng";
import { getCachedLogoBase64 } from "@features/sesregistro/utils/logoBase64";

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
  const { t } = useTranslation();

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
  
  // Estados para el modal de detalles del día
  const [isDayDetailsModalOpen, setIsDayDetailsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateReservations, setSelectedDateReservations] = useState<Reservation[]>([]);
  
  // Estado para las pestañas de reservas
  const [activeTab, setActiveTab] = useState<ReservationTabType>('current');

  // Estados para el modal de detalles SES
  const [selectedSesReportId, setSelectedSesReportId] = useState<string | null>(null);
  const [selectedSesReportDetails, setSelectedSesReportDetails] = useState<TravelerReportDetails | null>(null);

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

      // Cargar reservas del usuario
      const reservationsData = await reservationService.getReservations();

      // Actualizar estado con datos reales
      setProperties(propertiesData || []);
      setReservations(reservationsData);

      // Si hay un ID de reserva en la URL pero no existe, mostrar error
      if (reservationId) {
        const foundReservation = reservationsData.find(r => r.id === reservationId);
        if (!foundReservation) {
          setErrorMessage(t("reservations.errors.reservationNotFound"));
          navigate("/reservations");
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
    console.log("🟢 EJECUTANDO: handleCreateReservation - Creando nueva reserva");
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Obtener el nombre de la propiedad
      const property = properties.find(p => p.id === data.propertyId);
      
      // Mapear los datos del formulario al formato esperado por el servicio
      const reservationData = {
        property_id: data.propertyId,
        property_name: property?.name || '',
        guest_name: data.mainGuest.firstName,
        guest_surname: data.mainGuest.lastName,
        phone_number: data.mainGuest.phone || null,
        nationality: data.mainGuest.nationality,
        checkin_date: data.checkInDate,
        checkout_date: data.checkOutDate,
        notes: data.notes || null,
        status: 'active' as const
      };

      // Verificar disponibilidad antes de crear
      const isAvailable = await reservationService.checkAvailability(
        reservationData.property_id,
        reservationData.checkin_date,
        reservationData.checkout_date
      );

      if (!isAvailable) {
        setErrorMessage(t("reservations.errors.propertyNotAvailable"));
        return;
      }

      // Crear la reserva
      const newReservation = await reservationService.createReservation(reservationData);
      
      // Actualizar la lista de reservas
      await loadData();
      
      setSuccessMessage(t("reservations.successMessages.created"));
      setViewMode(ViewMode.LIST);

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
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Obtener el nombre de la propiedad si cambió
      const property = properties.find(p => p.id === data.propertyId);
      
      // Mapear el status del frontend al formato de la DB
      let dbStatus: 'active' | 'cancelled' | 'completed' = 'active';
      if (currentReservation.status === 'cancelled') {
        dbStatus = 'cancelled';
      } else if (currentReservation.status === 'completed') {
        dbStatus = 'completed';
      }
      
      // Mapear los datos del formulario al formato esperado por el servicio
      const reservationData = {
        property_id: data.propertyId,
        property_name: property?.name || '',
        guest_name: data.mainGuest.firstName,
        guest_surname: data.mainGuest.lastName,
        phone_number: data.mainGuest.phone || null,
        nationality: data.mainGuest.nationality,
        checkin_date: data.checkInDate,
        checkout_date: data.checkOutDate,
        notes: data.notes || null,
        status: dbStatus
      };

      // Verificar disponibilidad antes de actualizar (excluyendo la reserva actual)
      const isAvailable = await reservationService.checkAvailability(
        reservationData.property_id,
        reservationData.checkin_date,
        reservationData.checkout_date,
        currentReservation.id
      );

      if (!isAvailable) {
        setErrorMessage(t("reservations.errors.propertyNotAvailable"));
        return;
      }

      // Actualizar la reserva
      await reservationService.updateReservation(currentReservation.id, reservationData);
      
      // Actualizar la lista de reservas
      await loadData();
      
      setSuccessMessage(t("reservations.successMessages.updated"));
      setViewMode(ViewMode.LIST);

    } catch (error) {
      console.error("Error al actualizar la reserva:", error);
      setErrorMessage(t("reservations.errors.saving"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para ver detalles del parte SES
  const handleViewSesDetails = async (reservationId: string) => {
    try {
      // Encontrar la reserva
      const reservation = reservations.find(r => r.id === reservationId);
      if (!reservation || !reservation.sesRegistrationToken) {
        toast.error(t('travelerRegistry.errors.reportNotFound'));
        return;
      }

      setSelectedSesReportId(reservationId);
      
      // Cargar detalles completos del traveler form request
      // includeCompleted: true permite acceder a formularios completados desde el dashboard
      const request = await travelerFormsService.getRequestByToken(reservation.sesRegistrationToken, true);
      if (!request) {
        toast.error(t('travelerRegistry.errors.reportNotFound'));
        return;
      }

      // Load ALL travelers data if completed (supports 1 to N travelers)
      let allTravelersData = null;
      let travelerData = null; // First traveler (for backwards compatibility)
      
      if (request.status === 'completed') {
        const travelers = await travelerFormsService.getTravelerData(request.id);
        allTravelersData = travelers; // Store ALL travelers
        travelerData = travelers[0]; // First traveler for legacy fields
      }

      // Map to modal format (now includes ALL travelers)
      const details: TravelerReportDetails = {
        id: request.id,
        propertyId: request.property_id,
        propertyName: request.property_name,
        touristEmail: travelerData?.email || request.guest_email,
        checkInDate: request.check_in_date,
        checkOutDate: request.check_out_date,
        status: request.status,
        sentAt: request.sent_at,
        completedAt: request.completed_at,
        numPersons: request.num_travelers_expected,
        
        // NEW: Array of ALL travelers (supports multiple travelers)
        travelers: allTravelersData?.map(t => ({
          firstName: t.first_name,
          lastName: t.last_name,
          document: t.document_number,
          documentType: t.document_type,
          nationality: t.nationality,
          birthDate: t.birth_date,
          phone: t.phone || undefined,
          email: t.email,
        })),
        
        // Legacy fields (for backwards compatibility - show first traveler)
        touristName: travelerData ? `${travelerData.first_name} ${travelerData.last_name}` : null,
        touristFirstName: travelerData?.first_name,
        touristLastName: travelerData?.last_name,
        touristDocument: travelerData?.document_number,
        touristDocumentType: travelerData?.document_type,
        touristNationality: travelerData?.nationality,
        touristBirthDate: travelerData?.birth_date,
        touristPhone: travelerData?.phone || undefined,
        
        // Payment (shared across all travelers)
        paymentMethod: travelerData?.payment_method || undefined,
        paymentHolder: travelerData?.payment_holder || undefined,
        
        // Signature (shared across all travelers)
        signatureUrl: travelerData?.signature_data || undefined,
      };

      setSelectedSesReportDetails(details);
    } catch (error) {
      console.error('Error loading SES details:', error);
      toast.error(t('travelerRegistry.errors.loadingDetails'));
    }
  };

  // Handler para descargar PDF del parte SES
  const handleDownloadSesPdf = async (reservationId: string) => {
    try {
      // Encontrar la reserva
      const reservation = reservations.find(r => r.id === reservationId);
      if (!reservation || !reservation.sesRegistrationToken) {
        toast.error(t('travelerRegistry.errors.reportNotFound'));
        return;
      }

      // Obtener los datos completos del reporte
      // includeCompleted: true permite acceder a formularios completados desde el dashboard
      const request = await travelerFormsService.getRequestByToken(reservation.sesRegistrationToken, true);
      if (!request) {
        toast.error(t('travelerRegistry.errors.reportNotFound'));
        return;
      }

      // Si no está completado, no se puede descargar
      if (request.status !== 'completed') {
        toast.error(t('travelerRegistry.errors.mustBeCompleted'));
        return;
      }

      // Get ALL travelers data (supports 1 to N travelers)
      const travelers = await travelerFormsService.getTravelerData(request.id);

      if (!travelers || travelers.length === 0) {
        toast.error(t('travelerRegistry.errors.noTravelerData'));
        return;
      }

      // Calcular número de noches
      const checkInDate = new Date(request.check_in_date);
      const checkOutDate = new Date(request.check_out_date);
      const diffTime = checkOutDate.getTime() - checkInDate.getTime();
      const numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Show loading toast with traveler count
      const loadingToast = toast.loading(
        `Preparando PDF con ${travelers.length} viajero${travelers.length > 1 ? 's' : ''}...`
      );

      // Load Host Helper logo in base64 to include in PDF
      const logoBase64 = await getCachedLogoBase64();

      // Convert signature SVG to PNG base64 for PDF (shared across all travelers)
      const firstTraveler = travelers[0];
      const signatureForPdf = await prepareSignatureForPDF(firstTraveler.signature_data);

      // Map ALL travelers to PDF structure (NEW: supports multiple travelers)
      const pdfData: TravelerReportPDFData = {
        // Reservation data (shared across all travelers)
        propertyName: request.property_name,
        checkInDate: request.check_in_date,
        checkOutDate: request.check_out_date,
        numberOfNights,
        
        // NEW: Array of ALL travelers (each gets their own page in PDF)
        travelers: travelers.map(t => ({
          firstName: t.first_name,
          lastName: t.last_name,
          documentType: t.document_type,
          documentNumber: t.document_number,
          nationality: t.nationality,
          birthDate: t.birth_date,
          gender: t.gender || undefined,
          email: t.email,
          phone: t.phone || undefined,
          addressStreet: t.address_street || undefined,
          addressCity: t.address_city || undefined,
          addressPostalCode: t.address_postal_code || undefined,
          addressCountry: t.address_country || undefined,
        })),
        
        // Payment data (shared across all travelers)
        paymentMethod: firstTraveler.payment_method || undefined,
        paymentHolder: firstTraveler.payment_holder || undefined,
        
        // Signature (shared across all travelers)
        signatureUrl: signatureForPdf || undefined,
        
        // Metadata
        logoBase64: logoBase64 || undefined,
        submittedAt: firstTraveler.submitted_at || firstTraveler.created_at,
        formRequestId: request.id,
      };

      // Generar y descargar PDF
      toast.loading(t('travelerRegistry.toast.generatingPdf'), { id: loadingToast });
      await downloadTravelerReportPDF(pdfData);
      toast.dismiss(loadingToast);
      toast.success(t('travelerRegistry.toast.pdfDownloaded'));

    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error(t('travelerRegistry.errors.downloadingPdf'));
    }
  };

  // Handler para cerrar modal SES
  const handleCloseSesModal = () => {
    setSelectedSesReportId(null);
    setSelectedSesReportDetails(null);
  };

  // Función para manejar el envío a SES
  const handleSendToSES = async (reservationId: string) => {
    try {
      // TODO: Implementar envío a SES
      setSuccessMessage(t("reservations.successMessages.sentToSES"));
    } catch (error) {
      console.error("Error sending to SES:", error);
      setErrorMessage(t("reservations.errors.sendingToSES"));
    }
  };

  // Función para manejar eliminación de reserva
  const handleReservationDeleted = (reservationId: string) => {
    // Actualizar la lista de reservas
    setReservations(prev => prev.filter(r => r.id !== reservationId));
    
    // Si estamos viendo detalles de la reserva eliminada, volver a la lista
    if (currentReservation && currentReservation.id === reservationId) {
      setViewMode(ViewMode.LIST);
      setCurrentReservation(undefined);
    }
  };

  // Mostrar formulario para crear nueva reserva
  const handleAddReservation = () => {
    setCurrentReservation(undefined);
    setViewMode(ViewMode.FORM);
  };

  // Mostrar formulario para editar reserva existente
  const handleEditReservation = (reservation: Reservation) => {
    setCurrentReservation(reservation);
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

  // Manejar cambio de pestaña
  const handleTabChange = (tab: ReservationTabType) => {
    setActiveTab(tab);
  };

  // Obtener reservas filtradas según la pestaña activa
  const getFilteredReservations = () => {
    return filterReservationsByTab(reservations, activeTab);
  };

  // Obtener conteos de reservas para las pestañas
  const reservationCounts = getReservationCounts(reservations);

  // Manejar clic en fecha del calendario
  const handleDateClick = (date: Date, dayReservations: Reservation[]) => {
    setSelectedDate(date);
    setSelectedDateReservations(dayReservations);
    setIsDayDetailsModalOpen(true);
  };

  // Cerrar modal de detalles del día
  const handleCloseDayDetailsModal = () => {
    setIsDayDetailsModalOpen(false);
    setSelectedDate(null);
    setSelectedDateReservations([]);
  };

  // Navegar a detalle de reserva desde el modal
  const handleViewReservationFromModal = (reservationId: string) => {
    handleCloseDayDetailsModal();
    handleViewReservation(reservationId);
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
                  <Button
                    onClick={clearMessages}
                    variant="ghost"
                    size="icon"
                    className={`${
                      errorMessage
                        ? "bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600"
                        : "bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600"
                    }`}
                    aria-label={t("common.dismiss") || "Cerrar"}
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Button>
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
              properties={properties}
              onDateClick={handleDateClick}
            />
          </div>
        )}

        {/* Contenido según el modo de visualización */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            {(() => {
          
              return LoadingInlineVariants.list(t("common.loadingData") || "Cargando reservas...");
            })()}
          </div>
        ) : (
          <>
            {viewMode === ViewMode.LIST && (
              <>
                {reservations.length === 0 ? (
                  <div className="bg-white shadow rounded-lg p-10 text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t("reservations.emptyState")}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {t("reservations.emptyStateDescription")}
                    </p>
                    <Button
                      type="button"
                      onClick={handleAddReservation}
                      variant="primary"
                      size="md"
                      leadingIcon={<PlusIcon className="-ml-1 mr-2 h-5 w-5" />}
                    >
                      {t("reservations.actions.create")}
                    </Button>
                  </div>
                ) : (
                  <ReservationList
                    reservations={getFilteredReservations()}
                    properties={properties}
                    onAddReservation={handleAddReservation}
                    onReservationDeleted={handleReservationDeleted}
                    onEditReservation={handleEditReservation}
                    onViewSesDetails={handleViewSesDetails}
                    onDownloadSesPdf={handleDownloadSesPdf}
                    activeTab={activeTab}
                    tabsComponent={
                      <ReservationTabs
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        currentCount={reservationCounts.current}
                        pastCount={reservationCounts.past}
                      />
                    }
                  />
                )}
              </>
            )}

            {viewMode === ViewMode.DETAIL && currentReservation && (
              <div>
                <div className="mb-6">
                  <Button
                    type="button"
                    onClick={handleBackToList}
                    variant="secondary"
                    size="sm"
                    leadingIcon={(
                      <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    )}
                  >
                    {t("reservations.backToReservations")}
                  </Button>
                </div>

                <ReservationDetail
                  reservation={currentReservation}
                  property={currentProperty}
                  onEdit={() => handleEditReservation(currentReservation)}
                  onSendToSES={() => handleSendToSES(currentReservation?.id || '')}
                  isSendingToSES={isSendingToSES}
                />
              </div>
            )}

            {viewMode === ViewMode.FORM && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {currentReservation ? t("reservations.editReservation") : t("reservations.newReservation")}
                    </h3>
                    <Button
                      type="button"
                      onClick={handleBackToList}
                      variant="secondary"
                      size="sm"
                      leadingIcon={(
                        <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    >
                      {t("reservations.cancel")}
                    </Button>
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

      {/* Modal de detalles del día */}
      <DayDetailsModal
        isOpen={isDayDetailsModalOpen}
        selectedDate={selectedDate}
        reservations={selectedDateReservations}
        properties={properties}
        onClose={handleCloseDayDetailsModal}
        onViewReservation={handleViewReservationFromModal}
      />

      {/* Modal de detalles del parte SES */}
      <TravelerReportDetailsModal
        isOpen={selectedSesReportId !== null}
        onClose={handleCloseSesModal}
        report={selectedSesReportDetails}
        onDownloadPdf={() => selectedSesReportId && handleDownloadSesPdf(selectedSesReportId)}
      />
    </div>
  );
};

export default ReservationManagementPage;

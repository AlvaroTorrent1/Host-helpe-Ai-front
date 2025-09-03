import React, { useState, useEffect } from "react";
import {
  Reservation,
  ReservationStatus,
  ReservationFilters,
} from "../../types/reservation";
import { Property } from "../../types/property";
import { useTranslation } from "react-i18next";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "@shared/components/DeleteConfirmationModal";
import { reservationService } from "@/services/reservationService";
import MobileFiltersButton from "@shared/components/filters/MobileFiltersButton";
import MobileFiltersSheet from "@shared/components/filters/MobileFiltersSheet";
import FilterChips from "@shared/components/filters/FilterChips";

interface ReservationListProps {
  reservations: Reservation[];
  properties: Property[];
  onAddReservation: () => void;
  onReservationDeleted?: (reservationId: string) => void;
  onEditReservation?: (reservation: Reservation) => void;
  tabsComponent?: React.ReactNode;
  activeTab?: 'current' | 'past';
}

const ReservationList: React.FC<ReservationListProps> = ({
  reservations,
  properties,
  onAddReservation,
  onReservationDeleted,
  onEditReservation,
  tabsComponent,
  activeTab = 'current',
}) => {
  const { t, i18n } = useTranslation();
  
  // Estados para los filtros
  const [filters, setFilters] = useState<ReservationFilters>({
    propertyId: undefined,
    startDate: undefined,
    endDate: undefined,
    searchTerm: "",
  });

  // Estado para almacenar las reservas filtradas
  const [filteredReservations, setFilteredReservations] =
    useState<Reservation[]>(reservations);

  // Estados para eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados para filtros móviles
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Aplicar filtros cuando cambien o cuando cambien las reservas
  useEffect(() => {
    const filtered = reservations.filter((reservation) => {
      // Filtro por propiedad
      if (filters.propertyId && reservation.propertyId !== filters.propertyId) {
        return false;
      }

      // Filtro por fecha de entrada
      if (filters.startDate && reservation.checkInDate < filters.startDate) {
        return false;
      }

      // Filtro por fecha de salida
      if (filters.endDate && reservation.checkOutDate > filters.endDate) {
        return false;
      }

      // Filtro por término de búsqueda (nombre/apellido/email del huésped principal)
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const mainGuest = reservation.guests.find(
          (g) => g.id === reservation.mainGuestId,
        );
        if (!mainGuest) return false;

        const fullName =
          `${mainGuest.firstName} ${mainGuest.lastName}`.toLowerCase();
        const email = mainGuest.email.toLowerCase();

        if (!fullName.includes(searchLower) && !email.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });

    setFilteredReservations(filtered);
  }, [filters, reservations]);

  // Manejador de cambios en los filtros
  const handleFilterChange = (newFilters: Partial<ReservationFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  // Manejador para limpiar todos los filtros
  const handleClearFilters = () => {
    setFilters({
      propertyId: undefined,
      startDate: undefined,
      endDate: undefined,
      searchTerm: "",
    });
  };

  // Verificar si hay filtros activos (excluyendo searchTerm)
  const hasActiveFilters = !!(filters.propertyId || filters.startDate || filters.endDate);

  // Formatear fecha
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(i18n.language, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Manejar click en eliminar reserva
  const handleDeleteClick = (reservation: Reservation) => {
    setReservationToDelete(reservation);
    setDeleteModalOpen(true);
  };

  // Cerrar modal de eliminación
  const handleDeleteModalClose = () => {
    if (!isDeleting) {
      setDeleteModalOpen(false);
      setReservationToDelete(null);
    }
  };

  // Confirmar eliminación
  const handleDeleteConfirm = async () => {
    if (!reservationToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      await reservationService.deleteReservation(reservationToDelete.id);
      
      // Actualizar estado local
      setFilteredReservations(prev => 
        prev.filter(r => r.id !== reservationToDelete.id)
      );

      // Notificar al componente padre
      if (onReservationDeleted) {
        onReservationDeleted(reservationToDelete.id);
      }

      // Mostrar mensaje de éxito
      toast.success(t('reservations.successMessages.deleted'));
      
      // Cerrar modal
      setDeleteModalOpen(false);
      setReservationToDelete(null);
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast.error(t('reservations.errors.deleting'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Cabecera y filtros */}
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="mb-4 sm:mb-0">
            {tabsComponent || (
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {t("dashboard.reservations.title")}
              </h3>
            )}
          </div>
          <button
            type="button"
            onClick={onAddReservation}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            {t("dashboard.reservations.newReservation")}
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="px-4 py-4 sm:px-6 border-b border-gray-200 bg-gray-50">
        {/* Campo de búsqueda - siempre visible y filtros desktop ocultos en móvil */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Filtro de búsqueda */}
          <div className="flex-1 max-w-md">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("reservations.filters.search")}
            </label>
            <input
              type="text"
              name="search"
              id="search"
              placeholder={t("reservations.filters.searchPlaceholder")}
              value={filters.searchTerm || ""}
              onChange={(e) =>
                handleFilterChange({ searchTerm: e.target.value })
              }
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          {/* Filtros desktop - ocultos en móvil */}
          <div className="hidden md:flex md:items-end md:space-x-4">
            {/* Filtro de propiedad */}
            <div className="min-w-[200px]">
              <label
                htmlFor="property-desktop"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("reservations.filters.property")}
              </label>
              <select
                id="property-desktop"
                name="property"
                value={filters.propertyId || ""}
                onChange={(e) =>
                  handleFilterChange({ propertyId: e.target.value || undefined })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">{t("reservations.filters.allProperties")}</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de fecha desde */}
            <div className="min-w-[140px]">
              <label
                htmlFor="startDate-desktop"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("reservations.filters.checkInDate")}
              </label>
              <input
                type="date"
                name="startDate"
                id="startDate-desktop"
                value={filters.startDate || ""}
                onChange={(e) =>
                  handleFilterChange({ startDate: e.target.value || undefined })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>

            {/* Filtro de fecha hasta */}
            <div className="min-w-[140px]">
              <label
                htmlFor="endDate-desktop"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("reservations.filters.checkOutDate")}
              </label>
              <input
                type="date"
                name="endDate"
                id="endDate-desktop"
                value={filters.endDate || ""}
                onChange={(e) =>
                  handleFilterChange({ endDate: e.target.value || undefined })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>

            {/* Botón para limpiar filtros */}
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {t("reservations.filters.clear")}
            </button>
          </div>
        </div>

        {/* FilterChips para mostrar filtros activos en móvil */}
        {hasActiveFilters && (
          <div className="mt-3 md:hidden">
            <FilterChips
              filters={[
                ...(filters.propertyId 
                  ? [{ 
                      key: 'property', 
                      label: properties.find(p => p.id === filters.propertyId)?.name || 'Propiedad',
                      onRemove: () => handleFilterChange({ propertyId: undefined })
                    }] 
                  : []
                ),
                ...(filters.startDate 
                  ? [{ 
                      key: 'startDate', 
                      label: `Check-in: ${filters.startDate}`,
                      onRemove: () => handleFilterChange({ startDate: undefined })
                    }] 
                  : []
                ),
                ...(filters.endDate 
                  ? [{ 
                      key: 'endDate', 
                      label: `Check-out: ${filters.endDate}`,
                      onRemove: () => handleFilterChange({ endDate: undefined })
                    }] 
                  : []
                )
              ]}
              onOpenFilters={() => setIsMobileFiltersOpen(true)}
            />
          </div>
        )}


      </div>

      {/* Lista de reservas */}
      {filteredReservations.length === 0 ? (
        <div className="text-center p-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {tabsComponent ? t(`reservations.empty.${activeTab}`) : t("reservations.emptyState")}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {tabsComponent 
              ? (activeTab === 'current' 
                ? t("reservations.emptyStateDescription") 
                : t("reservations.emptyPastDescription"))
              : t("reservations.emptyStateDescription")
            }
          </p>
          {!Object.values(filters).some(
            (val) => val !== undefined && val !== "",
          ) && activeTab === 'current' && (
            <div className="mt-6">
              <button
                type="button"
                onClick={onAddReservation}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("reservations.newReservation")}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Contenedor con scroll horizontal para móvil */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
            {/* Contenedor con scroll vertical */}
            <div className={`overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 ${
              filteredReservations.length > 8 ? 'max-h-96' : 'max-h-none'
            }`}>
              <table className="w-full divide-y divide-gray-200" style={{ minWidth: '800px' }}>
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="divide-x divide-gray-200">
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ minWidth: '200px', width: '20%' }}
                    >
                      <div className="flex items-center justify-start">
                        {t("reservations.table.guest")}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ minWidth: '200px', width: '20%' }}
                    >
                      <div className="flex items-center justify-start">
                        {t("reservations.table.property")}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ minWidth: '120px', width: '15%' }}
                    >
                      <div className="flex items-center justify-start">
                        {t("reservations.table.phone")}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ minWidth: '150px', width: '15%' }}
                    >
                      <div className="flex items-center justify-start">
                        {t("reservations.table.checkIn")}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ minWidth: '150px', width: '15%' }}
                    >
                      <div className="flex items-center justify-start">
                        {t("reservations.table.checkOut")}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ minWidth: '100px', width: '15%' }}
                    >
                      {t("reservations.table.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReservations.map((reservation, index) => {
                    // Encontrar el huésped principal
                    const mainGuest = reservation.guests.find(
                      (g) => g.id === reservation.mainGuestId,
                    );

                    // Encontrar la propiedad
                    const property = properties.find(
                      (p) => p.id === reservation.propertyId,
                    );

                    return (
                      <tr 
                        key={reservation.id} 
                        className="hover:bg-gray-50 transition-colors group divide-x divide-gray-200"
                      >
                        <td 
                          className="px-4 py-4 text-sm font-medium text-gray-900 text-left"
                          style={{ minWidth: '200px', width: '20%' }}
                        >
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">
                              {mainGuest
                                ? `${mainGuest.firstName} ${mainGuest.lastName}`
                                : t("common.notAvailable")}
                            </div>
                          </div>
                        </td>
                        <td 
                          className="px-4 py-4 text-sm text-gray-900 text-left"
                          style={{ minWidth: '200px', width: '20%' }}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{property?.name || t("common.notAvailable")}</span>
                            <span className="text-xs text-gray-500">{property?.address || ""}</span>
                          </div>
                        </td>
                        <td 
                          className="px-4 py-4 text-sm text-gray-500 text-left"
                          style={{ minWidth: '120px', width: '15%' }}
                        >
                          {mainGuest?.phone || t("common.notAvailable")}
                        </td>
                        <td 
                          className="px-4 py-4 text-sm text-gray-500 text-left"
                          style={{ minWidth: '150px', width: '15%' }}
                        >
                          {formatDate(reservation.checkInDate)}
                        </td>
                        <td 
                          className="px-4 py-4 text-sm text-gray-500 text-left"
                          style={{ minWidth: '150px', width: '15%' }}
                        >
                          {formatDate(reservation.checkOutDate)}
                        </td>
                        <td 
                          className="px-4 py-4 text-sm text-center"
                          style={{ minWidth: '100px', width: '15%' }}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            {/* Botón de editar */}
                            <button
                              onClick={() => onEditReservation?.(reservation)}
                              className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded hover:bg-blue-50"
                              title={t("reservations.edit.tooltip")}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            
                            {/* Botón de eliminar */}
                            <button
                              onClick={() => handleDeleteClick(reservation)}
                              className="text-red-600 hover:text-red-800 transition-colors p-2 rounded hover:bg-red-50"
                              title={t("reservations.delete.tooltip")}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Indicador de scroll si hay muchas reservas */}
          {filteredReservations.length > 5 && (
            <div className="text-center py-2 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {t("reservations.scrollIndicator")}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Botón de filtros móvil */}
      <MobileFiltersButton 
        onOpen={() => setIsMobileFiltersOpen(true)} 
        isActive={hasActiveFilters} 
      />

      {/* Panel de filtros móvil */}
      <MobileFiltersSheet
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        onApply={() => { /* Los filtros se aplican automáticamente */ }}
        onClear={handleClearFilters}
        title={t("reservations.filters.title", { defaultValue: "Filtros de Reservas" })}
      >
        <div className="space-y-4">
          {/* Filtro de propiedad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("reservations.filters.property")}
            </label>
            <select
              value={filters.propertyId || ""}
              onChange={(e) =>
                handleFilterChange({ propertyId: e.target.value || undefined })
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">{t("reservations.filters.allProperties")}</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de fecha check-in */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("reservations.filters.checkInDate")}
            </label>
            <input
              type="date"
              value={filters.startDate || ""}
              onChange={(e) =>
                handleFilterChange({ startDate: e.target.value || undefined })
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Filtro de fecha check-out */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("reservations.filters.checkOutDate")}
            </label>
            <input
              type="date"
              value={filters.endDate || ""}
              onChange={(e) =>
                handleFilterChange({ endDate: e.target.value || undefined })
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </MobileFiltersSheet>

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        title={t('reservations.delete.title')}
        message={t('reservations.delete.message')}
        details={reservationToDelete ? t('reservations.delete.details', {
          guestName: `${reservationToDelete.guests.find(g => g.id === reservationToDelete.mainGuestId)?.firstName || ''} ${reservationToDelete.guests.find(g => g.id === reservationToDelete.mainGuestId)?.lastName || ''}`.trim(),
          checkIn: formatDate(reservationToDelete.checkInDate),
          checkOut: formatDate(reservationToDelete.checkOutDate),
          propertyName: properties.find(p => p.id === reservationToDelete.propertyId)?.name || t("common.notAvailable")
        }) : undefined}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ReservationList;

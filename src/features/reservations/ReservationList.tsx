import React, { useState, useEffect } from "react";
import {
  Reservation,
  ReservationStatus,
  ReservationFilters,
} from "../../types/reservation";
import { Property } from "../../types/property";

interface ReservationListProps {
  reservations: Reservation[];
  properties: Property[];
  onViewDetails: (reservationId: string) => void;
  onAddReservation: () => void;
}

const ReservationList: React.FC<ReservationListProps> = ({
  reservations,
  properties,
  onViewDetails,
  onAddReservation,
}) => {
  // Estados para los filtros
  const [filters, setFilters] = useState<ReservationFilters>({
    status: "all",
    propertyId: undefined,
    startDate: undefined,
    endDate: undefined,
    searchTerm: "",
  });

  // Estado para almacenar las reservas filtradas
  const [filteredReservations, setFilteredReservations] =
    useState<Reservation[]>(reservations);

  // Aplicar filtros cuando cambien o cuando cambien las reservas
  useEffect(() => {
    const filtered = reservations.filter((reservation) => {
      // Filtro por estado
      if (
        filters.status &&
        filters.status !== "all" &&
        reservation.status !== filters.status
      ) {
        return false;
      }

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
      status: "all",
      propertyId: undefined,
      startDate: undefined,
      endDate: undefined,
      searchTerm: "",
    });
  };

  // Función para traducir el estado a español
  const getStatusLabel = (status: ReservationStatus): string => {
    const statusLabels: Record<ReservationStatus, string> = {
      confirmed: "Confirmada",
      pending: "Pendiente",
      cancelled: "Cancelada",
      completed: "Completada",
    };
    return statusLabels[status];
  };

  // Función para obtener el color del badge de estado
  const getStatusColor = (status: ReservationStatus): string => {
    const statusColors: Record<ReservationStatus, string> = {
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
    };
    return statusColors[status];
  };

  // Formatear fecha
  const formatDate = (dateString: string): string => {
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

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Cabecera y filtros */}
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 sm:mb-0">
            Reservas
          </h3>
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
            Nueva reserva
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="px-4 py-4 sm:px-6 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Filtro de búsqueda */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700"
            >
              Buscar
            </label>
            <input
              type="text"
              name="search"
              id="search"
              placeholder="Nombre o email..."
              value={filters.searchTerm || ""}
              onChange={(e) =>
                handleFilterChange({ searchTerm: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          {/* Filtro de estado */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              Estado
            </label>
            <select
              id="status"
              name="status"
              value={filters.status || "all"}
              onChange={(e) =>
                handleFilterChange({
                  status: e.target.value as ReservationStatus | "all",
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="all">Todos</option>
              <option value="confirmed">Confirmada</option>
              <option value="pending">Pendiente</option>
              <option value="cancelled">Cancelada</option>
              <option value="completed">Completada</option>
            </select>
          </div>

          {/* Filtro de propiedad */}
          <div>
            <label
              htmlFor="property"
              className="block text-sm font-medium text-gray-700"
            >
              Propiedad
            </label>
            <select
              id="property"
              name="property"
              value={filters.propertyId || ""}
              onChange={(e) =>
                handleFilterChange({ propertyId: e.target.value || undefined })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">Todas</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de fecha desde */}
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700"
            >
              Fecha desde
            </label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              value={filters.startDate || ""}
              onChange={(e) =>
                handleFilterChange({ startDate: e.target.value || undefined })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          {/* Filtro de fecha hasta */}
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700"
            >
              Fecha hasta
            </label>
            <input
              type="date"
              name="endDate"
              id="endDate"
              value={filters.endDate || ""}
              onChange={(e) =>
                handleFilterChange({ endDate: e.target.value || undefined })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Botón para limpiar filtros */}
        <div className="mt-4 text-right">
          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Limpiar filtros
          </button>
        </div>
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
            No hay reservas
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {Object.values(filters).some(
              (val) => val !== undefined && val !== "" && val !== "all",
            )
              ? "No hay reservas que coincidan con los filtros seleccionados."
              : "Comienza añadiendo tu primera reserva."}
          </p>
          {!Object.values(filters).some(
            (val) => val !== undefined && val !== "" && val !== "all",
          ) && (
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
                Nueva reserva
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
                >
                  Huésped
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
                >
                  Propiedad
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
                >
                  Check-in
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
                >
                  Check-out
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12"
                >
                  Estado
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12"
                >
                  Acciones
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
                    className={index % 2 === 0 ? "bg-white border-b border-gray-100 hover:bg-gray-50" : "bg-gray-50 border-b border-gray-100 hover:bg-gray-100"}
                  >
                    <td className="px-3 py-4 text-left">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {mainGuest
                            ? `${mainGuest.firstName} ${mainGuest.lastName}`
                            : "N/A"}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]" title={mainGuest?.email || "N/A"}>
                          {mainGuest?.email || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-left">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {property?.name || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500 break-words max-w-[200px]">
                          {property?.address || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-left">
                      <div className="text-sm text-gray-900">
                        {formatDate(reservation.checkInDate)}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-left">
                      <div className="text-sm text-gray-900">
                        {formatDate(reservation.checkOutDate)}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-left">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(reservation.status)}`}
                      >
                        {getStatusLabel(reservation.status)}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-left text-sm font-medium">
                      <button
                        onClick={() => onViewDetails(reservation.id)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReservationList;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@services/supabase";
import { useAuth } from "@shared/contexts/AuthContext";
import { useLanguage } from "@shared/contexts/LanguageContext";
import DashboardNavigation from "./DashboardNavigation";
import DashboardLanguageSelector from "./DashboardLanguageSelector";
import DashboardHeader from "@shared/components/DashboardHeader";
import DashboardStats from "./DashboardStats";

type Property = {
  id: string;
  name: string;
  address: string;
  image?: string;
  status: "active" | "inactive";
};

type Reservation = {
  id: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  status: "confirmed" | "pending" | "cancelled";
  property_id: string;
  property_name: string;
};

// Tipos de categorías de incidencias según el PRD
type IncidentCategory =
  | "check-in-out"
  | "property-issue"
  | "tourist-info"
  | "emergency"
  | "other";

type Incident = {
  id: string;
  title: string;
  date: string;
  status: "resolved" | "pending";
  property_id: string;
  property_name: string;
  category: IncidentCategory;
  description?: string;
};

const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    IncidentCategory | "all"
  >("all");

  // Obtener datos del usuario actual
  useEffect(() => {
    const getUser = async () => {
      const { data: _userData } = await supabase.auth.getUser();
      setIsLoading(false);
    };

    getUser();
  }, []);

  // Cargar datos de simulación para el MVP
  useEffect(() => {
    // Simular propiedades de ejemplo
    const mockProperties: Property[] = [
      {
        id: "1",
        name: t("mockData.properties.apartment.name"),
        address: t("mockData.properties.apartment.address"),
        image:
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        status: "active",
      },
      {
        id: "2",
        name: t("mockData.properties.beach.name"),
        address: t("mockData.properties.beach.address"),
        image:
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        status: "active",
      },
    ];

    // Simular reservas de ejemplo
    const mockReservations: Reservation[] = [
      {
        id: "101",
        guest_name: t("mockData.guests.guest1"),
        check_in: "2025-04-15",
        check_out: "2025-04-20",
        status: "confirmed",
        property_id: "1",
        property_name: t("mockData.properties.apartment.name"),
      },
      {
        id: "102",
        guest_name: t("mockData.guests.guest2"),
        check_in: "2025-04-05",
        check_out: "2025-04-10",
        status: "pending",
        property_id: "2",
        property_name: t("mockData.properties.beach.name"),
      },
    ];

    // Simular incidencias de ejemplo con categorías
    const mockIncidents: Incident[] = [
      {
        id: "201",
        title: t("mockData.incidents.hotWater.title"),
        date: "2025-03-25",
        status: "resolved",
        property_id: "1",
        property_name: t("mockData.properties.apartment.name"),
        category: "property-issue",
        description: t("mockData.incidents.hotWater.description"),
      },
      {
        id: "202",
        title: t("mockData.incidents.wifi.title"),
        date: "2025-03-28",
        status: "pending",
        property_id: "2",
        property_name: t("mockData.properties.beach.name"),
        category: "property-issue",
        description: t("mockData.incidents.wifi.description"),
      },
      {
        id: "203",
        title: t("mockData.incidents.transport.title"),
        date: "2025-03-27",
        status: "resolved",
        property_id: "1",
        property_name: t("mockData.properties.apartment.name"),
        category: "tourist-info",
        description: t("mockData.incidents.transport.description"),
      },
      {
        id: "204",
        title: t("mockData.incidents.checkin.title"),
        date: "2025-03-29",
        status: "pending",
        property_id: "2",
        property_name: t("mockData.properties.beach.name"),
        category: "check-in-out",
        description: t("mockData.incidents.checkin.description"),
      },
    ];

    setProperties(mockProperties);
    setReservations(mockReservations);
    setIncidents(mockIncidents);
  }, [t]);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error(t("errors.signOut"), error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mapeo de categorías para mostrar nombres amigables
  const categoryLabels: Record<IncidentCategory | "all", string> = {
    all: t("dashboard.incidents.categories.all"),
    "check-in-out": t("dashboard.incidents.categories.checkInOut"),
    "property-issue": t("dashboard.incidents.categories.propertyIssue"),
    "tourist-info": t("dashboard.incidents.categories.touristInfo"),
    emergency: t("dashboard.incidents.categories.emergency"),
    other: t("dashboard.incidents.categories.other"),
  };

  // Función para filtrar incidencias según la categoría seleccionada
  const filteredIncidents =
    selectedCategory === "all"
      ? incidents
      : incidents.filter((incident) => incident.category === selectedCategory);

  // Calcular el número de incidencias pendientes
  const pendingIncidentsCount = incidents.filter(
    (incident) => incident.status === "pending",
  ).length;

  // Calcular la tasa de resolución
  const resolvedIncidentsCount = incidents.filter(
    (incident) => incident.status === "resolved",
  ).length;
  const resolutionRate =
    incidents.length > 0
      ? Math.round((resolvedIncidentsCount / incidents.length) * 100)
      : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-indigo-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("dashboard.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header con navegación */}
      <DashboardHeader onSignOut={handleSignOut} />

      {/* Navegación secundaria */}
      <DashboardNavigation />

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="bg-white shadow-sm rounded-lg p-3 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-4">
            {t("dashboard.welcome")}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
            {t("dashboard.description")}
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 sm:p-4 text-yellow-700">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs sm:text-sm">{t("dashboard.notice")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de estadísticas */}
        <div className="mb-4 sm:mb-6">
          <DashboardStats 
            activeProperties={properties.length}
            pendingReservations={reservations.filter(r => r.status === "pending").length}
            totalReservations={reservations.length}
            pendingIncidents={incidents.filter(i => i.status === "pending").length}
            resolutionRate={resolutionRate}
          />
        </div>

        {/* Propiedades */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {t("dashboard.properties.title")}
            </h2>
            <Link
              to="/properties/add"
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              {t("dashboard.properties.add")}
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {properties.map((property) => (
              <div
                key={property.id}
                className="bg-white shadow-sm rounded-lg overflow-hidden flex flex-col sm:flex-row h-full"
              >
                <div className="w-full sm:w-1/3 h-40 sm:h-auto">
                  {property.image ? (
                    <img
                      src={property.image}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <svg
                        className="h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 22V12h6v10"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <Link
                      to={`/properties/${property.id}`}
                      className="block text-base font-semibold text-gray-800 hover:text-primary-500 mb-1"
                    >
                      {property.name}
                    </Link>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {property.address}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        property.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {property.status === "active"
                        ? t("dashboard.properties.statusActive")
                        : t("dashboard.properties.statusInactive")}
                    </span>
                    <Link
                      to={`/properties/${property.id}`}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                    >
                      {t("dashboard.properties.manage")}
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {properties.length === 0 && (
              <div className="col-span-full bg-white shadow-sm rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm sm:text-base mb-3">
                  {t("dashboard.properties.empty")}
                </p>
                <Link
                  to="/properties/add"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  {t("dashboard.properties.addFirst")}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Grid layout para estadísticas y acciones rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Reservas */}
          <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">
              {t("dashboard.reservations.title")}
            </h3>
            <div className="mt-1">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                <span className="text-sm text-gray-600">
                  {t("dashboard.reservations.upcoming")}
                </span>
                <span className="text-lg font-semibold">
                  {reservations.filter((r) => r.status === "confirmed").length}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                <span className="text-sm text-gray-600">
                  {t("dashboard.reservations.pending")}
                </span>
                <span className="text-lg font-semibold">
                  {reservations.filter((r) => r.status === "pending").length}
                </span>
              </div>
              <div className="mt-4">
                <Link
                  to="/reservations"
                  className="block text-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md"
                >
                  {t("dashboard.reservations.view")}
                </Link>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">
              {t("dashboard.quickActions.title")}
            </h3>
            <div className="mt-1 space-y-2">
              <Link
                to="/messages"
                className="block text-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md"
              >
                {t("dashboard.quickActions.messages")}
              </Link>
              <Link
                to="/help"
                className="block text-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md"
              >
                {t("dashboard.quickActions.help")}
              </Link>
            </div>
          </div>
        </div>

        {/* Incidencias */}
        <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2 sm:mb-0">
              {t("dashboard.incidents.title")}
            </h3>
            <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                  selectedCategory === "all"
                    ? "bg-primary-100 text-primary-800"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {categoryLabels["all"]}
              </button>
              {(Object.keys(categoryLabels) as Array<IncidentCategory | "all">)
                .filter((key) => key !== "all")
                .map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                      selectedCategory === category
                        ? "bg-primary-100 text-primary-800"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {categoryLabels[category]}
                  </button>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {t("dashboard.incidents.pending")}
                </span>
                <span className="text-lg font-semibold">
                  {pendingIncidentsCount}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {t("dashboard.incidents.resolutionRate")}
                </span>
                <span className="text-lg font-semibold">{resolutionRate}%</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="w-[35%] sm:w-[35%] px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex items-center">
                      {t("dashboard.incidents.table.title")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="hidden sm:table-cell w-[25%] px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex items-center">
                      {t("dashboard.incidents.table.property")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="w-[32.5%] sm:w-[20%] px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex items-center">
                      {t("dashboard.incidents.table.category")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="w-[32.5%] sm:w-[20%] px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex items-center">
                      {t("dashboard.incidents.table.status")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIncidents.length > 0 ? (
                  filteredIncidents.map((incident) => (
                    <tr key={incident.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-2 sm:px-6 py-2 sm:py-4 text-sm text-left">
                        <div className="truncate max-w-[150px] sm:max-w-full font-medium">
                          {incident.title}
                        </div>
                        <div className="text-xs text-gray-500 sm:hidden mt-1">
                          {incident.property_name}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-2 sm:px-6 py-2 sm:py-4 text-sm text-gray-500 text-left">
                        {incident.property_name}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 text-left">
                        <div className="flex items-center">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {categoryLabels[incident.category]}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 text-left">
                        <div className="flex items-center">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              incident.status === "resolved"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {incident.status === "resolved"
                              ? t("dashboard.incidents.table.resolved")
                              : t("dashboard.incidents.table.pending")}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-2 sm:px-6 py-4 text-center text-sm text-gray-500"
                    >
                      {t("dashboard.incidents.noIncidents")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@services/supabase";
import { useAuth } from "@shared/contexts/AuthContext";
import { useLanguage } from "@shared/contexts/LanguageContext";
import DashboardNavigation from "./DashboardNavigation";
import DashboardLanguageSelector from "./DashboardLanguageSelector";
import DashboardHeader from "@shared/components/DashboardHeader";
import DashboardStats from "./DashboardStats";
import n8nTestService from "@services/n8nTestService";

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
  phone_number?: string;
};

const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    IncidentCategory | "all"
  >("all");

  // Nuevo estado para propiedad seleccionada
  const [selectedProperty, setSelectedProperty] = useState<string | "all">("all");
  
  // Estado para controlar si mostrar todas las incidencias o solo las 10 recientes


  // Obtener datos del usuario actual y cargar datos reales
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener usuario actual
        const { data: userData } = await supabase.auth.getUser();
        console.log("Current user data:", userData);
        
        if (userData?.user) {
          console.log("User ID:", userData.user.id);
          
          // Obtener propiedades del usuario
          const { data: propertiesData, error: propertiesError } = await supabase
            .from('properties')
            .select('*')
            .eq('user_id', userData.user.id);
          
          console.log("Properties data:", propertiesData);
          console.log("Properties error:", propertiesError);
          
          if (propertiesError) {
            console.error("Error al cargar propiedades:", propertiesError);
          } else {
            setProperties(propertiesData || []);
          }
          
          // Obtener incidencias del usuario usando JOIN con properties para filtrar por user_id
          const { data: incidentsData, error: incidentsError } = await supabase
            .from('incidents')
            .select(`
              id,
              title,
              description,
              property_id,
              category,
              status,
              phone_number,
              created_at,
              properties!inner(
                name,
                user_id
              )
            `)
            .eq('properties.user_id', userData.user.id)
            .order('created_at', { ascending: false })
            .limit(50); // Limitar a las 50 más recientes
          
          console.log("Incidents data:", incidentsData);
          console.log("Incidents error:", incidentsError);
          
          if (incidentsError) {
            console.error("Error al cargar incidencias:", incidentsError);
            setIncidents([]); // Fallback a array vacío en caso de error
          } else {
            // Mapear los datos al formato esperado por el frontend
            const mappedIncidents: Incident[] = (incidentsData || []).map((incident: any) => {
              // Verificar que el objeto tenga las propiedades necesarias
              const propertyName = incident.properties?.name || 
                                 (Array.isArray(incident.properties) && incident.properties[0]?.name) || 
                                 'Propiedad desconocida';
              
              return {
                id: incident.id || '',
                title: incident.title || 'Sin título',
                date: incident.created_at || new Date().toISOString(),
                status: (incident.status === 'resolved' ? 'resolved' : 'pending') as "resolved" | "pending",
                property_id: incident.property_id || '',
                property_name: propertyName,
                category: (incident.category || 'other') as IncidentCategory,
                description: incident.description || '',
                phone_number: incident.phone_number || ''
              };
            });
            
            setIncidents(mappedIncidents);
          }
          
          // TODO: Implementar carga de reservas
          // Por ahora dejamos array vacío para reservas
          setReservations([]);
        }
        
      } catch (error) {
        console.error("Error al cargar datos:", error);
        // En caso de error, asegurar arrays vacíos
        setProperties([]);
        setIncidents([]);
        setReservations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Reset de vista a recientes cuando cambian los filtros
  useEffect(() => {
  }, [selectedCategory, selectedProperty]);

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

  // Hardcoded values in case translations aren't working
  const fallbackCategoryLabels: Record<IncidentCategory | "all", string> = {
    all: "All",
    "check-in-out": "Check-in/Check-out",
    "property-issue": "Property Issues",
    "tourist-info": "Tourist Information",
    emergency: "Emergencies",
    other: "Others",
  };

  // Fallback status labels
  const fallbackStatusLabels = {
    resolved: "Resolved",
    pending: "Pending"
  };

  // Fallback for section titles and labels
  const fallbackLabels = {
    incidentsTitle: "Recent Incidents",
    pendingLabel: "Pending",
    resolutionRateLabel: "Resolution Rate",
    tableTitle: "Title",
    tableProperty: "Property",
    tableCategory: "Category", 
    tableStatus: "Status",
    tablePhone: "Phone Number",
    tableDate: "Date",
    noIncidents: "No incidents to display",
    allProperties: "All properties",
    clearFilters: "Clear filters",
    activeFilters: "Active filters"
  };

  // Use fallback if translation returns the key itself
  const getLabel = (category: IncidentCategory | "all"): string => {
    const translated = categoryLabels[category];
    // Check if the translation returned just the key (failed translation)
    if (translated && translated.includes("dashboard.incidents.categories")) {
      return fallbackCategoryLabels[category];
    }
    return translated || fallbackCategoryLabels[category];
  };

  // Get status label with fallback
  const getStatusLabel = (status: "resolved" | "pending"): string => {
    const translated = t(`dashboard.incidents.table.${status}`);
    if (translated && translated.includes("dashboard.incidents.table")) {
      return fallbackStatusLabels[status];
    }
    return translated || fallbackStatusLabels[status];
  };

  // Get translated text with fallback
  const getText = (key: string, fallback: string): string => {
    const translated = t(key);
    if (!translated || translated === key || translated.includes("dashboard.incidents")) {
      return fallback;
    }
    return translated;
  };

  // Función para filtrar incidencias con filtros combinados
  const filteredIncidents = incidents.filter((incident) => {
    // Filtro por categoría
    const categoryMatch = selectedCategory === "all" || incident.category === selectedCategory;
    
    // Filtro por propiedad
    const propertyMatch = selectedProperty === "all" || incident.property_id === selectedProperty;
    
    // Ambos filtros deben coincidir
    return categoryMatch && propertyMatch;
  });

  // Limitar a las 10 incidencias más recientes o mostrar todas según el estado
  // Ya no necesitamos displayedIncidents, usamos directamente filteredIncidents

  // Calcular el número de incidencias pendientes (aplicando filtros)
  const pendingIncidentsCount = filteredIncidents.filter(
    (incident) => incident.status === "pending",
  ).length;

  // Calcular la tasa de resolución (aplicando filtros)
  const resolvedIncidentsCount = filteredIncidents.filter(
    (incident) => incident.status === "resolved",
  ).length;
  const resolutionRate =
    filteredIncidents.length > 0
      ? Math.round((resolvedIncidentsCount / filteredIncidents.length) * 100)
      : 0;

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedProperty("all");
  };

  // Función para verificar si hay filtros activos
  const hasActiveFilters = selectedCategory !== "all" || selectedProperty !== "all";

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
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {properties.length > 0 ? (
              properties.map((property) => (
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
                          ? "Active" 
                          : "Inactive"}
                      </span>
                      <Link
                        to={`/properties/${property.id}`}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white shadow-sm rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm sm:text-base mb-3">
                  {getText("dashboard.properties.empty.title", "No properties available")}
                </p>
              </div>
            )}
          </div>
        </div>



        {/* Incidencias */}
        <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
          {/* Header con título y botón limpiar filtros */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-0">
              {getText("dashboard.incidents.title", fallbackLabels.incidentsTitle)}
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {getText("dashboard.incidents.filters.clearFilters", fallbackLabels.clearFilters)}
              </button>
            )}
          </div>
          
          {/* Toolbar de filtros - Diseño profesional */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-end gap-4">
              {/* Selector de Propiedades */}
              <div className="flex-1 lg:flex-none lg:min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText("dashboard.incidents.table.property", fallbackLabels.tableProperty)}
                </label>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  <option value="all">
                    {getText("dashboard.incidents.filters.allProperties", fallbackLabels.allProperties)}
                  </option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Divisor visual para pantallas grandes */}
              <div className="hidden lg:block w-px h-12 bg-gray-300"></div>
              
              {/* Filtros por Categoría */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText("dashboard.incidents.table.category", fallbackLabels.tableCategory)}
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border transition-all duration-200 ${
                      selectedCategory === "all"
                        ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                  >
                    {getLabel("all")}
                  </button>
                  {(Object.keys(categoryLabels) as Array<IncidentCategory | "all">)
                    .filter((key) => key !== "all")
                    .map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border transition-all duration-200 whitespace-nowrap ${
                          selectedCategory === category
                            ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                        }`}
                      >
                        {getLabel(category)}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {getText("dashboard.incidents.pending", fallbackLabels.pendingLabel)}
                </span>
                <span className="text-lg font-semibold">
                  {pendingIncidentsCount}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {getText("dashboard.incidents.resolutionRate", fallbackLabels.resolutionRateLabel)}
                </span>
                <span className="text-lg font-semibold">{resolutionRate}%</span>
              </div>
            </div>
          </div>

          {/* Indicador de scroll para móvil */}
          <div className="block sm:hidden mb-2 text-center">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              ← Desliza para ver más información →
            </span>
          </div>


          
          {/* Contenedor con scroll horizontal para móvil */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
            {/* Contenedor con scroll vertical */}
            <div className={`overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 ${
              filteredIncidents.length > 8 ? 'max-h-96' : 'max-h-none'
            }`}>
              <table className="w-full divide-y divide-gray-200" style={{ minWidth: '800px' }}>
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="divide-x divide-gray-200">
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ minWidth: '280px', width: '40%' }}
                    >
                      <div className="flex items-center justify-start">
                        {getText("dashboard.incidents.table.title", fallbackLabels.tableTitle)}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ minWidth: '120px', width: '16%' }}
                    >
                      <div className="flex items-center justify-start">
                        {getText("dashboard.incidents.table.property", fallbackLabels.tableProperty)}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ minWidth: '100px', width: '12%' }}
                    >
                      <div className="flex items-center justify-start">
                        {getText("dashboard.incidents.table.category", fallbackLabels.tableCategory)}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ minWidth: '85px', width: '10%' }}
                    >
                      <div className="flex items-center justify-start">
                        {getText("dashboard.incidents.table.status", fallbackLabels.tableStatus)}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ minWidth: '110px', width: '12%' }}
                    >
                      <div className="flex items-center justify-start">
                        {getText("dashboard.incidents.table.phoneNumber", fallbackLabels.tablePhone)}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ minWidth: '85px', width: '10%' }}
                    >
                      <div className="flex items-center justify-start">
                        {getText("dashboard.incidents.table.date", fallbackLabels.tableDate)}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredIncidents.length > 0 ? (
                    filteredIncidents.map((incident) => (
                      <tr key={incident.id} className="hover:bg-gray-50 transition-colors group divide-x divide-gray-200">
                        <td 
                          className="px-4 py-4 text-sm font-medium text-gray-900 text-left"
                          style={{ minWidth: '280px', width: '40%' }}
                        >
                          <div className="line-clamp-2 leading-tight text-left" title={incident.title}>
                            {incident.title}
                          </div>
                        </td>
                        <td 
                          className="px-4 py-4 text-sm text-gray-500 text-left"
                          style={{ minWidth: '120px', width: '16%' }}
                        >
                          <div className="truncate text-left" title={incident.property_name}>
                            {incident.property_name}
                          </div>
                        </td>
                        <td 
                          className="px-4 py-4 text-left"
                          style={{ minWidth: '100px', width: '12%' }}
                        >
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 whitespace-nowrap">
                            {getLabel(incident.category)}
                          </span>
                        </td>
                        <td 
                          className="px-4 py-4 text-left"
                          style={{ minWidth: '85px', width: '10%' }}
                        >
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap ${
                              incident.status === "resolved"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {getStatusLabel(incident.status)}
                          </span>
                        </td>
                        <td 
                          className="px-4 py-4 text-sm text-gray-500 text-left"
                          style={{ minWidth: '110px', width: '12%' }}
                        >
                          <div className="truncate text-left">
                            {incident.phone_number || "N/A"}
                          </div>
                        </td>
                        <td 
                          className="px-4 py-4 text-sm text-gray-500 text-left whitespace-nowrap"
                          style={{ minWidth: '85px', width: '10%' }}
                        >
                          {incident.date ? new Date(incident.date).toLocaleDateString() : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-sm text-gray-500"
                      >
                        {hasActiveFilters 
                          ? `${getText("dashboard.incidents.noIncidents", fallbackLabels.noIncidents)} con los filtros seleccionados`
                          : getText("dashboard.incidents.noIncidents", fallbackLabels.noIncidents)
                        }
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;

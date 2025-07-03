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

// Tipos de categorías de incidencias - valores reales de Supabase
type IncidentCategory =
  | "Check-in"
  | "Conversation Summary"
  | "Property Info"
  | "Property Information"
  | "Property Issue"
  | "Propriety Issue"  // typo en DB
  | "Propriety Info"   // typo en DB
  | "Reservation Issue"
  | "Restaurant Recommendation"
  | "Richiesta immagini"  // italiano
  | "Tourist Information"
  | "emergency"   // futuras categorías
  | "other"       // futuras categorías

type Incident = {
  id: string;
  title: string;
  date: string;
  status: "resolved" | "pending";
  property_id: string;
  property_name: string;
  category: string;  // Flexible para manejar cualquier categoría de DB
  description?: string;
  phone_number?: string;
  conversation_body?: string;  // Transcripción completa de la conversación
};

const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Nuevo estado para propiedad seleccionada
  const [selectedProperty, setSelectedProperty] = useState<string | "all">("all");
  
  // Nuevo estado para filtro por estado
  const [selectedStatus, setSelectedStatus] = useState<string | "all">("all");
  
  // Estados para modal de conversación
  const [selectedConversation, setSelectedConversation] = useState<{
    title: string;
    body: string;
  } | null>(null);
  const [isConversationModalOpen, setIsConversationModalOpen] = useState(false);
  
  // Estado para controlar si mostrar todas las incidencias o solo las 10 recientes


  // Obtener datos del usuario actual y cargar datos reales
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verificar sesión activa primero
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error al obtener sesión:", sessionError);
          // Intentar refrescar sesión
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.error("Error al refrescar sesión:", refreshError);
            console.log("Redirigiendo a login debido a problemas de autenticación...");
            await signOut();
            return;
          }
          console.log("Sesión refrescada exitosamente");
        }
        
        // Obtener usuario actual
        const { data: userData, error: userError } = await supabase.auth.getUser();
        console.log("Current user data:", userData);
        console.log("User error:", userError);
        
        if (userError) {
          console.error("Error al obtener usuario:", userError);
          console.log("Redirigiendo a login debido a error de usuario...");
          await signOut();
          return;
        }
        
        if (!userData?.user) {
          console.log("No hay usuario autenticado, redirigiendo a login...");
          await signOut();
          return;
        }
        
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
          
          // Si es un error de autenticación, intentar resolver
          if (propertiesError.code === 'PGRST301' || propertiesError.message?.includes('JWT')) {
            console.log("Error de JWT detectado, intentando refrescar sesión...");
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error("Error al refrescar sesión:", refreshError);
              await signOut();
              return;
            }
            // Reintentar carga de propiedades
            const { data: retryData, error: retryError } = await supabase
              .from('properties')
              .select('*')
              .eq('user_id', userData.user.id);
            
            if (retryError) {
              console.error("Error en segundo intento de cargar propiedades:", retryError);
              setProperties([]);
            } else {
              setProperties(retryData || []);
            }
          } else {
            setProperties([]);
          }
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
            conversation_body,
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
              category: incident.category || 'other',  // Mantener valor original de DB
              description: incident.description || '',
              phone_number: incident.phone_number || '',
              conversation_body: incident.conversation_body || ''
            };
          });
          
          setIncidents(mappedIncidents);
        }
        
        // TODO: Implementar carga de reservas
        // Por ahora dejamos array vacío para reservas
        setReservations([]);
        
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
  }, [selectedCategory, selectedProperty, selectedStatus]);

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

  // Función para normalizar categorías de DB a nombres amigables
  const normalizeCategoryName = (dbCategory: string): string => {
    const categoryMap: Record<string, string> = {
      // Categorías reales de Supabase → Nombres normalizados
      "Check-in": "Check-in/Check-out",
      "Conversation Summary": "Conversation Summary",
      "Property Info": "Property Information",
      "Property Information": "Property Information", 
      "Property Issue": "Property Issues",
      "Propriety Issue": "Property Issues",  // Fix typo
      "Propriety Info": "Property Information",  // Fix typo
      "Reservation Issue": "Reservation Issues",
      "Restaurant Recommendation": "Restaurant Recommendations",
      "Richiesta immagini": "Image Requests",  // Traducir del italiano
      "Tourist Information": "Tourist Information",
      // Futuras categorías
      "emergency": "Emergencies",
      "other": "Others",
      // Fallback para categorías no mapeadas
      "all": "All"
    };
    
    return categoryMap[dbCategory] || dbCategory || "Others";
  };

  // Obtener categorías únicas presentes en las incidencias actuales
  const getAvailableCategories = (): string[] => {
    const uniqueCategories = Array.from(new Set(incidents.map(incident => incident.category)));
    return ["all", ...uniqueCategories.sort()];
  };

  // Mapeo de categorías para mostrar nombres amigables (dinámico)
  const categoryLabels: Record<string, string> = {};
  getAvailableCategories().forEach(category => {
    categoryLabels[category] = normalizeCategoryName(category);
  });

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
  const getLabel = (category: string): string => {
    return categoryLabels[category] || normalizeCategoryName(category);
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
    
    // Filtro por estado
    const statusMatch = selectedStatus === "all" || incident.status === selectedStatus;
    
    // Todos los filtros deben coincidir
    return categoryMatch && propertyMatch && statusMatch;
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
    setSelectedStatus("all");
  };

  // Función para verificar si hay filtros activos
  const hasActiveFilters = selectedCategory !== "all" || selectedProperty !== "all" || selectedStatus !== "all";

  // Funciones para manejar modal de conversación
  const handleTitleClick = (incident: Incident) => {
    if (incident.conversation_body && incident.conversation_body.trim()) {
      setSelectedConversation({
        title: incident.title,
        body: incident.conversation_body
      });
      setIsConversationModalOpen(true);
    }
  };

  const closeConversationModal = () => {
    setIsConversationModalOpen(false);
    setSelectedConversation(null);
  };

  // Efecto para cerrar modal con tecla Escape y manejar scroll del body
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isConversationModalOpen) {
        closeConversationModal();
      }
    };

    if (isConversationModalOpen) {
      // Desactivar scroll del body cuando modal está abierto
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        // Reactivar scroll del body cuando modal se cierra
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isConversationModalOpen]);

  // Componente Modal para mostrar conversación completa
  const ConversationModal = () => {
    if (!isConversationModalOpen || !selectedConversation) return null;

    // Manejar click outside para cerrar modal
    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        closeConversationModal();
      }
    };

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleOverlayClick}
      >
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Conversación: {selectedConversation.title}
            </h3>
            <button
              onClick={closeConversationModal}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
              {selectedConversation.body}
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200">
            <button
              onClick={closeConversationModal}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  };

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
              
              {/* Selector de Categorías */}
              <div className="flex-1 lg:flex-none lg:min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText("dashboard.incidents.table.category", fallbackLabels.tableCategory)}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  <option value="all">
                    {getLabel("all")}
                  </option>
                  {getAvailableCategories()
                    .filter((category) => category !== "all")
                    .map((category) => (
                      <option key={category} value={category}>
                        {getLabel(category)}
                      </option>
                    ))}
                </select>
              </div>

              {/* Selector de Estado */}
              <div className="flex-1 lg:flex-none lg:min-w-[160px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText("dashboard.incidents.table.status", fallbackLabels.tableStatus)}
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  <option value="all">
                    Todos
                  </option>
                  <option value="pending">
                    {getStatusLabel("pending")}
                  </option>
                  <option value="resolved">
                    {getStatusLabel("resolved")}
                  </option>
                </select>
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
                          <div 
                            className={`line-clamp-2 leading-tight text-left flex items-center gap-2 ${
                              incident.conversation_body && incident.conversation_body.trim() 
                                ? 'cursor-pointer hover:text-blue-600 transition-colors' 
                                : ''
                            }`}
                            title={incident.conversation_body && incident.conversation_body.trim() 
                              ? `${incident.title} (Click para ver conversación completa)` 
                              : incident.title
                            }
                            onClick={() => handleTitleClick(incident)}
                          >
                            <span>{incident.title}</span>
                            {incident.conversation_body && incident.conversation_body.trim() && (
                              <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                            )}
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

      {/* Modal de conversación */}
      <ConversationModal />
    </div>
  );
};

export default DashboardPage;

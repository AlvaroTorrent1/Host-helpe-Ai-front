import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@services/supabase";
import { useAuth } from "@shared/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import DashboardNavigation from "./DashboardNavigation";
// import DashboardLanguageSelector from "./DashboardLanguageSelector"; // Temporalmente comentado
import DashboardHeader from "@shared/components/DashboardHeader";
import DashboardStats from "./DashboardStats";
import AgentUsageChart from "./components/AgentUsageChart";
import AgentUsageAreaChart from "./components/AgentUsageBarChart";
// import n8nTestService from "@services/n8nTestService"; // Temporalmente comentado
import documentService from "@services/documentService";
import reservationService from "@services/reservationService";
import agentService from "@services/agentService";
import MinimalIncidentMetrics from "./components/MinimalIncidentMetrics";
import { filterReservationsByTab } from "../reservations/utils/reservationFilters";
import { Reservation } from "@/types/reservation";
import { PropertyDocument } from "@/types/property";
import { useBodyScrollLock } from "@/hooks";
import { LoadingScreen, LoadingInline, LoadingSize, LoadingVariant } from "@shared/components/loading";
import { IncidentCategory, INCIDENT_CATEGORIES } from '@/types/incident';
import { interpolateColor } from "@/utils/animationUtils";
import MobileFiltersButton from "@shared/components/filters/MobileFiltersButton";
import MobileFiltersSheet from "@shared/components/filters/MobileFiltersSheet";
import FilterChips from "@shared/components/filters/FilterChips";

type Property = {
  id: string;
  name: string;
  address: string;
  image?: string;
  description?: string;
};

// Using imported Reservation type from @/types/reservation



type Incident = {
  id: string;
  title_spanish: string;
  title_english?: string;
  date: string;
  status: "resolved" | "pending";
  property_id: string;
  property_name: string;
  category: string;  // Flexible para manejar cualquier categoría de DB
  description?: string;
  phone_number?: string;
  conversation_body_spanish?: string;
  conversation_body_english?: string;
};

// Hook personalizado para gradientes dinámicos con scroll
const useScrollGradient = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const maxScroll = scrollHeight - clientHeight;
        const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
        setScrollProgress(Math.min(Math.max(progress, 0), 1));
      }
    };

    const element = scrollRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Calcular estilos dinámicos para burbujas del usuario
  const getUserBubbleStyle = (): React.CSSProperties => {
    const baseColor = '#ECA408'; // naranja base
    const targetColor = '#F59E0B'; // amarillo más intenso
    const backgroundColor = interpolateColor(baseColor, targetColor, scrollProgress);
    return {
      background: `linear-gradient(135deg, ${backgroundColor} 0%, #FCD34D 100%)`,
      boxShadow: `0 4px 12px rgba(236, 164, 8, ${0.2 + scrollProgress * 0.3})`,
      transform: `scale(${1 + scrollProgress * 0.02})`, // Efecto de escala sutil
    };
  };

  // Calcular estilos dinámicos para burbujas del agente
  const getAgentBubbleStyle = (): React.CSSProperties => {
    const baseColor = '#F3F4F6'; // gris base
    const targetColor = '#E0F2FE'; // azul suave
    const backgroundColor = interpolateColor(baseColor, targetColor, scrollProgress);
    return {
      background: `linear-gradient(135deg, ${backgroundColor} 0%, #DBEAFE 100%)`,
      boxShadow: `0 4px 12px rgba(59, 130, 246, ${0.1 + scrollProgress * 0.2})`,
      transform: `scale(${1 + scrollProgress * 0.02})`, // Efecto de escala sutil
    };
  };

  return { 
    scrollRef, 
    scrollProgress, 
    getUserBubbleStyle, 
    getAgentBubbleStyle 
  };
};

// Helper function to count current reservations (using same logic as reservations page)
const getCurrentReservationsCount = (reservations: any[]): number => {
  if (!reservations || reservations.length === 0) return 0;
  
  return filterReservationsByTab(reservations, 'current').length;
};

const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const language = i18n.language;
  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Estado para minutos ahorrados de ElevenLabs
  const [savedMinutes, setSavedMinutes] = useState(0);

  // Nuevo estado para propiedad seleccionada
  const [selectedProperty, setSelectedProperty] = useState<string | "all">("all");
  
  // Nuevo estado para filtro por estado
  const [selectedStatus, setSelectedStatus] = useState<string | "all">("all");
  
  // Nuevo estado para filtro por mes
  const [selectedMonth, setSelectedMonth] = useState<string | "all">("all");
  
  // Estados para modal de conversación
  const [selectedConversation, setSelectedConversation] = useState<{
    title: string;
    body: string;
  } | null>(null);
  const [isConversationModalOpen, setIsConversationModalOpen] = useState(false);
  
  // Estados para modal de propiedades
  const [selectedPropertyDetails, setSelectedPropertyDetails] = useState<{
    property: Property;
    documents: PropertyDocument[];
  } | null>(null);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  // Estado UI móvil (no afecta lógica): sheet de filtros
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  // Estado para controlar si mostrar todas las incidencias o solo las 10 recientes

  // Funciones helper para obtener campos según el idioma
  const getIncidentTitle = (incident: Incident): string => {
    if (language === 'en') {
      // Mostrar título en inglés, o español con indicador si no hay traducción
      return incident.title_english || `${incident.title_spanish} (sin traducir)`;
    }
    return incident.title_spanish;
  };

  const getIncidentConversation = (incident: Incident): string => {
    // Intentar obtener el contenido de conversación según idioma
    let conversationBody = '';
    
    if (language === 'en') {
      // Priorizar inglés, fallback a español
      conversationBody = incident.conversation_body_english && incident.conversation_body_english.trim() 
        ? incident.conversation_body_english.trim()
        : incident.conversation_body_spanish && incident.conversation_body_spanish.trim()
        ? incident.conversation_body_spanish.trim()
        : '';
    } else {
      // Para español, usar directamente el campo español, fallback a inglés
      conversationBody = incident.conversation_body_spanish && incident.conversation_body_spanish.trim()
        ? incident.conversation_body_spanish.trim()
        : incident.conversation_body_english && incident.conversation_body_english.trim()
        ? incident.conversation_body_english.trim()
        : '';
    }
    
    // Si no hay conversación, usar la descripción como fallback
    if (!conversationBody && incident.description) {
      conversationBody = incident.description.trim();
    }
    
    return conversationBody;
  };

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
            title_spanish,
            title_english,
            description,
            property_id,
            category,
            status,
            phone_number,
            conversation_body_spanish,
            conversation_body_english,
            created_at,
            properties!inner(
              name,
              user_id
            )
          `)
          .eq('properties.user_id', userData.user.id)
          .order('created_at', { ascending: false })
          .limit(50)
        
        console.log("Incidents data:", incidentsData);
        console.log("Incidents error:", incidentsError);
        
        if (incidentsError) {
          console.error("Error al cargar incidencias:", incidentsError);
          setIncidents([]); // Fallback a array vacío en caso de error
        } else {
          // Mapear los datos al formato esperado por el frontend
          const mappedIncidents: Incident[] = (incidentsData || []).map((incident: any, index: number) => {
            // Verificar que el objeto tenga las propiedades necesarias
            const propertyName = incident.properties?.name || 
                               (Array.isArray(incident.properties) && incident.properties[0]?.name) || 
                               'Propiedad desconocida';
            
            return {
              id: incident.id || '',
              title_spanish: incident.title_spanish || 'Sin título',
              title_english: incident.title_english || '',
              date: incident.created_at || new Date().toISOString(),
              status: (incident.status === 'resolved' ? 'resolved' : 'pending') as "resolved" | "pending",
              property_id: incident.property_id || '',
              property_name: propertyName,
              category: incident.category || 'other',  // Mantener valor original de DB
              description: incident.description || '',
              phone_number: incident.phone_number || '',
              // ✅ Asegurar que las conversaciones se preserven correctamente
              conversation_body_spanish: typeof incident.conversation_body_spanish === 'string' ? incident.conversation_body_spanish.trim() : '',
              conversation_body_english: typeof incident.conversation_body_english === 'string' ? incident.conversation_body_english.trim() : ''
            };
          });
          
          setIncidents(mappedIncidents);
        }
        
        // Cargar reservas (manuales + sincronizadas)
        try {
          console.log("🔄 Cargando reservas...");
          const reservationsData = await reservationService.getReservations();
          console.log("✅ Reservas cargadas:", reservationsData.length);
          setReservations(reservationsData);
        } catch (reservationsError) {
          console.error("❌ Error al cargar reservas:", reservationsError);
          setReservations([]); // Fallback a array vacío en caso de error
        }

        // Cargar minutos ahorrados de ElevenLabs
        try {
          console.log("🔄 Cargando minutos ahorrados...");
          const savedMinutesData = await agentService.getCurrentMonthSavedMinutes();
          console.log("✅ Minutos ahorrados cargados:", savedMinutesData);
          setSavedMinutes(savedMinutesData);
        } catch (agentError) {
          console.error("❌ Error al cargar minutos ahorrados:", agentError);
          setSavedMinutes(0);
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
  }, [selectedCategory, selectedProperty, selectedStatus]);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      // Redirigir a la landing page después de cerrar sesión exitosamente
      navigate("/");
    } catch (error) {
      console.error(t("errors.signOut"), error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mapeo directo de nuestras 10 categorías hardcodeadas a claves de traducción
  const getCategoryTranslationKey = (dbCategory: string): string => {
    // Para nuestras categorías nuevas, usar directamente el nombre de la categoría
    if (INCIDENT_CATEGORIES.includes(dbCategory as any) || dbCategory === "all") {
      return dbCategory;
    }
    
    // Fallback para categorías legacy que puedan existir en la DB
    const legacyCategoryKeyMap: Record<string, string> = {
      "Check-in": "checkin",
      "Conversation Summary": "others",
      "Property Info": "others", 
      "Property Information": "others",
      "Property Issue": "maintenance",
      "Propriety Issue": "maintenance",  // Fix typo
      "Propriety Info": "others",   // Fix typo  
      "Reservation Issue": "others",
      "Restaurant Recommendation": "others",
      "Richiesta immagini": "others",  // Italiano
      "Tourist Information": "others",
      "emergency": "emergency",
      "other": "others"
    };
    
    return legacyCategoryKeyMap[dbCategory] || "others";
  };

  // Función para obtener etiqueta de categoría traducida
  const getLabel = (category: string): string => {
    const translationKey = getCategoryTranslationKey(category);
    
    // Caso especial para "all"
    if (category === "all") {
      return language === 'es' ? 'Todas' : 'All';
    }
    
    const translated = t(`dashboard.incidents.categories.${translationKey}`);
    
    // Si la traducción no existe, usar fallback simple
    if (!translated || translated.includes('dashboard.incidents.categories')) {
      // Fallback básico para categorías que no estén traducidas
      return translationKey.charAt(0).toUpperCase() + translationKey.slice(1);
    }
    
    return translated;
  };

  // Obtener categorías disponibles usando las constantes definidas
  const getAvailableCategories = (): string[] => {
    // Usar las categorías definidas en lugar de las categorías presentes en los datos
    // Esto garantiza consistencia y permite filtrar por categorías aunque no haya incidencias
    return ["all", ...INCIDENT_CATEGORIES];
  };

  // Función para obtener los meses disponibles basados en las fechas de las incidencias
  const getAvailableMonths = (): { value: string; label: string }[] => {
    // Obtener fechas únicas de las incidencias
    const uniqueMonths = Array.from(new Set(
      incidents.map(incident => {
        const date = new Date(incident.date);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      })
    )).sort().reverse(); // Ordenar más recientes primero
    
    // Convertir a formato legible usando la función de dateUtils para localización automática
    return uniqueMonths.map(monthValue => {
      const [year, month] = monthValue.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      const locale = language === 'es' ? 'es-ES' : 'en-US';
      
      // Usar getMonthName de dateUtils para manejo automático de localización
      const monthName = date.toLocaleDateString(locale, { month: 'long' });
      
      return {
        value: monthValue,
        label: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`
      };
    });
  };

  // Las categorías ahora se traducen dinámicamente con getLabel()

  // Fallback status labels
  const fallbackStatusLabels = {
    resolved: "Resuelto",
    pending: "Pendiente"
  };

  // Fallback for section titles and labels
  const fallbackLabels = {
    incidentsTitle: "Incidencias Recientes",
    pendingLabel: "Pendientes",
    resolutionRateLabel: "Tasa de Resolución",
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
    
    // Filtro por mes
    const monthMatch = selectedMonth === "all" || (() => {
      const incidentDate = new Date(incident.date);
      const incidentMonth = `${incidentDate.getFullYear()}-${String(incidentDate.getMonth() + 1).padStart(2, '0')}`;
      return incidentMonth === selectedMonth;
    })();
    
    // Todos los filtros deben coincidir
    return categoryMatch && propertyMatch && statusMatch && monthMatch;
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
    setSelectedMonth("all");
  };

  // Función para verificar si hay filtros activos
  const hasActiveFilters = selectedCategory !== "all" || selectedProperty !== "all" || selectedStatus !== "all" || selectedMonth !== "all";

  // Funciones para manejar modal de conversación
  const handleTitleClick = (incident: Incident) => {
    console.log('🐛 handleTitleClick - incident:', incident);
    console.log('🐛 conversation_body_spanish:', incident.conversation_body_spanish);
    console.log('🐛 conversation_body_english:', incident.conversation_body_english);
    
    const conversationBody = getIncidentConversation(incident);
    console.log('🐛 getIncidentConversation result:', conversationBody);
    
    // ✅ Lógica más permisiva: abrir modal si hay CUALQUIER contenido
    if (conversationBody && conversationBody.length > 0) {
      setSelectedConversation({
        title: getIncidentTitle(incident),
        body: conversationBody
      });
      setIsConversationModalOpen(true);
    } else {
      // ✅ Fallback: usar descripción si no hay conversación
      const fallbackContent = incident.description || 'No hay contenido de conversación disponible';
      console.log('🐛 Using fallback content:', fallbackContent);
      
      if (fallbackContent && fallbackContent.trim().length > 0) {
        setSelectedConversation({
          title: getIncidentTitle(incident),
          body: fallbackContent
        });
        setIsConversationModalOpen(true);
      }
    }
  };

  const closeConversationModal = () => {
    setIsConversationModalOpen(false);
    setSelectedConversation(null);
  };

  // Funciones para manejar modal de propiedades
  const handlePropertyClick = async (property: Property) => {
    setSelectedPropertyDetails({ property, documents: [] });
    setIsPropertyModalOpen(true);
    setIsLoadingDocuments(true);

    try {
      // Obtener documentos de la propiedad
      const documents = await documentService.getDocumentsByProperty(property.id);
      setSelectedPropertyDetails({ property, documents });
    } catch (error) {
      console.error("Error al cargar documentos:", error);
      // Si hay error, mantener el modal abierto pero sin documentos
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const closePropertyModal = () => {
    setIsPropertyModalOpen(false);
    setSelectedPropertyDetails(null);
  };

  // Función para manejar la navegación a gestionar propiedad
  const handleManageProperty = (propertyId: string) => {
    // Cerrar el modal actual
    closePropertyModal();
    // Navegar a la página de propiedades con el parámetro para editar
    navigate(`/properties?edit=${propertyId}`);
  };

  // Hook para manejar el bloqueo del scroll cuando hay modales abiertos
  const isAnyModalOpen = isConversationModalOpen || isPropertyModalOpen;
  useBodyScrollLock(isAnyModalOpen);

  // Efecto para cerrar modales con tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isConversationModalOpen) {
          closeConversationModal();
        }
        if (isPropertyModalOpen) {
          closePropertyModal();
        }
      }
    };

    if (isAnyModalOpen) {
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isConversationModalOpen, isPropertyModalOpen, isAnyModalOpen]);

  // Tipos para mensajes de chat
  interface ChatMessage {
    sender: 'usuario' | 'agente';
    text: string;
    timestamp?: string;
  }

  // Función para parsear conversaciones en mensajes individuales (bilingüe)
  const parseConversation = (conversationText: string): ChatMessage[] => {
    if (!conversationText?.trim()) return [];

    const messages: ChatMessage[] = [];
    
    // Detectar si es formato estructurado en español o inglés
    const hasSpanishFormat = conversationText.includes('Usuario:') || conversationText.includes('Agente:');
    const hasEnglishFormat = conversationText.includes('User:') || conversationText.includes('Agent:');
    
    if (hasSpanishFormat || hasEnglishFormat) {
      // Usar el patrón correcto según el idioma detectado
      const pattern = hasSpanishFormat 
        ? /(Usuario:|Agente:)/g 
        : /(User:|Agent:)/g;
      
      const parts = conversationText.split(pattern);
      
      let currentSender: 'usuario' | 'agente' | null = null;
      
      for (let i = 1; i < parts.length; i += 2) {
        const delimiter = parts[i];
        const text = parts[i + 1]?.trim();
        
        // Mapear tanto español como inglés a los valores internos
        if (delimiter === 'Usuario:' || delimiter === 'User:') {
          currentSender = 'usuario';
        } else if (delimiter === 'Agente:' || delimiter === 'Agent:') {
          currentSender = 'agente';
        }
        
        if (currentSender && text) {
          messages.push({
            sender: currentSender,
            text: text
          });
        }
      }
    } else {
      // Texto plano - mostrar como mensaje del usuario
      messages.push({
        sender: 'usuario',
        text: conversationText.trim()
      });
    }
    
    return messages;
  };

    // Componente para renderizar cada mensaje como burbuja de chat
  const ChatBubble: React.FC<{ 
    message: ChatMessage; 
    style?: React.CSSProperties;
  }> = ({ message, style }) => {
    const isUser = message.sender === 'usuario';
    
    return (
      <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div 
          className={`group max-w-xs lg:max-w-md px-5 py-4 rounded-2xl transition-all duration-300 hover:scale-105 ${
            isUser 
              ? 'text-white rounded-br-md shadow-lg' 
              : 'text-gray-800 border border-gray-100 rounded-bl-md shadow-md'
          }`}
          style={style || (isUser 
            ? { 
                background: 'linear-gradient(135deg, #ECA408 0%, #F59E0B 100%)',
                boxShadow: '0 4px 12px rgba(236, 164, 8, 0.25)'
              }
            : { 
                background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }
          )}
        >
          {/* Etiqueta del remitente con mejor diseño */}
          <div className={`text-xs font-semibold mb-2 ${
            isUser ? 'text-white/90' : 'text-gray-500'
          }`}>
            {message.sender === 'usuario' ? t('dashboard.incidents.chat.user') : t('dashboard.incidents.chat.agent')}
          </div>
          
          {/* Texto del mensaje con mejor tipografía */}
          <div className="text-sm leading-relaxed font-medium">
            {message.text}
          </div>
        </div>
      </div>
    );
  };

  // Componente Modal para mostrar conversación completa
  const ConversationModal = () => {
    if (!isConversationModalOpen || !selectedConversation) return null;

    // Parsear conversación en mensajes individuales
    const messages = parseConversation(selectedConversation.body);

    // Hook para gradientes dinámicos
    const { scrollRef, getUserBubbleStyle, getAgentBubbleStyle } = useScrollGradient();

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
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
          {/* Header estilo chat con gradiente naranja-amarillo */}
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#ECA408] to-[#F5B730] text-white rounded-t-lg shadow-lg">
            <div className="flex items-center space-x-3">
              {/* Avatar del chat */}
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 15v-4H8l4-6v4h3l-4 6z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {selectedConversation.title}
                </h3>
                <p className="text-white text-opacity-90 text-sm">
                  {messages.length} {t('dashboard.incidents.chat.messages')} • {t('dashboard.incidents.chat.hostHelper')}
                </p>
              </div>
            </div>
                          <button
                onClick={closeConversationModal}
                className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-10"
              >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Chat Area con scroll dinámico */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100 p-6" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f3f4f6' fill-opacity='0.3'%3E%3Ccircle cx='5' cy='5' r='5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          >
            {messages.length > 0 ? (
              <div className="space-y-2">
                {messages.map((message, index) => (
                  <ChatBubble 
                    key={index} 
                    message={message} 
                    style={message.sender === 'usuario' ? getUserBubbleStyle() : getAgentBubbleStyle()}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                  </svg>
                                     <p>{t('dashboard.incidents.chat.noMessages')}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer estilo chat */}
          <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
                             <span>{t('dashboard.incidents.chat.conversationCompleted')}</span>
             </div>
             <button
               onClick={closeConversationModal}
               className="px-6 py-2 bg-gradient-to-r from-[#ECA408] to-[#F5B730] text-white rounded-lg hover:from-[#D69E07] hover:to-[#E6A42A] transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
             >
               {t('dashboard.incidents.chat.closeChat')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Componente Modal para mostrar detalles de propiedad
  const PropertyDetailsModal = () => {
    if (!isPropertyModalOpen || !selectedPropertyDetails) return null;

    const { property, documents } = selectedPropertyDetails;

    // Manejar click outside para cerrar modal
    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        closePropertyModal();
      }
    };

    // Obtener icono según el tipo de documento
    const getDocumentIcon = (type: string) => {
      switch (type) {
        case 'house_rules':
          return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l-5.5 9h11z"/>
              <circle cx="17.5" cy="17.5" r="4.5"/>
              <path d="M3 13.5h8v8H3z"/>
            </svg>
          );
        case 'inventory':
          return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          );
        case 'faq':
          return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
            </svg>
          );
        case 'guide':
          return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
            </svg>
          );
        default:
          return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          );
      }
    };

    // Función para abrir documento en nueva pestaña
    const openDocument = (url: string) => {
      window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleOverlayClick}
      >
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-primary-500 text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              {/* Avatar de propiedad */}
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {property.name}
                </h3>
                <p className="text-white text-opacity-90 text-sm">
                  {property.address}
                </p>
              </div>
            </div>
            <button
              onClick={closePropertyModal}
              className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Imagen de la propiedad */}
            {property.image && (
              <div className="mb-6">
                <img 
                  src={property.image} 
                  alt={property.name}
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
              </div>
            )}

             {/* Descripción */}
             {property.description && (
               <div className="mb-6">
                 <h4 className="text-lg font-semibold text-gray-900 mb-2">
                   {t('dashboard.propertyDetails.description')}
                 </h4>
                 <p className="text-gray-700">{property.description}</p>
               </div>
             )}

             {/* Documentos */}
             <div>
               <h4 className="text-lg font-semibold text-gray-900 mb-4">
                 {t('dashboard.propertyDetails.documents')} ({documents.length})
               </h4>
               
               {isLoadingDocuments ? (
                 <div className="flex items-center justify-center py-8">
                   <LoadingInline 
                     message={t('dashboard.propertyDetails.loadingDocuments')}
                     size={LoadingSize.MD}
                     variant={LoadingVariant.PRIMARY}
                     direction="horizontal"
                   />
                 </div>
              ) : documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <div 
                      key={doc.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => openDocument(doc.file_url)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          doc.type === 'house_rules' ? 'bg-blue-100 text-blue-600' :
                          doc.type === 'inventory' ? 'bg-green-100 text-green-600' :
                          doc.type === 'faq' ? 'bg-purple-100 text-purple-600' :
                          doc.type === 'guide' ? 'bg-orange-100 text-orange-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {getDocumentIcon(doc.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-900 truncate">
                            {doc.name}
                          </h5>
                                                     <p className="text-sm text-gray-500 mt-1">
                             {t(`dashboard.propertyDetails.documentTypes.${doc.type}`) || t('dashboard.propertyDetails.documentTypes.other')}
                           </p>
                          {doc.description && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {doc.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                                     <p className="text-gray-500">{t('dashboard.propertyDetails.noDocuments')}</p>
                 </div>
               )}
             </div>
           </div>
           
           {/* Footer */}
           <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-white rounded-b-lg">
             <button
               onClick={() => handleManageProperty(property.id)}
               className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
             >
               {t('dashboard.propertyDetails.manageProperty')}
             </button>
             <button
               onClick={closePropertyModal}
               className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
             >
               {t('dashboard.propertyDetails.close')}
             </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
  
    
    return (
      <LoadingScreen
        message={t("common.loadingData") || "Cargando datos del dashboard..."}
        subtext={t("common.loadingSubtext") || "Esto solo tomará unos segundos"}
        showLogo={false}
        gradient={true}
        data-testid="dashboard-loading"
      />
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
            pendingReservations={getCurrentReservationsCount(reservations)}
            totalReservations={reservations.length}
            pendingIncidents={incidents.filter(i => i.status === "pending").length}
            resolutionRate={resolutionRate}
            savedMinutes={savedMinutes}
          />
        </div>

        {/* Gráfico de uso del agente */}
        <div className="mb-6">
          <AgentUsageAreaChart />
        </div>

        {/* Propiedades */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {t("dashboard.properties.title")}
            </h2>
            {/* Botones de navegación para móviles */}
            {properties.length > 1 && (
              <div className="flex gap-2 sm:hidden">
                <button
                  onClick={() => {
                    const container = document.getElementById('properties-container');
                    if (container) {
                      container.scrollBy({ left: -container.clientWidth, behavior: 'smooth' });
                    }
                  }}
                  className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                  aria-label="Ver propiedades anteriores"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const container = document.getElementById('properties-container');
                    if (container) {
                      container.scrollBy({ left: container.clientWidth, behavior: 'smooth' });
                    }
                  }}
                  className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                  aria-label="Ver propiedades siguientes"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          {/* Contenedor con scroll horizontal en móviles, grid en desktop */}
          <div 
            id="properties-container"
            className="flex gap-3 overflow-x-auto scrollbar-hide sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {properties.length > 0 ? (
              properties.map((property) => (
                <div
                  key={property.id}
                  className="bg-white shadow-sm rounded-lg overflow-hidden flex flex-col sm:flex-row h-full w-full flex-shrink-0 sm:min-w-0 sm:w-auto"
                  style={{ scrollSnapAlign: 'start' }}
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
                      <button
                        onClick={() => handlePropertyClick(property)}
                        className="block w-full text-left text-base font-semibold text-gray-800 hover:text-primary-500 mb-1 transition-colors"
                      >
                        {property.name}
                      </button>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {property.address}
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          'bg-green-100 text-green-800'
                        }`}
                      >
                        {t('dashboard.propertyDetails.active')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white shadow-sm rounded-lg p-4 text-center w-full flex-shrink-0 sm:min-w-0 sm:col-span-full sm:w-auto">
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
          
          {/* Chips-resumen de filtros activos (solo móvil) */}
          <FilterChips
            filters={{
              property: selectedProperty,
              category: selectedCategory,
              status: selectedStatus,
              month: selectedMonth,
            }}
            onOpenFilters={() => setIsMobileFiltersOpen(true)}
          />

          {/* Toolbar de filtros - Desktop */}
          <div className="hidden md:block bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
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
                    {getText("dashboard.incidents.filters.allStatus", language === 'es' ? 'Todos' : 'All')}
                  </option>
                  <option value="pending">
                    {getStatusLabel("pending")}
                  </option>
                  <option value="resolved">
                    {getStatusLabel("resolved")}
                  </option>
                </select>
              </div>

              {/* Selector de Mes */}
              <div className="flex-1 lg:flex-none lg:min-w-[160px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText("dashboard.incidents.filters.month", "Mes")}
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  <option value="all">
                    {getText("dashboard.incidents.filters.allMonths", "Todos los meses")}
                  </option>
                  {getAvailableMonths().map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* FAB para abrir filtros en móvil */}
          <MobileFiltersButton onOpen={() => setIsMobileFiltersOpen(true)} isActive={hasActiveFilters} />

          {/* Panel de filtros en móvil (reutiliza los mismos selectores) */}
          <MobileFiltersSheet
            isOpen={isMobileFiltersOpen}
            onClose={() => setIsMobileFiltersOpen(false)}
            onApply={() => { /* no altera lógica; selectores ya actualizan estado */ }}
            onClear={clearAllFilters}
            title={getText("dashboard.incidents.filters.title", "Filtros")}
          >
            <div className="space-y-4">
              {/* Selector de Propiedades */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText("dashboard.incidents.table.property", fallbackLabels.tableProperty)}
                </label>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">{getText("dashboard.incidents.filters.allProperties", fallbackLabels.allProperties)}</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>{property.name}</option>
                  ))}
                </select>
              </div>

              {/* Selector de Categorías */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText("dashboard.incidents.table.category", fallbackLabels.tableCategory)}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">{getLabel("all")}</option>
                  {getAvailableCategories().filter(c => c !== "all").map((category) => (
                    <option key={category} value={category}>{getLabel(category)}</option>
                  ))}
                </select>
              </div>

              {/* Selector de Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText("dashboard.incidents.table.status", fallbackLabels.tableStatus)}
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">{getText("dashboard.incidents.filters.allStatus", language === 'es' ? 'Todos' : 'All')}</option>
                  <option value="pending">{getStatusLabel("pending")}</option>
                  <option value="resolved">{getStatusLabel("resolved")}</option>
                </select>
              </div>

              {/* Selector de Mes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText("dashboard.incidents.filters.month", "Mes")}
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">{getText("dashboard.incidents.filters.allMonths", "Todos los meses")}</option>
                  {getAvailableMonths().map((month) => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </MobileFiltersSheet>

          {/* Métricas minimalistas - todo en una línea */}
          <div className="mb-4">
            <MinimalIncidentMetrics 
              pendingIncidents={pendingIncidentsCount}
              resolutionRate={resolutionRate}
            />
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
                              getIncidentConversation(incident) && getIncidentConversation(incident).trim() 
                                ? 'cursor-pointer hover:text-blue-600 transition-colors' 
                                : ''
                            }`}
                            title={getIncidentConversation(incident) && getIncidentConversation(incident).trim() 
                              ? `${getIncidentTitle(incident)} (Click para ver conversación completa)` 
                              : getIncidentTitle(incident)
                            }
                            onClick={() => handleTitleClick(incident)}
                          >
                            <span>{getIncidentTitle(incident)}</span>
                            {getIncidentConversation(incident) && getIncidentConversation(incident).trim() && (
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
                          ? `${getText("dashboard.incidents.noIncidents", fallbackLabels.noIncidents)} ${getText("dashboard.incidents.filters.withSelectedFilters", language === 'es' ? 'con los filtros seleccionados' : 'with the selected filters')}`
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
      
      {/* Modal de detalles de propiedad */}
      <PropertyDetailsModal />
    </div>
  );
};

export default DashboardPage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@services/supabase';
import { useAuth } from '@shared/contexts/AuthContext';
import { useLanguage } from '@shared/contexts/LanguageContext';
import DashboardNavigation from './DashboardNavigation';
import DashboardLanguageSelector from './DashboardLanguageSelector';

type Property = {
  id: string;
  name: string;
  address: string;
  image?: string;
  status: 'active' | 'inactive';
};

type Reservation = {
  id: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  property_id: string;
  property_name: string;
};

// Tipos de categorías de incidencias según el PRD
type IncidentCategory = 'check-in-out' | 'property-issue' | 'tourist-info' | 'emergency' | 'other';

type Incident = {
  id: string;
  title: string;
  date: string;
  status: 'resolved' | 'pending';
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
  const [selectedCategory, setSelectedCategory] = useState<IncidentCategory | 'all'>('all');
  
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
        id: '1',
        name: 'Apartamento Centro',
        address: 'Calle Mayor 10, Madrid',
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        status: 'active'
      },
      {
        id: '2',
        name: 'Casa de Playa',
        address: 'Paseo Marítimo 23, Barcelona',
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        status: 'active'
      }
    ];
    
    // Simular reservas de ejemplo
    const mockReservations: Reservation[] = [
      {
        id: '101',
        guest_name: 'Carlos Rodríguez',
        check_in: '2025-04-15',
        check_out: '2025-04-20',
        status: 'confirmed',
        property_id: '1',
        property_name: 'Apartamento Centro'
      },
      {
        id: '102',
        guest_name: 'Laura Martínez',
        check_in: '2025-04-05',
        check_out: '2025-04-10',
        status: 'pending',
        property_id: '2',
        property_name: 'Casa de Playa'
      }
    ];
    
    // Simular incidencias de ejemplo con categorías
    const mockIncidents: Incident[] = [
      {
        id: '201',
        title: 'Problemas con el agua caliente',
        date: '2025-03-25',
        status: 'resolved',
        property_id: '1',
        property_name: 'Apartamento Centro',
        category: 'property-issue',
        description: 'El huésped reportó que el agua caliente no funciona en el baño principal.'
      },
      {
        id: '202',
        title: 'WiFi no funciona',
        date: '2025-03-28',
        status: 'pending',
        property_id: '2',
        property_name: 'Casa de Playa',
        category: 'property-issue',
        description: 'El router parece tener problemas de conexión.'
      },
      {
        id: '203',
        title: 'Información sobre transporte público',
        date: '2025-03-27',
        status: 'resolved',
        property_id: '1',
        property_name: 'Apartamento Centro',
        category: 'tourist-info',
        description: 'El huésped solicitó información sobre cómo llegar al centro desde el alojamiento.'
      },
      {
        id: '204',
        title: 'Problema con el check-in',
        date: '2025-03-29',
        status: 'pending',
        property_id: '2',
        property_name: 'Casa de Playa',
        category: 'check-in-out',
        description: 'El huésped no pudo acceder al sistema de check-in automático.'
      }
    ];
    
    setProperties(mockProperties);
    setReservations(mockReservations);
    setIncidents(mockIncidents);
  }, []);
  
  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Mapeo de categorías para mostrar nombres amigables
  const categoryLabels: Record<IncidentCategory | 'all', string> = {
    'all': t('dashboard.incidents.categories.all'),
    'check-in-out': t('dashboard.incidents.categories.checkInOut'),
    'property-issue': t('dashboard.incidents.categories.propertyIssue'),
    'tourist-info': t('dashboard.incidents.categories.touristInfo'),
    'emergency': t('dashboard.incidents.categories.emergency'),
    'other': t('dashboard.incidents.categories.other')
  };

  // Función para filtrar incidencias según la categoría seleccionada
  const filteredIncidents = selectedCategory === 'all'
    ? incidents
    : incidents.filter(incident => incident.category === selectedCategory);
    
  // Calcular el número de incidencias pendientes
  const pendingIncidentsCount = incidents.filter(incident => incident.status === 'pending').length;
  
  // Calcular la tasa de resolución
  const resolvedIncidentsCount = incidents.filter(incident => incident.status === 'resolved').length;
  const resolutionRate = incidents.length > 0 
    ? Math.round((resolvedIncidentsCount / incidents.length) * 100) 
    : 0;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-indigo-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header con navegación */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-4 sm:mb-0">
            <Link to="/">
              <img 
                src="/imagenes/Logo_hosthelper_new.png" 
                alt="Host Helper AI Logo" 
                className="h-16 sm:h-36" 
              />
            </Link>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <DashboardLanguageSelector />
            <span className="text-gray-700 text-sm sm:text-base truncate max-w-[120px] sm:max-w-full">{user?.email}</span>
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 sm:px-4 py-1 sm:py-2 rounded-md text-sm transition duration-150 disabled:opacity-70"
            >
              {isLoading ? '...' : t('dashboard.menu.logout')}
            </button>
          </div>
        </div>
      </header>
      
      {/* Navegación secundaria */}
      <DashboardNavigation />
      
      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="bg-white shadow-sm rounded-lg p-3 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-4">{t('dashboard.welcome')}</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
            {t('dashboard.description')}
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 sm:p-4 text-yellow-700">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs sm:text-sm">
                  {t('dashboard.notice')}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Grid layout para estadísticas y acciones rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Propiedades */}
          <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">{t('dashboard.properties.title')}</h3>
            <div className="mt-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">{t('dashboard.properties.total')}</span>
                <span className="text-lg font-semibold">{properties.length}</span>
              </div>
              <div className="space-y-2">
                <Link
                  to="/properties"
                  className="block text-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md"
                >
                  {t('dashboard.properties.view')}
                </Link>
                <Link
                  to="/properties/add"
                  className="block text-center text-sm bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-md"
                >
                  {t('dashboard.properties.add')}
                </Link>
              </div>
            </div>
          </div>
          
          {/* Reservas */}
          <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">{t('dashboard.reservations.title')}</h3>
            <div className="mt-1">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                <span className="text-sm text-gray-600">{t('dashboard.reservations.upcoming')}</span>
                <span className="text-lg font-semibold">{reservations.filter(r => r.status === 'confirmed').length}</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                <span className="text-sm text-gray-600">{t('dashboard.reservations.pending')}</span>
                <span className="text-lg font-semibold">{reservations.filter(r => r.status === 'pending').length}</span>
              </div>
              <div className="mt-4">
                <Link
                  to="/reservations"
                  className="block text-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md"
                >
                  {t('dashboard.reservations.view')}
                </Link>
              </div>
            </div>
          </div>
          
          {/* Acciones rápidas */}
          <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">{t('dashboard.quickActions.title')}</h3>
            <div className="mt-1 space-y-2">
              <Link
                to="/messages"
                className="block text-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md"
              >
                {t('dashboard.quickActions.messages')}
              </Link>
              <Link
                to="/help"
                className="block text-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md"
              >
                {t('dashboard.quickActions.help')}
              </Link>
            </div>
          </div>
        </div>
        
        {/* Incidencias */}
        <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2 sm:mb-0">{t('dashboard.incidents.title')}</h3>
            <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {categoryLabels['all']}
              </button>
              {(Object.keys(categoryLabels) as Array<IncidentCategory | 'all'>)
                .filter(key => key !== 'all')
                .map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                      selectedCategory === category
                        ? 'bg-primary-100 text-primary-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                <span className="text-sm text-gray-600">{t('dashboard.incidents.pending')}</span>
                <span className="text-lg font-semibold">{pendingIncidentsCount}</span>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t('dashboard.incidents.resolutionRate')}</span>
                <span className="text-lg font-semibold">{resolutionRate}%</span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.incidents.table.title')}
                  </th>
                  <th scope="col" className="hidden sm:table-cell px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.incidents.table.property')}
                  </th>
                  <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.incidents.table.category')}
                  </th>
                  <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.incidents.table.status')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIncidents.length > 0 ? (
                  filteredIncidents.map((incident) => (
                    <tr key={incident.id}>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm">
                        <div className="truncate max-w-[150px] sm:max-w-full">{incident.title}</div>
                        <div className="text-xs text-gray-500 sm:hidden">{incident.property_name}</div>
                      </td>
                      <td className="hidden sm:table-cell px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                        {incident.property_name}
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {categoryLabels[incident.category]}
                        </span>
                      </td>
                      <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          incident.status === 'resolved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {incident.status === 'resolved' ? t('dashboard.incidents.table.resolved') : t('dashboard.incidents.table.pending')}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-2 sm:px-6 py-4 text-center text-sm text-gray-500">
                      {t('dashboard.incidents.noIncidents')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Registro Viajero SES */}
        <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">{t('dashboard.sesRegistration.title')}</h3>
          <p className="text-sm text-gray-600 mb-4">
            {t('dashboard.sesRegistration.description')}
          </p>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Link
              to="/ses-registration"
              className="text-center text-sm bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-md"
            >
              {t('dashboard.sesRegistration.register')}
            </Link>
            <a
              href="https://sede.policia.gob.es/portalCiudadano/sede_electronica/extranjeria/EX14.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md"
            >
              {t('dashboard.sesRegistration.downloadForm')}
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage; 
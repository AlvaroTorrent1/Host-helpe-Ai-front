import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import DashboardNavigation from '../components/DashboardNavigation';
import DashboardLanguageSelector from '../components/DashboardLanguageSelector';

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
      const { data } = await supabase.auth.getUser();
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/">
              <img 
                src="/imagenes/Logo_hosthelper_new.png" 
                alt="Host Helper AI Logo" 
                className="h-36" 
              />
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <DashboardLanguageSelector />
            <span className="text-gray-700">{user?.email}</span>
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm transition duration-150 disabled:opacity-70"
            >
              {isLoading ? 'Cerrando sesión...' : t('dashboard.menu.logout')}
            </button>
          </div>
        </div>
      </header>
      
      {/* Navegación secundaria */}
      <DashboardNavigation />
      
      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('dashboard.welcome')}</h2>
          <p className="text-gray-600 mb-4">
            {t('dashboard.description')}
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">
                  {t('dashboard.notice')}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Grid de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-gray-700 font-medium mb-4">{t('dashboard.properties.title')}</h3>
            <div className="text-3xl font-bold text-gray-900 mb-2">{properties.length}</div>
            <p className="text-gray-500 text-sm mb-4">{t('dashboard.properties.total')}</p>
            <Link 
              to="/dashboard/properties" 
              className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center"
            >
              {t('dashboard.properties.view')}
              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-gray-700 font-medium mb-4">{t('dashboard.reservations.title')}</h3>
            <div className="text-3xl font-bold text-gray-900 mb-2">{reservations.length}</div>
            <p className="text-gray-500 text-sm mb-4">{t('dashboard.reservations.confirmed')}</p>
            <Link 
              to="/dashboard/reservations" 
              className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center"
            >
              {t('dashboard.reservations.view')}
              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-gray-700 font-medium mb-4">{t('dashboard.registrations.title')}</h3>
            <div className="text-3xl font-bold text-gray-900 mb-2">3</div>
            <p className="text-gray-500 text-sm mb-4">{t('dashboard.registrations.pending')}</p>
            <Link 
              to="/dashboard/registrations" 
              className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center"
            >
              {t('dashboard.registrations.view')}
              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
        
        {/* Sección de acciones rápidas */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('dashboard.quickActions.title')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/dashboard/properties" className="bg-primary-50 text-primary-700 hover:bg-primary-100 p-4 rounded-lg text-center transition duration-150 flex flex-col items-center">
              <svg className="h-8 w-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>{t('dashboard.properties.add')}</span>
            </Link>
            <Link to="/dashboard/reservations" className="bg-primary-50 text-primary-700 hover:bg-primary-100 p-4 rounded-lg text-center transition duration-150 flex flex-col items-center">
              <svg className="h-8 w-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              <span>{t('dashboard.reservations.register')}</span>
            </Link>
            <button className="bg-primary-50 text-primary-700 hover:bg-primary-100 p-4 rounded-lg text-center transition duration-150">
              <svg className="h-8 w-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
              <span>{t('dashboard.quickActions.messages')}</span>
            </button>
            <button className="bg-primary-50 text-primary-700 hover:bg-primary-100 p-4 rounded-lg text-center transition duration-150">
              <svg className="h-8 w-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>{t('dashboard.quickActions.help')}</span>
            </button>
          </div>
        </div>
        
        {/* Incidencias y Registros SES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Panel de incidencias */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">{t('dashboard.incidents.title')}</h3>
              <div className="flex space-x-2">
                <select
                  className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value as IncidentCategory | 'all')}
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {filteredIncidents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t('dashboard.incidents.empty')}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredIncidents.slice(0, 3).map(incident => (
                  <div key={incident.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-gray-900">{incident.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        incident.status === 'resolved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {incident.status === 'resolved' 
                          ? t('dashboard.incidents.status.resolved') 
                          : t('dashboard.incidents.status.pending')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {incident.description || 'Sin descripción'}
                    </p>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>{incident.property_name}</span>
                      <span>{new Date(incident.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 text-right">
              <button className="text-primary-600 hover:text-primary-700 text-sm">
                {t('dashboard.incidents.viewAll')}
              </button>
            </div>
          </div>
          
          {/* Panel de Registro SES */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">{t('dashboard.ses.title')}</h3>
            </div>
            
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <div className="flex justify-between">
                  <h4 className="font-medium text-gray-900">Carlos Rodríguez</h4>
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-800">
                    {t('dashboard.ses.status.approved')}
                  </span>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Apartamento Centro</span>
                  <span>15/04/2025</span>
                </div>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <div className="flex justify-between">
                  <h4 className="font-medium text-gray-900">Laura Martínez</h4>
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-yellow-100 text-yellow-800">
                    {t('dashboard.ses.status.pending')}
                  </span>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Casa de Playa</span>
                  <span>05/04/2025</span>
                </div>
              </div>
              
              <div className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between">
                  <h4 className="font-medium text-gray-900">Miguel Fernández</h4>
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-800">
                    {t('dashboard.ses.status.error')}
                  </span>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Apartamento Centro</span>
                  <span>10/04/2025</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-right">
              <Link to="/ses-registration" className="text-primary-600 hover:text-primary-700 text-sm">
                {t('dashboard.registrations.manage')}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage; 
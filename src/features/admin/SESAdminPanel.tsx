// src/features/admin/SESAdminPanel.tsx
/**
 * Panel de Administración para SES Hospedajes
 * 
 * Permite a los gestores:
 * - Ver estadísticas de propiedades registradas vs no registradas
 * - Ver lista de propiedades listas para registrar
 * - Registrar múltiples propiedades a la vez (bulk registration)
 * - Ver comparación con lodgings existentes en el sistema
 * 
 * IMPORTANTE: Siempre presentar como "SES Hospedajes" (nunca mencionar Lynx)
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Property } from '../../types/property';
import { registerLodging, isPropertyReadyToRegister, listLodgings } from '../../services/lynx.functions';
import toast from 'react-hot-toast';

// Tipo para las estadísticas
interface SESStats {
  total: number;
  registered: number;
  notRegistered: number;
  readyToRegister: number;
  pendingValidation: number;
  active: number;
  rejected: number;
}

export const SESAdminPanel: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<SESStats>({
    total: 0,
    registered: 0,
    notRegistered: 0,
    readyToRegister: 0,
    pendingValidation: 0,
    active: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'ready' | 'registered'>('overview');
  const [bulkRegistering, setBulkRegistering] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [bulkResults, setBulkResults] = useState<{ success: number; errors: string[] }>({ success: 0, errors: [] });

  // Cargar propiedades del usuario actual
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    try {
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuario no autenticado');
        return;
      }

      // Obtener todas las propiedades del usuario
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading properties:', error);
        toast.error('Error al cargar propiedades');
        return;
      }

      setProperties(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Exception loading properties:', error);
      toast.error('Error inesperado al cargar propiedades');
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const calculateStats = (props: Property[]) => {
    const total = props.length;
    const registered = props.filter(p => p.lynx_lodging_id).length;
    const notRegistered = total - registered;
    const readyToRegister = props.filter(p => !p.lynx_lodging_id && isPropertyReadyToRegister(p)).length;
    const pendingValidation = props.filter(p => p.lynx_lodging_status === 'pending_validation').length;
    const active = props.filter(p => p.lynx_lodging_status === 'active').length;
    const rejected = props.filter(p => p.lynx_lodging_status === 'rejected').length;

    setStats({
      total,
      registered,
      notRegistered,
      readyToRegister,
      pendingValidation,
      active,
      rejected,
    });
  };

  // Obtener propiedades listas para registrar
  const getReadyProperties = () => {
    return properties.filter(p => !p.lynx_lodging_id && isPropertyReadyToRegister(p));
  };

  // Obtener propiedades registradas
  const getRegisteredProperties = () => {
    return properties.filter(p => p.lynx_lodging_id);
  };

  // Registrar todas las propiedades listas
  const handleBulkRegister = async () => {
    const readyProps = getReadyProperties();
    
    if (readyProps.length === 0) {
      toast.error('No hay propiedades listas para registrar');
      return;
    }

    // Pedir confirmación
    const confirmed = window.confirm(
      `¿Deseas registrar ${readyProps.length} propiedad(es) en SES Hospedajes?\n\n` +
      'Este proceso puede tardar varios segundos.'
    );

    if (!confirmed) return;

    setBulkRegistering(true);
    setBulkProgress({ current: 0, total: readyProps.length });
    setBulkResults({ success: 0, errors: [] });

    const results = { success: 0, errors: [] as string[] };

    // Procesar una por una (secuencial para evitar sobrecarga)
    for (let i = 0; i < readyProps.length; i++) {
      const prop = readyProps[i];
      setBulkProgress({ current: i + 1, total: readyProps.length });

      try {
        console.log(`Registrando ${i + 1}/${readyProps.length}: ${prop.name}`);
        const result = await registerLodging(prop.id);

        if (result.success) {
          results.success++;
        } else {
          results.errors.push(`${prop.name}: ${result.error || 'Error desconocido'}`);
        }
      } catch (error) {
        results.errors.push(`${prop.name}: Error inesperado`);
      }

      // Pequeña pausa entre requests para no saturar
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setBulkResults(results);
    setBulkRegistering(false);

    // Mostrar resumen
    if (results.success > 0) {
      toast.success(`✅ ${results.success} propiedad(es) registrada(s) exitosamente`);
    }
    if (results.errors.length > 0) {
      toast.error(`❌ ${results.errors.length} propiedad(es) con errores`);
    }

    // Recargar propiedades
    await loadProperties();
  };

  // Renderizar estadísticas
  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total de propiedades */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Propiedades</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Registradas (activas) */}
      <div className="bg-white p-6 rounded-lg shadow border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Registradas (Activas)</p>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Listas para registrar */}
      <div className="bg-white p-6 rounded-lg shadow border border-amber-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Listas para Registrar</p>
            <p className="text-3xl font-bold text-amber-600">{stats.readyToRegister}</p>
          </div>
          <div className="bg-amber-100 p-3 rounded-full">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Pendientes de validación */}
      <div className="bg-white p-6 rounded-lg shadow border border-yellow-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Pendiente Validación</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingValidation}</p>
          </div>
          <div className="bg-yellow-100 p-3 rounded-full">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizar tabs
  const renderTabs = () => (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'overview'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Resumen
        </button>
        <button
          onClick={() => setActiveTab('ready')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'ready'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Listas para Registrar ({stats.readyToRegister})
        </button>
        <button
          onClick={() => setActiveTab('registered')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'registered'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Registradas ({stats.registered})
        </button>
      </nav>
    </div>
  );

  // Renderizar lista de propiedades listas
  const renderReadyProperties = () => {
    const readyProps = getReadyProperties();

    if (readyProps.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No hay propiedades listas para registrar</p>
          <p className="text-sm text-gray-400 mt-2">Completa todos los datos requeridos en tus propiedades</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Botón de registro masivo */}
        <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div>
            <h3 className="font-semibold text-blue-900">Registro Masivo</h3>
            <p className="text-sm text-blue-700">Registra todas las propiedades listas de una vez</p>
          </div>
          <button
            onClick={handleBulkRegister}
            disabled={bulkRegistering}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {bulkRegistering ? 'Registrando...' : `Registrar Todas (${readyProps.length})`}
          </button>
        </div>

        {/* Progreso del registro masivo */}
        {bulkRegistering && (
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progreso</span>
              <span>{bulkProgress.current} de {bulkProgress.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Resultados del registro masivo */}
        {bulkResults.success > 0 || bulkResults.errors.length > 0 ? (
          <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
            <h4 className="font-semibold text-gray-900">Resultados del Registro Masivo</h4>
            {bulkResults.success > 0 && (
              <p className="text-sm text-green-600">✅ {bulkResults.success} propiedad(es) registrada(s) exitosamente</p>
            )}
            {bulkResults.errors.length > 0 && (
              <div className="text-sm text-red-600">
                <p className="font-medium">❌ {bulkResults.errors.length} error(es):</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  {bulkResults.errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}

        {/* Lista de propiedades */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propiedad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Licencia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provincia</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {readyProps.map((prop) => (
                <tr key={prop.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{prop.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prop.city}, {prop.province}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prop.tourism_license}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prop.province}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Renderizar lista de propiedades registradas
  const renderRegisteredProperties = () => {
    const registeredProps = getRegisteredProperties();

    if (registeredProps.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No hay propiedades registradas aún</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propiedad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Licencia</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Lodging</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {registeredProps.map((prop) => (
              <tr key={prop.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{prop.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prop.tourism_license}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    prop.lynx_lodging_status === 'active' ? 'bg-green-100 text-green-800' :
                    prop.lynx_lodging_status === 'pending_validation' ? 'bg-yellow-100 text-yellow-800' :
                    prop.lynx_lodging_status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {prop.lynx_lodging_status === 'active' ? '✓ Activa' :
                     prop.lynx_lodging_status === 'pending_validation' ? '⏳ Pendiente' :
                     prop.lynx_lodging_status === 'rejected' ? '✗ Rechazada' :
                     'Desconocido'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">{prop.lynx_lodging_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración SES</h1>
        <p className="text-gray-600">Gestiona el registro de tus propiedades en el sistema SES Hospedajes del Ministerio del Interior</p>
      </div>

      {/* Estadísticas */}
      {renderStats()}

      {/* Tabs */}
      {renderTabs()}

      {/* Contenido según tab activo */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Acerca de SES Hospedajes</h2>
              <p className="text-sm text-blue-800">
                El <strong>Sistema de Estadística de Servicios de Hospedaje (SES Hospedajes)</strong> es el sistema oficial del 
                <strong> Ministerio del Interior de España</strong> para el registro de viajeros según el <em>Real Decreto 933/2021</em>.
              </p>
              <p className="text-sm text-blue-800 mt-2">
                Todas las viviendas turísticas deben estar registradas y enviar los partes de viajeros obligatoriamente.
              </p>
            </div>
            {renderStats()}
          </div>
        )}
        {activeTab === 'ready' && renderReadyProperties()}
        {activeTab === 'registered' && renderRegisteredProperties()}
      </div>
    </div>
  );
};

export default SESAdminPanel;


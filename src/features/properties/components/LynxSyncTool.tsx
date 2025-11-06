// src/features/properties/components/LynxSyncTool.tsx
/**
 * Herramienta de Sincronización con Lynx Check-in
 * 
 * Permite a los gestores mapear sus propiedades de Host Helper
 * con los "lodgings" registrados en Lynx Check-in.
 * 
 * Este mapeo es necesario para enviar automáticamente los partes
 * de viajero al Ministerio del Interior a través de Lynx.
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// Tipos para propiedades y lodgings
interface Property {
  id: string;
  name: string;
  lynx_lodging_id: string | null;
}

interface LynxLodging {
  id: string;
  name: string;
  establishment: {
    address: string;
    city: string;
    province: string;
  };
}

export const LynxSyncTool: React.FC = () => {
  const { t } = useTranslation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [lodgings, setLodgings] = useState<LynxLodging[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Carga propiedades de Host Helper y lodgings de Lynx
   */
  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Cargar propiedades de Host Helper
      const { data: propsData, error: propsError } = await supabase
        .from('properties')
        .select('id, name, lynx_lodging_id')
        .order('name');

      if (propsError) {
        throw new Error(`Error cargando propiedades: ${propsError.message}`);
      }

      setProperties(propsData || []);

      // 2. Llamar Edge Function para obtener lodgings de Lynx
      const { data: lynxData, error: lynxError } = await supabase.functions.invoke(
        'lynx-list-lodgings'
      );

      if (lynxError) {
        throw new Error(`Error obteniendo lodgings de Lynx: ${lynxError.message}`);
      }

      if (lynxData?.lodgings) {
        setLodgings(lynxData.lodgings);
      } else {
        throw new Error('No se pudieron obtener los lodgings de Lynx');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Error cargando datos'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Vincula una propiedad con un lodging de Lynx
   */
  const linkPropertyToLodging = async (propertyId: string, lodgingId: string) => {
    try {
      setSyncing(true);

      // Actualizar la propiedad con el lynx_lodging_id
      const { error } = await supabase
        .from('properties')
        .update({ lynx_lodging_id: lodgingId || null })
        .eq('id', propertyId);

      if (error) {
        throw new Error(`Error vinculando propiedad: ${error.message}`);
      }

      // Actualizar estado local
      setProperties(prev =>
        prev.map(prop =>
          prop.id === propertyId
            ? { ...prop, lynx_lodging_id: lodgingId || null }
            : prop
        )
      );

      toast.success(
        lodgingId 
          ? '✓ Propiedad vinculada con Lynx' 
          : 'Vinculación eliminada'
      );
    } catch (error) {
      console.error('Error linking property:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Error vinculando propiedad'
      );
    } finally {
      setSyncing(false);
    }
  };

  /**
   * Encuentra el nombre del lodging vinculado
   */
  const getLodgingName = (lodgingId: string | null): string => {
    if (!lodgingId) return '';
    const lodging = lodgings.find(l => l.id === lodgingId);
    return lodging?.name || lodgingId;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Sincronizar con Lynx Check-in
        </h2>
        <p className="text-gray-600">
          Vincula tus propiedades con los alojamientos registrados en Lynx Check-in
          para enviar automáticamente los partes de viajero al Ministerio del Interior.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-700">
            {properties.length}
          </div>
          <div className="text-sm text-blue-600">
            Propiedades en Host Helper
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-700">
            {properties.filter(p => p.lynx_lodging_id).length}
          </div>
          <div className="text-sm text-green-600">
            Propiedades vinculadas
          </div>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-700">
            {lodgings.length}
          </div>
          <div className="text-sm text-orange-600">
            Lodgings en Lynx
          </div>
        </div>
      </div>

      {/* List of properties */}
      <div className="space-y-4">
        {properties.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay propiedades para vincular
          </div>
        ) : (
          properties.map(property => (
            <div
              key={property.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Property info */}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">
                    {property.name}
                  </h3>
                  
                  {/* Status badge */}
                  {property.lynx_lodging_id ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Vinculado
                      </span>
                      <span className="text-sm text-gray-600">
                        {getLodgingName(property.lynx_lodging_id)}
                      </span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      ⚠ Sin vincular
                    </span>
                  )}
                </div>

                {/* Lodging selector */}
                <div className="flex-1 max-w-md">
                  <select
                    value={property.lynx_lodging_id || ''}
                    onChange={(e) => linkPropertyToLodging(property.id, e.target.value)}
                    disabled={syncing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Seleccionar Lodging de Lynx --</option>
                    {lodgings.map(lodging => (
                      <option key={lodging.id} value={lodging.id}>
                        {lodging.name} - {lodging.establishment.city}
                      </option>
                    ))}
                  </select>
                  
                  {/* Lodging details */}
                  {property.lynx_lodging_id && (
                    <div className="mt-2 text-xs text-gray-500">
                      {(() => {
                        const lodging = lodgings.find(l => l.id === property.lynx_lodging_id);
                        return lodging ? (
                          <>
                            {lodging.establishment.address}, {lodging.establishment.city}
                          </>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Help text */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-bold text-blue-900 mb-2">
          ℹ️ ¿Cómo funciona?
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>1. Cada propiedad de Host Helper debe vincularse con un lodging de Lynx</li>
          <li>2. Cuando un turista completa el check-in, los datos se guardan en Host Helper</li>
          <li>3. Si la propiedad está vinculada, se envían automáticamente a Lynx Check-in</li>
          <li>4. Lynx transmite los datos al Ministerio del Interior (SES.hospedajes)</li>
          <li>5. El gestor puede ver el estado del envío en el dashboard de partes de viajero</li>
        </ul>
      </div>

      {/* Refresh button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={loadData}
          disabled={loading || syncing}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          🔄 Actualizar datos
        </button>
      </div>
    </div>
  );
};

export default LynxSyncTool;















// src/features/properties/components/SESRegistrationPanel.tsx
// Panel para mostrar el estado de registro en SES Hospedajes (Ministerio del Interior)
// IMPORTANTE: Presentamos esto como conexión directa con SES, aunque técnicamente
// usamos un proveedor intermedio (transparente para el usuario)

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Property } from '../../../types/property';
import { registerLodging, getMissingFieldsForRegistration } from '../../../services/lynx.functions';

interface SESRegistrationPanelProps {
  property: Property;
  onSync?: () => void;
}

export const SESRegistrationPanel: React.FC<SESRegistrationPanelProps> = ({
  property,
  onSync
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Determinar el estado de registro en SES
  const getRegistrationStatus = () => {
    if (property.lynx_lodging_id && property.lynx_lodging_status === 'active') {
      return {
        status: 'registered',
        color: 'green',
        icon: '✓',
        label: 'Registrada en SES',
        description: 'Esta propiedad está correctamente registrada en el sistema SES Hospedajes del Ministerio del Interior.'
      };
    }
    
    if (property.lynx_lodging_id && property.lynx_lodging_status === 'pending_validation') {
      return {
        status: 'pending',
        color: 'yellow',
        icon: '⏳',
        label: 'Pendiente de validación',
        description: 'El registro en SES está pendiente de validación manual por parte del Ministerio.'
      };
    }
    
    if (property.lynx_lodging_id && property.lynx_lodging_status === 'rejected') {
      return {
        status: 'rejected',
        color: 'red',
        icon: '✗',
        label: 'Registro rechazado',
        description: 'El registro en SES fue rechazado. Verifica los datos de la licencia turística.'
      };
    }

    // No registrada
    return {
      status: 'not_registered',
      color: 'gray',
      icon: '○',
      label: 'No registrada en SES',
      description: 'Esta propiedad aún no está registrada en el sistema SES Hospedajes.'
    };
  };

  const status = getRegistrationStatus();

  // Verificar si tiene todos los datos necesarios para registrar
  // Solo validamos lo MÍNIMO requerido por Lynx API: name + 4 credenciales SES
  const hasRequiredData = () => {
    return !!(
      property.name &&
      property.ses_landlord_code &&
      property.ses_username &&
      property.ses_api_password &&
      property.ses_establishment_code
    );
  };

  const canRegister = status.status === 'not_registered' && hasRequiredData();

  // Handler para registrar la propiedad en SES Hospedajes
  const handleRegister = async () => {
    // Prevenir doble click
    if (isRegistering) return;

    // Validar que se puede registrar
    if (!canRegister) {
      const missing = getMissingFieldsForRegistration(property);
      toast.error(`No se puede registrar. Faltan: ${missing.join(', ')}`);
      return;
    }

    setIsRegistering(true);

    try {
      console.log('🚀 Iniciando registro en SES Hospedajes...', property.id);

      // Llamar al servicio de registro
      const result = await registerLodging(property.id);

      if (result.success) {
        // Registro exitoso
        const status = result.lodging?.status;
        
        if (status === 'active') {
          toast.success('✓ Propiedad registrada exitosamente en SES Hospedajes');
        } else if (status === 'pending_validation') {
          toast.success('⏳ Propiedad enviada. Pendiente de validación (24-48h)');
        } else {
          toast.success(result.message || 'Propiedad registrada en SES Hospedajes');
        }

        // Llamar a onSync para refrescar datos
        onSync?.();
      } else {
        // Error en el registro
        const errorMsg = result.details || result.error || 'Error al registrar propiedad';
        
        if (result.field) {
          toast.error(`Error: ${errorMsg}. Revisa el campo ${result.field}`);
        } else {
          toast.error(`Error al registrar: ${errorMsg}`);
        }
      }
    } catch (error) {
      console.error('❌ Exception registering property:', error);
      toast.error('Error inesperado al registrar. Inténtalo de nuevo.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header - siempre visible */}
      <div 
        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
          status.color === 'green' ? 'bg-green-50 border-l-4 border-l-green-500' :
          status.color === 'yellow' ? 'bg-yellow-50 border-l-4 border-l-yellow-500' :
          status.color === 'red' ? 'bg-red-50 border-l-4 border-l-red-500' :
          'bg-gray-50 border-l-4 border-l-gray-400'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`text-2xl ${
              status.color === 'green' ? 'text-green-600' :
              status.color === 'yellow' ? 'text-yellow-600' :
              status.color === 'red' ? 'text-red-600' :
              'text-gray-400'
            }`}>
              {status.icon}
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${
                status.color === 'green' ? 'text-green-900' :
                status.color === 'yellow' ? 'text-yellow-900' :
                status.color === 'red' ? 'text-red-900' :
                'text-gray-700'
              }`}>
                Estado de Registro SES
              </h3>
              <p className={`text-xs ${
                status.color === 'green' ? 'text-green-700' :
                status.color === 'yellow' ? 'text-yellow-700' :
                status.color === 'red' ? 'text-red-700' :
                'text-gray-500'
              }`}>
                {status.label}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Icono de SES Hospedajes */}
            <div className="bg-blue-100 p-2 rounded-full">
              <svg 
                className="w-5 h-5 text-blue-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                />
              </svg>
            </div>
            
            {/* Flecha de expandir/colapsar */}
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Contenido expandible */}
      {isExpanded && (
        <div className="p-4 bg-white border-t border-gray-200 space-y-4">
          {/* NOTA: Los IDs de Lynx (lynx_lodging_id, lynx_account_id) se mantienen en la BD
              para uso interno del sistema, pero NO se muestran al usuario porque son
              datos técnicos que no aportan valor desde su perspectiva. */}

          {/* Credenciales SES - OBLIGATORIAS */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-700 uppercase flex items-center">
              <span className="text-red-600 mr-1">*</span> Credenciales SES
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Código Arrendador:</span>
                <span className={`ml-2 ${property.ses_landlord_code ? 'text-green-600 font-medium' : 'text-red-500'}`}>
                  {property.ses_landlord_code ? '✓ Configurado' : '✗ Requerido'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Usuario SES:</span>
                <span className={`ml-2 ${property.ses_username ? 'text-green-600 font-medium' : 'text-red-500'}`}>
                  {property.ses_username ? '✓ Configurado' : '✗ Requerido'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Contraseña API:</span>
                <span className={`ml-2 ${property.ses_api_password ? 'text-green-600 font-medium' : 'text-red-500'}`}>
                  {property.ses_api_password ? '✓ Configurado' : '✗ Requerido'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Código Establecimiento:</span>
                <span className={`ml-2 ${property.ses_establishment_code ? 'text-green-600 font-medium' : 'text-red-500'}`}>
                  {property.ses_establishment_code ? '✓ Configurado' : '✗ Requerido'}
                </span>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="pt-3 border-t border-gray-200">
            {status.status === 'not_registered' && (
              <>
                {canRegister ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRegister();
                    }}
                    disabled={isRegistering}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {isRegistering ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Registrando...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Registrar en SES Hospedajes</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                    <p className="text-sm text-amber-800">
                      <strong>⚠️ Datos incompletos:</strong> Completa todos los campos requeridos en la propiedad antes de registrar en SES.
                    </p>
                  </div>
                )}
              </>
            )}

            {status.status === 'registered' && (
              <div className="space-y-2">
                {/* Botón Sincronizar */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSync?.();
                  }}
                  className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Sincronizar</span>
                </button>

                {/* Botón Re-registrar con Nuevas Credenciales */}
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    
                    // Confirmar con el usuario
                    if (!window.confirm(
                      '¿Re-registrar esta propiedad con las credenciales SES actuales?\n\n' +
                      'Esto creará una nueva authority connection y lodging en Lynx/SES.\n\n' +
                      'Útil si:\n' +
                      '• Cambiaron las credenciales SES\n' +
                      '• El registro anterior tiene errores\n' +
                      '• Quieres usar el nuevo flujo de registro'
                    )) {
                      return;
                    }

                    setIsRegistering(true);
                    
                    try {
                      console.log('🔄 Re-registrando propiedad con forceReregister=true');
                      
                      const result = await registerLodging(property.id, true);
                      
                      if (result.success) {
                        toast.success('✅ Propiedad re-registrada exitosamente con nuevas credenciales');
                        onSync?.(); // Refrescar datos
                      } else {
                        toast.error(result.error || 'Error al re-registrar');
                      }
                    } catch (error) {
                      console.error('Error re-registrando:', error);
                      toast.error('Error al re-registrar propiedad');
                    } finally {
                      setIsRegistering(false);
                    }
                  }}
                  disabled={isRegistering}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Re-registrar con credenciales SES actuales (crea nueva authority connection)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{isRegistering ? 'Re-registrando...' : 'Re-registrar con Nuevas Credenciales'}</span>
                </button>

                {/* Nota explicativa */}
                <p className="text-xs text-gray-500 text-center">
                  💡 Use "Re-registrar" si cambió credenciales SES o el registro anterior tiene problemas
                </p>
              </div>
            )}

            {(status.status === 'pending' || status.status === 'rejected') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSync?.();
                }}
                className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Actualizar Estado</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SESRegistrationPanel;


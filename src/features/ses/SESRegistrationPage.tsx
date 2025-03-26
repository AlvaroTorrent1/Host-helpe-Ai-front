import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SESStatusPanel from './SESStatusPanel';
import TravelerRegistrationForm from './TravelerRegistrationForm';
import { useAuth } from '@shared/contexts/AuthContext';
import DashboardNavigation from '@features/dashboard/DashboardNavigation';

interface TravelerFormData {
  firstName: string;
  lastName: string;
  documentType: 'dni' | 'nie' | 'passport';
  documentNumber: string;
  documentCountry: string;
  birthDate: string;
  nationality: string;
}

const SESRegistrationPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  
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
  
  const handleTravelerSubmit = (data: TravelerFormData) => {
    // En una implementación real, aquí enviaríamos los datos al backend
    console.log('Datos del viajero:', data);
    alert('Viajero registrado con éxito');
    setShowRegistrationForm(false);
  };
  
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
            <span className="text-gray-700">{user?.email}</span>
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm transition duration-150 disabled:opacity-70"
            >
              {isLoading ? 'Cerrando sesión...' : 'Cerrar sesión'}
            </button>
          </div>
        </div>
      </header>
      
      {/* Navegación secundaria */}
      <DashboardNavigation />
      
      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Registro de Viajeros (SES)</h1>
          <button
            onClick={() => setShowRegistrationForm(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md transition duration-150"
          >
            Nuevo Registro
          </button>
        </div>
        
        {showRegistrationForm ? (
          <TravelerRegistrationForm
            onSubmit={handleTravelerSubmit}
            onCancel={() => setShowRegistrationForm(false)}
          />
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Información Relevante</h2>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p>
                      <strong>Recuerda:</strong> Según la normativa española, es obligatorio registrar a todos los viajeros alojados en establecimientos turísticos. 
                      El sistema SES (Sistema de Entrada de Viajeros) permite realizar este trámite de forma electrónica.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Registro Obligatorio</h3>
                  <p className="text-sm text-gray-600">
                    Todos los viajeros mayores de edad deben ser registrados en el SES dentro de las 24 horas siguientes a su llegada.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Documentación</h3>
                  <p className="text-sm text-gray-600">
                    Se requiere un documento de identidad válido (DNI, NIE o pasaporte) para cada viajero.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Sanciones</h3>
                  <p className="text-sm text-gray-600">
                    El incumplimiento puede conllevar sanciones. Host Helper se encarga de automatizar este proceso.
                  </p>
                </div>
              </div>
            </div>
            
            <SESStatusPanel />
          </>
        )}
      </main>
    </div>
  );
};

export default SESRegistrationPage; 
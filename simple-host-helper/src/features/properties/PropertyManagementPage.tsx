import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@services/supabase';
import { useAuth } from '@shared/contexts/AuthContext';
import { Property } from '@/types/property';
import PropertyList from './PropertyList';
import PropertyForm from './PropertyForm';
import Modal from '@shared/components/Modal';
import DashboardNavigation from '@features/dashboard/DashboardNavigation';

const PropertyManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentProperty, setCurrentProperty] = useState<Property | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  // Cargar datos de simulación para el MVP
  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true);
      try {
        // En una implementación real, esto sería una llamada a Supabase:
        const { data, error } = await supabase.from('properties').select('*').eq('user_id', user?.id);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setProperties(data);
        } else {
          // Usar datos simulados si no hay datos en Supabase
          const mockProperties: Property[] = [
            {
              id: '1',
              name: 'Apartamento Centro',
              address: 'Calle Mayor 10, Madrid',
              image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
              status: 'active',
              description: 'Hermoso apartamento en el centro de Madrid, cerca de todas las atracciones turísticas.',
              amenities: ['WiFi', 'Cocina', 'TV', 'Aire acondicionado'],
              created_at: '2025-02-15T12:00:00Z',
              additional_images: [
                {
                  id: 'img1',
                  property_id: '1',
                  file_url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
                  description: 'Zona de trabajo con escritorio amplio y vista a la calle',
                  uploaded_at: '2025-02-15T12:30:00Z'
                },
                {
                  id: 'img2',
                  property_id: '1',
                  file_url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
                  description: 'Cocina completamente equipada con todos los utensilios necesarios',
                  uploaded_at: '2025-02-15T12:35:00Z'
                }
              ],
              documents: [
                {
                  id: 'doc1',
                  property_id: '1',
                  type: 'faq',
                  name: 'Preguntas frecuentes',
                  file_url: '#',
                  description: 'Respuestas a las preguntas más comunes sobre el apartamento, como instrucciones para el wifi, recomendaciones locales y servicios cercanos.',
                  uploaded_at: '2025-02-15T14:00:00Z',
                  file_type: 'pdf'
                },
                {
                  id: 'doc2',
                  property_id: '1',
                  type: 'house_rules',
                  name: 'Reglas de la casa',
                  file_url: '#',
                  description: 'Normas del edificio, horarios de silencio, instrucciones para la recogida de basuras y normas de convivencia.',
                  uploaded_at: '2025-02-15T14:10:00Z',
                  file_type: 'doc'
                }
              ]
            },
            {
              id: '2',
              name: 'Casa de Playa',
              address: 'Paseo Marítimo 23, Barcelona',
              image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
              status: 'active',
              description: 'Bonita casa frente al mar en Barcelona, perfecta para familias.',
              amenities: ['WiFi', 'Cocina', 'Piscina', 'Parking'],
              created_at: '2025-01-20T10:30:00Z',
              additional_images: [
                {
                  id: 'img3',
                  property_id: '2',
                  file_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
                  description: 'Vista panorámica de la playa desde la terraza',
                  uploaded_at: '2025-01-20T11:00:00Z'
                },
                {
                  id: 'img4',
                  property_id: '2',
                  file_url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
                  description: 'Piscina privada con tumbonas y sombrillas',
                  uploaded_at: '2025-01-20T11:05:00Z'
                },
                {
                  id: 'img5',
                  property_id: '2',
                  file_url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
                  description: 'Instrucciones para usar la barbacoa exterior',
                  uploaded_at: '2025-01-20T11:10:00Z'
                }
              ],
              documents: [
                {
                  id: 'doc3',
                  property_id: '2',
                  type: 'guide',
                  name: 'Guía de la casa',
                  file_url: '#',
                  description: 'Instrucciones detalladas sobre el funcionamiento de los electrodomésticos, sistema de calefacción, aire acondicionado, y otros equipamientos de la casa.',
                  uploaded_at: '2025-01-20T12:00:00Z',
                  file_type: 'pdf'
                },
                {
                  id: 'doc4',
                  property_id: '2',
                  type: 'faq',
                  name: 'Preguntas frecuentes',
                  file_url: '#',
                  description: 'Respuestas a consultas habituales sobre restaurantes cercanos, actividades en la zona, transporte público y servicios médicos.',
                  uploaded_at: '2025-01-20T12:15:00Z',
                  file_type: 'doc'
                },
                {
                  id: 'doc5',
                  property_id: '2',
                  type: 'inventory',
                  name: 'Inventario completo',
                  file_url: '#',
                  description: 'Listado detallado de todos los muebles, equipamiento de cocina, ropa de cama y otros elementos disponibles para los huéspedes.',
                  uploaded_at: '2025-01-20T12:30:00Z',
                  file_type: 'txt'
                }
              ]
            }
          ];
          
          setProperties(mockProperties);
        }
      } catch (error) {
        console.error('Error al cargar propiedades:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProperties();
  }, [user]);

  // Manejar apertura del modal para añadir nueva propiedad
  const handleAddProperty = () => {
    setCurrentProperty(undefined);
    setModalOpen(true);
  };

  // Manejar edición de propiedad
  const handleEditProperty = (property: Property) => {
    setCurrentProperty(property);
    setModalOpen(true);
  };

  // Manejar apertura del modal de confirmación de eliminación
  const handleDeleteClick = (property: Property) => {
    setPropertyToDelete(property);
    setDeleteModalOpen(true);
  };

  // Manejar eliminación de propiedad
  const handleDeleteProperty = async () => {
    if (!propertyToDelete) return;
    
    setIsSubmitting(true);
    try {
      // En una implementación real:
      // await supabase.from('properties').delete().eq('id', propertyToDelete.id);
      
      // Simulación de borrado
      setProperties(prev => prev.filter(p => p.id !== propertyToDelete.id));
      setDeleteModalOpen(false);
      setPropertyToDelete(null);
    } catch (error) {
      console.error('Error al eliminar propiedad:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar envío del formulario (crear/actualizar)
  const handleSubmitProperty = async (propertyData: Omit<Property, 'id'>) => {
    setIsSubmitting(true);
    try {
      if (currentProperty) {
        // Actualizar propiedad existente
        const { data, error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', currentProperty.id)
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setProperties(prev => 
            prev.map(p => p.id === currentProperty.id ? data[0] : p)
          );
        }
      } else {
        // Crear nueva propiedad
        const { data, error } = await supabase
          .from('properties')
          .insert({
            ...propertyData,
            user_id: user?.id,
            created_at: new Date().toISOString()
          })
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setProperties(prev => [...prev, data[0]]);
        }
      }
      
      setModalOpen(false);
    } catch (error) {
      console.error('Error al guardar propiedad:', error);
      alert('Hubo un error al guardar la propiedad. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header con navegación */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/">
              <img 
                src="/imagenes/Logo_hosthelper.png" 
                alt="Host Helper AI Logo" 
                className="h-36" 
              />
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-700">
              Dashboard
            </Link>
            <span className="text-gray-700">{user?.email}</span>
          </div>
        </div>
      </header>
      
      {/* Navegación secundaria */}
      <DashboardNavigation />
      
      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Migas de pan */}
        <nav className="mb-6">
          <ol className="flex space-x-2 text-sm text-gray-500">
            <li>
              <Link to="/dashboard" className="hover:text-primary-600">Dashboard</Link>
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li className="text-gray-800 font-medium">Propiedades</li>
          </ol>
        </nav>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-t-4 border-b-4 border-primary-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <PropertyList
            properties={properties}
            onEdit={handleEditProperty}
            onDelete={handleDeleteClick}
            onAdd={handleAddProperty}
          />
        )}
      </main>
      
      {/* Modal para crear/editar propiedad */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={currentProperty ? "Editar propiedad" : "Añadir propiedad"}
        size="lg"
      >
        <PropertyForm
          property={currentProperty}
          onSubmit={handleSubmitProperty}
          onCancel={() => setModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
      
      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar eliminación"
        size="sm"
      >
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Eliminar propiedad</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                ¿Estás seguro de que deseas eliminar la propiedad "{propertyToDelete?.name}"? Esta acción no se puede deshacer.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={handleDeleteProperty}
            disabled={isSubmitting}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Eliminando...' : 'Eliminar'}
          </button>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(false)}
            disabled={isSubmitting}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Cancelar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default PropertyManagementPage; 
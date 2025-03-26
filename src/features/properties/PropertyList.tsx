import React, { useState } from 'react';
import { Property } from '@/types/property';
import PropertyCard from './PropertyCard';
import PropertyDetail from './PropertyDetail';
import Modal from '@shared/components/Modal';

interface PropertyListProps {
  properties: Property[];
  onEdit: (property: Property) => void;
  onDelete: (property: Property) => void;
  onAdd: () => void;
}

const PropertyList: React.FC<PropertyListProps> = ({ 
  properties, 
  onEdit, 
  onDelete,
  onAdd
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [search, setSearch] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Filtrar propiedades basado en el estado y búsqueda
  const filteredProperties = properties.filter(property => {
    // Filtrar por estado
    if (filter !== 'all' && property.status !== filter) {
      return false;
    }
    
    // Filtrar por término de búsqueda
    if (search && !property.name.toLowerCase().includes(search.toLowerCase()) && 
        !property.address.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Manejar clic en una propiedad para ver detalles
  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
  };

  // Cerrar el modal de detalles
  const handleCloseDetail = () => {
    setSelectedProperty(null);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Tus Propiedades</h2>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona todas tus propiedades desde aquí
          </p>
        </div>
        
        <button
          onClick={onAdd}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Añadir propiedad
        </button>
      </div>
      
      {/* Filtros y búsqueda */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              filter === 'all'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              filter === 'active'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Activas
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              filter === 'inactive'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Inactivas
          </button>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar propiedades..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
      </div>
      
      {/* Lista de propiedades */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay propiedades</h3>
          <p className="mt-1 text-sm text-gray-500">
            {search || filter !== 'all' 
              ? 'No hay resultados que coincidan con tus filtros.' 
              : 'Comienza añadiendo tu primera propiedad.'}
          </p>
          {!search && filter === 'all' && (
            <div className="mt-6">
              <button
                onClick={onAdd}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Añadir propiedad
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={() => handleViewProperty(property)}
            />
          ))}
        </div>
      )}

      {/* Modal de detalle de propiedad */}
      {selectedProperty && (
        <Modal 
          isOpen={!!selectedProperty} 
          onClose={handleCloseDetail}
          title=""
          size="xl"
          noPadding
        >
          <PropertyDetail 
            property={selectedProperty} 
            onEdit={onEdit} 
            onClose={handleCloseDetail}
          />
        </Modal>
      )}
    </div>
  );
};

export default PropertyList; 
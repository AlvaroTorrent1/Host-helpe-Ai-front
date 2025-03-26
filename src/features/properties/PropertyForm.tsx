import React, { useState, useEffect } from 'react';
import { Property, PropertyImage, PropertyDocument } from '../../types/property';
import PropertyImagesForm from './PropertyImagesForm';
import PropertyDocumentsForm from './PropertyDocumentsForm';

interface PropertyFormProps {
  property?: Property;
  onSubmit: (property: Omit<Property, 'id'>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const PropertyForm: React.FC<PropertyFormProps> = ({
  property,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<Omit<Property, 'id'>>({
    name: '',
    address: '',
    status: 'active',
    additional_images: [],
    documents: []
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 3;

  // Cargar datos de la propiedad si estamos en modo edición
  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name,
        address: property.address,
        status: property.status,
        image: property.image,
        description: property.description,
        amenities: property.amenities,
        additional_images: property.additional_images || [],
        documents: property.documents || []
      });
      
      if (property.image) {
        setImagePreview(property.image);
      }
    }
  }, [property]);

  // Manejar cambios en inputs de texto
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error de validación si se corrige
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Manejar cambios en checkboxes (amenities)
  const _handleAmenityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    setFormData(prev => {
      const currentAmenities = prev.amenities || [];
      
      if (checked) {
        // Agregar amenidad
        return {
          ...prev,
          amenities: [...currentAmenities, value]
        };
      } else {
        // Quitar amenidad
        return {
          ...prev,
          amenities: currentAmenities.filter(amenity => amenity !== value)
        };
      }
    });
  };

  // Manejar subida de imagen principal
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
      setValidationErrors(prev => ({
        ...prev,
        image: 'El archivo debe ser una imagen (JPG, PNG, GIF)'
      }));
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      setValidationErrors(prev => ({
        ...prev,
        image: 'La imagen debe ser menor a 5MB'
      }));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setFormData(prev => ({
        ...prev,
        image: result
      }));
    };
    reader.readAsDataURL(file);
    
    // Limpiar error si había
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.image;
      return newErrors;
    });
  };

  // Validar el formulario antes de enviar
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'El nombre es obligatorio';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'La dirección es obligatoria';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // Enviar formulario - los documentos temporales se procesarán en PropertyManagement
        onSubmit(formData);
      } catch {
        // Manejar el error de manera silenciosa para no interrumpir el flujo
      }
    }
  };

  // Manejar cambios en imágenes adicionales
  const handleAdditionalImagesChange = (images: PropertyImage[]) => {
    setFormData(prev => ({
      ...prev,
      additional_images: images
    }));
  };

  // Manejar cambios en documentos
  const handleDocumentsChange = (documents: PropertyDocument[]) => {
    setFormData(prev => ({
      ...prev,
      documents: documents
    }));
  };

  // Navegar a siguiente paso
  const handleNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  // Navegar a paso anterior
  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Renderizar paso actual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre de la propiedad *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  validationErrors.name ? 'border-red-500' : ''
                }`}
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Dirección *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  validationErrors.address ? 'border-red-500' : ''
                }`}
              />
              {validationErrors.address && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.address}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Imagen principal
              </label>
              <div className="mt-1 flex items-center">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Vista previa" 
                      className="h-32 w-48 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, image: undefined }));
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex-shrink-0">
                    <div className="h-32 w-48 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                )}
                
                <label htmlFor="image-upload" className="ml-4 cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  Subir imagen
                  <input
                    id="image-upload"
                    name="image"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              {validationErrors.image && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.image}</p>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <PropertyImagesForm 
            images={formData.additional_images}
            onChange={handleAdditionalImagesChange}
          />
        );
      case 3:
        return (
          <PropertyDocumentsForm
            propertyId={property?.id || 'temp'}
            documents={formData.documents}
            onChange={handleDocumentsChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Indicador de pasos */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium text-gray-500">
              Paso {currentStep} de {totalSteps}
            </div>
            <div className="text-xs font-medium text-gray-500">
              {currentStep === 1 ? 'Información básica' : currentStep === 2 ? 'Imágenes adicionales' : 'Documentos'}
            </div>
          </div>
          <div className="overflow-hidden rounded-full bg-gray-200">
            <div 
              className="h-2 rounded-full bg-primary-600" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {renderCurrentStep()}

      <div className="flex justify-between space-x-3 mt-6">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handlePreviousStep}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Anterior
          </button>
        )}
        
        <div className="flex-grow"></div>
        
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancelar
        </button>
        
        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Siguiente
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar propiedad'}
          </button>
        )}
      </div>
    </form>
  );
};

export default PropertyForm; 
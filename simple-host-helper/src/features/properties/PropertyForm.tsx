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

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Borrar error de validación cuando el usuario corrige
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Manejar cambios en la imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validar tipo y tamaño
    if (!file.type.match('image.*')) {
      setValidationErrors(prev => ({ 
        ...prev, 
        image: 'El archivo debe ser una imagen (JPG, PNG, etc.)' 
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
    
    // Crear URL para preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setFormData(prev => ({ ...prev, image: result }));
    };
    reader.readAsDataURL(file);
    
    // Borrar error si existía
    if (validationErrors.image) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.image;
        return newErrors;
      });
    }
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
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
                  validationErrors.name ? 'border-red-300' : ''
                }`}
                placeholder="Ej. Apartamento Centro Madrid"
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
                  validationErrors.address ? 'border-red-300' : ''
                }`}
                placeholder="Ej. Calle Gran Vía 27, Madrid"
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
                placeholder="Describe brevemente tu propiedad"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
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
                      className="h-32 w-40 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, image: undefined }));
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md"
                      title="Eliminar imagen"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-300"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
                <div className="ml-5">
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="image-upload"
                      className="relative cursor-pointer rounded-md bg-white font-medium text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 hover:text-primary-500"
                    >
                      <span>{imagePreview ? 'Cambiar imagen' : 'Subir imagen'}</span>
                      <input
                        id="image-upload"
                        name="image-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 5MB</p>
                </div>
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
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Anterior
          </button>
        )}

        <div className="flex-1"></div>

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Cancelar
        </button>

        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Siguiente
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
        )}
      </div>
    </form>
  );
};

export default PropertyForm; 
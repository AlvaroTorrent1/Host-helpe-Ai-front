import React, { useState, useEffect } from "react";
import {
  Property,
  PropertyImage,
  PropertyDocument,
} from "../../types/property";
import PropertyImagesForm from "./PropertyImagesForm";
import PropertyDocumentsForm from "./PropertyDocumentsForm";
import { useLanguage } from "@shared/contexts/LanguageContext";

interface PropertyFormProps {
  property?: Property;
  propertyName?: string; // Para pasar a PropertyDocumentsForm
  onSubmit: (property: Omit<Property, "id">) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const PropertyForm: React.FC<PropertyFormProps> = ({
  property,
  propertyName,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Omit<Property, "id">>({
    name: "",
    address: "",
    additional_images: [],
    google_business_profile_url: undefined, // Campo legacy, se mantiene por compatibilidad
  });

  // Estado separado para documentos (no se guardan en Property)
  const [temporaryDocuments, setTemporaryDocuments] = useState<PropertyDocument[]>([]);
  
  // Estado para múltiples links de Google Business
  const [googleBusinessUrls, setGoogleBusinessUrls] = useState<string[]>([""]);

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;
  const [isIntentionalSubmit, setIsIntentionalSubmit] = useState<boolean>(false);

  // Log temporal para debug
  useEffect(() => {
    console.log(`📍 PropertyForm - Paso actual: ${currentStep}, Submit intencional: ${isIntentionalSubmit}`);
  }, [currentStep, isIntentionalSubmit]);

  // Cargar datos de la propiedad si estamos en modo edición
  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name,
        address: property.address,
        image: property.image,
        description: property.description,
        amenities: property.amenities,
        additional_images: property.additional_images || [],
        google_business_profile_url: property.google_business_profile_url || undefined,
      });

      // Si hay URL legacy, añadirla a la lista
      if (property.google_business_profile_url) {
        setGoogleBusinessUrls([property.google_business_profile_url]);
      }
    }
  }, [property]);

  // Efecto para establecer automáticamente la imagen de portada
  useEffect(() => {
    // Solo establecer imagen de portada automáticamente en modo creación
    if (!property && formData.additional_images && formData.additional_images.length > 0) {
      const firstImage = formData.additional_images[0];
      if (firstImage.file_url && !formData.image) {
        console.log("🖼️ Estableciendo automáticamente la primera imagen como portada:", firstImage.file_url);
        setFormData(prev => ({
          ...prev,
          image: firstImage.file_url
        }));
      }
    }
  }, [formData.additional_images, property, formData.image]);

  // Manejar cambios en inputs de texto
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error de validación si se corrige
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Manejar cambios en checkboxes (amenities)
  const _handleAmenityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;

    setFormData((prev) => {
      const currentAmenities = prev.amenities || [];

      if (checked) {
        // Agregar amenidad
        return {
          ...prev,
          amenities: [...currentAmenities, value],
        };
      } else {
        // Quitar amenidad
        return {
          ...prev,
          amenities: currentAmenities.filter((amenity) => amenity !== value),
        };
      }
    });
  };

  // Validar el formulario antes de enviar
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = t("properties.form.validation.nameRequired");
    }

    if (!formData.address.trim()) {
      errors.address = t("properties.form.validation.addressRequired");
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Log de debug para entender qué está disparando el submit
    console.log('🚨 handleSubmit llamado!', {
      currentStep,
      isIntentionalSubmit,
      event: e.type,
      target: e.target,
      timeStamp: e.timeStamp
    });

    // VERIFICACIÓN DE SEGURIDAD: Solo permitir submit si es intencional
    if (!isIntentionalSubmit) {
      console.log('❌ Submit bloqueado - No es intencional');
      return;
    }

    // Verificar que estamos en el último paso
    if (currentStep !== totalSteps) {
      console.log('❌ Submit bloqueado - No estamos en el último paso');
      return;
    }

    // Solo proceder con la validación y envío cuando se hace clic en el botón de guardar
    if (validateForm()) {
      try {
        // Log detallado antes de enviar
        console.log("Enviando formulario con los siguientes datos:");
        console.log(`Nombre: ${formData.name}`);
        console.log(`Dirección: ${formData.address}`);
        console.log(`Total de imágenes: ${formData.additional_images?.length || 0}`);
        console.log(`Documentos temporales (para webhook): ${temporaryDocuments.length}`);
        console.log(`URLs Google Business: ${googleBusinessUrls.filter(url => url).length}`);
        
        // Pasar datos del formulario junto con información adicional
        const submitData = {
          ...formData,
          // Mantener el primer URL por compatibilidad legacy
          google_business_profile_url: googleBusinessUrls.find(url => url) || undefined,
          // Pasar documentos y URLs como datos adicionales (no parte de Property)
          _temporaryDocuments: temporaryDocuments,
          _googleBusinessUrls: googleBusinessUrls.filter(url => url),
        };
        
        onSubmit(submitData as any);
        
        // Resetear el flag después de enviar
        setIsIntentionalSubmit(false);
      } catch (error) {
        console.error("Error al enviar formulario:", error);
        setIsIntentionalSubmit(false);
      }
    }
  };

  // Manejar cambios en imágenes adicionales
  const handleAdditionalImagesChange = (images: PropertyImage[]) => {
    setFormData((prev) => ({
      ...prev,
      additional_images: images,
    }));
  };

  // Manejar cambios en documentos (ahora temporales)
  const handleDocumentsChange = (documents: PropertyDocument[]) => {
    setTemporaryDocuments(documents);
  };

  // Manejar cambios en URLs de Google Business
  const handleGoogleBusinessUrlChange = (index: number, value: string) => {
    const newUrls = [...googleBusinessUrls];
    newUrls[index] = value;
    setGoogleBusinessUrls(newUrls);
  };

  // Añadir nueva URL de Google Business
  const addGoogleBusinessUrl = () => {
    setGoogleBusinessUrls([...googleBusinessUrls, ""]);
  };

  // Eliminar URL de Google Business
  const removeGoogleBusinessUrl = (index: number) => {
    const newUrls = googleBusinessUrls.filter((_, i) => i !== index);
    setGoogleBusinessUrls(newUrls.length > 0 ? newUrls : [""]);
  };

  // Prevenir envío del formulario cuando se presiona Enter en campos específicos
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevenir envío automático del formulario
    }
  };

  // Navegación entre pasos
  const nextStep = () => {
    if (currentStep < totalSteps) {
      // Pequeño delay para evitar doble clics
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        // Asegurarse de que el flag de submit está en false
        setIsIntentionalSubmit(false);
      }, 100);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Renderizar contenido del paso actual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                {t("properties.form.fields.name")} *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder={t("properties.form.placeholders.name")}
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                {t("properties.form.fields.address")} *
              </label>
              <input
                type="text"
                name="address"
                id="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder={t("properties.form.placeholders.address")}
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                {t("properties.form.fields.description")}
              </label>
              <textarea
                name="description"
                id="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder={t("properties.form.placeholders.description")}
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            {/* Información sobre imagen de portada */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                  <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Imagen de portada automática
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      La primera imagen que subas en la siguiente pestaña se convertirá automáticamente en la imagen de portada de la propiedad.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            {/* Mostrar preview de imagen de portada si existe */}
            {formData.image && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-green-800">
                      Imagen de portada establecida
                    </h3>
                    <div className="mt-2 flex items-center space-x-3">
                      <img
                        src={formData.image}
                        alt="Imagen de portada"
                        className="h-16 w-20 object-cover rounded-md border"
                      />
                      <p className="text-sm text-green-700">
                        Esta será la imagen principal que se mostrará en las listas de propiedades.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          <PropertyImagesForm
            images={formData.additional_images}
            onChange={handleAdditionalImagesChange}
          />
          </div>
        );
      case 3:
        return (
          <PropertyDocumentsForm
            propertyId={property?.id || "temp"}
            propertyName={propertyName || formData.name || "Propiedad"}
            documents={temporaryDocuments}
            onChange={handleDocumentsChange}
          />
        );
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Enlaces de Google Business
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Añade los enlaces a los perfiles de Google Business de tu propiedad. 
                Estos enlaces se guardarán como enlaces compartibles para uso en mensajería.
              </p>
            </div>
            
            <div className="space-y-4">
              {googleBusinessUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
              <label
                      htmlFor={`google_business_url_${index}`}
                      className="block text-sm font-medium text-gray-700"
              >
                      {index === 0 ? "URL principal" : `URL adicional ${index}`}
              </label>
              <input
                type="url"
                      id={`google_business_url_${index}`}
                      value={url}
                      onChange={(e) => handleGoogleBusinessUrlChange(index, e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="https://maps.google.com/maps?cid=..."
                    />
                  </div>
                  {googleBusinessUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGoogleBusinessUrl(index)}
                      className="mt-6 inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addGoogleBusinessUrl}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Añadir otro enlace
              </button>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Los enlaces se guardarán como enlaces compartibles que podrás usar en WhatsApp, 
                    Telegram y otras plataformas de mensajería.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Renderizar botones de acción según el paso actual
  const renderActionButtons = () => {
    return (
      <div className="pt-5">
        <div className="flex justify-between">
        <div>
          {currentStep > 1 && (
            <button
              type="button"
                onClick={prevStep}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {t("properties.form.buttons.previous")}
            </button>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
              {t("properties.form.buttons.cancel")}
          </button>

          {currentStep < totalSteps ? (
            <button
              type="button"
                onClick={nextStep}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {t("properties.form.buttons.next")}
            </button>
          ) : (
            <button
                type="submit"
              disabled={isSubmitting}
                onClick={() => {
                  console.log('✅ Botón de crear/actualizar clickeado - Marcando como submit intencional');
                  setIsIntentionalSubmit(true);
                }}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
                {isSubmitting
                  ? t("properties.form.buttons.saving")
                  : property
                    ? t("properties.form.buttons.update")
                    : t("properties.form.buttons.create")}
            </button>
          )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <form 
        onSubmit={handleSubmit} 
        onKeyDown={(e) => {
          // Prevenir submit con Enter en TODO el formulario
          if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
            e.preventDefault();
            console.log('⚠️ Enter prevenido en:', e.target);
          }
        }}
        className="space-y-8 divide-y divide-gray-200"
      >
        <div className="space-y-8 divide-y divide-gray-200">
          <div>
            <div className="pb-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {property
                  ? t("properties.form.titles.edit")
                  : t("properties.form.titles.create")}
              </h3>
            </div>

            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`flex-1 ${step < 4 ? "mr-2" : ""}`}
                  >
                    <div
                      className={`h-2 rounded-full ${
                        step <= currentStep
                          ? "bg-primary-600"
                          : "bg-gray-200"
                      }`}
                    />
                    <p
                      className={`mt-2 text-xs text-center ${
                        step <= currentStep
                          ? "text-primary-600 font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {step === 1 && t("properties.form.steps.basic")}
                      {step === 2 && t("properties.form.steps.images")}
                      {step === 3 && t("properties.form.steps.documents")}
                      {step === 4 && t("properties.form.steps.google")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {renderCurrentStep()}
          </div>
        </div>

        {renderActionButtons()}
      </form>
    </>
  );
};

export default PropertyForm;

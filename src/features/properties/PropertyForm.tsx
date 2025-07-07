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
  onSubmit: (property: Omit<Property, "id">) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const PropertyForm: React.FC<PropertyFormProps> = ({
  property,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Omit<Property, "id">>({
    name: "",
    address: "",
    status: "active",
    additional_images: [],
    documents: [],
    google_business_profile_url: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;

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
        documents: property.documents || [],
        google_business_profile_url: property.google_business_profile_url || "",
      });

      if (property.image) {
        setImagePreview(property.image);
      }
    }
  }, [property]);

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

  // Manejar subida de imagen principal
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      setValidationErrors((prev) => ({
        ...prev,
        image: t("properties.form.validation.imageFormat"),
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      setValidationErrors((prev) => ({
        ...prev,
        image: t("properties.form.validation.imageSize"),
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setFormData((prev) => ({
        ...prev,
        image: result,
      }));
    };
    reader.readAsDataURL(file);

    // Limpiar error si había
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.image;
      return newErrors;
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

    // Solo proceder con la validación y envío cuando se hace clic en el botón de guardar
    if (validateForm()) {
      try {
        // Log detallado de los documentos antes de enviar
        console.log("Enviando formulario con los siguientes datos:");
        console.log(`Total de documentos: ${formData.documents?.length || 0}`);
        if (formData.documents && formData.documents.length > 0) {
          formData.documents.forEach((doc, index) => {
            console.log(`Documento ${index + 1}:`);
            console.log(`- ID: ${doc.id}`);
            console.log(`- Nombre: ${doc.name}`);
            console.log(`- Tipo: ${doc.type}`);
            console.log(`- Property ID: ${doc.property_id}`);
            console.log(`- Es temporal: ${doc.property_id === 'temp'}`);
          });
        }
        
        // Enviar formulario - los documentos temporales se procesarán en PropertyManagement
        onSubmit(formData);
      } catch (error) {
        console.error("Error al enviar formulario:", error);
        // Manejar el error de manera silenciosa para no interrumpir el flujo
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

  // Manejar cambios en documentos
  const handleDocumentsChange = (documents: PropertyDocument[]) => {
    setFormData((prev) => ({
      ...prev,
      documents: documents,
    }));
  };

  // Navegar a siguiente paso con validación de paso actual
  const handleNextStep = () => {
    // Para el paso 1, validar campos requeridos
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setValidationErrors(prev => ({ ...prev, name: t("properties.form.validation.nameRequired") }));
        return;
      }
      if (!formData.address.trim()) {
        setValidationErrors(prev => ({ ...prev, address: t("properties.form.validation.addressRequired") }));
        return;
      }
    }
    
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  // Navegar a paso anterior
  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Renderizar paso actual
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
                {t("properties.form.labels.name")} *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  validationErrors.name ? "border-red-500" : ""
                }`}
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                {t("properties.form.labels.address")} *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  validationErrors.address ? "border-red-500" : ""
                }`}
              />
              {validationErrors.address && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.address}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                {t("properties.form.labels.description")}
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description || ""}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700"
              >
                {t("properties.form.labels.status")}
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="active">{t("properties.status.active")}</option>
                <option value="inactive">{t("properties.status.inactive")}</option>
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
                      className="h-32 w-48 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData((prev) => ({ ...prev, image: undefined }));
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex-shrink-0">
                    <div className="h-32 w-48 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                      <svg
                        className="h-8 w-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                )}

                <label
                  htmlFor="image-upload"
                  className="ml-4 cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
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
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.image}
                </p>
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
            propertyId={property?.id || "temp"}
            documents={formData.documents}
            onChange={handleDocumentsChange}
          />
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("properties.form.labels.googleBusinessTitle")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("properties.form.labels.googleBusinessDescription")}
              </p>
            </div>
            
            <div>
              <label
                htmlFor="google_business_profile_url"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("properties.form.labels.googleBusinessUrl")}
              </label>
              <input
                type="url"
                id="google_business_profile_url"
                name="google_business_profile_url"
                value={formData.google_business_profile_url || ""}
                onChange={handleChange}
                placeholder={t("properties.form.labels.googleBusinessPlaceholder")}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  validationErrors.google_business_profile_url ? "border-red-500" : ""
                }`}
              />
              {validationErrors.google_business_profile_url && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.google_business_profile_url}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                {t("properties.form.labels.googleBusinessHelper")}
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Dividir el renderizado del botón final para evitar confusiones
  const renderActionButtons = () => {
    return (
      <div className="pt-5 border-t border-gray-200 flex justify-between items-center">
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePreviousStep}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {t("properties.form.buttons.previous")}
            </button>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {t("properties.buttons.cancel")}
          </button>
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {t("properties.form.buttons.next")}
            </button>
          ) : (
            <button
              type="button" 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSubmitting ? t("properties.form.buttons.saving") : t("properties.form.buttons.save")}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
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

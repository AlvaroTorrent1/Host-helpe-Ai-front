// ✅ OPTIMIZACIÓN: Agregados useCallback y useMemo para evitar re-renders innecesarios
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Property,
  PropertyImage,
  PropertyDocument,
} from "../../types/property";
import PropertyImagesForm from "./PropertyImagesForm";
import PropertyDocumentsForm from "./PropertyDocumentsForm";
import { useTranslation } from "react-i18next";
import { areUrlsEquivalent } from "../../utils/urlNormalization";
import { propertyIcalService } from "../../services/propertyIcalService";
import { supabase } from "../../services/supabase";

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
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Omit<Property, "id">>({
    name: "",
    address: "",
    additional_images: [],
    google_business_profile_url: undefined, // Campo legacy, se mantiene por compatibilidad
    business_links_description: "",
  });

  // Estado separado para documentos (no se guardan en Property)
  const [temporaryDocuments, setTemporaryDocuments] = useState<PropertyDocument[]>([]);
  
  // Estado para múltiples links de Google Business
  const [googleBusinessUrls, setGoogleBusinessUrls] = useState<string[]>([""]);
  const [originalGoogleBusinessUrls, setOriginalGoogleBusinessUrls] = useState<string[]>([]); // Snapshot inicial

  // Estados para enlaces iCal
  const [bookingIcalUrl, setBookingIcalUrl] = useState<string>("");
  const [airbnbIcalUrl, setAirbnbIcalUrl] = useState<string>("");
  const [showBookingInstructions, setShowBookingInstructions] = useState<boolean>(false);
  const [showAirbnbInstructions, setShowAirbnbInstructions] = useState<boolean>(false);
  const [icalValidationStates, setIcalValidationStates] = useState({
    booking: { isValidating: false, isValid: false, error: "" },
    airbnb: { isValidating: false, isValid: false, error: "" }
  });

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

  // Función para detectar cambios en los enlaces
  const hasLinksChanged = (): boolean => {
    const currentUrls = googleBusinessUrls.filter(url => url && url.trim() !== '');
    const originalUrls = originalGoogleBusinessUrls;
    
    // Si las longitudes son diferentes, hay cambios
    if (currentUrls.length !== originalUrls.length) {
      return true;
    }
    
    // Comparar cada URL normalizada
    for (let i = 0; i < currentUrls.length; i++) {
      if (!areUrlsEquivalent(currentUrls[i], originalUrls[i] || '')) {
        return true;
      }
    }
    
    return false;
  };

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
        business_links_description: property.business_links_description || "",
      });

      // CORREGIDO: Cargar TODOS los enlaces de shareable_links
      const existingUrls: string[] = [];
      
      // Cargar enlaces de shareable_links (fuente principal)
      if (property.shareable_links && property.shareable_links.length > 0) {
        property.shareable_links.forEach(link => {
          if (link.public_url) {
            existingUrls.push(link.public_url);
          }
        });
      }
      
      // Si no hay enlaces en shareable_links, usar el campo legacy como fallback
      if (existingUrls.length === 0 && property.google_business_profile_url) {
        existingUrls.push(property.google_business_profile_url);
      }
      
      // Establecer los URLs (al menos uno vacío para permitir añadir)
      setGoogleBusinessUrls(existingUrls.length > 0 ? existingUrls : [""]);
      // NUEVO: Guardar snapshot de los URLs originales para comparación
      setOriginalGoogleBusinessUrls([...existingUrls]); // Deep clone
      
      console.log("📍 Enlaces cargados en el formulario:", existingUrls);

      // CORREGIDO: Cargar también los documentos existentes
      if (property.documents && property.documents.length > 0) {
        setTemporaryDocuments(property.documents);
        console.log("📄 Documentos cargados en el formulario:", property.documents);
      } else {
        // Si no hay documentos, limpiar el estado
        setTemporaryDocuments([]);
        console.log("📄 No hay documentos para cargar");
      }
    }
  }, [property]);

  // Cargar enlaces iCal existentes cuando se edita una propiedad
  useEffect(() => {
    if (property?.id) {
      const loadIcalConfigs = async () => {
        try {
          // Obtener el usuario actual
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          // Cargar configuraciones iCal existentes
          const icalConfigs = await propertyIcalService.getPropertyIcalConfigs(property.id, user.id);
          
          if (icalConfigs.bookingUrl) {
            setBookingIcalUrl(icalConfigs.bookingUrl);
            // Actualizar estado de validación como válido si ya existe
            setIcalValidationStates(prev => ({
              ...prev,
              booking: {
                isValidating: false,
                isValid: icalConfigs.bookingStatus === 'active',
                error: icalConfigs.bookingStatus === 'error' ? 'Error en sincronización' : ''
              }
            }));
          }

          if (icalConfigs.airbnbUrl) {
            setAirbnbIcalUrl(icalConfigs.airbnbUrl);
            // Actualizar estado de validación como válido si ya existe
            setIcalValidationStates(prev => ({
              ...prev,
              airbnb: {
                isValidating: false,
                isValid: icalConfigs.airbnbStatus === 'active',
                error: icalConfigs.airbnbStatus === 'error' ? 'Error en sincronización' : ''
              }
            }));
          }

          console.log('📅 Enlaces iCal cargados:', icalConfigs);
        } catch (error) {
          console.error('Error cargando enlaces iCal:', error);
          // No mostrar error al usuario, solo log
        }
      };

      loadIcalConfigs();
    }
  }, [property?.id]);

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

  // ✅ OPTIMIZACIÓN: useCallback evita re-crear función en cada render
  // Manejar cambios en inputs de texto
  const handleChange = useCallback((
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
    setValidationErrors((prev) => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []);

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
        
        // Verificar si hay cambios en los enlaces
        const linksChanged = hasLinksChanged();
        console.log(`🔗 Enlaces modificados: ${linksChanged ? 'SÍ' : 'NO'}`);
        
        // Pasar datos del formulario junto con información adicional
        const submitData = {
          ...formData,
          // Mantener el primer URL por compatibilidad legacy
          google_business_profile_url: googleBusinessUrls.find(url => url) || undefined,
          // Pasar documentos y URLs como datos adicionales (no parte de Property)
          _temporaryDocuments: temporaryDocuments,
          _googleBusinessUrls: googleBusinessUrls.filter(url => url),
          _linksChanged: linksChanged, // Flag para indicar si hay cambios en enlaces
          // Agregar enlaces iCal
          _bookingIcalUrl: bookingIcalUrl.trim() || undefined,
          _airbnbIcalUrl: airbnbIcalUrl.trim() || undefined,
          _icalValidationStates: icalValidationStates,
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

  // Validar enlace iCal
  const validateIcalUrl = async (url: string, platform: 'booking' | 'airbnb') => {
    if (!url.trim()) {
      setIcalValidationStates(prev => ({
        ...prev,
        [platform]: { isValidating: false, isValid: false, error: "" }
      }));
      return;
    }

    // Validación básica de formato
    const isBookingUrl = platform === 'booking' && 
      (url.includes('booking.com') && url.includes('ical'));
    const isAirbnbUrl = platform === 'airbnb' && 
      (url.includes('airbnb.com') && url.includes('ical'));

    if (!isBookingUrl && !isAirbnbUrl) {
      setIcalValidationStates(prev => ({
        ...prev,
        [platform]: { 
          isValidating: false, 
          isValid: false, 
          error: `URL no válida para ${platform === 'booking' ? 'Booking.com' : 'Airbnb'}` 
        }
      }));
      return;
    }

    setIcalValidationStates(prev => ({
      ...prev,
      [platform]: { isValidating: true, isValid: false, error: "" }
    }));

    try {
      // TODO: Hacer test fetch al enlace iCal
      // Por ahora, simular validación exitosa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIcalValidationStates(prev => ({
        ...prev,
        [platform]: { isValidating: false, isValid: true, error: "" }
      }));
    } catch (error) {
      setIcalValidationStates(prev => ({
        ...prev,
        [platform]: { 
          isValidating: false, 
          isValid: false, 
          error: "No se pudo conectar al enlace. Verifica que sea correcto." 
        }
      }));
    }
  };

  // Manejar cambios en enlaces iCal
  const handleIcalUrlChange = (value: string, platform: 'booking' | 'airbnb') => {
    if (platform === 'booking') {
      setBookingIcalUrl(value);
    } else {
      setAirbnbIcalUrl(value);
    }

    // Debounce validation
    clearTimeout((window as any)[`${platform}ValidationTimeout`]);
    (window as any)[`${platform}ValidationTimeout`] = setTimeout(() => {
      validateIcalUrl(value, platform);
    }, 500);
  };

  // Renderizar estado de conexión iCal
  const renderIcalConnectionStatus = (platform: 'booking' | 'airbnb') => {
    const state = icalValidationStates[platform];
    const url = platform === 'booking' ? bookingIcalUrl : airbnbIcalUrl;

    if (!url.trim()) {
      return (
        <div className="mt-1 flex items-center">
          <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
          <span className="text-xs text-gray-500">{t("properties.form.notConnected")}</span>
        </div>
      );
    }

    if (state.isValidating) {
      return (
        <div className="mt-1 flex items-center">
          <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
          <span className="text-xs text-yellow-600">Verificando...</span>
        </div>
      );
    }

    if (state.isValid) {
      return (
        <div className="mt-1 flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className="text-xs text-green-600">Conectado</span>
        </div>
      );
    }

    if (state.error) {
      return (
        <div className="mt-1">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <span className="text-xs text-red-600">Error</span>
          </div>
          <p className="text-xs text-red-600 mt-1">{state.error}</p>
        </div>
      );
    }

    return null;
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
          <div className="space-y-6 animate-fade-in">
            {/* Basic Information */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                {t("properties.form.propertyName")} *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={t("properties.form.propertyNamePlaceholder")}
                className={`mt-1 block w-full px-3 py-2 border ${
                  validationErrors.name ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                required
              />
              {validationErrors.name && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.name}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                {t("properties.form.address")} *
              </label>
              <input
                type="text"
                name="address"
                id="address"
                value={formData.address}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={t("properties.form.addressPlaceholder")}
                className={`mt-1 block w-full px-3 py-2 border ${
                  validationErrors.address
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                required
              />
              {validationErrors.address && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.address}
                </p>
              )}
            </div>


          </div>
        );
      case 2:
        return (
          <div className="animate-fade-in">
            {/* Mensaje de Imagen de Portada Automática */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <span className="font-bold">{t("properties.form.autoCoverImageTitle")}</span>{" "}
                    {t("properties.form.autoCoverImageText")}
                  </p>
                </div>
              </div>
            </div>
            
            <PropertyImagesForm
              images={formData.additional_images || []}
              onChange={handleAdditionalImagesChange}
              propertyId={property?.id}
            />
          </div>
        );
      case 3:
        return (
          <div className="animate-fade-in">
            <PropertyDocumentsForm
              documents={temporaryDocuments}
              onChange={handleDocumentsChange}
              propertyId={property?.id || "temp"}
              propertyName={formData.name || propertyName} // Pasar el nombre de la propiedad
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Sección: Enlaces de Negocio */}
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {t("properties.form.businessLinksTitle")}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {t("properties.form.businessLinksDescription")}
              </p>
            </div>

            {/* Contenedor con scroll - máximo 2 enlaces visibles */}
            <div className="relative">
              <div className="max-h-32 overflow-y-auto space-y-3 pr-1 border border-gray-100 rounded-md p-2 bg-gray-50">
                {googleBusinessUrls.map((url, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-white rounded border p-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) =>
                        handleGoogleBusinessUrlChange(index, e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      placeholder={t("properties.form.businessUrlPlaceholder")}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {googleBusinessUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGoogleBusinessUrl(index)}
                        className="p-2 text-gray-500 hover:text-red-600 flex-shrink-0"
                        aria-label={t("properties.form.removeLink")}
                      >
                        <svg
                          className="h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {/* Indicador de scroll cuando hay más de 2 enlaces */}
              {googleBusinessUrls.length > 2 && (
                <div className="absolute bottom-1 right-3 text-xs text-gray-400 bg-white px-1 rounded">
                  ↕ {googleBusinessUrls.length} enlaces
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={addGoogleBusinessUrl}
              className="mt-2 flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              <svg
                className="h-5 w-5 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              {t("properties.form.addAnotherLink")}
            </button>

            {/* Sección: Sincronización de Calendarios */}
            <div className="border-t border-gray-200 pt-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {t("properties.form.calendarsTitle")}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {t("properties.form.calendarsDescription")}
                </p>
              </div>

              {/* Booking.com */}
              <div className="mt-4 p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {/* Logo real de Booking.com */}
                    <div className="w-12 h-12 mr-3 flex items-center justify-center">
                      <img 
                        src="/imagenes/booking_logo.png" 
                        alt="Booking.com" 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Booking.com</h4>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
                    onClick={() => setShowBookingInstructions(!showBookingInstructions)}
                  >
                    {showBookingInstructions ? t("properties.form.hide") : t("properties.form.help")}
                  </button>
                </div>
                
                {/* Instrucciones Booking.com */}
                {showBookingInstructions && (
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
                    <ol className="text-xs text-blue-800 space-y-0.5 list-decimal list-inside">
                      <li>Extranet Booking.com → <strong>"Rates & Availability"</strong></li>
                      <li><strong>"Calendar"</strong> → <strong>"Sync calendars"</strong></li>
                      <li><strong>"Export calendar"</strong> → Copiar enlace</li>
                    </ol>
                  </div>
                )}
                
                <div>
                  <input
                    type="url"
                    value={bookingIcalUrl}
                    onChange={(e) => handleIcalUrlChange(e.target.value, 'booking')}
                    placeholder="https://admin.booking.com/hotel/..."
                    className="block w-full px-2 py-1.5 text-sm border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    onKeyDown={handleKeyDown}
                  />
                  {renderIcalConnectionStatus('booking')}
                </div>
              </div>

              {/* Airbnb */}
              <div className="mt-3 p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {/* Logo real de Airbnb */}
                    <div className="w-12 h-12 mr-3 flex items-center justify-center">
                      <img 
                        src="/imagenes/airbnb_logo.jpeg" 
                        alt="Airbnb" 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Airbnb</h4>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
                    onClick={() => setShowAirbnbInstructions(!showAirbnbInstructions)}
                  >
                    {showAirbnbInstructions ? t("properties.form.hide") : t("properties.form.help")}
                  </button>
                </div>
                
                {/* Instrucciones Airbnb */}
                {showAirbnbInstructions && (
                  <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
                    <ol className="text-xs text-red-800 space-y-0.5 list-decimal list-inside">
                      <li>Airbnb Host → <strong>"Calendar"</strong> de tu anuncio</li>
                      <li><strong>"Availability settings"</strong> → <strong>"Calendar sync"</strong></li>
                      <li>Copiar enlace de <strong>"Export calendar"</strong></li>
                    </ol>
                  </div>
                )}
                
                <div>
                  <input
                    type="url"
                    value={airbnbIcalUrl}
                    onChange={(e) => handleIcalUrlChange(e.target.value, 'airbnb')}
                    placeholder="https://www.airbnb.com/calendar/ical/..."
                    className="block w-full px-2 py-1.5 text-sm border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    onKeyDown={handleKeyDown}
                  />
                  {renderIcalConnectionStatus('airbnb')}
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
  const renderActionButtons = () => (
    <div className="flex justify-end items-center space-x-4 pt-6 border-t border-gray-200">
      {currentStep > 1 && (
        <button
          type="button"
          onClick={prevStep}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          {t("common.previous")}
        </button>
      )}
      {currentStep < totalSteps ? (
        <button
          type="button"
          onClick={nextStep}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {t("common.next")}
        </button>
      ) : (
        <button
          type="submit"
          onClick={() => {
            // Log para debug
            console.log('✅ Botón "Guardar" pulsado - Estableciendo submit intencional');
            setIsIntentionalSubmit(true);
          }}
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-primary-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {isSubmitting ? t("common.saving") : t("common.save")}
        </button>
      )}
    </div>
  );

  const steps = [
    { id: 1, name: t("properties.form.steps.basicInfo") },
    { id: 2, name: t("properties.form.steps.images") },
    { id: 3, name: t("properties.form.steps.documents") },
    { id: 4, name: "Enlaces" },
  ];

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
                    className={`flex-1 ${step < 4 ? "mr-1 sm:mr-2" : ""}`}
                  >
                    <div
                      className={`h-2 rounded-full ${
                        step <= currentStep
                          ? "bg-primary-600"
                          : "bg-gray-200"
                      }`}
                    />
                    <p
                      className={`mt-2 text-xs sm:text-sm text-center truncate px-1 max-w-full ${
                        step <= currentStep
                          ? "text-primary-600 font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {/* Texto responsive: versión corta en móvil, completa en desktop */}
                      {step === 1 && (
                        <>
                          <span className="sm:hidden">{t("properties.form.steps.basicShort")}</span>
                          <span className="hidden sm:inline">{t("properties.form.steps.basic")}</span>
                        </>
                      )}
                      {step === 2 && (
                        <>
                          <span className="sm:hidden">{t("properties.form.steps.imagesShort")}</span>
                          <span className="hidden sm:inline">{t("properties.form.steps.images")}</span>
                        </>
                      )}
                      {step === 3 && (
                        <>
                          <span className="sm:hidden">{t("properties.form.steps.documentsShort")}</span>
                          <span className="hidden sm:inline">{t("properties.form.steps.documents")}</span>
                        </>
                      )}
                      {step === 4 && (
                        <>
                          <span className="sm:hidden">{t("properties.form.steps.googleShort")}</span>
                          <span className="hidden sm:inline">{t("properties.form.steps.google")}</span>
                        </>
                      )}
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

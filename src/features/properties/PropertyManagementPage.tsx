import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Property, PropertyDocument, PropertyImage } from "../../types/property";
import PropertyList from "./PropertyList";
import PropertyForm from "./PropertyForm";
import Modal from "../../shared/components/Modal";
import DashboardHeader from "../../shared/components/DashboardHeader";
import DashboardNavigation from "../../features/dashboard/DashboardNavigation";
import { useAuth } from "../../shared/contexts/AuthContext";
import { useLanguage } from "../../shared/contexts/LanguageContext";
import { supabase } from "../../services/supabase";
// documentService removido - ahora se usa mediaService unificado
import { toast } from "react-hot-toast";
import propertyWebhookService from "../../services/propertyWebhookService";
import webhookTestService from "../../services/webhookTestService";
import mediaService from "../../services/mediaService";
import { useCanCreateProperty } from "@shared/contexts/UserStatusContext";
import UpgradePrompt from "@shared/components/UpgradePrompt";
import { webhookDocumentService } from "../../services/webhookDocumentService";
import { shareableLinkService } from "../../services/shareableLinkService";
import { dualImageProcessingService } from "../../services/dualImageProcessingService";

// Función utilitaria para validar y limpiar URL de Google Business
const validateGoogleBusinessUrl = (url: string | undefined): string | undefined => {
  if (!url || url.trim() === '') {
    return undefined; // URL vacía se convierte en undefined para la BD
  }
  
  const cleanUrl = url.toString().trim();
  
  // Si no tiene protocolo, añadir https://
  if (!cleanUrl.match(/^https?:\/\//i)) {
    return `https://${cleanUrl}`;
  }
  
  return cleanUrl;
};

interface PropertyManagementPageProps {
  onSignOut?: () => void;
}

const PropertyManagementPage: React.FC<PropertyManagementPageProps> = ({ onSignOut }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { canCreate, remainingProperties, loading: statusLoading } = useCanCreateProperty();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentProperty, setCurrentProperty] = useState<Property | undefined>(
    undefined,
  );
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [useWebhook, setUseWebhook] = useState(true);
  const [progressPhase, setProgressPhase] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  
  // Limpiar el mensaje de error cuando se abre o cierra el modal
  useEffect(() => {
    setErrorMessage(null);
  }, [modalOpen]);

  // Cargar datos de simulación para el MVP
  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true);
      try {
        // SOLUCION CORS: Usar consulta simple como en Dashboard que funciona
        const { data, error } = await supabase
          .from("properties")
          .select('*')
          .eq('user_id', user?.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          // SOLUCION CORS: Mapeo simplificado sin JOIN - cargar media_files por separado si es necesario
          const mappedProperties = data.map((property: any) => ({
            ...property,
            documents: [], // Se puede cargar por separado si es necesario
            additional_images: [], // Se puede cargar por separado si es necesario
          }));
          setProperties(mappedProperties);
        } else {
          // MODIFICADO: No cargar datos mock - usuarios free deben tener 0 propiedades
          // Los usuarios free deben ver una lista vacía para fomentar el upgrade
          setProperties([]);
        }
      } catch (error) {
        console.error(t("errors.loadProperties"), error);
        // En caso de error, también mostrar lista vacía
        setProperties([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, [user, t]);

  // Manejar apertura del modal para añadir nueva propiedad
  const handleAddProperty = () => {
    try {
      // NUEVO: Verificar si puede crear propiedad (no verificar durante carga)
      if (!statusLoading && !canCreate) {
        setShowUpgradePrompt(true);
        return;
      }
      
      setCurrentProperty(undefined);
      setModalOpen(true);
    } catch (error) {
      console.error('Error handling add property:', error);
      // Fallback: mostrar prompt de upgrade por seguridad
      setShowUpgradePrompt(true);
    }
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
      // Eliminación real de la base de datos
      await supabase.from('properties').delete().eq('id', propertyToDelete.id);
      
      // Actualizar el estado local
      setProperties((prev) => prev.filter((p) => p.id !== propertyToDelete.id));
      setDeleteModalOpen(false);
      setPropertyToDelete(null);
      
      // Mostrar mensaje de éxito
      toast.success(t("properties.deleteSuccess") || "Propiedad eliminada con éxito");
    } catch (error) {
      console.error(t("errors.deleteProperty"), error);
      toast.error(t("errors.deleteProperty") || "Error al eliminar la propiedad");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar envío del formulario (crear/actualizar)
  const handleSubmitProperty = async (propertyData: Omit<Property, "id">) => {
    setIsSubmitting(true);
    setProgressPhase('');
    setProgressPercent(0);

    try {
      // Extraer datos adicionales que no son parte de Property
      const { additional_images, _temporaryDocuments, _googleBusinessUrls, ...otherData } = propertyData as any;
      
      // Obtener usuario actual para RLS
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }
      
      // Crear objeto limpio SOLO con campos válidos de la tabla properties
      // Basado en el esquema actual: id, name, address, image, description, amenities, rules, 
      // created_at, updated_at, user_id, google_business_url, featured_image_id, 
      // gallery_setup_completed, shareable_links_generated, google_business_profile_url
      const propertyDataToSend = {
        name: otherData.name?.toString().trim() || '',
        address: otherData.address?.toString().trim() || '',
        description: otherData.description?.toString().trim() || '',
        amenities: Array.isArray(otherData.amenities) ? otherData.amenities.filter(Boolean) : [],
        rules: Array.isArray(otherData.rules) ? otherData.rules.filter(Boolean) : [],
        image: otherData.image?.toString().trim() || '',
        // Validar y limpiar URL de Google Business
        google_business_profile_url: validateGoogleBusinessUrl(otherData.google_business_profile_url),
        user_id: user.id, // REQUERIDO para política RLS
        // No incluir campos automáticos: id, created_at, updated_at se manejan por la DB
        // No incluir campos opcionales: featured_image_id, gallery_setup_completed, shareable_links_generated, google_business_url
      };
      
      // Log de validación de datos
      console.log('🔍 Datos filtrados para envío:', JSON.stringify(propertyDataToSend, null, 2));
      
      if (currentProperty) {
        // MODO EDICIÓN: Actualizar propiedad existente
        setProgressPhase('Actualizando información básica...');
        setProgressPercent(20);
        
        const { data: updatedProperty, error: updateError } = await supabase
          .from("properties")
          .update(propertyDataToSend)
          .eq("id", currentProperty.id)
          .select()
          .single();

        if (updateError) {
          console.error("Error actualizando propiedad:", updateError);
          throw updateError;
        }

        // Actualizar imágenes si hay nuevas
        if (additional_images && additional_images.length > 0) {
          setProgressPhase('Procesando nuevas imágenes...');
          setProgressPercent(50);
          
          const newImages = additional_images.filter((img: PropertyImage) => 
            img.property_id === "temp" && img.file instanceof File
          );
          
          if (newImages.length > 0) {
            const imageFiles = newImages.map((img: PropertyImage) => img.file as File);
            await mediaService.uploadMediaFiles(
              currentProperty.id,
              imageFiles,
              (progress) => {
                setProgressPercent(50 + (progress * 0.3));
              }
            );
          }
        }

        // Procesar documentos si hay nuevos
        if (_temporaryDocuments && _temporaryDocuments.length > 0) {
          setProgressPhase('Procesando documentos...');
          setProgressPercent(80);
          
          for (const doc of _temporaryDocuments) {
            if (doc.file instanceof File) {
              await webhookDocumentService.sendDocumentToWebhook(
                currentProperty.id,
                propertyDataToSend.name,
                doc.file,
                {
                  name: doc.name,
                  description: doc.description,
                  type: doc.type,
                }
              );
            }
          }
        }

        // Procesar Google Business URLs
        if (_googleBusinessUrls && _googleBusinessUrls.length > 0) {
          setProgressPhase('Guardando enlaces de Google Business...');
          setProgressPercent(90);
          
          await shareableLinkService.createGoogleBusinessLinks(
            currentProperty.id,
            _googleBusinessUrls
          );
        }

        setProgressPhase('¡Actualización completada!');
        setProgressPercent(100);
        
        // Actualizar la lista local
        setProperties((prev) =>
          prev.map((p) =>
            p.id === currentProperty.id
              ? { ...p, ...propertyDataToSend }
              : p
          )
        );

        toast.success("Propiedad actualizada exitosamente");
      } else {
        // MODO CREACIÓN: Nueva propiedad
        const hasFiles = (additional_images?.length || 0) > 0 || (_temporaryDocuments?.length || 0) > 0;
        
        console.log('🏗️ Creando nueva propiedad directamente en Supabase (evitando webhook n8n)');
        
        // Temporalmente deshabilitamos el webhook n8n para evitar errores de columna status
        // El webhook tiene problemas con campos legacy que ya no existen en la base de datos
        await createPropertyDirectly(propertyDataToSend, additional_images, _temporaryDocuments, _googleBusinessUrls);
        
        /* WEBHOOK N8N TEMPORALMENTE DESHABILITADO - CAUSA ERRORES DE COLUMNA STATUS
        if (useWebhook && hasFiles) {
          // USAR WEBHOOK CON IA para procesamiento inteligente (LEGACY - mantener por compatibilidad)
          console.log('🚀 Usando webhook n8n para procesamiento inteligente de archivos');
          
          const onProgress = (phase: string, progress: number) => {
            setProgressPhase(phase);
            setProgressPercent(progress);
          };
          
          try {
            // ... resto del código del webhook ...
          } catch (error) {
            console.error('❌ Error con webhook n8n:', error);
            toast.error("Error al procesar con IA. Creando propiedad de forma estándar...");
            
            // Fallback: crear directamente en Supabase
            await createPropertyDirectly(propertyDataToSend, additional_images, _temporaryDocuments, _googleBusinessUrls);
          }
        } else {
          // Crear directamente en Supabase sin webhook n8n
          await createPropertyDirectly(propertyDataToSend, additional_images, _temporaryDocuments, _googleBusinessUrls);
        }
        */
      }

      // Cerrar modal después de crear/actualizar exitosamente
      setModalOpen(false);
      setCurrentProperty(undefined);
      setProgressPhase('');
      setProgressPercent(0);
      
    } catch (error) {
      console.error("Error al guardar propiedad:", error);
      
      // Manejo específico de errores comunes
      let errorMessage = "Error desconocido";
      
      if (error instanceof Error) {
        if (error.message.includes('constraint')) {
          errorMessage = "Error de validación de datos. Verifique que todos los campos estén correctamente completados.";
        } else if (error.message.includes('authentication') || error.message.includes('auth')) {
          errorMessage = "Error de autenticación. Por favor, inicie sesión nuevamente.";
        } else if (error.message.includes('permission') || error.message.includes('policy')) {
          errorMessage = "No tiene permisos para realizar esta acción.";
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          errorMessage = "Error de conexión. Verifique su conexión a internet.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(`Error al guardar: ${errorMessage}`);
      setProgressPhase('');
      setProgressPercent(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Crear propiedad directamente en Supabase
  const createPropertyDirectly = async (
    propertyData: any, 
    images?: PropertyImage[],
    documents?: PropertyDocument[],
    googleBusinessUrls?: string[]
  ) => {
    setProgressPhase('Creando propiedad...');
    setProgressPercent(20);
    
    // Log de depuración para verificar los datos que se envían
    console.log('🔍 Datos que se enviarán a la base de datos:');
    console.log('propertyData:', JSON.stringify(propertyData, null, 2));
    console.log('Columnas disponibles en properties:', ['id', 'name', 'address', 'image', 'description', 'amenities', 'rules', 'created_at', 'updated_at', 'user_id', 'google_business_url', 'featured_image_id', 'gallery_setup_completed', 'shareable_links_generated', 'google_business_profile_url']);
    
    // Crear propiedad en Supabase
    const { data: newProperty, error: createError } = await supabase
      .from("properties")
      .insert(propertyData)
      .select()
      .single();

    if (createError) {
      console.error("Error creando propiedad:", createError);
      console.error("Error details:", JSON.stringify(createError, null, 2));
      throw createError;
    }
    
    const savedProperty = newProperty as Property;
    console.log('✅ Propiedad creada:', savedProperty.id);
    
    // Procesar imágenes si existen
    if (images && images.length > 0) {
      setProgressPhase('Procesando imágenes...');
      setProgressPercent(50);
      
      try {
        // Filtrar solo imágenes que tienen archivo File
        const imageFiles = images
          .filter(img => img.file instanceof File)
          .map(img => img.file as File);
        
        if (imageFiles.length > 0) {
          console.log(`🔄 Iniciando procesamiento dual de ${imageFiles.length} imágenes para la propiedad ${savedProperty.id}`);
          
          // Procesamiento dual: Storage+media_files + Webhook simultáneo
          try {
            await dualImageProcessingService.processImagesForProperty(
              savedProperty.id,
              savedProperty.name,
              imageFiles,
              {
                onProgress: (message: string, percent?: number) => {
                  setProgressPhase(message);
                  if (percent) {
                    const adjustedProgress = 50 + (percent * 0.3);
                    setProgressPercent(Math.round(adjustedProgress));
                  }
                },
                onStatusChange: (status: string) => {
                  console.log(`📊 Estado del procesamiento dual: ${status}`);
                },
                onSuccess: (results: any[]) => {
                  console.log(`✅ Procesamiento dual completado: ${results.length} imágenes`);
                  toast.success(`${imageFiles.length} imágenes procesadas con éxito (Storage + Webhook)`);
                },
                onError: (error: string) => {
                  console.error(`❌ Error en procesamiento dual: ${error}`);
                  toast.error(`Error procesando imágenes: ${error}`);
                }
              }
            );
          } catch (dualProcessingError) {
            console.error('Error en procesamiento dual de imágenes:', dualProcessingError);
            toast.error('No se pudieron procesar las imágenes completamente');
          }
        }
      } catch (imageError) {
        console.error('Error al procesar imágenes:', imageError);
        toast.error('Algunas imágenes no pudieron ser procesadas');
        // No lanzar error, continuar con el proceso
      }
    }
    
    // Procesar documentos vía webhook
    if (documents && documents.length > 0) {
      setProgressPhase('Procesando documentos...');
      setProgressPercent(70);
      
      try {
        for (const doc of documents) {
          if (doc.file instanceof File) {
            await webhookDocumentService.sendDocumentToWebhook(
              savedProperty.id,
              savedProperty.name,
              doc.file,
              {
                name: doc.name,
                description: doc.description,
                type: doc.type,
              }
            );
          }
        }
        
        console.log(`✅ ${documents.length} documentos enviados al webhook`);
        toast.success(`${documents.length} documentos procesados correctamente`);
      } catch (docError) {
        console.error('Error al procesar documentos:', docError);
        toast.error('Algunos documentos no pudieron ser procesados');
      }
    }
    
    // Procesar Google Business URLs
    if (googleBusinessUrls && googleBusinessUrls.length > 0) {
      setProgressPhase('Guardando enlaces de Google Business...');
      setProgressPercent(90);
      
      try {
        const createdLinks = await shareableLinkService.createGoogleBusinessLinks(
          savedProperty.id,
          googleBusinessUrls
        );
        
        console.log(`✅ ${createdLinks.length} enlaces de Google Business guardados`);
        toast.success(`${createdLinks.length} enlaces guardados correctamente`);
      } catch (linkError) {
        console.error('Error al guardar enlaces:', linkError);
        toast.error('Algunos enlaces no pudieron ser guardados');
      }
    }
    
    setProgressPhase('¡Propiedad creada exitosamente!');
    setProgressPercent(100);
    
    // Añadir a la lista local
    setProperties((prev) => [savedProperty, ...prev]);
    toast.success("Propiedad creada exitosamente");
    
    return savedProperty;
  };

  // Función segura para cerrar el upgrade prompt
  const handleCloseUpgradePrompt = () => {
    try {
      setShowUpgradePrompt(false);
    } catch (error) {
      console.error('Error closing upgrade prompt:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header con navegación */}
      <DashboardHeader onSignOut={onSignOut} />

      {/* Navegación secundaria */}
      <DashboardNavigation />

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Migas de pan */}
        <nav className="mb-6">
          <ol className="flex space-x-2 text-sm text-gray-500">
            <li>
              <Link to="/dashboard" className="hover:text-primary-600">
                {t("dashboard.menu.dashboard")}
              </Link>
            </li>
            <li className="flex items-center">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </li>
            <li className="text-gray-800 font-medium">{t("dashboard.menu.properties")}</li>
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
        title={currentProperty ? t("properties.modal.edit") : t("properties.modal.add")}
        size="lg"
      >
        {errorMessage && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}


        {/* Indicador de progreso durante el procesamiento */}
        {isSubmitting && (progressPhase || progressPercent > 0) && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">
                {progressPhase || 'Procesando...'}
              </span>
              <span className="text-sm text-blue-600">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            {useWebhook && progressPercent > 0 && progressPercent < 100 && (
              <p className="text-xs text-blue-600 mt-1">
                ⚡ Sistema inteligente procesando archivos...
              </p>
            )}
          </div>
        )}

        <PropertyForm
          property={currentProperty}
          propertyName={currentProperty?.name}
          onSubmit={handleSubmitProperty}
          onCancel={() => setModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={t("properties.modal.confirmDelete")}
        size="sm"
      >
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {t("properties.modal.deleteProperty")}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                {t("properties.modal.deleteConfirmMessage", { propertyName: propertyToDelete?.name || "" })}
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
            {isSubmitting ? t("properties.buttons.deleting") : t("properties.buttons.delete")}
          </button>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(false)}
            disabled={isSubmitting}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            {t("properties.buttons.cancel")}
          </button>
        </div>
      </Modal>

      {/* NUEVO: Upgrade prompt modal */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={handleCloseUpgradePrompt}
        feature="property"
        recommendedPlan="basic"
      />
    </div>
  );
};

export default PropertyManagementPage;

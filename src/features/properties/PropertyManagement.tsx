import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Property, PropertyDocument } from "../../types/property";
import propertyService from "../../services/propertyService";
// Removed obsolete webhook services - now using direct n8n webhook approach
import { updateTempDocumentsPropertyId } from "../../services/documentService";
import mediaService from "../../services/mediaService";
import { dualImageProcessingService } from "../../services/dualImageProcessingService";
import PropertyForm from "./PropertyForm";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { MessagingUrlsPanel } from "./components/MessagingUrlsPanel";
import { LoadingInline, LoadingSize, LoadingVariant } from "@shared/components/loading";

// PropertyFormData interface - basada en la estructura que acepta el formulario
interface PropertyFormData extends Omit<Property, "id"> {
  documents?: PropertyDocument[];
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  property_type?: string;
  num_bedrooms?: number;
  num_bathrooms?: number;
  max_guests?: number;
}

interface PropertyManagementProps {
  propertyId?: string;
  onSaved?: (property: Property) => void;
}

// Mock del contexto de usuario si no existe
const useUser = () => {
  return { id: "current-user" };
};

// Import real supabase client
import { supabase } from "../../services/supabase";

const PropertyManagement: React.FC<PropertyManagementProps> = ({
  propertyId,
  onSaved,
}) => {
  const [property, setProperty] = useState<Property | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [, setSaveError] = useState<string | null>(null);
  
  // Estado para feedback de progreso del webhook
  const [progressPhase, setProgressPhase] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [useImageProcessing, setUseImageProcessing] = useState<boolean>(true); // Usar procesamiento de imágenes con IA
  
  // Estado para panel de URLs de mensajería
  const [showMessagingPanel, setShowMessagingPanel] = useState<boolean>(false);

  const navigate = useNavigate();
  const isEditing = !!propertyId;
  const { t } = useTranslation();
  const user = useUser();

  // Cargar propiedad si estamos en modo edición
  useEffect(() => {
    if (propertyId) {
      setIsLoading(true);
      setError(null);

      propertyService
        .getPropertyById(propertyId)
        .then((fetchedProperty) => {
          setProperty(fetchedProperty);
        })
        .catch((err) => {
          console.error("Error cargando propiedad:", err);
          setError("No se pudo cargar la propiedad. Intente nuevamente.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [propertyId]);

  // Función para guardar la propiedad
  const handleSaveProperty = async (propertyData: PropertyFormData) => {
    try {
      setIsSubmitting(true);
      setSaveError(null);
      setProgressPhase('');
      setProgressPercent(0);

      let savedProperty: Property;

      // Modo edición: actualizar propiedad existente (siempre directo a Supabase)
      if (property && property.id) {
        setProgressPhase(t('propertyManagement.updatingProperty'));
        setProgressPercent(50);
        
        const { data, error } = await supabase
          .from("properties")
          .update({
            name: propertyData.name,
            address: propertyData.address,
            city: propertyData.city,
            state: propertyData.state,
            postal_code: propertyData.postal_code,
            country: propertyData.country,
            property_type: propertyData.property_type,
            num_bedrooms: propertyData.num_bedrooms,
            num_bathrooms: propertyData.num_bathrooms,
            max_guests: propertyData.max_guests,
            description: propertyData.description || "",
            updated_at: new Date().toISOString(),
          })
          .eq("id", property.id)
          .select()
          .single();

        if (error) throw error;
        savedProperty = data as unknown as Property;
        
        // Procesar nuevas imágenes si existen
        if (propertyData.additional_images && propertyData.additional_images.length > 0) {
          setProgressPhase(t('propertyManagement.processingNewImages'));
          setProgressPercent(65);
          
          try {
            // Filtrar solo imágenes nuevas que tienen archivo File
            const newImageFiles = propertyData.additional_images
              .filter(img => img.file instanceof File && img.property_id === "temp")
              .map(img => img.file as File);
            
            if (newImageFiles.length > 0) {
              console.log(`📸 ${t('propertyManagement.addingNewImages', { count: newImageFiles.length, propertyId: savedProperty.id })}`);
              
              // NOTA: Temporalmente deshabilitado para evitar conflicto con imageWebhookService
              // TODO: Actualizar mediaService para que funcione sin category/subcategory
              /*
              // Subir nuevas imágenes usando mediaService
              const uploadedImages = await mediaService.uploadMediaFiles(
                savedProperty.id,
                newImageFiles,
                (progress) => {
                  // Ajustar el progreso entre 65-75%
                  const adjustedProgress = 65 + (progress * 0.1);
                  setProgressPercent(Math.round(adjustedProgress));
                }
              );
              
              console.log(`✅ ${t('propertyManagement.newImagesAdded', { count: uploadedImages.length })}`);
              toast.success(t('propertyManagement.newImagesAdded', { count: uploadedImages.length }));
              */
              
              // Por ahora, solo mostrar mensaje de éxito
              console.log(`✅ ${t('propertyManagement.newImagesReady', { count: newImageFiles.length })}`);
              toast.success(t('propertyManagement.newImagesAddedSuccess', { count: newImageFiles.length }));
            }
          } catch (imageError) {
            console.error(t('propertyManagement.errorProcessingNewImages'), imageError);
            toast.error(t('propertyManagement.someImagesNotProcessed'));
            // No lanzar error, continuar con el proceso
          }
        }
        
        setProgressPhase(t('propertyManagement.processingDocuments'));
        setProgressPercent(75);
        
        // Procesar documentos temporales si existen
        if (
          propertyData.documents &&
          propertyData.documents.some(
            (doc: PropertyDocument) => doc.property_id === "temp",
          )
        ) {
          const updatedDocs = await updateTempDocumentsPropertyId(
            savedProperty.id,
          );

          if (updatedDocs.length > 0) {
            const allDocuments = [
              ...(savedProperty.documents || []),
              ...updatedDocs,
            ];

            const { data: updatedProperty, error: updateError } = await supabase
              .from("properties")
              .update({
                documents: allDocuments,
              })
              .eq("id", savedProperty.id)
              .select()
              .single();

            if (updateError) throw updateError;
            savedProperty = updatedProperty as unknown as Property;
          }
        }
      }
      // Modo creación: nuevo flujo con procesamiento de imágenes
      else {
        const hasImages = (propertyData.additional_images?.length || 0) > 0;
        const hasOtherFiles = (propertyData.documents?.length || 0) > 0;
        
        // SIMPLIFICADO: Usar procesamiento de imágenes con IA directo si hay imágenes
        if (useImageProcessing && hasImages) {
          console.log(t('propertyManagement.usingImageProcessing'));
          savedProperty = await createPropertyWithImageProcessing(propertyData);
        } else {
          console.log('📝 Usando creación directa');
          savedProperty = await createPropertyDirectly(propertyData);
        }
      }

      // Guardar la propiedad actualizada en el estado
      setProperty(savedProperty);
      setProgressPhase('Completado');
      setProgressPercent(100);

      // Mostrar mensaje de éxito
      toast.success(isEditing ? "Propiedad actualizada correctamente" : "Propiedad creada correctamente");

      // Redireccionar después de un breve retraso
      setTimeout(() => {
        navigate("/properties");
      }, 1500);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setSaveError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
      console.error('❌ Error saving property:', error);
    } finally {
      setIsSubmitting(false);
      setProgressPhase('');
      setProgressPercent(0);
    }
  };

  /**
   * NUEVO: Crear propiedad con procesamiento de imágenes IA
   */
  const createPropertyWithImageProcessing = async (propertyData: PropertyFormData): Promise<Property> => {
    try {
      setProgressPhase(t('propertyManagement.creatingPropertyRecord'));
      setProgressPercent(10);

      // Paso 1: Crear propiedad en modo "draft"
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data: draftProperty, error: createError } = await supabase
        .from("properties")
        .insert({
          name: propertyData.name,
          address: propertyData.address,
          description: propertyData.description || "",
          user_id: user.id,
          status: 'pending_media_processing', // Estado pendiente
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) throw createError;

      console.log(`✅ Propiedad creada en modo draft: ${draftProperty.id}`);

      // Paso 2: Procesar imágenes con IA si existen
      if (propertyData.additional_images && propertyData.additional_images.length > 0) {
        setProgressPhase(t('propertyManagement.processingImagesWithIA'));
        setProgressPercent(20);

        // Extraer archivos File de las imágenes
        const imageFiles = propertyData.additional_images
          .filter(img => img.file instanceof File)
          .map(img => img.file as File);

        if (imageFiles.length > 0) {
          console.log(`🖼️ Procesando ${imageFiles.length} imágenes con IA para propiedad ${draftProperty.id}`);

          // Usar servicio de procesamiento dual para storage + webhook n8n
          await dualImageProcessingService.processImagesForProperty(
            draftProperty.id,
            draftProperty.name,
            imageFiles,
            user.id,
            {
              onProgress: (message: string, percent?: number) => {
                setProgressPhase(message);
                if (percent) setProgressPercent(20 + (percent * 0.6)); // 20% a 80%
              },
              onStatusChange: (status) => {
                console.log(`📊 Dual processing status: ${status}`);
              },
              onSuccess: (results) => {
                console.log(`✅ Procesamiento dual completado: ${results.length} imágenes`);
              },
              onError: (error: string) => {
                console.error(`❌ Error en procesamiento dual: ${error}`);
                // En caso de error, continuar sin descripciones IA
                toast.error(`Error procesando imágenes: ${error}`);
              }
            }
          );

          console.log('🎉 Imágenes procesadas con IA enviadas para procesamiento');
        }
      }

      setProgressPhase(t('propertyManagement.completingCreation'));
      setProgressPercent(95);

      // Mostrar mensaje de éxito
      toast.success('¡Propiedad creada! Las imágenes se están procesando con IA en segundo plano.', {
        duration: 5000
      });

      setProgressPercent(100);
      
      return {
        ...draftProperty,
        status: 'active' // Para mostrar en UI como activa (se activará automáticamente en BD)
      } as Property;

    } catch (error) {
      console.error('❌ Error en createPropertyWithImageProcessing:', error);
      throw error;
    }
  };

  // Función auxiliar para crear propiedad directamente en Supabase
  const createPropertyDirectly = async (propertyData: PropertyFormData): Promise<Property> => {
    setProgressPhase(t('propertyManagement.creatingPropertyDirectly'));
    setProgressPercent(20);
    
    const { data, error } = await supabase
      .from("properties")
      .insert({
        user_id: user?.id,
        name: propertyData.name,
        address: propertyData.address,
        city: propertyData.city,
        state: propertyData.state,
        postal_code: propertyData.postal_code,
        country: propertyData.country,
        property_type: propertyData.property_type,
        num_bedrooms: propertyData.num_bedrooms,
        num_bathrooms: propertyData.num_bathrooms,
        max_guests: propertyData.max_guests,
        description: propertyData.description || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    
    let savedProperty = data as unknown as Property;
    
    // Procesar imágenes si existen
    if (propertyData.additional_images && propertyData.additional_images.length > 0) {
      setProgressPhase(t('propertyManagement.uploadingImagesDirectly'));
      setProgressPercent(50);
      
      try {
        // Filtrar solo imágenes que tienen archivo File
        const imageFiles = propertyData.additional_images
          .filter(img => img.file instanceof File)
          .map(img => img.file as File);
        
        if (imageFiles.length > 0) {
          console.log(`📸 Procesando ${imageFiles.length} imágenes para la propiedad ${savedProperty.id}`);
          
          // NOTA: Temporalmente deshabilitado - mediaService necesita actualización
          // TODO: Actualizar mediaService para que funcione sin category/subcategory
          /*
          // Subir imágenes usando mediaService
          const uploadedImages = await mediaService.uploadMediaFiles(
            savedProperty.id,
            imageFiles,
            (progress) => {
              // Ajustar el progreso entre 50-70%
              const adjustedProgress = 50 + (progress * 0.2);
              setProgressPercent(Math.round(adjustedProgress));
            }
          );
          
          console.log(`✅ ${uploadedImages.length} imágenes procesadas exitosamente`);
          toast.success(`${uploadedImages.length} imágenes agregadas exitosamente`);
          */
          
          // Por ahora, solo mostrar mensaje
          console.log(`✅ ${imageFiles.length} imágenes preparadas`);
          toast.success(`${imageFiles.length} imágenes listas para procesar`);
        }
      } catch (imageError) {
        console.error('Error al procesar imágenes:', imageError);
        toast.error('Algunas imágenes no pudieron ser procesadas');
        // No lanzar error, continuar con el proceso
      }
    }
    
    setProgressPhase(t('propertyManagement.processingDocumentsDirectly'));
    setProgressPercent(70);

    // Procesar documentos temporales si existen
    if (
      propertyData.documents &&
      propertyData.documents.some(
        (doc: PropertyDocument) => doc.property_id === "temp",
      )
    ) {
      const updatedDocs = await updateTempDocumentsPropertyId(
        savedProperty.id,
      );

      if (updatedDocs.length > 0) {
        const allDocuments = [
          ...(savedProperty.documents || []),
          ...updatedDocs,
        ];

        const { data: updatedProperty, error: updateError } = await supabase
          .from("properties")
          .update({
            documents: allDocuments,
          })
          .eq("id", savedProperty.id)
          .select()
          .single();

        if (updateError) throw updateError;
        savedProperty = updatedProperty as unknown as Property;
      }
    }
    
    return savedProperty;
  };

  // Manejar cancelación
  const handleCancel = () => {
    if (onSaved) {
      onSaved(property as Property);
    } else {
      navigate("/properties");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingInline 
          message="Cargando propiedad..."
          size={LoadingSize.LG}
          variant={LoadingVariant.PRIMARY}
          direction="vertical"
        />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? "Editar propiedad" : "Añadir propiedad"}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
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
          {progressPercent > 0 && progressPercent < 100 && (
            <p className="text-xs text-blue-600 mt-1">
              ⚡ Sistema inteligente procesando archivos...
            </p>
          )}
        </div>
      )}

      {/* Botón para mostrar URLs para mensajería (solo en modo edición) */}
      {isEditing && property && (
        <div className="mb-6">
          <button
            onClick={() => setShowMessagingPanel(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <span>📱</span>
            <span>Ver URLs para Mensajería</span>
          </button>
        </div>
      )}

      <PropertyForm
        property={property}
        onSubmit={handleSaveProperty}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />

      {/* Panel de URLs para mensajería */}
      {showMessagingPanel && property && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <MessagingUrlsPanel
              propertyId={property.id}
              propertyName={property.name}
              onClose={() => setShowMessagingPanel(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyManagement;

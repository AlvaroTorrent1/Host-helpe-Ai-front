import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Property, PropertyDocument } from "../../types/property";
import propertyService from "../../services/propertyService";
import propertyWebhookService from "../../services/propertyWebhookService";
import { webhookTestService } from "../../services/webhookTestService";
import { updateTempDocumentsPropertyId } from "../../services/documentService";
import mediaService from "../../services/mediaService";
import directImageWebhookService from "../../services/directImageWebhookService";
import PropertyForm from "./PropertyForm";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { MessagingUrlsPanel } from "./components/MessagingUrlsPanel";

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
  const [useWebhook, setUseWebhook] = useState<boolean>(true); // Usar webhook por defecto
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
        setProgressPhase('Actualizando propiedad...');
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
          setProgressPhase('Procesando nuevas imágenes...');
          setProgressPercent(65);
          
          try {
            // Filtrar solo imágenes nuevas que tienen archivo File
            const newImageFiles = propertyData.additional_images
              .filter(img => img.file instanceof File && img.property_id === "temp")
              .map(img => img.file as File);
            
            if (newImageFiles.length > 0) {
              console.log(`📸 Agregando ${newImageFiles.length} nuevas imágenes a la propiedad ${savedProperty.id}`);
              
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
              
              console.log(`✅ ${uploadedImages.length} nuevas imágenes agregadas`);
              toast.success(`${uploadedImages.length} nuevas imágenes agregadas`);
              */
              
              // Por ahora, solo mostrar mensaje de éxito
              console.log(`✅ ${newImageFiles.length} nuevas imágenes preparadas para procesar`);
              toast.success(`${newImageFiles.length} nuevas imágenes agregadas`);
            }
          } catch (imageError) {
            console.error('Error al procesar nuevas imágenes:', imageError);
            toast.error('Algunas imágenes no pudieron ser procesadas');
            // No lanzar error, continuar con el proceso
          }
        }
        
        setProgressPhase('Procesando documentos...');
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
        
        // NUEVO: Usar procesamiento de imágenes con IA si hay imágenes
        if (useImageProcessing && hasImages) {
          console.log('🎨 Usando nuevo flujo con procesamiento de imágenes IA');
          savedProperty = await createPropertyWithImageProcessing(propertyData);
        }
        // Usar webhook tradicional si tiene archivos y la opción está habilitada
        else if (useWebhook && (hasImages || hasOtherFiles)) {
          console.log('🚀 Usando webhook n8n para procesamiento inteligente de archivos');
          
          // Callback para mostrar progreso al usuario
          const onProgress = (phase: string, progress: number) => {
            setProgressPhase(phase);
            setProgressPercent(progress);
          };
          
          try {
            // Organizar archivos por categoría para el webhook
            const organizedFiles = {
              interni: propertyData.additional_images?.filter(img => 
                img.description?.toLowerCase().includes('interior') || 
                img.description?.toLowerCase().includes('sala') ||
                img.description?.toLowerCase().includes('cocina')
              ).map(img => ({
                filename: img.description || 'image.jpg',
                url: img.file_url,
                type: 'image/jpeg',
                description: img.description || ''
              })) || [],
              esterni: propertyData.additional_images?.filter(img => 
                img.description?.toLowerCase().includes('exterior') ||
                img.description?.toLowerCase().includes('fachada') ||
                img.description?.toLowerCase().includes('terraza')
              ).map(img => ({
                filename: img.description || 'image.jpg',
                url: img.file_url,
                type: 'image/jpeg',
                description: img.description || ''
              })) || [],
              elettrodomestici_foto: propertyData.additional_images?.filter(img => 
                img.description?.toLowerCase().includes('electrodomestico') ||
                img.description?.toLowerCase().includes('nevera') ||
                img.description?.toLowerCase().includes('lavadora')
              ).map(img => ({
                filename: img.description || 'image.jpg',
                url: img.file_url,
                type: 'image/jpeg',
                description: img.description || ''
              })) || [],
              documenti_casa: propertyData.documents?.filter(doc => 
                doc.name?.toLowerCase().includes('contrato') ||
                doc.name?.toLowerCase().includes('plano')
              ).map(doc => ({
                filename: doc.name || 'document.pdf',
                url: doc.file_url,
                type: 'application/pdf',
                description: doc.description || doc.name || ''
              })) || [],
              documenti_elettrodomestici: propertyData.documents?.filter(doc => 
                doc.name?.toLowerCase().includes('manual') ||
                doc.name?.toLowerCase().includes('garantia')
              ).map(doc => ({
                filename: doc.name || 'document.pdf',
                url: doc.file_url,
                type: 'application/pdf',
                description: doc.description || doc.name || ''
              })) || []
            };

            // Crear propiedad vía webhook n8n
            const result = await propertyWebhookService.processPropertyWithWebhook(
              propertyData, 
              organizedFiles,
              { onProgress }
            );
            
            savedProperty = { 
              ...propertyData, 
              id: result.property_id 
            } as Property;
            
            console.log('✅ Propiedad creada exitosamente vía webhook:', savedProperty.id);
            
          } catch (webhookError) {
            console.warn('⚠️ Webhook falló, fallback a método directo:', webhookError);
            toast('El procesamiento inteligente no está disponible. Usando método estándar...', { 
              icon: '⚠️',
              duration: 3000 
            });
            
            // Fallback: crear directamente en Supabase
            savedProperty = await createPropertyDirectly(propertyData);
          }
        } else {
          console.log('📝 Usando creación directa (sin archivos o webhook deshabilitado)');
          
          // Crear directamente en Supabase
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
      setProgressPhase('Creando propiedad en modo borrador...');
      setProgressPercent(5);

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
        setProgressPhase('Procesando imágenes con IA...');
        setProgressPercent(20);

        // Extraer archivos File de las imágenes
        const imageFiles = propertyData.additional_images
          .filter(img => img.file instanceof File)
          .map(img => img.file as File);

        if (imageFiles.length > 0) {
          console.log(`🖼️ Procesando ${imageFiles.length} imágenes con IA para propiedad ${draftProperty.id}`);

          // Llamar al nuevo servicio de procesamiento de imágenes
          await directImageWebhookService.sendImagesToWebhook(
            draftProperty.id,
            draftProperty.name,
            imageFiles,
            {
              onProgress: (message: string, percent?: number) => {
                setProgressPhase(message);
                if (percent) setProgressPercent(20 + (percent * 0.6)); // 20% a 80%
              },
              onStatusChange: (status: string) => {
                console.log(`📊 Image processing status: ${status}`);
              },
              onSuccess: (results: any[]) => {
                console.log(`✅ Procesamiento de imágenes completado: ${results.length} imágenes`);
              },
              onError: (error: string) => {
                console.error(`❌ Error en procesamiento de imágenes: ${error}`);
                // En caso de error, continuar sin descripciones IA
                toast.error(`Error procesando imágenes: ${error}`);
              }
            }
          );

          console.log('🎉 Imágenes procesadas con IA enviadas para procesamiento');
        }
      }

      setProgressPhase('Finalizando...');
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
    setProgressPhase('Creando propiedad...');
    setProgressPercent(30);
    
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
      setProgressPhase('Procesando imágenes...');
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
    
    setProgressPhase('Procesando documentos...');
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? "Editar propiedad" : "Añadir propiedad"}
      </h2>

      {/* Toggle para webhook n8n (solo en modo creación) */}
      {!isEditing && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={useWebhook}
                onChange={(e) => setUseWebhook(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  🤖 Procesamiento Inteligente con IA
                </span>
                <p className="text-xs text-gray-600">
                  Categoriza automáticamente imágenes y documentos usando n8n + IA para agentes WhatsApp/Telegram
                </p>
              </div>
            </label>
            
            {/* Botones de prueba del webhook (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="flex space-x-2">
                <button
                  onClick={async () => {
                    const isHealthy = await propertyWebhookService.checkWebhookHealth();
                    toast(isHealthy ? 
                      '✅ Webhook n8n funcionando correctamente' : 
                      '❌ Webhook n8n no disponible', 
                      { duration: 3000 }
                    );
                  }}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  🔧 Test Salud
                </button>
                
                <button
                  onClick={async () => {
                    try {
                      toast('🧪 Ejecutando test completo...', { duration: 2000 });
                      await webhookTestService.runFullTest();
                      toast('✅ Test completo exitoso - Revisa la consola para detalles', { duration: 5000 });
                    } catch (error) {
                      console.error('Error en test:', error);
                      toast('❌ Test falló - Revisa la consola para detalles', { duration: 5000 });
                    }
                  }}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  🧪 Test Completo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
          {useWebhook && progressPercent > 0 && progressPercent < 100 && (
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

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@services/supabase";
import { useAuth } from "@shared/contexts/AuthContext";
import { useLanguage } from "@shared/contexts/LanguageContext";
import { Property } from "@/types/property";
import PropertyList from "./PropertyList";
import PropertyForm from "./PropertyForm";
import Modal from "@shared/components/Modal";
import DashboardNavigation from "@features/dashboard/DashboardNavigation";
import DashboardHeader from "@shared/components/DashboardHeader";
import documentService from "../../services/documentService";
import { toast } from "react-hot-toast";
import propertyWebhookService from "@services/propertyWebhookService";
import webhookTestService from "@services/webhookTestService";

interface PropertyManagementPageProps {
  onSignOut?: () => void;
}

const PropertyManagementPage: React.FC<PropertyManagementPageProps> = ({ onSignOut }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentProperty, setCurrentProperty] = useState<Property | undefined>(
    undefined,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Estados para procesamiento con IA
  const [useWebhook, setUseWebhook] = useState<boolean>(true); // Usar webhook por defecto
  const [progressPhase, setProgressPhase] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);

  // Limpiar el mensaje de error cuando se abre o cierra el modal
  useEffect(() => {
    setErrorMessage(null);
  }, [modalOpen]);

  // Cargar datos de simulación para el MVP
  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true);
      try {
        // En una implementación real, esto sería una llamada a Supabase:
        const { data, error } = await supabase
          .from("properties")
          .select("*, property_documents(*), property_images(*)")
          .eq("user_id", user?.id);

        if (error) throw error;

        if (data && data.length > 0) {
          // Mapear los datos para que coincidan con la estructura esperada
          const mappedProperties = data.map(property => ({
            ...property,
            documents: property.property_documents || [],
            additional_images: property.property_images || [],
          }));
          setProperties(mappedProperties);
        } else {
          // Usar datos simulados si no hay datos en Supabase
          const mockProperties: Property[] = [
            {
              id: "1",
              name: t("mockData.properties.apartment.name"),
              address: t("mockData.properties.apartment.address"),
              image:
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
              status: "active",
              description: t("mockData.properties.apartment.description"),
              amenities: ["WiFi", "Cocina", "TV", "Aire acondicionado"],
              created_at: "2025-02-15T12:00:00Z",
              additional_images: [
                {
                  id: "img1",
                  property_id: "1",
                  file_url:
                    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                  description: t("mockData.properties.apartment.workspace"),
                  uploaded_at: "2025-02-15T12:30:00Z",
                },
                {
                  id: "img2",
                  property_id: "1",
                  file_url:
                    "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                  description: t("mockData.properties.apartment.kitchen"),
                  uploaded_at: "2025-02-15T12:35:00Z",
                },
              ],
              documents: [
                {
                  id: "doc1",
                  property_id: "1",
                  type: "faq",
                  name: t("mockData.properties.documents.faq"),
                  file_url: "#",
                  description: t("mockData.properties.documents.faqDesc"),
                  uploaded_at: "2025-02-15T14:00:00Z",
                  file_type: "pdf",
                },
                {
                  id: "doc2",
                  property_id: "1",
                  type: "house_rules",
                  name: t("mockData.properties.documents.rules"),
                  file_url: "#",
                  description: t("mockData.properties.documents.rulesDesc"),
                  uploaded_at: "2025-02-15T14:10:00Z",
                  file_type: "doc",
                },
              ],
            },
            {
              id: "2",
              name: t("mockData.properties.beach.name"),
              address: t("mockData.properties.beach.address"),
              image:
                "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
              status: "active",
              description: t("mockData.properties.beach.description"),
              amenities: ["WiFi", "Cocina", "Piscina", "Parking"],
              created_at: "2025-01-20T10:30:00Z",
              additional_images: [
                {
                  id: "img3",
                  property_id: "2",
                  file_url:
                    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                  description: t("mockData.properties.beach.terrace"),
                  uploaded_at: "2025-01-20T11:00:00Z",
                },
                {
                  id: "img4",
                  property_id: "2",
                  file_url:
                    "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                  description: t("mockData.properties.beach.pool"),
                  uploaded_at: "2025-01-20T11:05:00Z",
                },
                {
                  id: "img5",
                  property_id: "2",
                  file_url:
                    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                  description: t("mockData.properties.beach.bbq"),
                  uploaded_at: "2025-01-20T11:10:00Z",
                },
              ],
              documents: [
                {
                  id: "doc3",
                  property_id: "2",
                  type: "guide",
                  name: t("mockData.properties.documents.guide"),
                  file_url: "#",
                  description: t("mockData.properties.documents.guideDesc"),
                  uploaded_at: "2025-01-20T12:00:00Z",
                  file_type: "pdf",
                },
                {
                  id: "doc4",
                  property_id: "2",
                  type: "faq",
                  name: t("mockData.properties.documents.faq"),
                  file_url: "#",
                  description: t("mockData.properties.documents.nearbyFaqDesc"),
                  uploaded_at: "2025-01-20T12:15:00Z",
                  file_type: "doc",
                },
                {
                  id: "doc5",
                  property_id: "2",
                  type: "inventory",
                  name: t("mockData.properties.documents.inventory"),
                  file_url: "#",
                  description: t("mockData.properties.documents.inventoryDesc"),
                  uploaded_at: "2025-01-20T12:30:00Z",
                  file_type: "txt",
                },
              ],
            },
          ];

          setProperties(mockProperties);
        }
      } catch (error) {
        console.error(t("errors.loadProperties"), error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, [user, t]);

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
      const { additional_images, documents, ...propertyDataToSend } = propertyData;
      
      if (currentProperty) {
        // MODO EDICIÓN: Actualizar propiedad existente (sin webhook)
        setProgressPhase('Actualizando propiedad...');
        setProgressPercent(50);
        
        const { data, error } = await supabase
          .from("properties")
          .update(propertyDataToSend)
          .eq("id", currentProperty.id)
          .select();

        if (error) {
          console.error('Supabase update error:', error);
          setErrorMessage(`Error al actualizar la propiedad: ${error.message}`);
          return;
        }

        if (data && data.length > 0) {
          // Procesar documentos temporales si existen
          if (documents && documents.some(doc => doc.property_id === 'temp')) {
            setProgressPhase('Procesando documentos...');
            setProgressPercent(75);
            
            try {
              await documentService.updateTempDocumentsPropertyId(currentProperty.id);
            } catch (error) {
              console.error('Error al actualizar documentos temporales:', error);
            }
          }

          // Actualizar la lista de propiedades
          setProperties((prev) =>
            prev.map((p) =>
              p.id === currentProperty.id ? { ...p, ...propertyData } : p,
            ),
          );
          
          toast.success("Propiedad actualizada correctamente");
        }
      } else {
        // MODO CREACIÓN: Nueva propiedad
        const hasFiles = (additional_images?.length || 0) > 0 || (documents?.length || 0) > 0;
        
        if (useWebhook && hasFiles) {
          // USAR WEBHOOK CON IA para procesamiento inteligente
          console.log('🚀 Usando webhook n8n para procesamiento inteligente de archivos');
          
          const onProgress = (phase: string, progress: number) => {
            setProgressPhase(phase);
            setProgressPercent(progress);
          };
          
          try {
            // Filtrar solo archivos con URLs válidas (no mock)
            const validImages = additional_images?.filter(img => 
              img.file_url && !img.file_url.startsWith('#') && img.file_url.startsWith('http')
            ) || [];
            
            const validDocs = documents?.filter(doc => 
              doc.file_url && !doc.file_url.startsWith('#') && doc.file_url.startsWith('http')
            ) || [];

            // Si no hay archivos válidos, crear propiedad directamente
            if (validImages.length === 0 && validDocs.length === 0) {
              console.log('⚠️ No hay archivos válidos para procesar con IA, creando propiedad directamente');
              await createPropertyDirectly(propertyDataToSend);
              
              // Cerrar modal después de crear exitosamente
              setModalOpen(false);
              setCurrentProperty(undefined);
              setProgressPhase('');
              setProgressPercent(0);
              return;
            }

            // Organizar archivos válidos por categoría para el webhook
            const organizedFiles = {
              interni: validImages.filter(img => 
                img.description?.toLowerCase().includes('interior') || 
                img.description?.toLowerCase().includes('sala') ||
                img.description?.toLowerCase().includes('cocina') ||
                img.description?.toLowerCase().includes('dormitorio') ||
                img.description?.toLowerCase().includes('baño')
              ).map(img => ({
                filename: img.description || 'image.jpg',
                url: img.file_url,
                type: 'image/jpeg',
                size: 1024000,
                description: img.description || ''
              })),
              
              esterni: validImages.filter(img => 
                img.description?.toLowerCase().includes('exterior') ||
                img.description?.toLowerCase().includes('fachada') ||
                img.description?.toLowerCase().includes('terraza') ||
                img.description?.toLowerCase().includes('jardín') ||
                img.description?.toLowerCase().includes('piscina')
              ).map(img => ({
                filename: img.description || 'image.jpg',
                url: img.file_url,
                type: 'image/jpeg',
                size: 1024000,
                description: img.description || ''
              })),
              
              elettrodomestici_foto: validImages.filter(img => 
                img.description?.toLowerCase().includes('electrodomestico') ||
                img.description?.toLowerCase().includes('nevera') ||
                img.description?.toLowerCase().includes('lavadora') ||
                img.description?.toLowerCase().includes('microondas') ||
                img.description?.toLowerCase().includes('horno')
              ).map(img => ({
                filename: img.description || 'image.jpg',
                url: img.file_url,
                type: 'image/jpeg',
                size: 1024000,
                description: img.description || ''
              })),
              
              documenti_casa: validDocs.filter(doc => 
                doc.name?.toLowerCase().includes('contrato') ||
                doc.name?.toLowerCase().includes('plano') ||
                doc.name?.toLowerCase().includes('normas') ||
                doc.name?.toLowerCase().includes('reglas')
              ).map(doc => ({
                filename: doc.name || 'document.pdf',
                url: doc.file_url,
                type: 'application/pdf',
                size: 512000,
                description: doc.description || doc.name || ''
              })),
              
              documenti_elettrodomestici: validDocs.filter(doc => 
                doc.name?.toLowerCase().includes('manual') ||
                doc.name?.toLowerCase().includes('garantia') ||
                doc.name?.toLowerCase().includes('instrucciones')
              ).map(doc => ({
                filename: doc.name || 'document.pdf',
                url: doc.file_url,
                type: 'application/pdf',
                size: 512000,
                description: doc.description || doc.name || ''
              }))
            };

            // Añadir imágenes no categorizadas a interni
            const uncategorizedImages = validImages.filter(img => {
              const desc = img.description?.toLowerCase() || '';
              return !desc.includes('interior') && !desc.includes('sala') && !desc.includes('cocina') &&
                     !desc.includes('dormitorio') && !desc.includes('baño') &&
                     !desc.includes('exterior') && !desc.includes('fachada') && !desc.includes('terraza') &&
                     !desc.includes('jardín') && !desc.includes('piscina') &&
                     !desc.includes('electrodomestico') && !desc.includes('nevera') && !desc.includes('lavadora') &&
                     !desc.includes('microondas') && !desc.includes('horno');
            });
            
            if (uncategorizedImages.length > 0) {
              organizedFiles.interni.push(...uncategorizedImages.map(img => ({
                filename: img.description || 'image.jpg',
                url: img.file_url,
                type: 'image/jpeg',
                size: 1024000,
                description: img.description || ''
              })));
            }

            // Crear propiedad vía webhook n8n
            const result = await propertyWebhookService.processPropertyWithWebhook(
              propertyDataToSend, 
              organizedFiles,
              { onProgress }
            );
            
            const newProperty = { 
              ...propertyData, 
              id: result.property_id 
            } as Property;
            
            // Añadir la nueva propiedad a la lista
            setProperties((prev) => [newProperty, ...prev]);
            
            toast.success("✨ Propiedad creada con IA - Archivos categorizados automáticamente");
            
          } catch (webhookError) {
            console.warn('⚠️ Webhook falló, usando método directo:', webhookError);
            toast('El procesamiento IA no está disponible. Usando método estándar...', { 
              icon: '⚠️',
              duration: 3000 
            });
            
            // Fallback: crear directamente
            await createPropertyDirectly(propertyDataToSend);
          }
        } else {
          // CREAR DIRECTAMENTE sin webhook (sin archivos o webhook deshabilitado)
          console.log('📝 Usando creación directa (sin archivos o webhook deshabilitado)');
          await createPropertyDirectly(propertyDataToSend);
        }
      }
      
      setModalOpen(false);
      setCurrentProperty(undefined);
      setProgressPhase('');
      setProgressPercent(0);
      
    } catch (error) {
      console.error(t("errors.saveProperty"), error);
      setErrorMessage(error instanceof Error ? error.message : "Error al guardar la propiedad");
      toast.error(`Error: ${error instanceof Error ? error.message : "Error desconocido"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función auxiliar para crear propiedad directamente
  const createPropertyDirectly = async (propertyDataToSend: any) => {
    setProgressPhase('Creando propiedad...');
    setProgressPercent(50);
    
    // Limpiar el google_business_profile_url si está vacío
    const cleanedData = {
      ...propertyDataToSend,
      google_business_profile_url: propertyDataToSend.google_business_profile_url || null
    };
    
    const { data, error } = await supabase
      .from("properties")
      .insert({
        ...cleanedData,
        user_id: user?.id,
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;

    if (data && data.length > 0) {
      setProperties((prev) => [data[0], ...prev]);
      toast.success("Propiedad creada correctamente");
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
        {/* Toggle para webhook n8n (solo en modo creación) */}
        {!currentProperty && (
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
    </div>
  );
};

export default PropertyManagementPage;

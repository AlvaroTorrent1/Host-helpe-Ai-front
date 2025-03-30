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

const PropertyManagementPage: React.FC = () => {
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

  // Cargar datos de simulación para el MVP
  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true);
      try {
        // En una implementación real, esto sería una llamada a Supabase:
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("user_id", user?.id);

        if (error) throw error;

        if (data && data.length > 0) {
          setProperties(data);
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
      // En una implementación real:
      // await supabase.from('properties').delete().eq('id', propertyToDelete.id);

      // Simulación de borrado
      setProperties((prev) => prev.filter((p) => p.id !== propertyToDelete.id));
      setDeleteModalOpen(false);
      setPropertyToDelete(null);
    } catch (error) {
      console.error(t("errors.deleteProperty"), error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar envío del formulario (crear/actualizar)
  const handleSubmitProperty = async (propertyData: Omit<Property, "id">) => {
    setIsSubmitting(true);
    try {
      if (currentProperty) {
        // Actualizar propiedad existente
        const { data, error } = await supabase
          .from("properties")
          .update(propertyData)
          .eq("id", currentProperty.id)
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          setProperties((prev) =>
            prev.map((p) => (p.id === currentProperty.id ? data[0] : p)),
          );
        }
      } else {
        // Crear nueva propiedad
        const { data, error } = await supabase
          .from("properties")
          .insert({
            ...propertyData,
            user_id: user?.id,
            created_at: new Date().toISOString(),
          })
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          setProperties((prev) => [...prev, data[0]]);
        }
      }

      setModalOpen(false);
    } catch (error) {
      console.error(t("errors.saveProperty"), error);
      alert(t("errors.savePropertyAlert"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header con navegación */}
      <DashboardHeader />

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

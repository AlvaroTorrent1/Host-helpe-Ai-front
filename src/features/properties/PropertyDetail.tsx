import React, { useState } from "react";
import { Property } from "../../types/property";
import PropertyDocumentManager from "./PropertyDocumentManager";
import { useLanguage } from "@shared/contexts/LanguageContext";

interface PropertyDetailProps {
  property: Property;
  onEdit: (property: Property) => void;
  onClose: () => void;
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({
  property,
  onEdit,
  onClose,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"info" | "images" | "documents">(
    "info",
  );
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

  // Obtener icono según el tipo de archivo
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return (
          <svg
            className="h-6 w-6 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "doc":
        return (
          <svg
            className="h-6 w-6 text-blue-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "txt":
        return (
          <svg
            className="h-6 w-6 text-gray-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="h-6 w-6 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
      {/* Imagen de portada */}
      <div className="relative h-64 w-full">
        <img
          src={
            property.image ||
            "https://via.placeholder.com/800x400?text=Sin+imagen"
          }
          alt={property.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
          <div className="absolute bottom-0 left-0 p-6">
            <h2 className="text-2xl font-bold text-white">{property.name}</h2>
            <p className="text-white/80">{property.address}</p>
          </div>
        </div>
        <button
          className="absolute top-4 right-4 p-2 bg-white/80 rounded-full"
          onClick={onClose}
        >
          <svg
            className="h-6 w-6 text-gray-800"
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

      {/* Pestañas de navegación */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex px-6 pt-4">
          <button
            className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm ${
              activeTab === "info"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("info")}
          >
            {t("properties.detail.tabs.info")}
          </button>
          <button
            className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm ${
              activeTab === "images"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("images")}
          >
            {t("properties.detail.tabs.additionalImages")}
            {property.additional_images &&
              property.additional_images.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                  {property.additional_images.length}
                </span>
              )}
          </button>
          <button
            className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm ${
              activeTab === "documents"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("documents")}
          >
            {t("properties.detail.tabs.documents")}
            {property.documents && property.documents.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                {property.documents.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Contenido de la pestaña activa */}
      <div className="p-6">
        {activeTab === "info" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{t("properties.detail.description")}</h3>
              <p className="mt-2 text-gray-600">
                {property.description || t("properties.detail.noDescription")}
              </p>
            </div>

            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {t("properties.detail.amenities")}
                </h3>
                <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                  {property.amenities.map((amenity, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <svg
                        className="h-5 w-5 text-primary-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {amenity}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onEdit(property)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                {t("properties.buttons.edit")}
              </button>
            </div>
          </div>
        )}

        {activeTab === "images" && (
          <div>
            {property.additional_images &&
            property.additional_images.length > 0 ? (
              <div className="space-y-6">
                <p className="text-sm text-gray-500">
                  {t("properties.detail.additionalImagesInfo")}
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {property.additional_images.map((image) => (
                    <div
                      key={image.id}
                      className="group border rounded-md p-3 bg-white hover:shadow-md transition"
                    >
                      <div
                        className="relative cursor-pointer"
                        onClick={() => setEnlargedImage(image.file_url)}
                      >
                        <img
                          src={image.file_url}
                          alt={image.description}
                          className="h-40 w-full object-cover rounded-md"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-opacity">
                          <svg
                            className="h-8 w-8 text-white opacity-0 group-hover:opacity-100"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zm-3 0v3m0 0v3m0-6h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          Descripción
                        </h4>
                        <p className="text-sm text-gray-500">
                          {image.description || "Sin descripción"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {t("properties.detail.noAdditionalImages")}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t("properties.detail.addImagesWhileEditing")}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <div>
            {property.documents && property.documents.length > 0 ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    {t("properties.detail.documentsInfo")}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsDocumentModalOpen(true)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Gestionar documentos
                  </button>
                </div>
                <div className="space-y-3">
                  {property.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-start p-3 border rounded-md bg-white hover:bg-gray-50 transition"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getFileIcon(doc.file_type)}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {doc.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {doc.type === "faq" && "Preguntas frecuentes"}
                            {doc.type === "guide" && "Guía"}
                            {doc.type === "house_rules" && "Reglas de la casa"}
                            {doc.type === "inventory" && "Inventario"}
                            {doc.type === "other" && "Otro"}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 break-words">
                          {doc.description}
                        </p>
                      </div>
                      {/* En una implementación real, aquí iría un enlace para descargar el documento */}
                      <div className="ml-4 flex-shrink-0">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                          title="Ver documento"
                        >
                          Ver
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {t("properties.detail.noDocuments")}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t("properties.detail.addDocumentsWhileEditing")}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para ampliar imagen */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={() => setEnlargedImage(null)}
        >
          <div
            className="max-w-3xl max-h-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={enlargedImage}
              alt="Imagen ampliada"
              className="max-w-full max-h-[85vh] object-contain"
            />
            <button
              className="absolute top-4 right-4 p-2 bg-white/80 rounded-full"
              onClick={() => setEnlargedImage(null)}
            >
              <svg
                className="h-6 w-6 text-gray-800"
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
        </div>
      )}

      {/* Modal del gestor de documentos */}
      <PropertyDocumentManager
        propertyId={property.id}
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
      />
    </div>
  );
};

export default PropertyDetail;

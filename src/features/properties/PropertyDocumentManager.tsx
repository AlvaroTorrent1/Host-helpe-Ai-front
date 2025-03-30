import React, { useState, useEffect, useCallback } from "react";
import { PropertyDocument } from "../../types/property";
import documentService from "../../services/documentService";
import PropertyDocumentsForm from "./PropertyDocumentsForm";
import Modal from "../../shared/components/Modal";
import { useLanguage } from "@shared/contexts/LanguageContext";

interface PropertyDocumentManagerProps {
  propertyId: string;
  isOpen: boolean;
  onClose: () => void;
}

const PropertyDocumentManager: React.FC<PropertyDocumentManagerProps> = ({
  propertyId,
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar documentos
  const loadDocuments = useCallback(async () => {
    if (!propertyId) return;

    setIsLoading(true);
    setError(null);

    try {
      const docs = await documentService.getDocumentsByProperty(propertyId);
      setDocuments(docs);
    } catch (err) {
      console.error("Error cargando documentos:", err);
      setError("No se pudieron cargar los documentos. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  // Cargar documentos existentes al abrir el modal
  useEffect(() => {
    if (isOpen && propertyId) {
      loadDocuments();
    }
  }, [isOpen, propertyId, loadDocuments]);

  // Manejar la adición de un nuevo documento
  const handleAddDocument = (newDocument: PropertyDocument) => {
    setDocuments((prev) => [newDocument, ...prev]);
  };

  // Manejar cambios en la lista de documentos (eliminaciones)
  const handleDocumentsChange = (updatedDocuments: PropertyDocument[]) => {
    setDocuments(updatedDocuments);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("properties.documentManager.title")}>
      <div className="max-w-3xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <svg
              className="animate-spin h-8 w-8 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            {error}
            <button className="ml-2 underline" onClick={loadDocuments}>
              {t("properties.documentManager.retry")}
            </button>
          </div>
        ) : (
          <PropertyDocumentsForm
            propertyId={propertyId}
            documents={documents}
            onChange={handleDocumentsChange}
            onAddDocument={handleAddDocument}
          />
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="px-4 py-2 bg-blue-100 text-blue-900 rounded hover:bg-blue-200"
            onClick={onClose}
          >
            {t("properties.documentManager.close")}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PropertyDocumentManager;

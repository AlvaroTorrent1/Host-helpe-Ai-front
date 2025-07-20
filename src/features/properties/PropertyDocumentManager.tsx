import React, { useState, useEffect, useCallback } from "react";
import { PropertyDocument } from "../../types/property";
import documentService from "../../services/documentService";
import PropertyDocumentsForm from "./PropertyDocumentsForm";
import Modal from "../../shared/components/Modal";
import { useTranslation } from "react-i18next";
import { LoadingInline, LoadingSize, LoadingVariant } from "@shared/components/loading";

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
  const { t } = useTranslation();
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
            <LoadingInline 
              message="Cargando documentos..."
              size={LoadingSize.LG}
              variant={LoadingVariant.PRIMARY}
              direction="vertical"
            />
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

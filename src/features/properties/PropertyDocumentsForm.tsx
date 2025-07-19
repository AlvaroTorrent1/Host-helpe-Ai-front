import React, { useState, useEffect } from "react";
import { PropertyDocument } from "../../types/property";
import { webhookDocumentService, DocumentProcessingStatus } from "../../services/webhookDocumentService";
import { formatFileSize } from "../../utils";
import { useTranslation } from "react-i18next";
import { LoadingInline, LoadingSize, LoadingVariant } from "../../shared/components/loading";

interface PropertyDocumentsFormProps {
  propertyId: string;
  propertyName?: string; // Nombre de la propiedad para el webhook
  documents?: PropertyDocument[];
  onChange: (documents: PropertyDocument[]) => void;
  onAddDocument?: (document: PropertyDocument) => void;
}

const PropertyDocumentsForm: React.FC<PropertyDocumentsFormProps> = ({
  propertyId,
  propertyName = "Propiedad",
  documents = [],
  onChange,
  onAddDocument,
}) => {
  const { t } = useTranslation();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingStatus, setProcessingStatus] = useState<DocumentProcessingStatus | null>(null);
  const [processingMessage, setProcessingMessage] = useState<string>("");
  const [currentDocument, setCurrentDocument] = useState<{
    name: string;
    description: string;
    type: "faq" | "guide" | "house_rules" | "inventory" | "other";
    file?: File;
  }>({
    name: "",
    description: "",
    type: "faq",
  });

  // Verificar salud del webhook al montar el componente
  useEffect(() => {
    const checkWebhook = async () => {
      // Solo verificar webhook si tenemos un propertyId válido (no temporal)
      if (propertyId && propertyId !== "temp") {
        try {
          const isHealthy = await webhookDocumentService.checkWebhookHealth();
          if (!isHealthy) {
            console.warn("⚠️ El webhook de documentos podría no estar disponible");
          }
      } catch (error) {
          console.error("Error verificando webhook:", error);
        }
      }
    };
    
    checkWebhook();
  }, [propertyId]);

  // Manejar selección de archivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño del archivo
    if (file.size > 10 * 1024 * 1024) {
      // 10MB
      setValidationError("El documento debe ser menor a 10MB");
      return;
    }

    setSelectedFile(file);
    setValidationError(null);
  };

  // Manejar subida de documentos al webhook
  const handleUpload = async () => {
    if (
      !selectedFile ||
      !currentDocument.name ||
      !currentDocument.type
    ) {
      setValidationError("Por favor complete todos los campos requeridos");
      return;
    }

    // Si es una propiedad temporal, almacenar localmente
    if (!propertyId || propertyId === "temp") {
      console.log("📁 Almacenando documento temporalmente (se procesará al guardar la propiedad)");
      
      // Crear objeto documento temporal
      const tempDocument: PropertyDocument = {
        id: `temp_${Date.now()}`,
        property_id: "temp",
        name: currentDocument.name,
        description: currentDocument.description || "",
        type: currentDocument.type,
        file_url: "#", // URL temporal
        file_type: selectedFile.type.includes("pdf") ? "pdf" : 
                  selectedFile.type.includes("doc") ? "doc" : 
                  selectedFile.type.includes("text") ? "txt" : "other",
        uploaded_at: new Date().toISOString(),
        // Almacenar el archivo File para procesarlo después
        file: selectedFile,
      };
      
      // Añadir a la lista de documentos
      if (onAddDocument) {
        onAddDocument(tempDocument);
      } else {
        onChange([...documents, tempDocument]);
      }
      
      // Resetear formulario
      setCurrentDocument({
        name: "",
        description: "",
        type: "other",
      });
      setSelectedFile(null);
      
      // Limpiar elemento de entrada de archivo
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      return;
    }

    // Si tenemos un propertyId válido, proceder con el webhook normalmente
    setIsUploading(true);
    setValidationError(null);
    setProcessingStatus(null);
    setProcessingMessage("");

    try {
      console.log("📤 Enviando documento al webhook para procesamiento:", {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        propertyId,
        propertyName,
        documentType: currentDocument.type,
      });

      // Enviar documento al webhook con callbacks para mostrar progreso
      const response = await webhookDocumentService.sendDocumentToWebhook(
        propertyId,
        propertyName,
        selectedFile,
        {
          name: currentDocument.name,
          description: currentDocument.description,
          type: currentDocument.type,
        },
        {
          onStatusChange: (status) => {
            setProcessingStatus(status);
          },
          onProgress: (message) => {
            setProcessingMessage(message);
          },
          onError: (error) => {
            setValidationError(error);
          },
          onSuccess: (documentId) => {
            console.log("✅ Documento procesado exitosamente:", documentId);
            
            // Crear objeto temporal para mostrar en la UI
            const processedDocument: PropertyDocument = {
              id: documentId || `webhook_${Date.now()}`,
              property_id: propertyId,
              name: currentDocument.name,
              description: currentDocument.description || "",
              type: currentDocument.type,
              file_url: "#", // El webhook procesará y guardará la URL real
              file_type: selectedFile.type.includes("pdf") ? "pdf" : 
                        selectedFile.type.includes("doc") ? "doc" : 
                        selectedFile.type.includes("text") ? "txt" : "other",
              uploaded_at: new Date().toISOString(),
            };
        
        if (onAddDocument) {
              onAddDocument(processedDocument);
        } else {
              onChange([...documents, processedDocument]);
        }

        // Resetear formulario
        setCurrentDocument({
          name: "",
          description: "",
          type: "other",
        });
        setSelectedFile(null);
            setProcessingStatus(null);
            setProcessingMessage("");
        
        // Limpiar elemento de entrada de archivo
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
          }
        }
      );

      if (!response.success) {
        throw new Error(response.error || "Error al procesar el documento");
      }

    } catch (error) {
      console.error("Error detallado al enviar documento:", error);
      
      let errorMessage = "Error al procesar documento. ";
      
      // Errores específicos con mensajes personalizados
      if (error instanceof Error) {
        if (error.message.includes("authentication") || error.message.includes("auth")) {
          errorMessage += "Problema de autenticación. Por favor, inicie sesión nuevamente.";
        } else if (error.message.includes("network") || error.message.includes("connection")) {
          errorMessage += "Problema de conexión. Verifique su conexión a internet.";
        } else if (error.message.includes("webhook")) {
          errorMessage += "El servicio de procesamiento no está disponible. Intente más tarde.";
        } else if (error.message.includes("size")) {
          errorMessage += "El archivo es demasiado grande.";
        } else {
          errorMessage += error.message;
        }
      }
      
      setValidationError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Eliminar un documento (solo de la UI, ya que están en el webhook)
  const handleRemoveDocument = async (id: string) => {
    try {
      const updatedDocuments = documents.filter((doc) => doc.id !== id);
      onChange(updatedDocuments);
    } catch {
      setValidationError(
        "No se pudo eliminar el documento. Intente nuevamente.",
      );
    }
  };

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

  // Determinar si un documento es temporal (guardado en el cliente)
  const isTemporaryDocument = (document: PropertyDocument): boolean => {
    return document.property_id === "temp" || document.id.startsWith("temp_");
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-2">
        <h3 className="text-lg font-medium text-gray-900">
          {t("properties.form.documents.title")}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {t("properties.form.documents.description")}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {t("properties.form.documents.recommendedTypes")}
          <ul className="list-disc pl-5 mt-1">
            <li>
              <strong>{t("properties.form.documents.types.faq")}:</strong> {t("properties.form.documents.types.faqDescription")}
            </li>
            <li>
              <strong>{t("properties.form.documents.types.guides")}:</strong> {t("properties.form.documents.types.guidesDescription")}
            </li>
            <li>
              <strong>{t("properties.form.documents.types.houseRules")}:</strong> {t("properties.form.documents.types.houseRulesDescription")}
            </li>
            <li>
              <strong>{t("properties.form.documents.types.inventory")}:</strong> {t("properties.form.documents.types.inventoryDescription")}
            </li>
          </ul>
        </p>
      </div>

      {/* Mostrar aviso si estamos en modo creación */}
      {propertyId === "temp" && documents.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                {t("properties.form.documents.pendingDocuments")}
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>
                  {t("properties.form.documents.pendingDescription")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de documentos */}
      <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-start p-3 border rounded-md bg-white"
          >
            <div className="flex-shrink-0 mt-1">
              {getFileIcon(doc.file_type)}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {doc.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {doc.type === "faq" && t("properties.form.documents.types.faq")}
                    {doc.type === "guide" && t("properties.form.documents.types.guides")}
                    {doc.type === "house_rules" && t("properties.form.documents.types.houseRules")}
                    {doc.type === "inventory" && t("properties.form.documents.types.inventory")}
                    {doc.type === "other" && t("properties.form.documents.types.other")}
                  </p>
                  {isTemporaryDocument(doc) && (
                    <p className="text-xs text-amber-600 mt-1">
                      {t("properties.form.documents.pendingProcess")}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveDocument(doc.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500 break-words">
                {doc.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Formulario para añadir nuevos documentos */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-3">
          {t("properties.form.documents.addNewDocument")}
        </h4>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            {t("properties.form.documents.addNewDocument")}
          </label>
          
          <div className="mt-1 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                {t("properties.form.documents.documentName")}
              </label>
              <input
                type="text"
                value={currentDocument.name}
                onChange={(e) =>
                  setCurrentDocument({
                    ...currentDocument,
                    name: e.target.value,
                  })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder={t("properties.form.documents.documentNamePlaceholder")}
              />
            </div>
            
            <div className="w-full sm:w-1/3">
              <label className="block text-sm font-medium text-gray-700">
                {t("properties.form.documents.documentType")}
              </label>
              <select
                value={currentDocument.type}
                onChange={(e) =>
                  setCurrentDocument({
                    ...currentDocument,
                    type: e.target.value as any,
                  })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="faq">{t("properties.form.documents.types.faq")}</option>
                <option value="guide">{t("properties.form.documents.types.guides")}</option>
                <option value="house_rules">{t("properties.form.documents.types.houseRules")}</option>
                <option value="inventory">{t("properties.form.documents.types.inventory")}</option>
                <option value="other">{t("properties.form.documents.types.other")}</option>
              </select>
            </div>
          </div>
          
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("properties.form.documents.documentFile")}
            </label>
            <div 
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${selectedFile ? 'border-green-300 bg-green-50' : 'border-gray-300'} border-dashed rounded-md`}
            >
              <div className="space-y-1 text-center">
                {selectedFile ? (
                  <div className="text-center">
                    <div className="mx-auto h-12 w-12 text-green-500 flex items-center justify-center">
                      {getFileIcon(selectedFile.name.split('.').pop() || 'other')}
                    </div>
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      {t("properties.form.documents.changeFile")}
                    </button>
                  </div>
                ) : (
                  <>
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                      >
                        <span>{t("properties.form.documents.selectFile")}</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileSelect}
                        />
                      </label>
                      <p className="pl-1">{t("properties.form.documents.dragAndDrop")}</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {t("properties.form.documents.fileSizeLimit")}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {validationError && (
            <div className="mt-2 text-sm text-red-600" role="alert">
              <div className="flex">
                <svg 
                  className="h-5 w-5 text-red-500 mr-1" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                    clipRule="evenodd" 
                  />
                </svg>
                <span>{validationError}</span>
              </div>
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || !selectedFile}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white 
                ${isUploading || !selectedFile 
                  ? "bg-gray-300 cursor-not-allowed" 
                  : "bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"}`}
            >
              {isUploading ? (
                <span className="flex items-center">
                  <svg 
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
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
                  {t("properties.form.documents.uploading")}
                </span>
              ) : (
                t("properties.form.documents.uploadDocument")
              )}
            </button>
          </div>

          {/* Indicador de estado de procesamiento */}
          {processingStatus && (
            <div className={`mt-3 p-3 rounded-md flex items-center ${
              processingStatus === 'completed' ? 'bg-green-50 text-green-700' :
              processingStatus === 'failed' ? 'bg-red-50 text-red-700' :
              processingStatus === 'retry' ? 'bg-yellow-50 text-yellow-700' :
              'bg-blue-50 text-blue-700'
            }`}>
              {processingStatus === 'uploading' && (
                <>
                  <LoadingInline size={LoadingSize.SM} variant={LoadingVariant.PRIMARY} className="mr-2" />
                  <span>{t("properties.form.documents.uploadingDocument")}</span>
                </>
              )}
              {processingStatus === 'processing' && (
                <>
                  <svg className="animate-pulse h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                  </svg>
                  <span>{processingMessage || t("properties.form.documents.processingDocument")}</span>
                </>
              )}
              {processingStatus === 'completed' && (
                <>
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{t("properties.form.documents.documentProcessedSuccessfully")}</span>
                </>
              )}
              {processingStatus === 'failed' && (
                <>
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{t("properties.form.documents.errorProcessingDocument")}</span>
                </>
              )}
              {processingStatus === 'retry' && (
                <>
                  <LoadingInline size={LoadingSize.SM} variant={LoadingVariant.WARNING} className="mr-2" />
                  <span>{processingMessage || t("properties.form.documents.retrying")}</span>
                </>
              )}
            </div>
          )}


        </div>
      </div>
    </div>
  );
};

export default PropertyDocumentsForm;

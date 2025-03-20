import React, { useState } from 'react';
import { PropertyDocument } from '../../types/property';

interface PropertyDocumentsFormProps {
  documents?: PropertyDocument[];
  onChange: (documents: PropertyDocument[]) => void;
}

const PropertyDocumentsForm: React.FC<PropertyDocumentsFormProps> = ({ documents = [], onChange }) => {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [currentDocument, setCurrentDocument] = useState<Partial<PropertyDocument>>({
    name: '',
    description: '',
    type: 'faq',
    file_type: 'pdf'
  });

  // Generar un ID único para los nuevos documentos
  const generateTempId = () => `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  // Manejar subida de nuevo documento
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validar tamaño del archivo
    if (file.size > 10 * 1024 * 1024) { // 10MB
      setValidationError('El documento debe ser menor a 10MB');
      return;
    }
    
    // Determinar tipo de archivo
    let fileType: 'pdf' | 'doc' | 'txt' | 'other' = 'other';
    if (file.type === 'application/pdf') {
      fileType = 'pdf';
    } else if (file.type.includes('word') || file.type.includes('doc')) {
      fileType = 'doc';
    } else if (file.type === 'text/plain') {
      fileType = 'txt';
    }
    
    // Crear URL para el archivo y añadirlo a la lista
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const newDocument: PropertyDocument = {
        id: generateTempId(),
        property_id: 'temp',
        file_url: result,
        name: currentDocument.name || file.name,
        description: currentDocument.description || '',
        type: currentDocument.type as 'faq' | 'guide' | 'house_rules' | 'inventory' | 'other',
        file_type: fileType,
        uploaded_at: new Date().toISOString()
      };
      
      onChange([...documents, newDocument]);
      setCurrentDocument({
        name: '',
        description: '',
        type: 'faq',
        file_type: 'pdf'
      });
      setValidationError(null);
    };
    reader.readAsDataURL(file);
  };

  // Eliminar un documento
  const handleRemoveDocument = (id: string) => {
    const updatedDocuments = documents.filter(doc => doc.id !== id);
    onChange(updatedDocuments);
  };

  // Obtener icono según el tipo de archivo
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return (
          <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'doc':
        return (
          <svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'txt':
        return (
          <svg className="h-6 w-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-2">
        <h3 className="text-lg font-medium text-gray-900">Documentos de la propiedad</h3>
        <p className="mt-1 text-sm text-gray-500">
          Añade documentos como guías, instrucciones, reglas de la casa o FAQs para responder a las 
          preguntas frecuentes de los huéspedes. Estos documentos serán utilizados por nuestro 
          chatbot de IA para proporcionar respuestas precisas y personalizadas a los turistas.
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Los tipos de documentos recomendados incluyen:
          <ul className="list-disc pl-5 mt-1">
            <li><strong>FAQs:</strong> Respuestas a preguntas habituales sobre la propiedad, zona o servicios.</li>
            <li><strong>Guías:</strong> Instrucciones de uso de electrodomésticos, wifi, TV, etc.</li>
            <li><strong>Reglas de la casa:</strong> Normas específicas que deben seguir los huéspedes.</li>
            <li><strong>Inventario:</strong> Lista de objetos y equipamiento disponible.</li>
          </ul>
        </p>
      </div>

      {/* Lista de documentos */}
      <div className="space-y-3">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-start p-3 border rounded-md bg-white">
            <div className="flex-shrink-0 mt-1">
              {getFileIcon(doc.file_type)}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                  <p className="text-xs text-gray-500">
                    {doc.type === 'faq' && 'Preguntas frecuentes'}
                    {doc.type === 'guide' && 'Guía'}
                    {doc.type === 'house_rules' && 'Reglas de la casa'}
                    {doc.type === 'inventory' && 'Inventario'}
                    {doc.type === 'other' && 'Otro'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveDocument(doc.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500 break-words">{doc.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Formulario para añadir nuevos documentos */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-3">Añadir nuevo documento</h4>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="doc-name" className="block text-sm font-medium text-gray-700">Nombre del documento</label>
            <input
              type="text"
              id="doc-name"
              value={currentDocument.name}
              onChange={(e) => setCurrentDocument({...currentDocument, name: e.target.value})}
              placeholder="Ej. Instrucciones WiFi"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="doc-type" className="block text-sm font-medium text-gray-700">Tipo de documento</label>
            <select
              id="doc-type"
              value={currentDocument.type}
              onChange={(e) => setCurrentDocument({...currentDocument, type: e.target.value as any})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="faq">Preguntas frecuentes (FAQ)</option>
              <option value="guide">Guía de uso</option>
              <option value="house_rules">Reglas de la casa</option>
              <option value="inventory">Inventario</option>
              <option value="other">Otro</option>
            </select>
          </div>
        </div>
        
        <div className="mt-3">
          <label htmlFor="doc-description" className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            id="doc-description"
            value={currentDocument.description}
            onChange={(e) => setCurrentDocument({...currentDocument, description: e.target.value})}
            placeholder="Añade información sobre este documento para ayudar al chatbot a utilizarlo correctamente..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            rows={3}
          />
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="document-upload"
              className="flex flex-col items-center px-4 py-6 bg-white rounded-md shadow-sm border border-gray-300 border-dashed cursor-pointer hover:bg-gray-50 w-full"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                </p>
                <p className="text-xs text-gray-500">PDF, Word, TXT (MAX. 10MB)</p>
              </div>
              <input 
                id="document-upload" 
                type="file" 
                accept=".pdf,.doc,.docx,.txt" 
                className="hidden"
                onChange={handleDocumentUpload}
              />
            </label>
          </div>
        </div>
        
        {validationError && (
          <p className="mt-2 text-sm text-red-600">{validationError}</p>
        )}
      </div>
    </div>
  );
};

export default PropertyDocumentsForm; 
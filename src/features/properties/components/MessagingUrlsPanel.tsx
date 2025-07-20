// src/features/properties/components/MessagingUrlsPanel.tsx
// Panel para mostrar URLs de medios listos para mensajería (WhatsApp/Telegram)

import React, { useState, useEffect } from 'react';
import { getPropertyMediaForMessaging, formatForWhatsApp, formatForTelegram, generateMediaSummary, validateMediaUrls, type PropertyMediaSummary, type MediaFileForMessaging } from '../../../services/mediaService';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../shared/components/loading/LoadingSpinner';
import { LoadingSize, LoadingVariant } from '../../../shared/components/loading/types';

interface MessagingUrlsPanelProps {
  propertyId: string;
  propertyName: string;
  onClose?: () => void;
}

export const MessagingUrlsPanel: React.FC<MessagingUrlsPanelProps> = ({
  propertyId,
  propertyName,
  onClose
}) => {
  const [mediaSummary, setMediaSummary] = useState<PropertyMediaSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    valid: MediaFileForMessaging[];
    invalid: MediaFileForMessaging[];
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Cargar datos al montar
  useEffect(() => {
    loadMediaData();
  }, [propertyId]);

  const loadMediaData = async () => {
    setLoading(true);
    try {
      const summary = await getPropertyMediaForMessaging(propertyId);
      setMediaSummary(summary);
    } catch (error) {
      console.error('Error cargando datos de medios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateUrls = async () => {
    if (!mediaSummary) return;
    
    setValidating(true);
    try {
      const allFiles = [...mediaSummary.images, ...mediaSummary.documents];
      const results = await validateMediaUrls(allFiles);
      setValidationResults(results);
    } catch (error) {
      console.error('Error validando URLs:', error);
    } finally {
      setValidating(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`URLs ${type} copiadas al portapapeles`);
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
    }
  };

  const getFilteredMedia = () => {
    if (!mediaSummary) return { images: [], documents: [] };
    
    if (selectedCategory === 'all') {
      return mediaSummary;
    }
    
    return {
      ...mediaSummary,
      images: mediaSummary.images.filter(img => img.subcategory === selectedCategory),
      documents: mediaSummary.documents.filter(doc => doc.subcategory === selectedCategory)
    };
  };

  const getUniqueCategories = () => {
    if (!mediaSummary) return [];
    
    const categories = new Set<string>();
    mediaSummary.images.forEach(img => categories.add(img.subcategory));
    mediaSummary.documents.forEach(doc => categories.add(doc.subcategory));
    
    return Array.from(categories).sort();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-center items-center h-40">
          <LoadingSpinner size={LoadingSize.LG} variant={LoadingVariant.PRIMARY} />
        </div>
      </div>
    );
  }

  if (!mediaSummary) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">URLs para Mensajería</h3>
        <p className="text-gray-500">No se pudieron cargar los archivos multimedia.</p>
        {onClose && (
          <div className="mt-4">
            <Button onClick={onClose} variant="secondary">Cerrar</Button>
          </div>
        )}
      </div>
    );
  }

  const filteredMedia = getFilteredMedia();
  const whatsappUrls = formatForWhatsApp([...filteredMedia.images, ...filteredMedia.documents]);
  const telegramData = formatForTelegram([...filteredMedia.images, ...filteredMedia.documents]);
  const summary = generateMediaSummary(mediaSummary);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">URLs para Mensajería</h3>
        {onClose && (
          <Button onClick={onClose} variant="secondary" size="sm">✕</Button>
        )}
      </div>

      {/* Resumen */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium mb-2">Resumen de Archivos</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{mediaSummary.images.length}</div>
            <div className="text-sm text-gray-600">Imágenes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{mediaSummary.documents.length}</div>
            <div className="text-sm text-gray-600">Documentos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{mediaSummary.total_count}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
      </div>

      {/* Filtro por categoría */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Filtrar por categoría:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
        >
          <option value="all">Todas las categorías</option>
          {getUniqueCategories().map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Acciones de validación */}
      <div className="mb-6">
        <Button
          onClick={handleValidateUrls}
          disabled={validating}
          className="mr-3"
        >
          {validating ? 'Validando...' : 'Validar URLs'}
        </Button>
        
        {validationResults && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm">
              ✅ {validationResults.valid.length} URLs válidas | 
              ❌ {validationResults.invalid.length} URLs inválidas
            </p>
          </div>
        )}
      </div>

      {/* URLs para WhatsApp */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">📱 URLs para WhatsApp</h4>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">{whatsappUrls.length} URLs listas</span>
            <Button
              size="sm"
              onClick={() => copyToClipboard(whatsappUrls.join('\n'), 'de WhatsApp')}
            >
              Copiar URLs
            </Button>
          </div>
          <div className="max-h-32 overflow-y-auto bg-white p-2 rounded text-xs font-mono">
            {whatsappUrls.map((url, index) => (
              <div key={index} className="truncate">{url}</div>
            ))}
          </div>
        </div>
      </div>

      {/* URLs para Telegram */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">💬 URLs para Telegram</h4>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">{telegramData.length} archivos con descripción</span>
            <Button
              size="sm"
              onClick={() => copyToClipboard(
                telegramData.map(item => `${item.url} - ${item.caption}`).join('\n'),
                'de Telegram'
              )}
            >
              Copiar con Descripción
            </Button>
          </div>
          <div className="max-h-32 overflow-y-auto bg-white p-2 rounded text-xs">
            {telegramData.map((item, index) => (
              <div key={index} className="mb-1">
                <div className="font-mono truncate text-blue-600">{item.url}</div>
                <div className="text-gray-600 ml-2">{item.caption}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resumen descriptivo */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">📋 Resumen Descriptivo</h4>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Listo para copiar en mensajes</span>
            <Button
              size="sm"
              onClick={() => copyToClipboard(summary, 'resumen')}
            >
              Copiar Resumen
            </Button>
          </div>
          <pre className="whitespace-pre-wrap text-sm bg-white p-2 rounded">
            {summary}
          </pre>
        </div>
      </div>

      {/* Lista detallada */}
      <div>
        <h4 className="font-medium mb-3">📋 Detalle de Archivos</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredMedia.images.map((image, index) => (
            <div key={`img-${index}`} className="flex items-center justify-between p-2 bg-green-50 rounded">
              <div className="flex-1">
                <span className="text-sm font-medium">🖼️ {image.title}</span>
                <span className="text-xs text-gray-500 ml-2">({image.subcategory})</span>
              </div>
              <div className="text-xs text-gray-400 truncate max-w-xs">
                {image.url}
              </div>
            </div>
          ))}
          
          {filteredMedia.documents.map((doc, index) => (
            <div key={`doc-${index}`} className="flex items-center justify-between p-2 bg-blue-50 rounded">
              <div className="flex-1">
                <span className="text-sm font-medium">📄 {doc.title}</span>
                <span className="text-xs text-gray-500 ml-2">({doc.subcategory})</span>
              </div>
              <div className="text-xs text-gray-400 truncate max-w-xs">
                {doc.url}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 
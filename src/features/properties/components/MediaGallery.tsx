import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import mediaService, { MediaItem as MediaItemType, PaginationOptions } from '../../../services/mediaService';

interface MediaGalleryProps {
  propertyId: string;
  editable?: boolean;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ propertyId, editable = false }) => {
  const [mediaItems, setMediaItems] = useState<MediaItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Configuración de dropzone para carga de archivos
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov']
    },
    disabled: !editable || uploading,
    onDrop: handleFileDrop,
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB máximo
  });

  // Cargar medios al inicializar o cambiar página
  useEffect(() => {
    // Función para cargar medios con paginación
    async function loadMedia() {
      if (!propertyId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const options: PaginationOptions = { page, limit: 12 };
        const result = await mediaService.getMediaByProperty(propertyId, options);
        
        if (page === 1) {
          setMediaItems(result.items);
        } else {
          setMediaItems(prev => [...prev, ...result.items]);
        }
        
        setTotalCount(result.totalCount);
        setHasMore(result.hasMore);
      } catch (err) {
        console.error('Error cargando medios:', err);
        setError('No se pudieron cargar los medios. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    }

    loadMedia();
  }, [propertyId, page]);

  // Manejar la subida de archivos
  async function handleFileDrop(acceptedFiles: File[]) {
    if (!editable || !acceptedFiles.length) return;
    
    setUploading(true);
    setError(null);
    
    try {
      const uploadedItems = await mediaService.uploadMediaFiles(propertyId, acceptedFiles);
      setMediaItems(prev => [...uploadedItems, ...prev]);
      setTotalCount(prev => prev + uploadedItems.length);
    } catch (err) {
      console.error('Error subiendo archivos:', err);
      setError('Hubo un problema al subir los archivos. Intente nuevamente.');
    } finally {
      setUploading(false);
    }
  }

  // Eliminar un medio
  async function handleDelete(mediaId: string) {
    if (!editable) return;
    
    try {
      await mediaService.deleteMedia(mediaId);
      setMediaItems(prev => prev.filter(item => item.id !== mediaId));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      console.error('Error eliminando medio:', err);
      setError('No se pudo eliminar el archivo. Intente nuevamente.');
    }
  }

  // Cargar más medios
  function loadMore() {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  }

  // Crear un componente separado para cada item de medios
  const MediaItemComponent: React.FC<{
    item: MediaItemType;
    editable: boolean;
    onDelete: (id: string) => void;
  }> = ({ item, editable, onDelete }) => {
    const [optimizedImageUrl, setOptimizedImageUrl] = useState<string>(item.url);
    
    // Cargar la imagen optimizada al montar el componente
    useEffect(() => {
      if (item.fileType === 'image') {
        mediaService.optimizeImage(item.url, { width: 300, height: 200 })
          .then(url => setOptimizedImageUrl(url))
          .catch(() => setOptimizedImageUrl(item.url)); // Fallback a la URL original en caso de error
      }
    }, [item.url, item.fileType]);
    
    return (
      <div className="relative rounded-lg overflow-hidden bg-gray-100 group">
        {item.fileType === 'image' ? (
          <img 
            src={optimizedImageUrl} 
            alt={item.fileName}
            className="w-full h-48 object-cover transition duration-300 group-hover:opacity-90"
            loading="lazy"
          />
        ) : (
          <div className="relative w-full h-48 bg-gray-800">
            <img 
              src={item.thumbnailUrl || '/placeholder-video.jpg'} 
              alt={item.fileName}
              className="w-full h-full object-cover opacity-80"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm3.536 10.536l-5 5a.5.5 0 01-.707 0 .5.5 0 010-.707L12.293 10 7.829 5.536a.5.5 0 010-.707.5.5 0 01.707 0l5 5a.5.5 0 010 .707z" />
              </svg>
            </div>
          </div>
        )}
        
        {editable && (
          <button 
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition duration-200"
            onClick={() => onDelete(item.id)}
            aria-label="Eliminar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        <div className="p-2 text-xs text-gray-500 truncate">
          {(item.size / (1024 * 1024)).toFixed(2)} MB
        </div>
      </div>
    );
  };

  // Renderizar un item de la galería
  function renderMediaItem(item: MediaItemType) {
    return <MediaItemComponent key={item.id} item={item} editable={editable} onDelete={handleDelete} />;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Galería de Medios</h3>
      
      {/* Área de carga de archivos */}
      {editable && (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition duration-200 ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
          } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600">Subiendo archivos...</p>
            </div>
          ) : isDragActive ? (
            <p className="text-blue-500 font-medium">Suelte los archivos aquí...</p>
          ) : (
            <div>
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-600 mb-1">Arrastre imágenes o videos aquí, o haga clic para seleccionar</p>
              <p className="text-gray-500 text-sm">Hasta 100MB por archivo</p>
            </div>
          )}
        </div>
      )}
      
      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Galería de medios */}
      {loading && mediaItems.length === 0 ? (
        <div className="flex justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : mediaItems.length > 0 ? (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaItems.map(renderMediaItem)}
          </div>
          
          {/* Botón "Cargar más" */}
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Cargando...' : 'Cargar más'}
              </button>
            </div>
          )}
          
          {/* Contador total */}
          <p className="mt-2 text-sm text-gray-500 text-center">
            Mostrando {mediaItems.length} de {totalCount} {totalCount === 1 ? 'elemento' : 'elementos'}
          </p>
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">
          No hay imágenes o videos para mostrar.
        </div>
      )}
    </div>
  );
};

export default MediaGallery; 
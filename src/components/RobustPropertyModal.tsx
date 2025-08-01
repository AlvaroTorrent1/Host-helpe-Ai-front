// src/components/RobustPropertyModal.tsx
// Modal de propiedades completamente integrado con el sistema robusto

import React, { useState, useCallback, useEffect } from 'react';
import { useRobustModalState } from '../hooks/useRobustModalState';
import { SystemHealthMonitor, useSystemHealthMonitor } from './SystemHealthMonitor';
import { useAuth } from '../contexts/AuthContext';

// Componente de indicador de estado de sincronización
const SyncStatusIndicator: React.FC<{
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  pendingOperations: number;
  lastSyncTimestamp: number | null;
  syncErrors: string[];
  integrityStatus: string;
}> = ({ 
  isSaving, 
  hasUnsavedChanges, 
  pendingOperations, 
  lastSyncTimestamp, 
  syncErrors,
  integrityStatus 
}) => {
  const getStatusColor = () => {
    if (syncErrors.length > 0) return 'text-red-500';
    if (isSaving) return 'text-blue-500';
    if (hasUnsavedChanges) return 'text-yellow-500';
    if (integrityStatus === 'healthy') return 'text-green-500';
    return 'text-gray-400';
  };

  const getStatusText = () => {
    if (syncErrors.length > 0) return `${syncErrors.length} errors`;
    if (isSaving) return 'Saving...';
    if (hasUnsavedChanges) return `${pendingOperations} changes pending`;
    if (lastSyncTimestamp) {
      const timeAgo = Math.floor((Date.now() - lastSyncTimestamp) / 1000);
      return `Saved ${timeAgo}s ago`;
    }
    return 'Ready';
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Indicador visual */}
      <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${isSaving ? 'animate-pulse' : ''} bg-current`} />
      
      {/* Texto de estado */}
      <span className={`text-xs ${getStatusColor()}`}>
        {getStatusText()}
      </span>

      {/* Contador de operaciones pendientes */}
      {pendingOperations > 0 && (
        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
          {pendingOperations}
        </span>
      )}
    </div>
  );
};

// Componente de archivo multimedia con estado optimista
const MediaFileCard: React.FC<{
  file: any;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
}> = ({ file, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(file.title);
  const [localDescription, setLocalDescription] = useState(file.description || '');

  const handleSave = useCallback(() => {
    if (localTitle !== file.title || localDescription !== file.description) {
      onUpdate(file.id, {
        title: localTitle,
        description: localDescription
      });
    }
    setIsEditing(false);
  }, [file.id, file.title, file.description, localTitle, localDescription, onUpdate]);

  const handleCancel = useCallback(() => {
    setLocalTitle(file.title);
    setLocalDescription(file.description || '');
    setIsEditing(false);
  }, [file.title, file.description]);

  return (
    <div className={`
      border rounded-lg p-4 space-y-3 transition-all
      ${file._isOptimistic ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}
      ${file._pendingOperation === 'delete' ? 'opacity-50' : ''}
    `}>
      {/* Header con indicadores de estado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {file.file_type === 'image' ? (
            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
              🖼️
            </div>
          ) : (
            <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
              📄
            </div>
          )}
          
          {/* Indicadores de estado optimista */}
          {file._isOptimistic && (
            <div className="flex items-center space-x-1">
              {file._pendingOperation === 'update' && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Updating...
                </span>
              )}
              {file._pendingOperation === 'create' && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Creating...
                </span>
              )}
              {file._pendingOperation === 'delete' && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  Deleting...
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
                disabled={file._pendingOperation === 'delete'}
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(file.id)}
                className="text-sm text-red-600 hover:text-red-800"
                disabled={file._pendingOperation === 'delete'}
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="text-sm text-green-600 hover:text-green-800"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Contenido editable */}
      {isEditing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="File title"
          />
          <textarea
            value={localDescription}
            onChange={(e) => setLocalDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Description (optional)"
            rows={2}
          />
        </div>
      ) : (
        <div className="space-y-1">
          <h4 className="font-medium text-gray-900">{file.title}</h4>
          {file.description && (
            <p className="text-sm text-gray-600">{file.description}</p>
          )}
        </div>
      )}

      {/* Metadata */}
      <div className="text-xs text-gray-500 border-t pt-2">
        <div>Size: {file.file_size ? `${Math.round(file.file_size / 1024)}KB` : 'Unknown'}</div>
        <div>Created: {new Date(file.created_at).toLocaleDateString()}</div>
        {file.updated_at !== file.created_at && (
          <div>Updated: {new Date(file.updated_at).toLocaleDateString()}</div>
        )}
      </div>
    </div>
  );
};

// Modal principal
export const RobustPropertyModal: React.FC<{
  propertyId: string;
  isOpen: boolean;
  onClose: () => void;
}> = ({ propertyId, isOpen, onClose }) => {
  const { user } = useAuth();
  const healthMonitor = useSystemHealthMonitor();
  
  // Estado robusto con auto-save
  const {
    mediaFiles,
    shareableLinks,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    lastSyncTimestamp,
    pendingOperations,
    syncErrors,
    integrityStatus,
    pendingOperationsCount,
    updateMediaFile,
    updateShareableLink,
    deleteMediaFile,
    syncNow,
    checkIntegrity,
    clearErrors,
    hasOptimisticChanges
  } = useRobustModalState(propertyId);

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // ========================================
  // HANDLERS DE OPERACIONES
  // ========================================

  const handleUpdateMediaFile = useCallback((mediaId: string, updates: any) => {
    updateMediaFile(mediaId, updates);
  }, [updateMediaFile]);

  const handleDeleteMediaFile = useCallback((mediaId: string) => {
    if (confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      deleteMediaFile(mediaId);
    }
  }, [deleteMediaFile]);

  const handleUpdateShareableLink = useCallback((linkId: string, updates: any) => {
    updateShareableLink(linkId, updates);
  }, [updateShareableLink]);

  // ========================================
  // HANDLERS DE MODAL
  // ========================================

  const handleClose = useCallback(async () => {
    if (hasUnsavedChanges) {
      const shouldSave = confirm(
        'You have unsaved changes. Do you want to save them before closing?'
      );
      
      if (shouldSave) {
        await syncNow();
      }
    }
    onClose();
  }, [hasUnsavedChanges, syncNow, onClose]);

  const handleForceSave = useCallback(async () => {
    await syncNow();
  }, [syncNow]);

  // ========================================
  // EFECTOS
  // ========================================

  // Verificar integridad al abrir el modal
  useEffect(() => {
    if (isOpen) {
      checkIntegrity();
    }
  }, [isOpen, checkIntegrity]);

  // Auto-mostrar monitor de salud si hay problemas
  useEffect(() => {
    if (syncErrors.length > 0 && healthMonitor.shouldShow) {
      healthMonitor.show();
    }
  }, [syncErrors.length, healthMonitor]);

  // ========================================
  // RENDERIZADO
  // ========================================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">Property Media Management</h2>
            
            {/* Status indicator */}
            <SyncStatusIndicator
              isSaving={isSaving}
              hasUnsavedChanges={hasUnsavedChanges}
              pendingOperations={pendingOperationsCount}
              lastSyncTimestamp={lastSyncTimestamp}
              syncErrors={syncErrors}
              integrityStatus={integrityStatus}
            />
          </div>

          <div className="flex items-center space-x-2">
            {/* Controles de sincronización */}
            {hasUnsavedChanges && (
              <button
                onClick={handleForceSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Now'}
              </button>
            )}

            {/* Botón de opciones avanzadas */}
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="px-3 py-2 text-sm text-gray-600 border rounded hover:bg-gray-50"
            >
              Advanced
            </button>

            {/* Cerrar */}
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm text-gray-600 border rounded hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Errores de sincronización */}
          {syncErrors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-red-800">
                  Sync Errors ({syncErrors.length})
                </h3>
                <button
                  onClick={clearErrors}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {syncErrors.map((error, index) => (
                  <div key={index} className="text-sm text-red-700">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Opciones avanzadas */}
          {showAdvancedOptions && (
            <div className="mb-6 p-4 bg-gray-50 border rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Advanced Options</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">System Integrity</span>
                  <button
                    onClick={checkIntegrity}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Check Now
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Optimistic Changes</span>
                  <span className="text-xs text-gray-500">
                    {hasOptimisticChanges ? 'Yes' : 'No'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Health Monitor</span>
                  <button
                    onClick={healthMonitor.toggleMinimized}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {healthMonitor.isMinimized ? 'Show' : 'Hide'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Media Files */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Media Files ({mediaFiles.length})
              </h3>
              
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading media files...
                </div>
              ) : mediaFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No media files found for this property.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mediaFiles.map((file) => (
                    <MediaFileCard
                      key={file.id}
                      file={file}
                      onUpdate={handleUpdateMediaFile}
                      onDelete={handleDeleteMediaFile}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Shareable Links */}
            {shareableLinks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Shareable Links ({shareableLinks.length})
                </h3>
                
                <div className="space-y-2">
                  {shareableLinks.map((link) => (
                    <div
                      key={link.id}
                      className={`
                        p-3 border rounded-lg
                        ${link._isOptimistic ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{link.title}</div>
                          <div className="text-sm text-gray-600">{link.public_url}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`
                            text-xs px-2 py-1 rounded
                            ${link.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          `}>
                            {link.is_active ? 'Active' : 'Inactive'}
                          </span>
                          
                          {link._isOptimistic && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Updating...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-500">
            Property ID: {propertyId}
          </div>
          
          <div className="text-sm text-gray-500">
            Last sync: {lastSyncTimestamp ? new Date(lastSyncTimestamp).toLocaleTimeString() : 'Never'}
          </div>
        </div>
      </div>

      {/* System Health Monitor */}
      {healthMonitor.shouldShow && (
        <div className="fixed bottom-4 right-4 w-96 z-60">
          <SystemHealthMonitor
            isMinimized={healthMonitor.isMinimized}
            onToggleMinimized={healthMonitor.toggleMinimized}
          />
        </div>
      )}
    </div>
  );
}; 
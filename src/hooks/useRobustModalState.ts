// src/hooks/useRobustModalState.ts
// Hook para estado optimista con integración completa al sistema robusto

import { useState, useEffect, useCallback, useRef } from 'react';
import { robustModalService, RobustUpdateResult, SagaOperationResult } from '../services/robustModalService';
import { useAuth } from '../contexts/AuthContext';

// Tipos para el estado del modal
export interface MediaFile {
  id: string;
  property_id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: 'image' | 'document';
  is_shareable: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Estado optimista
  _isOptimistic?: boolean;
  _pendingOperation?: 'create' | 'update' | 'delete';
  _originalData?: Partial<MediaFile>;
}

export interface ShareableLink {
  id: string;
  property_id: string;
  target_id?: string;
  title: string;
  description: string;
  public_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Estado optimista
  _isOptimistic?: boolean;
  _pendingOperation?: 'create' | 'update' | 'delete';
}

export interface ModalState {
  mediaFiles: MediaFile[];
  shareableLinks: ShareableLink[];
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  lastSyncTimestamp: number | null;
  pendingOperations: number;
  activeSaga: string | null;
  syncErrors: string[];
  integrityStatus: 'healthy' | 'warning' | 'error' | 'unknown';
}

export interface OptimisticOperation {
  id: string;
  type: 'media_update' | 'media_create' | 'media_delete' | 'link_update' | 'link_create' | 'link_delete';
  target_id: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

// Hook principal
export function useRobustModalState(propertyId?: string) {
  const { user } = useAuth();
  const [state, setState] = useState<ModalState>({
    mediaFiles: [],
    shareableLinks: [],
    isLoading: false,
    isSaving: false,
    hasUnsavedChanges: false,
    lastSyncTimestamp: null,
    pendingOperations: 0,
    activeSaga: null,
    syncErrors: [],
    integrityStatus: 'unknown'
  });

  const [pendingOperations, setPendingOperations] = useState<OptimisticOperation[]>([]);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const integrityCheckIntervalRef = useRef<NodeJS.Timeout>();

  // ========================================
  // OPERACIONES OPTIMISTAS
  // ========================================

  /**
   * Aplicar cambio optimista inmediato
   */
  const applyOptimisticUpdate = useCallback((
    type: OptimisticOperation['type'],
    targetId: string,
    data: any
  ) => {
    const operationId = `${type}_${targetId}_${Date.now()}`;
    const operation: OptimisticOperation = {
      id: operationId,
      type,
      target_id: targetId,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    // Añadir a operaciones pendientes
    setPendingOperations(prev => [...prev, operation]);

    // Aplicar cambio optimista al estado
    setState(prev => {
      const newState = { ...prev };
      
      switch (type) {
        case 'media_update':
          newState.mediaFiles = prev.mediaFiles.map(file => 
            file.id === targetId 
              ? { 
                  ...file, 
                  ...data, 
                  _isOptimistic: true,
                  _pendingOperation: 'update',
                  _originalData: file
                }
              : file
          );
          break;
        case 'media_create':
          newState.mediaFiles = [...prev.mediaFiles, {
            ...data,
            id: targetId,
            _isOptimistic: true,
            _pendingOperation: 'create'
          }];
          break;
        case 'media_delete':
          newState.mediaFiles = prev.mediaFiles.map(file =>
            file.id === targetId
              ? { ...file, _isOptimistic: true, _pendingOperation: 'delete' }
              : file
          );
          break;
        case 'link_update':
          newState.shareableLinks = prev.shareableLinks.map(link =>
            link.id === targetId
              ? { ...link, ...data, _isOptimistic: true, _pendingOperation: 'update' }
              : link
          );
          break;
        // ... otros casos
      }

      return {
        ...newState,
        hasUnsavedChanges: true,
        pendingOperations: prev.pendingOperations + 1
      };
    });

    // Programar auto-save
    scheduleAutoSave();

    return operationId;
  }, []);

  /**
   * Confirmar operación optimista (éxito)
   */
  const confirmOptimisticUpdate = useCallback((operationId: string, serverData?: any) => {
    setPendingOperations(prev => prev.filter(op => op.id !== operationId));
    
    setState(prev => {
      const newState = { ...prev };
      
      // Actualizar con datos del servidor si están disponibles
      if (serverData) {
        if (serverData.updated_media_file) {
          newState.mediaFiles = prev.mediaFiles.map(file =>
            file._isOptimistic && file._pendingOperation
              ? { ...serverData.updated_media_file, _isOptimistic: false }
              : file
          );
        }
        if (serverData.updated_link) {
          newState.shareableLinks = prev.shareableLinks.map(link =>
            link._isOptimistic && link._pendingOperation
              ? { ...serverData.updated_link, _isOptimistic: false }
              : link
          );
        }
      }

      return {
        ...newState,
        pendingOperations: Math.max(0, prev.pendingOperations - 1),
        lastSyncTimestamp: Date.now(),
        syncErrors: prev.syncErrors.filter(error => !error.includes(operationId))
      };
    });
  }, []);

  /**
   * Revertir operación optimista (fallo)
   */
  const revertOptimisticUpdate = useCallback((operationId: string, error: string) => {
    const operation = pendingOperations.find(op => op.id === operationId);
    if (!operation) return;

    setPendingOperations(prev => prev.filter(op => op.id !== operationId));

    setState(prev => {
      const newState = { ...prev };

      // Revertir cambios optimistas
      switch (operation.type) {
        case 'media_update':
          newState.mediaFiles = prev.mediaFiles.map(file => {
            if (file.id === operation.target_id && file._originalData) {
              const { _isOptimistic, _pendingOperation, _originalData, ...originalFile } = file._originalData as MediaFile;
              return originalFile;
            }
            return file;
          });
          break;
        case 'media_create':
          newState.mediaFiles = prev.mediaFiles.filter(file => file.id !== operation.target_id);
          break;
        case 'media_delete':
          newState.mediaFiles = prev.mediaFiles.map(file =>
            file.id === operation.target_id
              ? { ...file, _isOptimistic: false, _pendingOperation: undefined }
              : file
          );
          break;
        // ... otros casos
      }

      return {
        ...newState,
        pendingOperations: Math.max(0, prev.pendingOperations - 1),
        syncErrors: [...prev.syncErrors, `Operation failed: ${error}`]
      };
    });
  }, [pendingOperations]);

  // ========================================
  // SINCRONIZACIÓN CON SERVIDOR
  // ========================================

  /**
   * Sincronizar operaciones pendientes
   */
  const syncPendingOperations = useCallback(async () => {
    if (pendingOperations.length === 0 || !user?.id) return;

    setState(prev => ({ ...prev, isSaving: true }));

    // Procesar operaciones en lotes
    for (const operation of pendingOperations) {
      try {
        let result: RobustUpdateResult;

        switch (operation.type) {
          case 'media_update':
            result = await robustModalService.updateMediaFileRobust(
              operation.target_id,
              operation.data,
              user.id
            );
            break;
          case 'link_update':
            result = await robustModalService.updateShareableLinkRobust(
              operation.target_id,
              operation.data,
              user.id
            );
            break;
          // ... otros casos
          default:
            continue;
        }

        if (result.success) {
          confirmOptimisticUpdate(operation.id, result.updated_data);
        } else {
          revertOptimisticUpdate(operation.id, result.error || 'Unknown error');
        }
      } catch (error) {
        revertOptimisticUpdate(operation.id, error instanceof Error ? error.message : 'Network error');
      }
    }

    setState(prev => ({ 
      ...prev, 
      isSaving: false,
      hasUnsavedChanges: pendingOperations.length > 0
    }));
  }, [pendingOperations, user?.id, confirmOptimisticUpdate, revertOptimisticUpdate]);

  /**
   * Auto-save con debounce
   */
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      syncPendingOperations();
    }, 2000); // Auto-save después de 2 segundos de inactividad
  }, [syncPendingOperations]);

  /**
   * Forzar sincronización manual
   */
  const forcSync = useCallback(async () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    await syncPendingOperations();
  }, [syncPendingOperations]);

  // ========================================
  // OPERACIONES DE ALTO NIVEL
  // ========================================

  /**
   * Actualizar archivo multimedia con estado optimista
   */
  const updateMediaFile = useCallback((
    mediaId: string,
    updates: Partial<MediaFile>
  ) => {
    return applyOptimisticUpdate('media_update', mediaId, updates);
  }, [applyOptimisticUpdate]);

  /**
   * Actualizar enlace compartible con estado optimista
   */
  const updateShareableLink = useCallback((
    linkId: string,
    updates: Partial<ShareableLink>
  ) => {
    return applyOptimisticUpdate('link_update', linkId, updates);
  }, [applyOptimisticUpdate]);

  /**
   * Eliminar archivo multimedia con estado optimista
   */
  const deleteMediaFile = useCallback((mediaId: string) => {
    return applyOptimisticUpdate('media_delete', mediaId, {});
  }, [applyOptimisticUpdate]);

  // ========================================
  // MONITOREO DE INTEGRIDAD
  // ========================================

  /**
   * Verificar integridad del sistema periódicamente
   */
  const checkSystemIntegrity = useCallback(async () => {
    try {
      const result = await robustModalService.checkSystemIntegrity();
      
      setState(prev => ({
        ...prev,
        integrityStatus: result.total_issues_found === 0 ? 'healthy' :
                        result.total_issues_found < 5 ? 'warning' : 'error'
      }));

      // Si hay problemas, añadir a errores de sync
      if (result.total_issues_found > 0) {
        setState(prev => ({
          ...prev,
          syncErrors: [
            ...prev.syncErrors.filter(e => !e.includes('integrity')),
            `Integrity issues detected: ${result.total_issues_found} problems found`
          ]
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        integrityStatus: 'error',
        syncErrors: [...prev.syncErrors, 'Failed to check system integrity']
      }));
    }
  }, []);

  // ========================================
  // EFECTOS
  // ========================================

  // Auto-verificación de integridad cada 5 minutos
  useEffect(() => {
    checkSystemIntegrity(); // Verificación inicial
    
    integrityCheckIntervalRef.current = setInterval(checkSystemIntegrity, 5 * 60 * 1000);
    
    return () => {
      if (integrityCheckIntervalRef.current) {
        clearInterval(integrityCheckIntervalRef.current);
      }
    };
  }, [checkSystemIntegrity]);

  // Cleanup de timeouts
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Estado
    ...state,
    pendingOperationsCount: pendingOperations.length,
    
    // Operaciones optimistas
    updateMediaFile,
    updateShareableLink,
    deleteMediaFile,
    
    // Sincronización
    syncNow: forcSync,
    
    // Monitoreo
    checkIntegrity: checkSystemIntegrity,
    
    // Utilidades
    clearErrors: useCallback(() => setState(prev => ({ ...prev, syncErrors: [] })), []),
    hasOptimisticChanges: pendingOperations.length > 0
  };
} 
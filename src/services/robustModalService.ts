// src/services/robustModalService.ts
// Servicio robusto para operaciones del modal que integra con las funciones SQL avanzadas

import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

// Tipos para el sistema robusto
export interface RobustUpdateResult {
  success: boolean;
  updated_data: any;
  affected_records: number;
  operation_log: string[];
  error?: string;
}

export interface SagaOperationResult {
  success: boolean;
  saga_id: string;
  is_duplicate: boolean;
  message: string;
  saga_uuid?: string;
}

export interface SagaStepResult {
  success: boolean;
  saga_completed: boolean;
  next_step: string | null;
  message: string;
}

export interface IntegrityCheckResult {
  alert_triggered: boolean;
  alerts_created: number;
  total_issues_found: number;
  check_summary: {
    orphaned_documents: number;
    broken_featured_refs: number;
    system_status: string;
    check_completed_at: string;
  };
}

// Clase principal del servicio robusto
export class RobustModalService {
  private static instance: RobustModalService;
  private activeSagas = new Map<string, string>(); // sagaId -> sagaUuid
  
  static getInstance(): RobustModalService {
    if (!RobustModalService.instance) {
      RobustModalService.instance = new RobustModalService();
    }
    return RobustModalService.instance;
  }

  // ========================================
  // OPERACIONES ROBUSTAS DE MEDIA FILES
  // ========================================

  /**
   * Actualizar archivo multimedia con propagación automática
   * Integra con update_media_file_with_propagation()
   */
  async updateMediaFileRobust(
    mediaId: string,
    updates: {
      title?: string;
      description?: string;
      is_shareable?: boolean;
      sort_order?: number;
    },
    userId: string
  ): Promise<RobustUpdateResult> {
    try {
      const { data, error } = await supabase.rpc('update_media_file_with_propagation', {
        p_media_id: mediaId,
        p_updates: updates,
        p_user_id: userId
      });

      if (error) throw error;

      const result = data[0];
      return {
        success: result.success,
        updated_data: result.updated_media_file,
        affected_records: result.affected_links,
        operation_log: result.operation_log
      };
    } catch (error) {
      console.error('Error updating media file:', error);
      return {
        success: false,
        updated_data: null,
        affected_records: 0,
        operation_log: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Actualizar enlace compartible con validación
   * Integra con update_shareable_link_with_validation()
   */
  async updateShareableLinkRobust(
    linkId: string,
    updates: {
      title?: string;
      description?: string;
      public_url?: string;
      target_id?: string;
      is_active?: boolean;
    },
    userId: string
  ): Promise<RobustUpdateResult> {
    try {
      const { data, error } = await supabase.rpc('update_shareable_link_with_validation', {
        p_link_id: linkId,
        p_updates: updates,
        p_user_id: userId
      });

      if (error) throw error;

      const result = data[0];
      return {
        success: result.success,
        updated_data: result.updated_link,
        affected_records: 1,
        operation_log: result.operation_log,
        error: result.validation_errors?.length > 0 ? result.validation_errors.join(', ') : undefined
      };
    } catch (error) {
      console.error('Error updating shareable link:', error);
      return {
        success: false,
        updated_data: null,
        affected_records: 0,
        operation_log: [],
        error: error.message
      };
    }
  }

  // ========================================
  // SISTEMA DE SAGAS PARA OPERACIONES COMPLEJAS
  // ========================================

  /**
   * Iniciar una saga para operación compleja del modal
   * Integra con start_modal_saga()
   */
  async startModalSaga(
    sagaType: 'property_create' | 'property_update' | 'media_bulk_update',
    propertyId: string,
    userId: string,
    inputData: any,
    totalSteps: number = 1
  ): Promise<SagaOperationResult> {
    try {
      const sagaId = `${sagaType}_${Date.now()}_${uuidv4().slice(0, 8)}`;
      const idempotencyKey = `${sagaType}_${propertyId}_${userId}_${Date.now()}`;

      const { data, error } = await supabase.rpc('start_modal_saga', {
        p_saga_id: sagaId,
        p_saga_type: sagaType,
        p_idempotency_key: idempotencyKey,
        p_property_id: propertyId,
        p_user_id: userId,
        p_input_data: inputData,
        p_total_steps: totalSteps
      });

      if (error) throw error;

      const result = data[0];
      
      // Almacenar referencia de saga activa
      if (result.success && result.saga_uuid) {
        this.activeSagas.set(sagaId, result.saga_uuid);
      }

      return {
        success: result.success,
        saga_id: sagaId,
        is_duplicate: result.is_duplicate,
        message: result.message,
        saga_uuid: result.saga_uuid
      };
    } catch (error) {
      console.error('Error starting modal saga:', error);
      return {
        success: false,
        saga_id: '',
        is_duplicate: false,
        message: error.message
      };
    }
  }

  /**
   * Avanzar un paso en la saga
   * Integra con advance_saga_step()
   */
  async advanceSagaStep(
    sagaId: string,
    stepName: string,
    stepResult?: any,
    rollbackInfo?: any
  ): Promise<SagaStepResult> {
    try {
      const sagaUuid = this.activeSagas.get(sagaId);
      if (!sagaUuid) {
        throw new Error('Saga not found in active sagas');
      }

      const { data, error } = await supabase.rpc('advance_saga_step', {
        p_saga_uuid: sagaUuid,
        p_step_name: stepName,
        p_step_result: stepResult,
        p_rollback_info: rollbackInfo
      });

      if (error) throw error;

      const result = data[0];

      // Si la saga se completó, limpiar de activas
      if (result.saga_completed) {
        this.activeSagas.delete(sagaId);
      }

      return {
        success: result.success,
        saga_completed: result.saga_completed,
        next_step: result.next_step,
        message: result.message
      };
    } catch (error) {
      console.error('Error advancing saga step:', error);
      return {
        success: false,
        saga_completed: false,
        next_step: null,
        message: error.message
      };
    }
  }

  /**
   * Obtener estado de una saga activa
   */
  async getSagaStatus(sagaId: string): Promise<any> {
    try {
      const sagaUuid = this.activeSagas.get(sagaId);
      if (!sagaUuid) return null;

      const { data, error } = await supabase
        .from('modal_saga_state')
        .select('*')
        .eq('id', sagaUuid)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting saga status:', error);
      return null;
    }
  }

  // ========================================
  // MONITOREO Y SALUD DEL SISTEMA
  // ========================================

  /**
   * Verificar integridad del sistema
   * Integra con check_integrity_with_alerts_simple()
   */
  async checkSystemIntegrity(): Promise<IntegrityCheckResult> {
    try {
      const { data, error } = await supabase.rpc('check_integrity_with_alerts_simple');

      if (error) throw error;

      return data[0];
    } catch (error) {
      console.error('Error checking system integrity:', error);
      return {
        alert_triggered: true,
        alerts_created: 0,
        total_issues_found: -1,
        check_summary: {
          orphaned_documents: -1,
          broken_featured_refs: -1,
          system_status: 'error',
          check_completed_at: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Obtener alertas activas del dashboard
   */
  async getActiveAlerts(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('v_alerts_dashboard')
        .select('*')
        .order('latest_alert', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting active alerts:', error);
      return [];
    }
  }

  /**
   * Limpiar documentos huérfanos manualmente
   */
  async cleanupOrphanedDocuments(propertyId?: string): Promise<RobustUpdateResult> {
    try {
      const { data, error } = await supabase.rpc('manual_cleanup_orphaned_documents');

      if (error) throw error;

      const result = data[0];
      return {
        success: true,
        updated_data: result,
        affected_records: result.documents_deleted,
        operation_log: [`Cleaned up ${result.documents_deleted} orphaned documents`]
      };
    } catch (error) {
      console.error('Error cleaning up orphaned documents:', error);
      return {
        success: false,
        updated_data: null,
        affected_records: 0,
        operation_log: [],
        error: error.message
      };
    }
  }
}

// Exportar instancia singleton
export const robustModalService = RobustModalService.getInstance(); 
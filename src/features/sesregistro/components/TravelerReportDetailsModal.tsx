// src/features/sesregistro/components/TravelerReportDetailsModal.tsx
/**
 * Modal para mostrar detalles completos de un parte de viajero
 * Muestra toda la información cuando está completado, o mensaje de pendiente
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import type { TravelerReport } from './TravelerReportsTable';

// Individual traveler data for display
export interface TravelerDisplayData {
  firstName: string;
  lastName: string;
  document: string;
  documentType: string;
  nationality: string;
  birthDate: string;
  phone?: string;
  email: string;
}

// Datos completos del parte (cuando está completado)
// Now supports MULTIPLE travelers (array)
export interface TravelerReportDetails extends TravelerReport {
  // Array of ALL travelers for this report (supports 1 to N travelers)
  travelers?: TravelerDisplayData[];
  
  // Payment info (shared across all travelers)
  paymentMethod?: string;
  paymentHolder?: string;
  numPersons?: number;
  numRooms?: number;
  signatureUrl?: string; // Digital signature (shared across all travelers)
  
  // Legacy fields (for backwards compatibility - will show first traveler if used)
  touristFirstName?: string;
  touristLastName?: string;
  touristDocument?: string;
  touristDocumentType?: string;
  touristNationality?: string;
  touristBirthDate?: string;
  touristPhone?: string;
}

interface TravelerReportDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: TravelerReportDetails | null;
  onDownloadPdf?: (reportId: string) => void;
}

const TravelerReportDetailsModal: React.FC<TravelerReportDetailsModalProps> = ({
  isOpen,
  onClose,
  report,
  onDownloadPdf,
}) => {
  // Hook de traducción
  const { t } = useTranslation();
  
  // No renderizar si no está abierto o no hay reporte
  if (!isOpen || !report) return null;

  return (
    <>
      {/* Overlay oscuro */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('travelerRegistry.modal.title')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Contenido */}
          <div className="px-6 py-4 space-y-6">
            {/* Información de la Propiedad */}
            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                {t('travelerRegistry.modal.stayInfo')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t('travelerRegistry.modal.property')}</p>
                  <p className="text-sm font-medium text-gray-900">
                    {report.propertyName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('travelerRegistry.modal.status')}</p>
                  <p>
                    {report.status === 'completed' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {t('travelerRegistry.table.completedBadge')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {t('travelerRegistry.table.pendingBadge')}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('travelerRegistry.modal.checkIn')}</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(report.checkInDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('travelerRegistry.modal.checkOut')}</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(report.checkOutDate)}
                  </p>
                </div>
                {report.numPersons && (
                  <div>
                    <p className="text-sm text-gray-500">{t('travelerRegistry.modal.numPersons')}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {report.numPersons}
                    </p>
                  </div>
                )}
                {report.numRooms && (
                  <div>
                    <p className="text-sm text-gray-500">{t('travelerRegistry.modal.rooms')}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {report.numRooms}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Información de los Viajeros (soporta múltiples) */}
            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                {report.travelers && report.travelers.length > 1
                  ? `Viajeros (${report.travelers.length})`
                  : t('travelerRegistry.modal.travelerInfo')}
              </h3>
              
              {report.status === 'pending' ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <p className="text-sm text-yellow-800">
                    {t('travelerRegistry.modal.pendingMessage')}
                  </p>
                  <p className="text-sm text-yellow-700 mt-2">
                    {t('travelerRegistry.modal.emailSentTo')} <span className="font-medium">{report.touristEmail}</span>
                  </p>
                  <p className="text-sm text-yellow-700">
                    {t('travelerRegistry.modal.sentOn')} <span className="font-medium">{formatDate(report.sentAt)}</span>
                  </p>
                </div>
              ) : report.travelers && report.travelers.length > 0 ? (
                // Show ALL travelers (supports 1 to N)
                <div className="space-y-4">
                  {report.travelers.map((traveler, index) => (
                    <div 
                      key={index} 
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      {/* Header with traveler number (if multiple) */}
                      {report.travelers!.length > 1 && (
                        <div className="mb-3 pb-2 border-b border-gray-300">
                          <span className="text-sm font-semibold text-primary">
                            Viajero {index + 1}
                          </span>
                        </div>
                      )}
                      
                      {/* Traveler info grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm text-gray-500">{t('travelerRegistry.modal.fullName')}</p>
                          <p className="text-sm font-medium text-gray-900">
                            {traveler.firstName} {traveler.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">{t('travelerRegistry.modal.email')}</p>
                          <p className="text-sm font-medium text-gray-900">
                            {traveler.email}
                          </p>
                        </div>
                        {traveler.phone && (
                          <div>
                            <p className="text-sm text-gray-500">{t('travelerRegistry.modal.phone')}</p>
                            <p className="text-sm font-medium text-gray-900">
                              {traveler.phone}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-500">{t('travelerRegistry.modal.document')}</p>
                          <p className="text-sm font-medium text-gray-900">
                            {traveler.documentType}: {traveler.document}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">{t('travelerRegistry.modal.nationality')}</p>
                          <p className="text-sm font-medium text-gray-900">
                            {traveler.nationality}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">{t('travelerRegistry.modal.birthDate')}</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(traveler.birthDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Fallback to legacy single-traveler format (backwards compatibility)
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{t('travelerRegistry.modal.fullName')}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {report.touristFirstName} {report.touristLastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('travelerRegistry.modal.email')}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {report.touristEmail}
                    </p>
                  </div>
                  {report.touristPhone && (
                    <div>
                      <p className="text-sm text-gray-500">{t('travelerRegistry.modal.phone')}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {report.touristPhone}
                      </p>
                    </div>
                  )}
                  {report.touristDocument && (
                    <div>
                      <p className="text-sm text-gray-500">{t('travelerRegistry.modal.document')}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {report.touristDocumentType}: {report.touristDocument}
                      </p>
                    </div>
                  )}
                  {report.touristNationality && (
                    <div>
                      <p className="text-sm text-gray-500">{t('travelerRegistry.modal.nationality')}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {report.touristNationality}
                      </p>
                    </div>
                  )}
                  {report.touristBirthDate && (
                    <div>
                      <p className="text-sm text-gray-500">{t('travelerRegistry.modal.birthDate')}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(report.touristBirthDate)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Información de Pago (solo si está completado) */}
            {report.status === 'completed' && report.paymentMethod && (
              <section>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  {t('travelerRegistry.modal.paymentInfo')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{t('travelerRegistry.modal.paymentMethod')}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {report.paymentMethod}
                    </p>
                  </div>
                  {report.paymentHolder && (
                    <div>
                      <p className="text-sm text-gray-500">{t('travelerRegistry.modal.paymentHolder')}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {report.paymentHolder}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Firma Digital (solo si está completado) */}
            {report.status === 'completed' && report.signatureUrl && (
              <section>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  {t('travelerRegistry.modal.signature')}
                </h3>
                <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                  {/* Renderizar SVG directamente desde el string guardado en la base de datos */}
                  <div 
                    dangerouslySetInnerHTML={{ __html: report.signatureUrl }}
                    className="max-w-xs mx-auto"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {t('travelerRegistry.modal.signedOn')} {report.completedAt && formatDate(report.completedAt)}
                  </p>
                </div>
              </section>
            )}
          </div>

          {/* Footer con acciones */}
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              {t('travelerRegistry.modal.close')}
            </button>
            {report.status === 'completed' && onDownloadPdf && (
              <button
                onClick={() => onDownloadPdf(report.id)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md transition-colors"
              >
                <DocumentTextIcon className="w-4 h-4" />
                {t('travelerRegistry.modal.downloadPdf')}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Función helper para formatear fechas
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default TravelerReportDetailsModal;


/**
 * src/features/ses/SESSubmissionHistory.tsx
 * Componente para mostrar el historial de envíos del sistema SES
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { SESSubmission } from '../../types/ses';

interface SESSubmissionHistoryProps {
  submissions: SESSubmission[];
  isLoading?: boolean;
  onRetry?: (submissionId: string) => void;
  className?: string;
}

const PAGE_SIZE = 10;

const SESSubmissionHistory = ({
  submissions,
  isLoading = false,
  onRetry,
  className = ''
}: SESSubmissionHistoryProps) => {
  const { t, i18n } = useTranslation();
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Determinar el locale según el idioma actual
  const dateLocale = i18n.language === 'es' ? es : enUS;

  // Filtrar las submissions según el filtro actual
  const filteredSubmissions = submissions.filter(submission => {
    if (currentFilter === 'all') return true;
    return submission.status === currentFilter;
  });

  // Calcular el número total de páginas
  const totalPages = Math.ceil(filteredSubmissions.length / PAGE_SIZE);

  // Obtener las submissions para la página actual
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Cambiar el filtro
  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    setCurrentPage(1); // Resetear a la primera página al cambiar el filtro
  };

  // Cambiar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="animate-pulse space-y-4" data-testid="loading-skeleton">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Cabecera con filtros */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <h2 className="text-lg font-semibold text-gray-800">
            {t('ses.history.title', 'Submission History')}
          </h2>
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentFilter === 'all'
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('all')}
            >
              {t('ses.filters.all', 'All')}
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentFilter === 'pending'
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('pending')}
            >
              {t('ses.filters.pending', 'Pending')}
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentFilter === 'submitted'
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('submitted')}
            >
              {t('ses.filters.submitted', 'Submitted')}
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentFilter === 'error'
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('error')}
            >
              {t('ses.filters.error', 'Error')}
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de submissions */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('ses.table.guest', 'Guest')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('ses.table.property', 'Property')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('ses.table.document', 'Document')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('ses.table.date', 'Date')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('ses.table.status', 'Status')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('ses.table.actions', 'Actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedSubmissions.length > 0 ? (
              paginatedSubmissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{submission.guestName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{submission.propertyName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {t(`ses.documentTypes.${submission.documentType}`, submission.documentType)}
                      <span className="ml-1 text-gray-500">{submission.documentNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(new Date(submission.submissionDate), 'dd/MM/yyyy HH:mm', { locale: dateLocale })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={submission.status} errorMessage={submission.errorMessage} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {submission.status === 'error' && onRetry && (
                      <button
                        onClick={() => onRetry(submission.id)}
                        className="text-primary-500 hover:text-primary-700"
                      >
                        {t('ses.actions.retry', 'Retry')}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  {t('ses.history.noSubmissions', 'No submissions found')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                {t('common.pagination.showing', 'Showing')}{' '}
                <span className="font-medium">
                  {(currentPage - 1) * PAGE_SIZE + 1}
                </span>{' '}
                {t('common.pagination.to', 'to')}{' '}
                <span className="font-medium">
                  {Math.min(currentPage * PAGE_SIZE, filteredSubmissions.length)}
                </span>{' '}
                {t('common.pagination.of', 'of')}{' '}
                <span className="font-medium">{filteredSubmissions.length}</span>{' '}
                {t('common.pagination.results', 'results')}
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <span className="sr-only">{t('common.pagination.first', 'First')}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M7.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L3.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <span className="sr-only">{t('common.pagination.previous', 'Previous')}</span>
                  {t('ses.pagination.previous', 'Previous')}
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  {t('ses.pagination.next', 'Next')}
                  <span className="sr-only">{t('common.pagination.next', 'Next')}</span>
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <span className="sr-only">{t('common.pagination.last', 'Last')}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L8.586 10l-4.293 4.293a1 1 0 000 1.414z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M12.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L16.586 10l-4.293 4.293a1 1 0 000 1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para mostrar el estado con color
const StatusBadge = ({ status, errorMessage }: { status: string; errorMessage?: string }) => {
  const { t } = useTranslation();
  
  let bgColor = '';
  let textColor = '';
  
  switch (status) {
    case 'pending':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      break;
    case 'submitted':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'error':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
  }
  
  return (
    <>
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
        {t(`ses.status.${status}`, status)}
      </span>
      {errorMessage && (
        <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
      )}
    </>
  );
};

export default SESSubmissionHistory; 
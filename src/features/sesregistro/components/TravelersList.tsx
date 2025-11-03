// src/features/sesregistro/components/TravelersList.tsx
/**
 * Lista de viajeros añadidos
 * Muestra todos los viajeros con opciones para editar/eliminar
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Traveler } from '../types';
import TravelerCard from './TravelerCard';

interface TravelersListProps {
  travelers: Traveler[];
  onEdit: (traveler: Traveler) => void;
  onDelete: (travelerId: string) => void;
  onAdd: () => void;
}

const TravelersList: React.FC<TravelersListProps> = ({
  travelers,
  onEdit,
  onDelete,
  onAdd,
}) => {
  const { t } = useTranslation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteClick = (traveler: Traveler) => {
    if (window.confirm(t('sesRegistro.travelers.confirmDelete'))) {
      if (traveler.id) {
        onDelete(traveler.id);
      }
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('sesRegistro.travelers.title')} ({travelers.length})
        </h3>
        <button
          onClick={onAdd}
          className="flex items-center px-4 py-2 bg-primary-100 text-primary-700 hover:bg-primary-200 rounded-lg font-medium transition"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('sesRegistro.travelers.add')}
        </button>
      </div>

      {travelers.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-2">{t('sesRegistro.travelers.empty')}</p>
          <p className="text-sm text-gray-400">{t('sesRegistro.travelers.required')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {travelers.map((traveler, index) => (
            <TravelerCard
              key={traveler.id || `traveler-${index}`}
              traveler={traveler}
              onEdit={() => onEdit(traveler)}
              onDelete={() => handleDeleteClick(traveler)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TravelersList;



































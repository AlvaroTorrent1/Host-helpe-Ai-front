// src/features/sesregistro/components/TravelerCard.tsx
/**
 * Card individual para mostrar un viajero
 * Muestra información resumida con opciones para editar/eliminar
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Traveler } from '../types';
import { getCountryByCode } from '../constants';

interface TravelerCardProps {
  traveler: Traveler;
  onEdit: () => void;
  onDelete: () => void;
}

const TravelerCard: React.FC<TravelerCardProps> = ({
  traveler,
  onEdit,
  onDelete,
}) => {
  const { t, i18n } = useTranslation();
  
  // Obtener idioma actual
  const currentLanguage = i18n.language.startsWith('es') ? 'es' : 'en';

  // Obtener países
  const nationalityCountry = getCountryByCode(traveler.nationality);
  const residenceCountry = getCountryByCode(traveler.residenceCountry);
  const phoneCountry = getCountryByCode(traveler.phoneCountry);

  // Nombre completo
  const fullName = [
    traveler.firstName,
    traveler.firstSurname,
    traveler.secondSurname
  ].filter(Boolean).join(' ');

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
      <div className="flex items-start justify-between mb-3">
        {/* Nombre y nacionalidad */}
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-lg mb-1">
            {fullName}
          </h4>
          {nationalityCountry && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="text-lg mr-1.5">{nationalityCountry.flag}</span>
              <span>
                {currentLanguage === 'es' ? nationalityCountry.nameEs : nationalityCountry.nameEn}
              </span>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:text-primary hover:bg-primary-50 rounded-lg transition"
            title={t('sesRegistro.travelers.edit')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title={t('sesRegistro.travelers.delete')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        {/* Email */}
        <div className="flex items-center text-gray-600">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="truncate">{traveler.email}</span>
        </div>

        {/* Teléfono */}
        <div className="flex items-center text-gray-600">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          {phoneCountry && <span className="mr-1">{phoneCountry.flag}</span>}
          <span>{phoneCountry?.phoneCode} {traveler.phone}</span>
        </div>

        {/* Residencia */}
        {residenceCountry && (
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="mr-1">{residenceCountry.flag}</span>
            <span className="truncate">
              {traveler.city}, {currentLanguage === 'es' ? residenceCountry.nameEs : residenceCountry.nameEn}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelerCard;













































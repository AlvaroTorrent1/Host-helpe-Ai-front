// src/features/sesregistro/components/wizard/PersonalInfoStep.tsx
/**
 * Paso 1 del wizard: Información Personal
 * Nombre, apellidos, nacionalidad, sexo
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import CountrySelector from '../CountrySelector';
import { PartialTraveler, Gender } from '../../types';

interface PersonalInfoStepProps {
  travelerData: PartialTraveler;
  onUpdate: (data: Partial<PartialTraveler>) => void;
  errors?: Record<string, string>;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  travelerData,
  onUpdate,
  errors = {},
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Título y subtítulo */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('sesRegistro.wizard.personal.title')}
        </h2>
        <p className="text-gray-600">
          {t('sesRegistro.wizard.personal.subtitle')}
        </p>
      </div>

      {/* Nombre */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('sesRegistro.wizard.personal.firstName')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={travelerData.firstName || ''}
          onChange={(e) => onUpdate({ firstName: e.target.value })}
          placeholder={t('sesRegistro.wizard.personal.firstNamePlaceholder')}
          className={`
            w-full px-4 py-3 border rounded-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            ${errors.firstName ? 'border-red-500' : 'border-gray-300'}
          `}
        />
        {errors.firstName && (
          <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
        )}
      </div>

      {/* Primer Apellido */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('sesRegistro.wizard.personal.firstSurname')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={travelerData.firstSurname || ''}
          onChange={(e) => onUpdate({ firstSurname: e.target.value })}
          placeholder={t('sesRegistro.wizard.personal.firstSurnamePlaceholder')}
          className={`
            w-full px-4 py-3 border rounded-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            ${errors.firstSurname ? 'border-red-500' : 'border-gray-300'}
          `}
        />
        {errors.firstSurname && (
          <p className="mt-1 text-sm text-red-600">{errors.firstSurname}</p>
        )}
      </div>

      {/* Segundo Apellido (Opcional) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('sesRegistro.wizard.personal.secondSurname')}
        </label>
        <input
          type="text"
          value={travelerData.secondSurname || ''}
          onChange={(e) => onUpdate({ secondSurname: e.target.value })}
          placeholder={t('sesRegistro.wizard.personal.secondSurnamePlaceholder')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Nacionalidad */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('sesRegistro.wizard.personal.nationality')} <span className="text-red-500">*</span>
        </label>
        <CountrySelector
          value={travelerData.nationality || ''}
          onChange={(countryCode) => onUpdate({ nationality: countryCode })}
          placeholder={t('sesRegistro.wizard.personal.nationalityPlaceholder')}
          error={errors.nationality}
          showFlag={true}
        />
      </div>

      {/* Sexo */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          {t('sesRegistro.wizard.personal.gender')} <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          {/* Hombre */}
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="male"
              checked={travelerData.gender === 'male'}
              onChange={(e) => onUpdate({ gender: e.target.value as Gender })}
              className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
            />
            <span className="ml-2 text-gray-700">{t('sesRegistro.wizard.personal.male')}</span>
          </label>

          {/* Mujer */}
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="female"
              checked={travelerData.gender === 'female'}
              onChange={(e) => onUpdate({ gender: e.target.value as Gender })}
              className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
            />
            <span className="ml-2 text-gray-700">{t('sesRegistro.wizard.personal.female')}</span>
          </label>

          {/* Otro */}
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="other"
              checked={travelerData.gender === 'other'}
              onChange={(e) => onUpdate({ gender: e.target.value as Gender })}
              className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
            />
            <span className="ml-2 text-gray-700">{t('sesRegistro.wizard.personal.other')}</span>
          </label>
        </div>
        {errors.gender && (
          <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoStep;





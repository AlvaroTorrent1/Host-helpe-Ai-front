// src/features/sesregistro/components/wizard/ResidenceCountryStep.tsx
/**
 * Paso 2 del wizard: País de Residencia
 * El paso más simple - solo selecciona un país
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import CountrySelector from '../CountrySelector';
import { PartialTraveler } from '../../types';

interface ResidenceCountryStepProps {
  travelerData: PartialTraveler;
  onUpdate: (data: Partial<PartialTraveler>) => void;
  errors?: Record<string, string>;
}

const ResidenceCountryStep: React.FC<ResidenceCountryStepProps> = ({
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
          {t('sesRegistro.wizard.residence.title')}
        </h2>
        <p className="text-gray-600">
          {t('sesRegistro.wizard.residence.subtitle')}
        </p>
      </div>

      {/* Selector de país */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('sesRegistro.wizard.residence.country')} <span className="text-red-500">*</span>
        </label>
        <CountrySelector
          value={travelerData.residenceCountry || ''}
          onChange={(countryCode) => onUpdate({ residenceCountry: countryCode })}
          placeholder={t('sesRegistro.wizard.residence.countryPlaceholder')}
          error={errors.residenceCountry}
          showFlag={true}
        />
      </div>
    </div>
  );
};

export default ResidenceCountryStep;













































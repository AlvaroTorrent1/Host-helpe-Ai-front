// src/features/sesregistro/components/wizard/AddressInfoStep.tsx
/**
 * Paso 3 del wizard: Información de Dirección
 * Ciudad, código postal, dirección, información adicional
 * Incluye selector inteligente de municipios españoles con códigos INE
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { PartialTraveler } from '../../types';
import CityInput from '../CityInput';

interface AddressInfoStepProps {
  travelerData: PartialTraveler;
  onUpdate: (data: Partial<PartialTraveler>) => void;
  errors?: Record<string, string>;
}

const AddressInfoStep: React.FC<AddressInfoStepProps> = ({
  travelerData,
  onUpdate,
  errors = {},
}) => {
  const { t } = useTranslation();

  // Manejar cambio de ciudad con código INE
  const handleCityChange = (city: string, ineCode?: string) => {
    onUpdate({ 
      city, 
      ineCode: ineCode || undefined 
    });
  };

  return (
    <div className="space-y-6">
      {/* Título y subtítulo */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('sesRegistro.wizard.address.title')}
        </h2>
        <p className="text-gray-600">
          {t('sesRegistro.wizard.address.subtitle')}
        </p>
      </div>

      {/* Ciudad - Input con sugerencias inteligentes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('sesRegistro.wizard.address.city')} <span className="text-red-500">*</span>
        </label>
        <CityInput
          value={travelerData.city || ''}
          onChange={handleCityChange}
          error={errors.city}
          placeholder={t('sesRegistro.wizard.address.cityPlaceholder')}
        />
      </div>

      {/* Código Postal */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('sesRegistro.wizard.address.postalCode')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={travelerData.postalCode || ''}
          onChange={(e) => onUpdate({ postalCode: e.target.value })}
          placeholder={t('sesRegistro.wizard.address.postalCodePlaceholder')}
          className={`
            w-full px-4 py-3 border rounded-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}
          `}
        />
        {/* Mostrar país usado para validación */}
        {travelerData.residenceCountry && (
          <p className="mt-1 text-xs text-gray-500">
            ℹ️ Validando formato de: {travelerData.residenceCountry}
          </p>
        )}
        {errors.postalCode && (
          <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
        )}
      </div>

      {/* Dirección */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('sesRegistro.wizard.address.address')} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={travelerData.address || ''}
          onChange={(e) => onUpdate({ address: e.target.value })}
          placeholder={t('sesRegistro.wizard.address.addressPlaceholder')}
          rows={3}
          className={`
            w-full px-4 py-3 border rounded-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            resize-none
            ${errors.address ? 'border-red-500' : 'border-gray-300'}
          `}
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address}</p>
        )}
      </div>

      {/* Información Adicional (Opcional) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('sesRegistro.wizard.address.additionalAddress')}
        </label>
        <textarea
          value={travelerData.additionalAddress || ''}
          onChange={(e) => onUpdate({ additionalAddress: e.target.value })}
          placeholder={t('sesRegistro.wizard.address.additionalAddressPlaceholder')}
          rows={2}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        />
      </div>
    </div>
  );
};

export default AddressInfoStep;





















// src/features/sesregistro/components/wizard/ContactInfoStep.tsx
/**
 * Paso 4 del wizard: Información de Contacto
 * Email, teléfono principal, teléfono alternativo (opcional)
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import PhoneInput from '../PhoneInput';
import { PartialTraveler } from '../../types';
import { DEFAULT_COUNTRY } from '../../constants';

interface ContactInfoStepProps {
  travelerData: PartialTraveler;
  onUpdate: (data: Partial<PartialTraveler>) => void;
  errors?: Record<string, string>;
}

const ContactInfoStep: React.FC<ContactInfoStepProps> = ({
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
          {t('sesRegistro.wizard.contact.title')}
        </h2>
        <p className="text-gray-600">
          {t('sesRegistro.wizard.contact.subtitle')}
        </p>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('sesRegistro.wizard.contact.email')} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            type="email"
            value={travelerData.email || ''}
            onChange={(e) => onUpdate({ email: e.target.value })}
            placeholder={t('sesRegistro.wizard.contact.emailPlaceholder')}
            className={`
              w-full pl-12 pr-4 py-3 border rounded-lg
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              ${errors.email ? 'border-red-500' : 'border-gray-300'}
            `}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Teléfono Principal */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('sesRegistro.wizard.contact.phone')} <span className="text-red-500">*</span>
        </label>
        <PhoneInput
          phoneCountry={travelerData.phoneCountry || DEFAULT_COUNTRY.code}
          phoneNumber={travelerData.phone || ''}
          onPhoneCountryChange={(countryCode) => onUpdate({ phoneCountry: countryCode })}
          onPhoneNumberChange={(phoneNumber) => onUpdate({ phone: phoneNumber })}
          placeholder={t('sesRegistro.wizard.contact.phonePlaceholder')}
          error={errors.phone}
          required
        />
      </div>

      {/* Teléfono Alternativo (Opcional) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('sesRegistro.wizard.contact.alternativePhone')}
        </label>
        <PhoneInput
          phoneCountry={travelerData.alternativePhoneCountry || DEFAULT_COUNTRY.code}
          phoneNumber={travelerData.alternativePhone || ''}
          onPhoneCountryChange={(countryCode) => onUpdate({ alternativePhoneCountry: countryCode })}
          onPhoneNumberChange={(phoneNumber) => onUpdate({ alternativePhone: phoneNumber })}
          placeholder={t('sesRegistro.wizard.contact.alternativePhonePlaceholder')}
        />
      </div>
    </div>
  );
};

export default ContactInfoStep;









































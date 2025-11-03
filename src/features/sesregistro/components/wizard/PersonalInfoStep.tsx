// src/features/sesregistro/components/wizard/PersonalInfoStep.tsx
/**
 * Paso 1 del wizard: Información Personal
 * Nombre, apellidos, nacionalidad, sexo, documento, fecha de nacimiento
 */

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CountrySelector from '../CountrySelector';
import { PartialTraveler, Gender, DocumentType } from '../../types';
import { requiresSecondSurname, getDocumentExample, filterDocumentInput } from '../../validators';

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

  // Verificar si el segundo apellido es obligatorio (DNI/NIE españoles)
  const isSecondSurnameRequired = useMemo(() => {
    return requiresSecondSurname(
      travelerData.documentType || 'other',
      travelerData.nationality || ''
    );
  }, [travelerData.documentType, travelerData.nationality]);

  // Obtener ejemplo de documento
  const documentExample = useMemo(() => {
    if (travelerData.documentType && travelerData.nationality) {
      return getDocumentExample(travelerData.documentType, travelerData.nationality);
    }
    return '';
  }, [travelerData.documentType, travelerData.nationality]);

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

      {/* Segundo Apellido (Condicional: obligatorio para DNI/NIE españoles) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('sesRegistro.wizard.personal.secondSurname')}
          {isSecondSurnameRequired && <span className="text-red-500">*</span>}
          {isSecondSurnameRequired && (
            <span className="text-xs font-normal text-gray-500 ml-2">
              {t('sesRegistro.wizard.personal.requiredForDNI')}
            </span>
          )}
        </label>
        <input
          type="text"
          value={travelerData.secondSurname || ''}
          onChange={(e) => onUpdate({ secondSurname: e.target.value })}
          placeholder={t('sesRegistro.wizard.personal.secondSurnamePlaceholder')}
          className={`
            w-full px-4 py-3 border rounded-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            ${errors.secondSurname ? 'border-red-500' : 'border-gray-300'}
          `}
        />
        {errors.secondSurname && (
          <p className="mt-1 text-sm text-red-600">{errors.secondSurname}</p>
        )}
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

      {/* Tipo de Documento */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('sesRegistro.wizard.personal.documentType')} <span className="text-red-500">*</span>
        </label>
        <select
          value={travelerData.documentType || ''}
          onChange={(e) => onUpdate({ documentType: e.target.value as DocumentType })}
          className={`
            w-full px-4 py-3 border rounded-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            ${errors.documentType ? 'border-red-500' : 'border-gray-300'}
          `}
        >
          <option value="">{t('sesRegistro.wizard.personal.documentTypePlaceholder')}</option>
          <option value="passport">{t('sesRegistro.wizard.personal.documentTypes.passport')}</option>
          <option value="dni">{t('sesRegistro.wizard.personal.documentTypes.dni')}</option>
          <option value="nie">{t('sesRegistro.wizard.personal.documentTypes.nie')}</option>
          <option value="other">{t('sesRegistro.wizard.personal.documentTypes.other')}</option>
        </select>
        {errors.documentType && (
          <p className="mt-1 text-sm text-red-600">{errors.documentType}</p>
        )}
      </div>

      {/* Número de Documento */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('sesRegistro.wizard.personal.documentNumber')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={travelerData.documentNumber || ''}
          onChange={(e) => {
            // Filtrar entrada: solo alfanuméricos, espacios y guiones
            const filtered = filterDocumentInput(e.target.value);
            onUpdate({ documentNumber: filtered });
          }}
          placeholder={t('sesRegistro.wizard.personal.documentNumberPlaceholder')}
          className={`
            w-full px-4 py-3 border rounded-lg font-mono
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            ${errors.documentNumber ? 'border-red-500' : 'border-gray-300'}
          `}
        />
        {errors.documentNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.documentNumber}</p>
        )}
        {documentExample && !errors.documentNumber && (
          <p className="mt-1 text-xs text-gray-500">
            {t('sesRegistro.wizard.personal.documentNumberExample')} {documentExample}
          </p>
        )}
      </div>

      {/* Número de Soporte del Documento */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('sesRegistro.wizard.personal.documentSupportNumber')} <span className="text-gray-400 text-xs">(opcional)</span>
        </label>
        <input
          type="text"
          value={travelerData.documentSupportNumber || ''}
          onChange={(e) => {
            // Filtrar entrada: solo alfanuméricos
            const filtered = filterDocumentInput(e.target.value);
            onUpdate({ documentSupportNumber: filtered });
          }}
          placeholder={t('sesRegistro.wizard.personal.documentSupportNumberPlaceholder')}
          className={`
            w-full px-4 py-3 border rounded-lg font-mono
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            ${errors.documentSupportNumber ? 'border-red-500' : 'border-gray-300'}
          `}
        />
        {errors.documentSupportNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.documentSupportNumber}</p>
        )}
        {!errors.documentSupportNumber && (
          <p className="mt-1 text-xs text-gray-500">
            {t('sesRegistro.wizard.personal.documentSupportNumberHelp')}
          </p>
        )}
      </div>

      {/* Fecha de Nacimiento */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('sesRegistro.wizard.personal.dateOfBirth')} <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={travelerData.dateOfBirth || ''}
          onChange={(e) => onUpdate({ dateOfBirth: e.target.value })}
          max={new Date().toISOString().split('T')[0]} // No permitir fechas futuras
          className={`
            w-full px-4 py-3 border rounded-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}
          `}
        />
        {errors.dateOfBirth && (
          <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
        )}
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





















// src/features/sesregistro/components/AddTravelerWizard.tsx
/**
 * Modal wizard para añadir/editar viajero
 * Orquesta los 4 pasos del wizard con validación y navegación
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Traveler, PartialTraveler, WizardStep } from '../types';
import { WIZARD_STEPS, EMAIL_REGEX, PHONE_REGEX } from '../constants';
import WizardProgressBar from './wizard/WizardProgressBar';
import PersonalInfoStep from './wizard/PersonalInfoStep';
import ResidenceCountryStep from './wizard/ResidenceCountryStep';
import AddressInfoStep from './wizard/AddressInfoStep';
import ContactInfoStep from './wizard/ContactInfoStep';
import { 
  validateDocument, 
  requiresSecondSurname,
  validateDateOfBirth,
  validatePhone,
  validatePostalCode
} from '../validators';

interface AddTravelerWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (traveler: Traveler) => void;
  editingTraveler?: Traveler | null;
}

const AddTravelerWizard: React.FC<AddTravelerWizardProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTraveler,
}) => {
  const { t } = useTranslation();
  
  // Estado del wizard
  const [currentStep, setCurrentStep] = useState<WizardStep>('personal');
  const [travelerData, setTravelerData] = useState<PartialTraveler>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar datos si estamos editando
  useEffect(() => {
    if (isOpen) {
      if (editingTraveler) {
        setTravelerData(editingTraveler);
      } else {
        setTravelerData({});
      }
      setCurrentStep('personal');
      setErrors({});
    }
  }, [isOpen, editingTraveler]);

  // Actualizar datos del viajero
  const handleUpdate = (data: Partial<PartialTraveler>) => {
    setTravelerData(prev => ({ ...prev, ...data }));
    // Limpiar errores de los campos que se están actualizando
    const newErrors = { ...errors };
    Object.keys(data).forEach(key => {
      delete newErrors[key];
    });
    setErrors(newErrors);
  };

  // Validar paso actual
  const validateStep = (step: WizardStep): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'personal':
        // Validar nombre
        if (!travelerData.firstName?.trim()) {
          newErrors.firstName = t('sesRegistro.validation.required');
        }
        
        // Validar primer apellido
        if (!travelerData.firstSurname?.trim()) {
          newErrors.firstSurname = t('sesRegistro.validation.required');
        }
        
        // Validar segundo apellido (obligatorio para DNI/NIE españoles)
        const needsSecondSurname = requiresSecondSurname(
          travelerData.documentType || 'other',
          travelerData.nationality || ''
        );
        if (needsSecondSurname && !travelerData.secondSurname?.trim()) {
          newErrors.secondSurname = t('sesRegistro.validation.secondSurnameRequired');
        }
        
        // Validar nacionalidad
        if (!travelerData.nationality) {
          newErrors.nationality = t('sesRegistro.validation.selectCountry');
        }
        
        // Validar tipo de documento
        if (!travelerData.documentType) {
          newErrors.documentType = t('sesRegistro.validation.selectDocumentType');
        }
        
        // Validar número de documento
        if (!travelerData.documentNumber?.trim()) {
          newErrors.documentNumber = t('sesRegistro.validation.documentNumberRequired');
        } else if (travelerData.documentType && travelerData.nationality) {
          const docValidation = validateDocument(
            travelerData.documentNumber,
            travelerData.documentType,
            travelerData.nationality
          );
          if (!docValidation.valid) {
            newErrors.documentNumber = docValidation.message || t('sesRegistro.validation.invalidFormat');
          }
        }
        
        // Validar fecha de nacimiento
        if (!travelerData.dateOfBirth) {
          newErrors.dateOfBirth = t('sesRegistro.validation.dateOfBirthRequired');
        } else {
          const dobValidation = validateDateOfBirth(travelerData.dateOfBirth);
          if (!dobValidation.valid) {
            newErrors.dateOfBirth = dobValidation.message || t('sesRegistro.validation.invalidDate');
          }
        }
        
        // Validar género
        if (!travelerData.gender) {
          newErrors.gender = t('sesRegistro.validation.selectGender');
        }
        break;

      case 'residence':
        if (!travelerData.residenceCountry) {
          newErrors.residenceCountry = t('sesRegistro.validation.selectCountry');
        }
        break;

      case 'address':
        // Validar ciudad
        if (!travelerData.city?.trim()) {
          newErrors.city = t('sesRegistro.validation.required');
        }
        
        // Validar código postal
        if (!travelerData.postalCode?.trim()) {
          newErrors.postalCode = t('sesRegistro.validation.required');
        } else if (travelerData.residenceCountry) {
          const postalValidation = validatePostalCode(
            travelerData.postalCode,
            travelerData.residenceCountry
          );
          if (!postalValidation.valid) {
            newErrors.postalCode = postalValidation.message || t('sesRegistro.validation.invalidFormat');
          }
        }
        
        // Validar dirección
        if (!travelerData.address?.trim()) {
          newErrors.address = t('sesRegistro.validation.required');
        }
        break;

      case 'contact':
        // Validar email
        if (!travelerData.email?.trim()) {
          newErrors.email = t('sesRegistro.validation.required');
        } else if (!EMAIL_REGEX.test(travelerData.email)) {
          newErrors.email = t('sesRegistro.validation.invalidEmail');
        }
        
        // Validar teléfono con libphonenumber-js
        if (!travelerData.phone?.trim()) {
          newErrors.phone = t('sesRegistro.validation.required');
        } else if (travelerData.phoneCountry) {
          const phoneValidation = validatePhone(
            travelerData.phone,
            travelerData.phoneCountry
          );
          if (!phoneValidation.valid) {
            newErrors.phone = phoneValidation.message || t('sesRegistro.validation.invalidNumber');
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navegar al siguiente paso
  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    const steps: WizardStep[] = ['personal', 'residence', 'address', 'contact'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  // Navegar al paso anterior
  const handleBack = () => {
    const steps: WizardStep[] = ['personal', 'residence', 'address', 'contact'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  // Enviar formulario
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Construir objeto Traveler completo
      const traveler: Traveler = {
        id: editingTraveler?.id,
        // Información Personal
        firstName: travelerData.firstName!,
        firstSurname: travelerData.firstSurname!,
        secondSurname: travelerData.secondSurname,
        nationality: travelerData.nationality!,
        gender: travelerData.gender!,
        // Información del Documento
        documentType: travelerData.documentType!,
        documentNumber: travelerData.documentNumber!,
        documentSupportNumber: travelerData.documentSupportNumber,
        dateOfBirth: travelerData.dateOfBirth!,
        placeOfBirth: travelerData.placeOfBirth,
        // País de Residencia
        residenceCountry: travelerData.residenceCountry!,
        // Dirección
        city: travelerData.city!,
        ineCode: travelerData.ineCode, // Código INE del municipio (opcional)
        postalCode: travelerData.postalCode!,
        address: travelerData.address!,
        additionalAddress: travelerData.additionalAddress,
        // Contacto
        email: travelerData.email!,
        phoneCountry: travelerData.phoneCountry!,
        phone: travelerData.phone!,
        alternativePhoneCountry: travelerData.alternativePhoneCountry,
        alternativePhone: travelerData.alternativePhone,
      };

      onSave(traveler);
      onClose();
    } catch (error) {
      console.error('Error al guardar viajero:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizar el paso actual
  const renderStep = () => {
    switch (currentStep) {
      case 'personal':
        return <PersonalInfoStep travelerData={travelerData} onUpdate={handleUpdate} errors={errors} />;
      case 'residence':
        return <ResidenceCountryStep travelerData={travelerData} onUpdate={handleUpdate} errors={errors} />;
      case 'address':
        return <AddressInfoStep travelerData={travelerData} onUpdate={handleUpdate} errors={errors} />;
      case 'contact':
        return <ContactInfoStep travelerData={travelerData} onUpdate={handleUpdate} errors={errors} />;
      default:
        return null;
    }
  };

  // Determinar si es el último paso
  const isLastStep = currentStep === 'contact';
  const isFirstStep = currentStep === 'personal';

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingTraveler ? t('sesRegistro.wizard.editTitle') : t('sesRegistro.wizard.title')}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Progress Bar */}
              <WizardProgressBar currentStep={currentStep} />
            </div>

            {/* Content */}
            <div className="px-6 py-8 overflow-y-auto max-h-[calc(90vh-180px)]">
              {renderStep()}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <div className="flex justify-between gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isFirstStep}
                  className={`
                    px-6 py-3 rounded-lg font-medium transition
                    ${isFirstStep
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  {t('sesRegistro.wizard.back')}
                </button>

                <button
                  type="button"
                  onClick={isLastStep ? handleSubmit : handleNext}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-primary hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
                >
                  {isSubmitting
                    ? t('sesRegistro.submit.submitting')
                    : isLastStep
                    ? t('sesRegistro.wizard.submit')
                    : t('sesRegistro.wizard.next')
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddTravelerWizard;





















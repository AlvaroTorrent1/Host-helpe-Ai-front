// src/features/sesregistro/components/ReservationForm.tsx
/**
 * Formulario para editar datos de la reserva
 * Permite seleccionar fechas, número de viajeros y método de pago
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PaymentMethod } from '../types';

interface ReservationFormData {
  checkIn: string;
  checkOut: string;
  numberOfTravelers: number;
  paymentMethod: PaymentMethod;
}

interface ReservationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ReservationFormData) => void;
  initialData: ReservationFormData;
  propertyName: string;
}

const ReservationForm: React.FC<ReservationFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  propertyName,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ReservationFormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      setErrors({});
    }
  }, [isOpen, initialData]);

  // Calcular número de noches
  const calculateNights = (checkIn: string, checkOut: string): number => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const numberOfNights = calculateNights(formData.checkIn, formData.checkOut);

  // Validar formulario
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.checkIn) {
      newErrors.checkIn = t('sesRegistro.validation.required');
    }

    if (!formData.checkOut) {
      newErrors.checkOut = t('sesRegistro.validation.required');
    }

    if (formData.checkIn && formData.checkOut) {
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      
      if (checkOutDate <= checkInDate) {
        newErrors.checkOut = 'La fecha de salida debe ser posterior a la de entrada';
      }
    }

    if (formData.numberOfTravelers < 1) {
      newErrors.numberOfTravelers = 'Debe haber al menos 1 viajero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSave(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            className="relative bg-white rounded-lg shadow-xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Editar Datos de Reserva
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
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
              {/* Nombre de la propiedad (solo lectura) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre de la propiedad
                </label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                  {propertyName}
                </div>
              </div>

              {/* Fecha de entrada */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha de Entrada <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className={`
                    w-full px-4 py-3 border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                    ${errors.checkIn ? 'border-red-500' : 'border-gray-300'}
                  `}
                />
                {errors.checkIn && (
                  <p className="mt-1 text-sm text-red-600">{errors.checkIn}</p>
                )}
              </div>

              {/* Fecha de salida */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha de Salida <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  min={formData.checkIn || new Date().toISOString().split('T')[0]}
                  className={`
                    w-full px-4 py-3 border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                    ${errors.checkOut ? 'border-red-500' : 'border-gray-300'}
                  `}
                />
                {errors.checkOut && (
                  <p className="mt-1 text-sm text-red-600">{errors.checkOut}</p>
                )}
                {numberOfNights > 0 && (
                  <p className="mt-1 text-sm text-primary font-medium">
                    {numberOfNights} {numberOfNights === 1 ? 'noche' : 'noches'}
                  </p>
                )}
              </div>

              {/* Número de viajeros */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Número de Viajeros <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.numberOfTravelers}
                  onChange={(e) => setFormData({ ...formData, numberOfTravelers: parseInt(e.target.value) || 1 })}
                  className={`
                    w-full px-4 py-3 border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                    ${errors.numberOfTravelers ? 'border-red-500' : 'border-gray-300'}
                  `}
                />
                {errors.numberOfTravelers && (
                  <p className="mt-1 text-sm text-red-600">{errors.numberOfTravelers}</p>
                )}
              </div>

              {/* Método de pago */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Método de Pago <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="destination">{t('sesRegistro.paymentMethods.destination')}</option>
                  <option value="online">{t('sesRegistro.paymentMethods.online')}</option>
                  <option value="bank_transfer">{t('sesRegistro.paymentMethods.bank_transfer')}</option>
                  <option value="other">{t('sesRegistro.paymentMethods.other')}</option>
                </select>
              </div>
            </form>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-primary hover:bg-primary-600 text-white rounded-lg font-semibold transition"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReservationForm;





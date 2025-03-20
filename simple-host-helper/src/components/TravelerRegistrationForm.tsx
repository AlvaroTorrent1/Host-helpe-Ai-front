import React, { useState } from 'react';

interface TravelerFormData {
  firstName: string;
  lastName: string;
  documentType: 'dni' | 'nie' | 'passport';
  documentNumber: string;
  documentCountry: string;
  birthDate: string;
  nationality: string;
}

interface TravelerRegistrationFormProps {
  onSubmit: (data: TravelerFormData) => void;
  onCancel: () => void;
}

const TravelerRegistrationForm: React.FC<TravelerRegistrationFormProps> = ({ 
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState<TravelerFormData>({
    firstName: '',
    lastName: '',
    documentType: 'passport',
    documentNumber: '',
    documentCountry: 'ES',
    birthDate: '',
    nationality: 'ES'
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof TravelerFormData, string>>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error al cambiar el valor
    if (errors[name as keyof TravelerFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TravelerFormData, string>> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es obligatorio';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Los apellidos son obligatorios';
    }
    
    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = 'El número de documento es obligatorio';
    }
    
    if (!formData.birthDate) {
      newErrors.birthDate = 'La fecha de nacimiento es obligatoria';
    } else {
      // Verificar que la fecha es válida y no está en el futuro
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      
      if (isNaN(birthDate.getTime())) {
        newErrors.birthDate = 'Formato de fecha inválido';
      } else if (birthDate > today) {
        newErrors.birthDate = 'La fecha de nacimiento no puede ser en el futuro';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Registro de Viajero (SES)</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full p-2 border rounded focus:ring-primary-500 focus:border-primary-500 ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Apellidos *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full p-2 border rounded focus:ring-primary-500 focus:border-primary-500 ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Documento *
            </label>
            <select
              id="documentType"
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="dni">DNI</option>
              <option value="nie">NIE</option>
              <option value="passport">Pasaporte</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Número de Documento *
            </label>
            <input
              type="text"
              id="documentNumber"
              name="documentNumber"
              value={formData.documentNumber}
              onChange={handleChange}
              className={`w-full p-2 border rounded focus:ring-primary-500 focus:border-primary-500 ${
                errors.documentNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.documentNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.documentNumber}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="documentCountry" className="block text-sm font-medium text-gray-700 mb-1">
              País Expedición *
            </label>
            <select
              id="documentCountry"
              name="documentCountry"
              value={formData.documentCountry}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="ES">España</option>
              <option value="DE">Alemania</option>
              <option value="FR">Francia</option>
              <option value="IT">Italia</option>
              <option value="UK">Reino Unido</option>
              <option value="US">Estados Unidos</option>
              {/* Añadir más países según necesidad */}
            </select>
          </div>
          
          <div>
            <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-1">
              Nacionalidad *
            </label>
            <select
              id="nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="ES">Española</option>
              <option value="DE">Alemana</option>
              <option value="FR">Francesa</option>
              <option value="IT">Italiana</option>
              <option value="UK">Británica</option>
              <option value="US">Estadounidense</option>
              {/* Añadir más nacionalidades según necesidad */}
            </select>
          </div>
          
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Nacimiento *
            </label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className={`w-full p-2 border rounded focus:ring-primary-500 focus:border-primary-500 ${
                errors.birthDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.birthDate && (
              <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 -mx-6 mt-8 px-6 py-3 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-150"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition duration-150"
          >
            Registrar Viajero
          </button>
        </div>
      </form>
    </div>
  );
};

export default TravelerRegistrationForm; 
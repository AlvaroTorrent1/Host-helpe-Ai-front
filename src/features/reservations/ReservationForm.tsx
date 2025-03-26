import React, { useState, useEffect } from 'react';
import { Reservation, ReservationCreateData, Guest, ReservationStatus } from '../../types/reservation';
import { Property } from '../../types/property';

interface ReservationFormProps {
  reservation?: Reservation;
  properties: Property[];
  onSubmit: (data: ReservationCreateData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ReservationForm: React.FC<ReservationFormProps> = ({
  reservation,
  properties,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState<ReservationCreateData>({
    propertyId: '',
    mainGuest: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      documentType: 'dni',
      documentNumber: '',
      birthDate: '',
      nationality: 'ES'
    },
    guests: [],
    mainGuestId: '',
    checkInDate: '',
    checkOutDate: '',
    status: 'pending',
    totalGuests: 1,
    bookingSource: 'direct'
  });

  // Estado para manejar errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Estado para manejar huéspedes adicionales
  const [additionalGuests, setAdditionalGuests] = useState<Omit<Guest, 'id'>[]>([]);

  // Cargar datos si estamos en modo edición
  useEffect(() => {
    if (reservation) {
      const mainGuest = reservation.guests.find(g => g.id === reservation.mainGuestId);
      const otherGuests = reservation.guests.filter(g => g.id !== reservation.mainGuestId).map(g => ({
        firstName: g.firstName,
        lastName: g.lastName,
        email: g.email,
        phone: g.phone || '',
        documentType: g.documentType,
        documentNumber: g.documentNumber,
        birthDate: g.birthDate,
        nationality: g.nationality
      }));
      
      if (mainGuest) {
        setFormData({
          ...reservation,
          mainGuest: {
            firstName: mainGuest.firstName,
            lastName: mainGuest.lastName,
            email: mainGuest.email,
            phone: mainGuest.phone || '',
            documentType: mainGuest.documentType,
            documentNumber: mainGuest.documentNumber,
            birthDate: mainGuest.birthDate,
            nationality: mainGuest.nationality
          },
          additionalGuests: otherGuests
        });
        
        setAdditionalGuests(otherGuests);
      }
    }
  }, [reservation]);

  // Manejar cambios en el formulario principal
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('mainGuest.')) {
      const field = name.replace('mainGuest.', '');
      setFormData({
        ...formData,
        mainGuest: {
          ...formData.mainGuest,
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Limpiar error si se corrige
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Manejar cambios en los huéspedes adicionales
  const handleGuestChange = (index: number, field: keyof Guest, value: string) => {
    const updatedGuests = [...additionalGuests];
    updatedGuests[index] = {
      ...updatedGuests[index],
      [field]: value
    };
    setAdditionalGuests(updatedGuests);
  };

  // Añadir huésped adicional
  const addGuest = () => {
    setAdditionalGuests([
      ...additionalGuests,
      {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        documentType: 'dni',
        documentNumber: '',
        birthDate: '',
        nationality: 'ES'
      }
    ]);
    
    // Actualizar el total de huéspedes
    setFormData({
      ...formData,
      totalGuests: formData.totalGuests + 1
    });
  };

  // Eliminar huésped adicional
  const removeGuest = (index: number) => {
    const updatedGuests = [...additionalGuests];
    updatedGuests.splice(index, 1);
    setAdditionalGuests(updatedGuests);
    
    // Actualizar el total de huéspedes
    setFormData({
      ...formData,
      totalGuests: formData.totalGuests - 1
    });
  };

  // Validar el formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validar propiedad
    if (!formData.propertyId) {
      newErrors['propertyId'] = 'Debes seleccionar una propiedad';
    }
    
    // Validar fechas
    if (!formData.checkInDate) {
      newErrors['checkInDate'] = 'La fecha de entrada es obligatoria';
    }
    
    if (!formData.checkOutDate) {
      newErrors['checkOutDate'] = 'La fecha de salida es obligatoria';
    }
    
    if (formData.checkInDate && formData.checkOutDate && formData.checkInDate >= formData.checkOutDate) {
      newErrors['checkOutDate'] = 'La fecha de salida debe ser posterior a la de entrada';
    }
    
    // Validar huésped principal
    if (!formData.mainGuest.firstName.trim()) {
      newErrors['mainGuest.firstName'] = 'El nombre es obligatorio';
    }
    
    if (!formData.mainGuest.lastName.trim()) {
      newErrors['mainGuest.lastName'] = 'El apellido es obligatorio';
    }
    
    if (!formData.mainGuest.email.trim()) {
      newErrors['mainGuest.email'] = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.mainGuest.email)) {
      newErrors['mainGuest.email'] = 'El email no es válido';
    }
    
    if (!formData.mainGuest.documentNumber.trim()) {
      newErrors['mainGuest.documentNumber'] = 'El número de documento es obligatorio';
    }
    
    if (!formData.mainGuest.birthDate) {
      newErrors['mainGuest.birthDate'] = 'La fecha de nacimiento es obligatoria';
    }
    
    if (!formData.mainGuest.nationality.trim()) {
      newErrors['mainGuest.nationality'] = 'La nacionalidad es obligatoria';
    }
    
    // Validar huéspedes adicionales
    additionalGuests.forEach((guest, index) => {
      if (!guest.firstName.trim()) {
        newErrors[`guest[${index}].firstName`] = 'El nombre es obligatorio';
      }
      
      if (!guest.lastName.trim()) {
        newErrors[`guest[${index}].lastName`] = 'El apellido es obligatorio';
      }
      
      if (!guest.documentNumber.trim()) {
        newErrors[`guest[${index}].documentNumber`] = 'El número de documento es obligatorio';
      }
      
      if (!guest.birthDate) {
        newErrors[`guest[${index}].birthDate`] = 'La fecha de nacimiento es obligatoria';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Preparar datos para enviar
      onSubmit({
        ...formData,
        additionalGuests: additionalGuests
      });
    }
  };

  // Función auxiliar para obtener error de un campo
  const getError = (fieldName: string): string | undefined => {
    return errors[fieldName];
  };

  // Opciones para el estado de la reserva
  const statusOptions: { value: ReservationStatus; label: string }[] = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'confirmed', label: 'Confirmada' },
    { value: 'cancelled', label: 'Cancelada' },
    { value: 'completed', label: 'Completada' },
  ];

  // Opciones para el origen de la reserva
  const bookingSourceOptions = [
    { value: 'direct', label: 'Directa' },
    { value: 'airbnb', label: 'Airbnb' },
    { value: 'booking', label: 'Booking.com' },
    { value: 'other', label: 'Otro' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        {/* Sección: Información de la reserva */}
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Información de la reserva</h3>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Selección de propiedad */}
            <div className="sm:col-span-3">
              <label htmlFor="propertyId" className="block text-sm font-medium text-gray-700">
                Propiedad *
              </label>
              <select
                id="propertyId"
                name="propertyId"
                value={formData.propertyId}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  getError('propertyId') ? 'border-red-300' : ''
                }`}
              >
                <option value="">Selecciona una propiedad</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
              {getError('propertyId') && (
                <p className="mt-2 text-sm text-red-600">{getError('propertyId')}</p>
              )}
            </div>

            {/* Estado de la reserva */}
            <div className="sm:col-span-3">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha de entrada */}
            <div className="sm:col-span-3">
              <label htmlFor="checkInDate" className="block text-sm font-medium text-gray-700">
                Fecha de entrada *
              </label>
              <input
                type="date"
                name="checkInDate"
                id="checkInDate"
                value={formData.checkInDate}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  getError('checkInDate') ? 'border-red-300' : ''
                }`}
              />
              {getError('checkInDate') && (
                <p className="mt-2 text-sm text-red-600">{getError('checkInDate')}</p>
              )}
            </div>

            {/* Fecha de salida */}
            <div className="sm:col-span-3">
              <label htmlFor="checkOutDate" className="block text-sm font-medium text-gray-700">
                Fecha de salida *
              </label>
              <input
                type="date"
                name="checkOutDate"
                id="checkOutDate"
                value={formData.checkOutDate}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  getError('checkOutDate') ? 'border-red-300' : ''
                }`}
              />
              {getError('checkOutDate') && (
                <p className="mt-2 text-sm text-red-600">{getError('checkOutDate')}</p>
              )}
            </div>

            {/* Origen de la reserva */}
            <div className="sm:col-span-3">
              <label htmlFor="bookingSource" className="block text-sm font-medium text-gray-700">
                Origen de la reserva
              </label>
              <select
                id="bookingSource"
                name="bookingSource"
                value={formData.bookingSource || 'direct'}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                {bookingSourceOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Referencia externa si no es directa */}
            {formData.bookingSource && formData.bookingSource !== 'direct' && (
              <div className="sm:col-span-3">
                <label htmlFor="bookingSourceReference" className="block text-sm font-medium text-gray-700">
                  Referencia
                </label>
                <input
                  type="text"
                  name="bookingSourceReference"
                  id="bookingSourceReference"
                  placeholder={`ID de ${
                    bookingSourceOptions.find(o => o.value === formData.bookingSource)?.label || 'la plataforma'
                  }`}
                  value={formData.bookingSourceReference || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            )}

            {/* Notas */}
            <div className="sm:col-span-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notas
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes || ''}
                onChange={handleChange}
                placeholder="Información adicional sobre la reserva..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Sección: Huésped principal */}
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Huésped principal</h3>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Nombre */}
            <div className="sm:col-span-3">
              <label htmlFor="mainGuest.firstName" className="block text-sm font-medium text-gray-700">
                Nombre *
              </label>
              <input
                type="text"
                name="mainGuest.firstName"
                id="mainGuest.firstName"
                value={formData.mainGuest.firstName}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  getError('mainGuest.firstName') ? 'border-red-300' : ''
                }`}
              />
              {getError('mainGuest.firstName') && (
                <p className="mt-2 text-sm text-red-600">{getError('mainGuest.firstName')}</p>
              )}
            </div>

            {/* Apellidos */}
            <div className="sm:col-span-3">
              <label htmlFor="mainGuest.lastName" className="block text-sm font-medium text-gray-700">
                Apellidos *
              </label>
              <input
                type="text"
                name="mainGuest.lastName"
                id="mainGuest.lastName"
                value={formData.mainGuest.lastName}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  getError('mainGuest.lastName') ? 'border-red-300' : ''
                }`}
              />
              {getError('mainGuest.lastName') && (
                <p className="mt-2 text-sm text-red-600">{getError('mainGuest.lastName')}</p>
              )}
            </div>

            {/* Email */}
            <div className="sm:col-span-3">
              <label htmlFor="mainGuest.email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                name="mainGuest.email"
                id="mainGuest.email"
                value={formData.mainGuest.email}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  getError('mainGuest.email') ? 'border-red-300' : ''
                }`}
              />
              {getError('mainGuest.email') && (
                <p className="mt-2 text-sm text-red-600">{getError('mainGuest.email')}</p>
              )}
            </div>

            {/* Teléfono */}
            <div className="sm:col-span-3">
              <label htmlFor="mainGuest.phone" className="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <input
                type="tel"
                name="mainGuest.phone"
                id="mainGuest.phone"
                value={formData.mainGuest.phone || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>

            {/* Tipo de documento */}
            <div className="sm:col-span-2">
              <label htmlFor="mainGuest.documentType" className="block text-sm font-medium text-gray-700">
                Tipo de documento *
              </label>
              <select
                id="mainGuest.documentType"
                name="mainGuest.documentType"
                value={formData.mainGuest.documentType}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="dni">DNI</option>
                <option value="passport">Pasaporte</option>
                <option value="other">Otro</option>
              </select>
            </div>

            {/* Número de documento */}
            <div className="sm:col-span-2">
              <label htmlFor="mainGuest.documentNumber" className="block text-sm font-medium text-gray-700">
                Número de documento *
              </label>
              <input
                type="text"
                name="mainGuest.documentNumber"
                id="mainGuest.documentNumber"
                value={formData.mainGuest.documentNumber}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  getError('mainGuest.documentNumber') ? 'border-red-300' : ''
                }`}
              />
              {getError('mainGuest.documentNumber') && (
                <p className="mt-2 text-sm text-red-600">{getError('mainGuest.documentNumber')}</p>
              )}
            </div>

            {/* Nacionalidad */}
            <div className="sm:col-span-2">
              <label htmlFor="mainGuest.nationality" className="block text-sm font-medium text-gray-700">
                Nacionalidad *
              </label>
              <input
                type="text"
                name="mainGuest.nationality"
                id="mainGuest.nationality"
                value={formData.mainGuest.nationality}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  getError('mainGuest.nationality') ? 'border-red-300' : ''
                }`}
              />
              {getError('mainGuest.nationality') && (
                <p className="mt-2 text-sm text-red-600">{getError('mainGuest.nationality')}</p>
              )}
            </div>

            {/* Fecha de nacimiento */}
            <div className="sm:col-span-3">
              <label htmlFor="mainGuest.birthDate" className="block text-sm font-medium text-gray-700">
                Fecha de nacimiento *
              </label>
              <input
                type="date"
                name="mainGuest.birthDate"
                id="mainGuest.birthDate"
                value={formData.mainGuest.birthDate}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                  getError('mainGuest.birthDate') ? 'border-red-300' : ''
                }`}
              />
              {getError('mainGuest.birthDate') && (
                <p className="mt-2 text-sm text-red-600">{getError('mainGuest.birthDate')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sección: Huéspedes adicionales */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Huéspedes adicionales</h3>
            <button
              type="button"
              onClick={addGuest}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Añadir huésped
            </button>
          </div>

          {additionalGuests.length === 0 ? (
            <p className="text-sm text-gray-500 italic mb-4">No hay huéspedes adicionales</p>
          ) : (
            additionalGuests.map((guest, index) => (
              <div key={index} className="mb-6 p-4 border border-gray-200 rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-gray-900">Huésped {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeGuest(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Nombre */}
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                    <input
                      type="text"
                      value={guest.firstName}
                      onChange={e => handleGuestChange(index, 'firstName', e.target.value)}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                        getError(`guest[${index}].firstName`) ? 'border-red-300' : ''
                      }`}
                    />
                    {getError(`guest[${index}].firstName`) && (
                      <p className="mt-2 text-sm text-red-600">{getError(`guest[${index}].firstName`)}</p>
                    )}
                  </div>

                  {/* Apellidos */}
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Apellidos *</label>
                    <input
                      type="text"
                      value={guest.lastName}
                      onChange={e => handleGuestChange(index, 'lastName', e.target.value)}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                        getError(`guest[${index}].lastName`) ? 'border-red-300' : ''
                      }`}
                    />
                    {getError(`guest[${index}].lastName`) && (
                      <p className="mt-2 text-sm text-red-600">{getError(`guest[${index}].lastName`)}</p>
                    )}
                  </div>

                  {/* Tipo de documento */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Tipo de documento *</label>
                    <select
                      value={guest.documentType}
                      onChange={e => handleGuestChange(index, 'documentType', e.target.value as 'dni' | 'passport' | 'other')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                      <option value="dni">DNI</option>
                      <option value="passport">Pasaporte</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>

                  {/* Número de documento */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Número de documento *</label>
                    <input
                      type="text"
                      value={guest.documentNumber}
                      onChange={e => handleGuestChange(index, 'documentNumber', e.target.value)}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                        getError(`guest[${index}].documentNumber`) ? 'border-red-300' : ''
                      }`}
                    />
                    {getError(`guest[${index}].documentNumber`) && (
                      <p className="mt-2 text-sm text-red-600">{getError(`guest[${index}].documentNumber`)}</p>
                    )}
                  </div>

                  {/* Nacionalidad */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Nacionalidad *</label>
                    <input
                      type="text"
                      value={guest.nationality}
                      onChange={e => handleGuestChange(index, 'nationality', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>

                  {/* Fecha de nacimiento */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Fecha de nacimiento *</label>
                    <input
                      type="date"
                      value={guest.birthDate}
                      onChange={e => handleGuestChange(index, 'birthDate', e.target.value)}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                        getError(`guest[${index}].birthDate`) ? 'border-red-300' : ''
                      }`}
                    />
                    {getError(`guest[${index}].birthDate`) && (
                      <p className="mt-2 text-sm text-red-600">{getError(`guest[${index}].birthDate`)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : reservation ? 'Actualizar reserva' : 'Crear reserva'}
        </button>
      </div>
    </form>
  );
};

export default ReservationForm; 
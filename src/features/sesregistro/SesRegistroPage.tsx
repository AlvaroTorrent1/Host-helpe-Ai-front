// src/features/sesregistro/SesRegistroPage.tsx
/**
 * Página pública de Check-in para turistas
 * Los turistas acceden mediante enlace único con token: /check-in/:token
 * El token identifica la solicitud de parte de viajero
 * Basado en la interfaz del proveedor LynxCheckin con branding de Host Helper
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Reservation, Traveler, PaymentMethod } from './types';
import TravelersList from './components/TravelersList';
import AddTravelerWizard from './components/AddTravelerWizard';
import ReservationForm from './components/ReservationForm';
import SignaturePad from './components/SignaturePad';
import LanguageSelector from './components/LanguageSelector';
import toast from 'react-hot-toast';
import { travelerFormsService } from '@/services/travelerFormsService';

const SesRegistroPage: React.FC = () => {
  // Get token from URL params
  const { token } = useParams<{
    token: string;
  }>();
  
  const { t } = useTranslation();

  // Estado de la reserva
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Timer de expiración
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  
  // Estado del wizard
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [editingTraveler, setEditingTraveler] = useState<Traveler | null>(null);
  
  // Estado del formulario de reserva
  const [isReservationFormOpen, setIsReservationFormOpen] = useState<boolean>(false);
  
  // Estado de check-in enviado
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  
  // Estado de la firma digital
  const [signature, setSignature] = useState<string | null>(null);
  const [signatureError, setSignatureError] = useState<string>('');
  
  // Cargar datos de la solicitud usando el token
  useEffect(() => {
    const loadReservationData = async () => {
      if (!token) {
        setError('Token no proporcionado');
        setLoading(false);
        return;
      }

      try {
        // Obtener la solicitud usando el token
        const request = await travelerFormsService.getRequestByToken(token);
        
        if (!request) {
          setError('Enlace inválido o no encontrado');
          setLoading(false);
          return;
        }

        // Verificar que no haya expirado
        const now = new Date();
        const expiresAt = new Date(request.expires_at);
        
        if (expiresAt < now) {
          setError('expired');
          setLoading(false);
          return;
        }

        // Verificar que no esté ya completado
        if (request.status === 'completed') {
          setError('Este formulario ya ha sido completado');
          setLoading(false);
          return;
        }

        // Calcular número de noches
        const checkInDate = new Date(request.check_in_date);
        const checkOutDate = new Date(request.check_out_date);
        const diffTime = checkOutDate.getTime() - checkInDate.getTime();
        const numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Mapear a estructura de Reservation
        const reservationData: Reservation = {
          propertyId: request.property_id,
          reservationId: request.reservation_id || 'N/A',
          token: request.token,
          propertyName: request.property_name,
          checkIn: request.check_in_date,
          checkOut: request.check_out_date,
          numberOfNights,
          numberOfTravelers: request.num_travelers_expected,
          paymentMethod: 'destination', // Default, usuario puede cambiar
          travelers: [], // Usuario los añadirá
          expiresAt: request.expires_at,
        };
        
        setReservation(reservationData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading reservation:', err);
        setError(t('sesRegistro.errors.loadingError'));
        setLoading(false);
      }
    };
    
    loadReservationData();
  }, [token, t]);
  
  // Timer countdown
  useEffect(() => {
    if (!reservation) return;
    
    const updateTimer = () => {
      const now = Date.now();
      const expiresAt = new Date(reservation.expiresAt).getTime();
      const remaining = Math.max(0, expiresAt - now);
      setTimeRemaining(remaining);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [reservation]);
  
  // Formatear tiempo restante
  const formatTimeRemaining = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };
  
  // Añadir viajero
  const handleAddTraveler = () => {
    setEditingTraveler(null);
    setIsWizardOpen(true);
  };

  // Editar viajero
  const handleEditTraveler = (traveler: Traveler) => {
    setEditingTraveler(traveler);
    setIsWizardOpen(true);
  };

  // Eliminar viajero
  const handleDeleteTraveler = (travelerId: string) => {
    if (!reservation) return;
    
    setReservation({
      ...reservation,
      travelers: reservation.travelers.filter(t => t.id !== travelerId)
    });
    
    toast.success(t('sesRegistro.travelers.deleteSuccess'));
  };

  // Guardar viajero (añadir o editar)
  const handleSaveTraveler = (traveler: Traveler) => {
    if (!reservation) return;

    if (traveler.id) {
      // Editar viajero existente
      setReservation({
        ...reservation,
        travelers: reservation.travelers.map(t => 
          t.id === traveler.id ? traveler : t
        )
      });
      toast.success(t('sesRegistro.travelers.updateSuccess'));
    } else {
      // Añadir nuevo viajero
      const newTraveler = {
        ...traveler,
        id: `traveler-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      setReservation({
        ...reservation,
        travelers: [...reservation.travelers, newTraveler]
      });
      toast.success(t('sesRegistro.travelers.addSuccess'));
    }
  };

  // Guardar datos de reserva editados
  const handleSaveReservation = (data: { checkIn: string; checkOut: string; numberOfTravelers: number; paymentMethod: PaymentMethod }) => {
    if (!reservation) return;

    // Calcular número de noches
    const checkInDate = new Date(data.checkIn);
    const checkOutDate = new Date(data.checkOut);
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setReservation({
      ...reservation,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      numberOfNights,
      numberOfTravelers: data.numberOfTravelers,
      paymentMethod: data.paymentMethod,
    });

    toast.success('Datos de reserva actualizados');
  };

  // Helper: Mapear gender del frontend ('male'/'female'/'other') al formato de la base de datos ('M'/'F'/'Other')
  // La base de datos espera valores cortos por compatibilidad con el Real Decreto 933/2021
  const mapGenderToDb = (gender: string | undefined): 'M' | 'F' | 'Other' | null => {
    if (!gender) return null;
    const mapping: Record<string, 'M' | 'F' | 'Other'> = {
      male: 'M',
      female: 'F',
      other: 'Other',
    };
    return mapping[gender] || null;
  };

  // Helper: Mapear método de pago del frontend al formato de la base de datos
  // Frontend usa valores descriptivos, DB usa códigos del Real Decreto 933/2021
  const mapPaymentMethodToDb = (method: PaymentMethod | undefined): 'TRANS' | 'CASH' | 'CARD' | 'OTHER' | null => {
    if (!method) return null;
    const mapping: Record<PaymentMethod, 'TRANS' | 'CASH' | 'CARD' | 'OTHER'> = {
      destination: 'CASH',      // Pago en destino = Efectivo
      online: 'CARD',           // Pago online = Tarjeta
      bank_transfer: 'TRANS',   // Transferencia bancaria
      other: 'OTHER',           // Otro método
    };
    return mapping[method] || null;
  };

  // Manejar envío del check-in
  const handleSubmitCheckin = async () => {
    // Validar que haya al menos un viajero
    if (!reservation || reservation.travelers.length === 0) {
      toast.error(t('sesRegistro.travelers.required'));
      return;
    }

    // ✅ VALIDACIÓN: Número de viajeros debe coincidir con el esperado
    const numTravelersAdded = reservation.travelers.length;
    const numTravelersExpected = reservation.numberOfTravelers;
    
    if (numTravelersAdded !== numTravelersExpected) {
      const missing = numTravelersExpected - numTravelersAdded;
      const extra = numTravelersAdded - numTravelersExpected;
      
      if (missing > 0) {
        // Faltan viajeros
        toast.error(
          `Faltan ${missing} viajero${missing > 1 ? 's' : ''} por registrar. ` +
          `Se esperan ${numTravelersExpected} viajero${numTravelersExpected > 1 ? 's' : ''}, ` +
          `pero solo has añadido ${numTravelersAdded}.`,
          { duration: 6000 }
        );
      } else {
        // Hay viajeros de más
        toast.error(
          `Has añadido ${extra} viajero${extra > 1 ? 's' : ''} de más. ` +
          `La reserva es para ${numTravelersExpected} viajero${numTravelersExpected > 1 ? 's' : ''}, ` +
          `pero has registrado ${numTravelersAdded}. Por favor elimina los viajeros extras.`,
          { duration: 6000 }
        );
      }
      
      // Scroll a la sección de viajeros
      const travelersSection = document.getElementById('travelers-section');
      if (travelersSection) {
        travelersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    // Validar que exista la firma
    if (!signature) {
      setSignatureError('La firma es obligatoria para completar el check-in');
      toast.error('Por favor, firme en el campo correspondiente');
      
      // Scroll al campo de firma
      const signatureElement = document.getElementById('signature-section');
      if (signatureElement) {
        signatureElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (!token) {
      toast.error('Token inválido');
      return;
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading(
        `Enviando datos de ${reservation.travelers.length} viajero${reservation.travelers.length > 1 ? 's' : ''}...`
      );

      // Send ALL travelers (each one creates a separate row in traveler_form_data)
      // All travelers share the same form_request_id and signature
      const submissionResults = [];
      
      for (let i = 0; i < reservation.travelers.length; i++) {
        const traveler = reservation.travelers[i];
        
        // Update progress toast
        toast.loading(
          `Enviando viajero ${i + 1} de ${reservation.travelers.length}: ${traveler.firstName} ${traveler.firstSurname}...`,
          { id: loadingToast }
        );

        // Map traveler data to Edge Function expected structure
        const travelerData = {
          first_name: traveler.firstName,
          last_name: `${traveler.firstSurname} ${traveler.secondSurname || ''}`.trim(),
          document_type: traveler.documentType.toUpperCase(), // DB expects DNI/NIE/PASSPORT
          document_number: traveler.documentNumber,
          document_support_number: traveler.documentSupportNumber || null, // ✅ Número de soporte (null si vacío)
          nationality: traveler.nationality,
          birth_date: traveler.dateOfBirth,
          gender: mapGenderToDb(traveler.gender), // Map 'male'/'female'/'other' to 'M'/'F'/'Other'
          email: traveler.email,
          phone: traveler.phone || null,
          // Map address fields (address is a string, not an object)
          address_street: traveler.address || null,                    // 'address' is the street
          address_city: traveler.city || null,                         // Direct field
          address_postal_code: traveler.postalCode || null,            // Direct field
          address_country: traveler.residenceCountry,                  // Residence country (ISO alpha-2)
          address_additional: traveler.additionalAddress || null,      // Additional info (apartment, floor, etc.)
          ine_code: traveler.ineCode || null,                          // ✅ Código INE del municipio (solo España)
          payment_method: mapPaymentMethodToDb(reservation.paymentMethod), // Map to 'CASH'/'CARD'/'TRANS'
          payment_holder: `${traveler.firstName} ${traveler.firstSurname}`,
          signature_data: signature, // Base64 signature (same for all travelers)
          consent_accepted: true,
        };

        // Send traveler data via Edge Function
        const result = await travelerFormsService.submitTravelerData(token, travelerData);

        submissionResults.push({
          traveler: `${traveler.firstName} ${traveler.firstSurname}`,
          success: result.success,
          error: result.error,
        });

        // If any traveler fails, stop and show error
        if (!result.success) {
          toast.dismiss(loadingToast);
          toast.error(
            `Error al enviar datos de ${traveler.firstName} ${traveler.firstSurname}: ${result.error || 'Error desconocido'}`
          );
          return;
        }
      }

      toast.dismiss(loadingToast);

      // All travelers submitted successfully
      setIsSubmitted(true);
      toast.success(
        `✅ Formulario completado: ${submissionResults.length} viajero${submissionResults.length > 1 ? 's' : ''} enviado${submissionResults.length > 1 ? 's' : ''} correctamente`
      );
      
    } catch (error) {
      console.error('Error al enviar check-in:', error);
      toast.error('Error al enviar el check-in. Por favor, inténtelo de nuevo.');
    }
  };

  // Manejar cambio de firma
  const handleSignatureChange = (signatureData: string | null) => {
    setSignature(signatureData);
    // Limpiar error si hay firma
    if (signatureData) {
      setSignatureError('');
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{t('sesRegistro.title')}...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('sesRegistro.errors.loadingError')}
          </h2>
          <p className="text-gray-600">
            {error || t('sesRegistro.errors.loadingErrorMessage')}
          </p>
        </div>
      </div>
    );
  }
  
  // Enlace expirado
  if (timeRemaining === 0) {
  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('sesRegistro.timer.expired')}
          </h2>
          <p className="text-gray-600">
            {t('sesRegistro.timer.expiredMessage')}
          </p>
        </div>
      </div>
    );
  }
  
  // Pantalla de confirmación de check-in enviado
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        {/* Header con Logo y Selector de Idiomas */}
        <div className="max-w-3xl mx-auto mb-8">
          {/* Logo y selector de idiomas en la misma línea */}
          <div className="flex items-center justify-between mb-4">
            {/* Logo a la izquierda */}
            <img 
              src="/imagenes/Logo_hosthelper.png" 
              alt="Host Helper" 
              className="h-20"
            />
            
            {/* Selector de idiomas a la derecha */}
            <LanguageSelector />
          </div>
        </div>

        {/* Tarjeta de confirmación */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            {/* Header con checkmark animado */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-12 text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
                <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {t('sesRegistro.confirmation.title')}
              </h1>
              <p className="text-green-50 text-lg">
                {t('sesRegistro.confirmation.subtitle')}
              </p>
            </div>

            {/* Resumen de la reserva */}
            <div className="px-6 py-8">
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {t('sesRegistro.confirmation.summary')}
                </h2>
                
                <div className="space-y-3">
                  {/* Propiedad */}
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 font-medium">{t('sesRegistro.confirmation.property')}</span>
                    <span className="text-gray-900 font-semibold text-right">{reservation.propertyName}</span>
                  </div>

                  {/* Fechas */}
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 font-medium">{t('sesRegistro.confirmation.stay')}</span>
                    <span className="text-gray-900 text-right">
                      {new Date(reservation.checkIn).toLocaleDateString()} - {new Date(reservation.checkOut).toLocaleDateString()}
                      <span className="block text-sm text-primary">{reservation.numberOfNights} {reservation.numberOfNights === 1 ? t('sesRegistro.reservationForm.night') : t('sesRegistro.reservationForm.nights')}</span>
                    </span>
                  </div>

                  {/* Viajeros registrados */}
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 font-medium">{t('sesRegistro.confirmation.registeredTravelers')}</span>
                    <span className="text-gray-900 font-semibold">{reservation.travelers.length}</span>
                  </div>

                  {/* Método de pago */}
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 font-medium">{t('sesRegistro.confirmation.paymentMethod')}</span>
                    <span className="text-gray-900">{t(`sesRegistro.paymentMethods.${reservation.paymentMethod}`)}</span>
                  </div>
                </div>
              </div>

              {/* Lista de viajeros */}
              <div className="mb-6">
                <h3 className="text-md font-semibold text-gray-900 mb-3">{t('sesRegistro.confirmation.travelersList')}</h3>
                <div className="space-y-2">
                  {reservation.travelers.map((traveler, index) => (
                    <div key={traveler.id} className="flex items-center bg-green-50 rounded-lg px-4 py-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">
                          {traveler.firstName} {traveler.firstSurname} {traveler.secondSurname || ''}
                        </p>
                        <p className="text-sm text-gray-600">{traveler.email}</p>
                      </div>
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>

              {/* Información adicional */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">{t('sesRegistro.confirmation.whatNext')}</h4>
                    <p className="text-sm text-blue-800">
                      {t('sesRegistro.confirmation.nextSteps')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón de cerrar */}
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition shadow-md"
              >
                {t('sesRegistro.confirmation.close')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header con Logo y Selector de Idiomas */}
      <div className="max-w-3xl mx-auto mb-6">
        {/* Logo y selector de idiomas en la misma línea */}
        <div className="flex items-center justify-between mb-4">
          {/* Logo a la izquierda */}
          <img 
            src="/imagenes/Logo_hosthelper.png" 
            alt="Host Helper" 
            className="h-24"
          />
          
          {/* Selector de idiomas a la derecha */}
          <LanguageSelector />
        </div>
        
        {/* Título centrado */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('sesRegistro.subtitle')}
          </h1>
        </div>
      </div>
      
      {/* Contenedor principal */}
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Timer de expiración */}
        <div className="bg-white shadow rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-700 font-medium">
              {t('sesRegistro.timer.label')}
            </span>
          </div>
          <span className="text-primary font-semibold text-lg">
            {formatTimeRemaining(timeRemaining)}
          </span>
        </div>
        
        {/* Información de Reserva */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {t('sesRegistro.reservation.title')}
            </h2>
            <p className="text-gray-600 text-sm">
              {t('sesRegistro.reservation.subtitle')}
            </p>
          </div>
          
          <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('sesRegistro.reservation.data')}
              </h3>
              <button 
                onClick={() => setIsReservationFormOpen(true)}
                className="text-primary hover:text-primary-600 font-medium text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                {t('sesRegistro.reservation.edit')}
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nombre de la propiedad */}
              <div>
                <div className="flex items-center text-gray-600 text-sm mb-1">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {t('sesRegistro.reservation.propertyName')}
                </div>
                <div className="font-semibold text-gray-900">{reservation.propertyName}</div>
              </div>
              
              {/* Método de Pago */}
              <div>
                <div className="flex items-center text-gray-600 text-sm mb-1">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  {t('sesRegistro.reservation.paymentMethod')}
                </div>
                <div className="font-semibold text-gray-900">
                  {t(`sesRegistro.paymentMethods.${reservation.paymentMethod}`)}
                </div>
              </div>
              
              {/* Fechas */}
              <div>
                <div className="flex items-center text-gray-600 text-sm mb-1">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {t('sesRegistro.reservation.dates')}
                </div>
                <div className="font-semibold text-gray-900">
                  {new Date(reservation.checkIn).toLocaleDateString()} - {new Date(reservation.checkOut).toLocaleDateString()}
                </div>
                <div className="text-primary text-sm">
                  {reservation.numberOfNights} {t('sesRegistro.reservation.nights')}
                </div>
              </div>
              
              {/* Número de Viajeros */}
              <div>
                <div className="flex items-center text-gray-600 text-sm mb-1">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {t('sesRegistro.reservation.numberOfTravelers')}
                </div>
                <div className="font-semibold text-gray-900">{reservation.numberOfTravelers}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Viajeros */}
        <div id="travelers-section">
          {/* Indicador de progreso de viajeros */}
          <div className={`mb-4 p-4 rounded-lg border-2 ${
            reservation.travelers.length === reservation.numberOfTravelers
              ? 'bg-green-50 border-green-500'
              : reservation.travelers.length < reservation.numberOfTravelers
              ? 'bg-yellow-50 border-yellow-500'
              : 'bg-red-50 border-red-500'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {reservation.travelers.length === reservation.numberOfTravelers ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : reservation.travelers.length < reservation.numberOfTravelers ? (
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <div>
                  <p className={`font-semibold ${
                    reservation.travelers.length === reservation.numberOfTravelers
                      ? 'text-green-900'
                      : reservation.travelers.length < reservation.numberOfTravelers
                      ? 'text-yellow-900'
                      : 'text-red-900'
                  }`}>
                    {reservation.travelers.length === reservation.numberOfTravelers
                      ? '¡Todos los viajeros registrados!'
                      : reservation.travelers.length < reservation.numberOfTravelers
                      ? `Faltan ${reservation.numberOfTravelers - reservation.travelers.length} viajero${reservation.numberOfTravelers - reservation.travelers.length > 1 ? 's' : ''} por registrar`
                      : `Has añadido ${reservation.travelers.length - reservation.numberOfTravelers} viajero${reservation.travelers.length - reservation.numberOfTravelers > 1 ? 's' : ''} de más`
                    }
                  </p>
                  <p className={`text-sm ${
                    reservation.travelers.length === reservation.numberOfTravelers
                      ? 'text-green-700'
                      : reservation.travelers.length < reservation.numberOfTravelers
                      ? 'text-yellow-700'
                      : 'text-red-700'
                  }`}>
                    {reservation.travelers.length} de {reservation.numberOfTravelers} viajero{reservation.numberOfTravelers > 1 ? 's' : ''} registrado{reservation.travelers.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              {/* Barra de progreso */}
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    reservation.travelers.length === reservation.numberOfTravelers
                      ? 'bg-green-600'
                      : reservation.travelers.length < reservation.numberOfTravelers
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ 
                    width: `${Math.min((reservation.travelers.length / reservation.numberOfTravelers) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>

          <TravelersList
            travelers={reservation.travelers}
            onAdd={handleAddTraveler}
            onEdit={handleEditTraveler}
            onDelete={handleDeleteTraveler}
          />
        </div>
        
        {/* Campo de Firma Digital */}
        <div id="signature-section" className="bg-white shadow rounded-lg p-6">
          <SignaturePad
            onSignatureChange={handleSignatureChange}
            signatureData={signature}
            error={signatureError}
          />
        </div>
        
        {/* Botón Enviar Check-in */}
        <div>
          {reservation.travelers.length !== reservation.numberOfTravelers && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 text-center">
                {reservation.travelers.length < reservation.numberOfTravelers
                  ? `⚠️ Debes registrar ${reservation.numberOfTravelers - reservation.travelers.length} viajero${reservation.numberOfTravelers - reservation.travelers.length > 1 ? 's' : ''} más antes de enviar`
                  : `⚠️ Debes eliminar ${reservation.travelers.length - reservation.numberOfTravelers} viajero${reservation.travelers.length - reservation.numberOfTravelers > 1 ? 's' : ''} antes de enviar`
                }
              </p>
            </div>
          )}
          
          <button
            onClick={handleSubmitCheckin}
            disabled={
              reservation.travelers.length === 0 || 
              reservation.travelers.length !== reservation.numberOfTravelers
            }
            className="w-full bg-primary hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition shadow-lg"
          >
            {reservation.travelers.length === reservation.numberOfTravelers
              ? t('sesRegistro.submit.button')
              : reservation.travelers.length < reservation.numberOfTravelers
              ? `Falta${reservation.numberOfTravelers - reservation.travelers.length > 1 ? 'n' : ''} ${reservation.numberOfTravelers - reservation.travelers.length} viajero${reservation.numberOfTravelers - reservation.travelers.length > 1 ? 's' : ''}`
              : `Elimina ${reservation.travelers.length - reservation.numberOfTravelers} viajero${reservation.travelers.length - reservation.numberOfTravelers > 1 ? 's' : ''}`
            }
          </button>
        </div>
      </div>

      {/* Wizard para añadir/editar viajero */}
      <AddTravelerWizard
        isOpen={isWizardOpen}
        onClose={() => {
          setIsWizardOpen(false);
          setEditingTraveler(null);
        }}
        onSave={handleSaveTraveler}
        editingTraveler={editingTraveler}
      />

      {/* Formulario para editar datos de reserva */}
      <ReservationForm
        isOpen={isReservationFormOpen}
        onClose={() => setIsReservationFormOpen(false)}
        onSave={handleSaveReservation}
        propertyName={reservation?.propertyName || ''}
        initialData={{
          checkIn: reservation?.checkIn || '',
          checkOut: reservation?.checkOut || '',
          numberOfTravelers: reservation?.numberOfTravelers || 1,
          paymentMethod: reservation?.paymentMethod || 'destination',
        }}
      />
    </div>
  );
};

export default SesRegistroPage;

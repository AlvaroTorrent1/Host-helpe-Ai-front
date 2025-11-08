// src/features/sesregistro/components/PhoneInput.tsx
/**
 * Input de teléfono con selector de código de país
 * Permite seleccionar el país y muestra su bandera y código telefónico
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Country } from '../types';
import { COUNTRIES, sortCountriesByLanguage, DEFAULT_COUNTRY } from '../constants';

interface PhoneInputProps {
  phoneCountry: string; // Código del país
  phoneNumber: string; // Número de teléfono
  onPhoneCountryChange: (countryCode: string) => void;
  onPhoneNumberChange: (phoneNumber: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  phoneCountry,
  phoneNumber,
  onPhoneCountryChange,
  onPhoneNumberChange,
  placeholder,
  disabled = false,
  error,
  required = false,
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Obtener idioma actual
  const currentLanguage = i18n.language.startsWith('es') ? 'es' : 'en';

  // Ordenar países por idioma
  const sortedCountries = sortCountriesByLanguage(currentLanguage);

  // Filtrar países por búsqueda
  const filteredCountries = sortedCountries.filter((country) => {
    if (!searchTerm) return true;
    const name = currentLanguage === 'es' ? country.nameEs : country.nameEn;
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           country.phoneCode.includes(searchTerm) ||
           country.code.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // País seleccionado
  const selectedCountry = COUNTRIES.find((c) => c.code === phoneCountry) || DEFAULT_COUNTRY;

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus en el input de búsqueda al abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelectCountry = (country: Country) => {
    onPhoneCountryChange(country.code);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permitir solo números, espacios, guiones y paréntesis
    const value = e.target.value.replace(/[^\d\s\-\(\)]/g, '');
    onPhoneNumberChange(value);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        {/* Selector de país */}
        <div className="relative w-32 flex-shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={`
              w-full px-3 py-3 border rounded-lg bg-white
              transition-all duration-200 flex items-center justify-between
              ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-primary cursor-pointer'}
              ${error ? 'border-red-500' : isOpen ? 'border-primary' : 'border-gray-300'}
              ${isOpen ? 'ring-2 ring-primary ring-opacity-20' : ''}
            `}
          >
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="text-xl">{selectedCountry.flag}</span>
              <span className="text-sm text-gray-700 truncate">{selectedCountry.phoneCode}</span>
            </div>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'transform rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown de países */}
          {isOpen && !disabled && (
            <div className="absolute z-50 w-80 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden left-0">
              {/* Input de búsqueda */}
              <div className="p-3 border-b border-gray-200">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={currentLanguage === 'es' ? 'Buscar país...' : 'Search country...'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Lista de países */}
              <div className="overflow-y-auto max-h-60">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleSelectCountry(country)}
                      className={`
                        w-full px-4 py-2.5 text-left transition-colors flex items-center justify-between
                        hover:bg-gray-50
                        ${country.code === phoneCountry ? 'bg-primary-50' : ''}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{country.flag}</span>
                        <span className={`text-sm ${country.code === phoneCountry ? 'text-primary font-medium' : 'text-gray-900'}`}>
                          {currentLanguage === 'es' ? country.nameEs : country.nameEn}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">{country.phoneCode}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    {currentLanguage === 'es' ? 'No se encontraron países' : 'No countries found'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input de número de teléfono */}
        <div className="flex-1">
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`
              w-full px-4 py-3 border rounded-lg
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
              ${error ? 'border-red-500' : 'border-gray-300'}
            `}
          />
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default PhoneInput;













































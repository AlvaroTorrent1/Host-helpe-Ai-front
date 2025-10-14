// src/features/sesregistro/components/CountrySelector.tsx
/**
 * Selector de países reutilizable
 * Muestra banderas, nombres en el idioma actual, y permite búsqueda
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Country } from '../types';
import { COUNTRIES, sortCountriesByLanguage } from '../constants';

interface CountrySelectorProps {
  value: string; // Código del país (ISO 3166-1 alpha-2)
  onChange: (countryCode: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  showFlag?: boolean;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  showFlag = true,
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
           country.code.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // País seleccionado
  const selectedCountry = COUNTRIES.find((c) => c.code === value);

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

  const handleSelect = (country: Country) => {
    onChange(country.code);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange('');
  };

  const getDisplayName = (country: Country): string => {
    return currentLanguage === 'es' ? country.nameEs : country.nameEn;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Input principal */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          relative w-full px-4 py-3 border rounded-lg bg-white cursor-pointer
          transition-all duration-200
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-primary'}
          ${error ? 'border-red-500' : isOpen ? 'border-primary' : 'border-gray-300'}
          ${isOpen ? 'ring-2 ring-primary ring-opacity-20' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            {/* Icono de globo o bandera */}
            {showFlag && selectedCountry ? (
              <span className="text-2xl mr-3">{selectedCountry.flag}</span>
            ) : (
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}

            {/* Texto seleccionado o placeholder */}
            <span className={selectedCountry ? 'text-gray-900' : 'text-gray-400'}>
              {selectedCountry ? getDisplayName(selectedCountry) : placeholder}
            </span>
          </div>

          {/* Iconos de acción */}
          <div className="flex items-center ml-2">
            {value && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="text-gray-400 hover:text-gray-600 mr-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Input de búsqueda */}
          <div className="p-3 border-b border-gray-200">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={currentLanguage === 'es' ? 'Buscar país...' : 'Search country...'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Lista de países */}
          <div className="overflow-y-auto max-h-60">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <div
                  key={country.code}
                  onClick={() => handleSelect(country)}
                  className={`
                    px-4 py-3 cursor-pointer transition-colors flex items-center
                    hover:bg-gray-50
                    ${country.code === value ? 'bg-primary-50' : ''}
                  `}
                >
                  {showFlag && <span className="text-2xl mr-3">{country.flag}</span>}
                  <span className={country.code === value ? 'text-primary font-medium' : 'text-gray-900'}>
                    {getDisplayName(country)}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                {currentLanguage === 'es' ? 'No se encontraron países' : 'No countries found'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default CountrySelector;



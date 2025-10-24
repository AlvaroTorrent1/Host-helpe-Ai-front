// src/features/sesregistro/components/CityInput.tsx
/**
 * Input de ciudad con sugerencias de municipios españoles
 * 
 * Características:
 * - Búsqueda inteligente con normalización de texto (sin tildes)
 * - Protección contra autocompletado del navegador
 * - Asociación automática de códigos INE
 * - Navegación con teclado (↑↓ Enter Escape)
 * - Accesibilidad completa (ARIA)
 */

import React, { useState, useEffect, useRef } from 'react';
import { searchMunicipalities, findMunicipalityByName, type Municipality } from '../data/municipalities';

interface CityInputProps {
  value: string;
  onChange: (city: string, ineCode?: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

const CityInput: React.FC<CityInputProps> = ({
  value,
  onChange,
  error,
  placeholder = 'Ingrese nombre de la ciudad',
  disabled = false,
}) => {
  // Estado del componente
  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Municipality[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(null);
  
  // Referencias DOM
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Nombre único para prevenir autocomplete del navegador
  const uniqueNameRef = useRef(`city_input_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`);
  
  // PROTECCIÓN 1: Sincronizar con valor externo
  // Detecta cambios desde el padre (incluido autocompletado que modifica el DOM)
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || '');
      
      // Auto-corrección: Si el valor tiene coincidencia exacta, normalizar
      if (value && value.length >= 2) {
        const match = findMunicipalityByName(value);
        if (match && match.name !== value) {
          // Valor sin normalizar detectado → corregir automáticamente
          console.log(`[CityInput] Auto-corrección: "${value}" → "${match.name}"`);
          setSelectedMunicipality(match);
          onChange(match.name, match.ineCode);
        }
      }
    }
  }, [value]);
  
  // PROTECCIÓN 2: Polling para detectar cambios externos
  // Captura autocompletados que evaden eventos de React
  useEffect(() => {
    if (disabled) return;
    
    const pollInterval = setInterval(() => {
      if (inputRef.current && document.activeElement === inputRef.current) {
        const domValue = inputRef.current.value;
        if (domValue !== inputValue) {
          console.log(`[CityInput] Cambio externo detectado: "${inputValue}" → "${domValue}"`);
          handleExternalChange(domValue);
        }
      }
    }, 100); // Polling cada 100ms
    
    return () => clearInterval(pollInterval);
  }, [inputValue, disabled]);
  
  // PROTECCIÓN 3: Event listener nativo para detectar cambios
  useEffect(() => {
    const input = inputRef.current;
    if (!input || disabled) return;
    
    const handleNativeInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.value !== inputValue) {
        console.log(`[CityInput] Evento nativo detectado: "${target.value}"`);
        handleExternalChange(target.value);
      }
    };
    
    input.addEventListener('input', handleNativeInput);
    return () => input.removeEventListener('input', handleNativeInput);
  }, [inputValue, disabled]);
  
  // Manejar cambio externo detectado
  const handleExternalChange = (newValue: string) => {
    setInputValue(newValue);
    
    // Buscar sugerencias
    if (newValue.length >= 2) {
      const results = searchMunicipalities(newValue);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setHighlightedIndex(-1);
      
      // Auto-corrección si hay coincidencia exacta
      const match = findMunicipalityByName(newValue);
      if (match) {
        setSelectedMunicipality(match);
        onChange(match.name, match.ineCode);
        if (match.name !== newValue) {
          setInputValue(match.name);
          if (inputRef.current) {
            inputRef.current.value = match.name;
          }
        }
      } else {
        setSelectedMunicipality(null);
        onChange(newValue, undefined);
      }
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setSelectedMunicipality(null);
      onChange(newValue, undefined);
    }
  };
  
  // Manejar cambio en el input (escritura del usuario)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue.length >= 2) {
      const results = searchMunicipalities(newValue);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setHighlightedIndex(-1);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
    
    // Si el usuario modifica después de seleccionar, limpiar el código INE
    if (selectedMunicipality && newValue !== selectedMunicipality.name) {
      setSelectedMunicipality(null);
      onChange(newValue, undefined);
    } else {
      onChange(newValue, undefined);
    }
  };
  
  // Seleccionar municipio de la lista
  const handleSelect = (municipality: Municipality) => {
    setInputValue(municipality.name);
    setSelectedMunicipality(municipality);
    setIsOpen(false);
    setHighlightedIndex(-1);
    setSuggestions([]);
    onChange(municipality.name, municipality.ineCode);
  };
  
  // Navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      // Si presionan Enter sin dropdown, intentar seleccionar coincidencia exacta
      if (e.key === 'Enter' && inputValue.length >= 2) {
        const match = findMunicipalityByName(inputValue);
        if (match) {
          e.preventDefault();
          handleSelect(match);
        }
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
        
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelect(suggestions[highlightedIndex]);
        } else if (suggestions.length > 0) {
          // Si hay sugerencias pero ninguna highlighted, seleccionar la primera
          handleSelect(suggestions[0]);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
        
      case 'Tab':
        // Permitir Tab para navegar a siguiente campo
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };
  
  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Scroll automático al elemento highlighted
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.querySelector(
        `[data-index="${highlightedIndex}"]`
      );
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <div ref={wrapperRef} className="relative">
      {/* Input de búsqueda */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={(e) => {
            // Quitar readonly al hacer focus (truco anti-autocomplete)
            e.target.removeAttribute('readonly');
            // Reabrir sugerencias si hay búsqueda previa
            if (inputValue.length >= 2 && suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          readOnly // Se quita en onFocus
          autoComplete="new-password" // Truco: navegadores no autocompletar passwords nuevos
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          name={uniqueNameRef.current}
          // ARIA para accesibilidad
          role="combobox"
          aria-autocomplete="list"
          aria-controls="city-suggestions-listbox"
          aria-expanded={isOpen}
          aria-activedescendant={
            highlightedIndex >= 0 ? `city-option-${highlightedIndex}` : undefined
          }
          data-form-type="other"
          data-lpignore="true"
          className={`
            w-full px-4 py-3 border rounded-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
        />
        
        {/* Icono de búsqueda */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Dropdown de sugerencias */}
      {isOpen && suggestions.length > 0 && !disabled && (
        <div
          ref={dropdownRef}
          id="city-suggestions-listbox"
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((municipality, index) => (
            <button
              key={municipality.ineCode}
              type="button"
              role="option"
              id={`city-option-${index}`}
              data-index={index}
              aria-selected={index === highlightedIndex}
              onClick={() => handleSelect(municipality)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`
                w-full text-left px-4 py-3 hover:bg-primary hover:text-white transition-colors
                ${index === highlightedIndex ? 'bg-primary text-white' : 'text-gray-900'}
                ${index === 0 ? 'rounded-t-lg' : ''}
                ${index === suggestions.length - 1 ? 'rounded-b-lg' : ''}
                border-b last:border-b-0
                ${index === highlightedIndex ? 'border-primary-dark' : 'border-gray-100'}
              `}
            >
              <div className="font-medium">{municipality.name}</div>
              <div className={`text-sm ${index === highlightedIndex ? 'text-white opacity-90' : 'text-gray-500'}`}>
                {municipality.province} · INE: {municipality.ineCode}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Mensaje: sin resultados */}
      {isOpen && inputValue.length >= 2 && suggestions.length === 0 && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
          No se encontraron municipios españoles
        </div>
      )}

      {/* Indicador: código INE asignado */}
      {selectedMunicipality && !error && (
        <div className="mt-1 text-sm text-gray-600 flex items-center">
          <svg className="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>
            Código INE: <span className="font-semibold">{selectedMunicipality.ineCode}</span>
          </span>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="mt-1 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Ayuda: escribir más caracteres */}
      {!isOpen && inputValue.length > 0 && inputValue.length < 2 && !error && (
        <div className="mt-1 text-xs text-gray-500">
          Escriba al menos 2 caracteres para buscar municipios españoles
        </div>
      )}
    </div>
  );
};

export default CityInput;


// src/shared/components/LanguageSelector.tsx
// Selector de idioma para la plataforma (header/dashboard)
// SOLO soporta inglés y español (no los 8 idiomas del check-in)

import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { PLATFORM_LANGUAGES } from '@/i18n';

interface LanguageSelectorProps {
  isMobile?: boolean;
  variant?: 'default' | 'dashboard'; // Nueva prop para variante dashboard
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  isMobile = false,
  variant = 'default',
}) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Obtener idioma actual de react-i18next
  const currentLanguage = i18n.language;

  // Forzar cambio a inglés si el idioma actual no es inglés ni español
  // Esto puede pasar si el usuario viene de la página de check-in en otro idioma
  useEffect(() => {
    if (!PLATFORM_LANGUAGES.includes(currentLanguage)) {
      // Cambiar a inglés por defecto
      i18n.changeLanguage('en');
      // Actualizar localStorage para que persista
      localStorage.setItem('preferredLanguage', 'en');
    }
  }, [currentLanguage, i18n]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLanguageChange = (lang: string) => {
    // Usar changeLanguage de react-i18next
    i18n.changeLanguage(lang);
    // Guardar en localStorage para persistir la preferencia
    localStorage.setItem('preferredLanguage', lang);
    setIsOpen(false);
  };

  // Mostrar solo ES o EN, aunque currentLanguage tenga otro valor temporalmente
  // Si no es un idioma de plataforma, mostrar EN por defecto
  const displayLanguage = PLATFORM_LANGUAGES.includes(currentLanguage) ? currentLanguage : 'en';

  // Variante dashboard - botones simples
  if (variant === 'dashboard') {
    return (
      <div className="flex items-center space-x-1 text-sm">
        <button
          onClick={() => handleLanguageChange("es")}
          className={`px-2 py-1 rounded ${
            displayLanguage === "es"
              ? "bg-white text-gray-800 border border-gray-300"
              : "text-gray-600 hover:bg-white hover:border hover:border-gray-300"
          }`}
          aria-label="Español"
        >
          ES
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={() => handleLanguageChange("en")}
          className={`px-2 py-1 rounded ${
            displayLanguage === "en"
              ? "bg-white text-gray-800 border border-gray-300"
              : "text-gray-600 hover:bg-white hover:border hover:border-gray-300"
          }`}
          aria-label="English"
        >
          EN
        </button>
      </div>
    );
  }

  // Para versión móvil
  if (isMobile) {
    return (
      <li className="pt-2 border-t border-gray-200">
        <div className="text-gray-600 mb-2">{t("common.language")}</div>
        <div className="flex space-x-4">
          <button
            onClick={() => handleLanguageChange("es")}
            className={`px-2 py-1 rounded ${
              displayLanguage === "es"
                ? "bg-white text-gray-800 border border-gray-300"
                : "text-gray-600 hover:bg-white hover:border hover:border-gray-300"
            }`}
          >
            <span>ES</span>
          </button>
          <button
            onClick={() => handleLanguageChange("en")}
            className={`px-2 py-1 rounded ${
              displayLanguage === "en"
                ? "bg-white text-gray-800 border border-gray-300"
                : "text-gray-600 hover:bg-white hover:border hover:border-gray-300"
            }`}
          >
            <span>EN</span>
          </button>
        </div>
      </li>
    );
  }

  // Para versión desktop (default)
  return (
    <div className="relative group mr-4">
      <button
        className="flex items-center space-x-1 text-gray-600 hover:text-primary-500 focus:outline-none"
        onClick={toggleDropdown}
      >
        <span>{displayLanguage.toUpperCase()}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "transform rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 py-2 w-28 bg-white shadow-lg rounded-md z-50">
          <button
            onClick={() => handleLanguageChange("es")}
            className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center space-x-2"
          >
            <span>ES</span>
            <span>{t("common.spanish")}</span>
          </button>
          <button
            onClick={() => handleLanguageChange("en")}
            className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center space-x-2"
          >
            <span>EN</span>
            <span>{t("common.english")}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;

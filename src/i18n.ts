// src/i18n.ts
// Configuración de react-i18next usando archivos JSON
// Soporta 8 idiomas para check-in de viajeros
// NOTA: La plataforma principal (header/dashboard) solo usa inglés y español

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Importar todos los archivos de traducción
import enTranslations from "./translations/en.json";
import esTranslations from "./translations/es.json";
import frTranslations from "./translations/fr.json";
import deTranslations from "./translations/de.json";
import nlTranslations from "./translations/nl.json";
import zhTranslations from "./translations/zh.json";
import ruTranslations from "./translations/ru.json";
import ptTranslations from "./translations/pt.json";

// Idiomas soportados por la plataforma principal (header, dashboard)
export const PLATFORM_LANGUAGES = ['en', 'es'];

// Intentar obtener el idioma preferido del usuario desde localStorage
// Si no existe, usar el idioma del navegador o inglés por defecto
// Para la plataforma principal, solo se permiten inglés y español
const getInitialLanguage = (): string => {
  const savedLanguage = localStorage.getItem('preferredLanguage');
  
  // Si hay idioma guardado Y es inglés o español, usarlo
  // Si es otro idioma (de check-in), usar inglés por defecto
  if (savedLanguage && PLATFORM_LANGUAGES.includes(savedLanguage)) {
    return savedLanguage;
  }
  
  // Detectar idioma del navegador
  const browserLang = navigator.language.split('-')[0];
  
  // Si el navegador es español, usar español
  // Para cualquier otro idioma (incluyendo neerlandés), usar inglés por defecto
  return browserLang === 'es' ? 'es' : 'en';
};

// Configurar i18next con todos los idiomas (necesarios para check-in)
i18n.use(initReactI18next).init({
  lng: getInitialLanguage(),
  fallbackLng: "es",
  resources: {
    en: {
      translation: enTranslations,
    },
    es: {
      translation: esTranslations,
    },
    fr: {
      translation: frTranslations,
    },
    de: {
      translation: deTranslations,
    },
    nl: {
      translation: nlTranslations,
    },
    zh: {
      translation: zhTranslations,
    },
    ru: {
      translation: ruTranslations,
    },
    pt: {
      translation: ptTranslations,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n; 
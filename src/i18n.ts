// src/i18n.ts
// Configuración de react-i18next usando archivos JSON
// Soporta múltiples idiomas para la interfaz pública de check-in

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

// Intentar obtener el idioma preferido del usuario desde localStorage
// Si no existe, usar el idioma del navegador o español por defecto
const getInitialLanguage = (): string => {
  const savedLanguage = localStorage.getItem('preferredLanguage');
  if (savedLanguage) {
    return savedLanguage;
  }
  
  // Detectar idioma del navegador
  const browserLang = navigator.language.split('-')[0];
  const supportedLanguages = ['en', 'es', 'fr', 'de', 'nl', 'zh', 'ru', 'pt'];
  
  return supportedLanguages.includes(browserLang) ? browserLang : 'es';
};

// Configurar i18next con todos los idiomas
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
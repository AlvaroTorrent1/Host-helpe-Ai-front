// src/i18n.ts
// Configuración de react-i18next usando archivos JSON

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslations from "./translations/en.json";
import esTranslations from "./translations/es.json";

i18n.use(initReactI18next).init({
  lng: "es",
  fallbackLng: "es",
  resources: {
    en: {
      translation: enTranslations,
    },
    es: {
      translation: esTranslations,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n; 
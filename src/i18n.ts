import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./translations/en";
import { es } from "./translations/es";

i18n.use(initReactI18next).init({
  lng: "es",
  fallbackLng: "es",
  resources: {
    en: {
      translation: en,
    },
    es: {
      translation: es,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n; 
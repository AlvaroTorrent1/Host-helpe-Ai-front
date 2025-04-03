import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importar traducciones
import translationEN from './translations/en.json';
import translationES from './translations/es.json';

const resources = {
  en: {
    translation: translationEN,
  },
  es: {
    translation: translationES,
  },
};

const i18nInstance = i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // idioma por defecto
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // no es necesario para React
    },
  });

export default i18nInstance; 
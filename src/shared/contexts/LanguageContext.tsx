import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { translations, LanguageCode } from "@translations/index";

// Debug: verificar que las traducciones se importen correctamente
console.log('LanguageContext - translations loaded:', !!translations);
console.log('LanguageContext - languages available:', Object.keys(translations || {}));

type LanguageContextType = {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
};

const defaultLanguageContext: LanguageContextType = {
  language: "es",
  setLanguage: () => {},
  t: () => "",
};

const LanguageContext = createContext<LanguageContextType>(
  defaultLanguageContext,
);

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  // Inicializar idioma desde localStorage o detectar del navegador
  const [language, setLanguage] = useState<LanguageCode>(() => {
    // Intentar cargar desde localStorage
    const savedLanguage = localStorage.getItem("language") as LanguageCode;
    if (savedLanguage && (savedLanguage === "es" || savedLanguage === "en")) {
      return savedLanguage;
    }
    
    // Detectar idioma del navegador
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === "en" || browserLang === "es") {
      return browserLang as LanguageCode;
    }
    
    // Por defecto español
    return "es";
  });

  // Efecto inicial para establecer el idioma en el DOM
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Guardar el idioma en localStorage cuando cambie después de la inicialización
  const handleSetLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    document.documentElement.lang = lang;
  };

  // Función para traducir textos con soporte para variables
  const t = (key: string, variables?: Record<string, string | number>): string => {
    // Debug temporal
    if (key.startsWith('reservations')) {
      console.log('t() called with key:', key);
      console.log('Current language:', language);
      console.log('translations[language]:', translations[language]);
    }
    
    const keys = key.split(".");
    let current: unknown = translations[language];
    
    // Primer intento con la clave exacta
    for (const k of keys) {
      if (current && typeof current === "object" && k in current) {
        current = (current as Record<string, unknown>)[k];
      } else {
        // Si falla, intentar con diferentes prefijos según el contexto de la página
        
        // 1. Check for standalone properties keys that should be under dashboard.properties
        if (key.startsWith("properties.")) {
          const dashboardKey = `dashboard.${key}`;
          let dashboardCurrent: unknown = translations[language];
          const dashboardKeys = dashboardKey.split(".");
          
          let fallbackSucceeded = true;
          for (const dk of dashboardKeys) {
            if (dashboardCurrent && typeof dashboardCurrent === "object" && dk in dashboardCurrent) {
              dashboardCurrent = (dashboardCurrent as Record<string, unknown>)[dk];
            } else {
              fallbackSucceeded = false;
              break;
            }
          }
          
          if (fallbackSucceeded && typeof dashboardCurrent === "string") {
            // Si encontramos la traducción con el prefijo dashboard, la devolvemos
            current = dashboardCurrent;
            break;
          }
        }
        
        // 2. Check for keys that should have dashboard prefix
        const needsDashboardPrefix = 
          keys[0] === "properties" || 
          keys[0] === "ses" || 
          keys[0] === "registrations" ||
          keys[0] === "incidents" || 
          keys[0] === "quickActions" || 
          keys[0] === "menu";
        
        if (needsDashboardPrefix) {
          const dashboardKey = `dashboard.${key}`;
          const dashboardKeys = dashboardKey.split(".");
          let dashboardCurrent: unknown = translations[language];
          
          let fallbackSucceeded = true;
          for (const dk of dashboardKeys) {
            if (dashboardCurrent && typeof dashboardCurrent === "object" && dk in dashboardCurrent) {
              dashboardCurrent = (dashboardCurrent as Record<string, unknown>)[dk];
            } else {
              fallbackSucceeded = false;
              break;
            }
          }
          
          if (fallbackSucceeded && typeof dashboardCurrent === "string") {
            // Si encontramos la traducción con el prefijo dashboard, la devolvemos
            current = dashboardCurrent;
            break;
          }
        }
        
        console.warn(`Translation key not found: ${key}`);
        // En desarrollo, hacer que las claves faltantes sean muy visibles en la UI
        if (process.env.NODE_ENV === 'development') {
          return `[CLAVE_NO_ENCONTRADA: ${key}]`;
        }
        return key; // Retornar la clave si no se encuentra la traducción
      }
    }

    if (typeof current !== "string") {
      console.warn(
        `Translation value for key "${key}" is not a string:`,
        current,
      );
      // En desarrollo, hacer que las claves faltantes sean muy visibles
      if (process.env.NODE_ENV === 'development') {
        return `[TRADUCCIÓN_FALTANTE: ${key}]`;
      }
      return key;
    }

    // Reemplazar variables en el texto si existen
    if (variables) {
      return Object.entries(variables).reduce((text, [varName, varValue]) => {
        const regex = new RegExp(`{{${varName}}}`, 'g');
        return text.replace(regex, String(varValue));
      }, current);
    }

    return current;
  };

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { translations, LanguageCode } from "@translations/index";

type LanguageContextType = {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
};

const defaultLanguageContext: LanguageContextType = {
  language: 'es',
  setLanguage: () => {},
  t: () => '',
};

const LanguageContext = createContext<LanguageContextType>(defaultLanguageContext);

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Intentar obtener el idioma guardado en localStorage, o usar 'es' por defecto
  const [language, setLanguage] = useState<LanguageCode>(() => {
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage as LanguageCode) || 'es';
  });

  // Guardar el idioma en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language; // Actualizar atributo lang del HTML
  }, [language]);

  // Función para traducir textos
  const t = (key: string): string => {
    const keys = key.split('.');
    let current: unknown = translations[language];
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = (current as Record<string, unknown>)[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // Retornar la clave si no se encuentra la traducción
      }
    }
    
    if (typeof current !== 'string') {
      console.warn(`Translation value for key "${key}" is not a string:`, current);
      return key;
    }
    
    return current;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 
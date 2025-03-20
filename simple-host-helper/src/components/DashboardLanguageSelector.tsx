import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageCode } from '../translations';

const DashboardLanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (lang: LanguageCode) => {
    setLanguage(lang);
  };

  return (
    <div className="flex items-center space-x-1 text-sm">
      <button
        onClick={() => handleLanguageChange('es')}
        className={`px-2 py-1 rounded ${
          language === 'es' 
            ? 'bg-gray-200 text-gray-800' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        aria-label="Español"
      >
        ES
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-2 py-1 rounded ${
          language === 'en' 
            ? 'bg-gray-200 text-gray-800' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
};

export default DashboardLanguageSelector; 
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageCode } from '../../translations';

interface LanguageSelectorProps {
  isMobile?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ isMobile = false }) => {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLanguageChange = (lang: LanguageCode) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  // Para versión móvil
  if (isMobile) {
    return (
      <li className="pt-2 border-t border-gray-200">
        <div className="text-gray-600 mb-2">{t('common.language')}</div>
        <div className="flex space-x-4">
          <button
            onClick={() => handleLanguageChange('es')}
            className={`px-2 py-1 rounded ${
              language === 'es'
                ? 'bg-white text-gray-800 border border-gray-300'
                : 'text-gray-600 hover:bg-white hover:border hover:border-gray-300'
            }`}
          >
            <span>ES</span>
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className={`px-2 py-1 rounded ${
              language === 'en'
                ? 'bg-white text-gray-800 border border-gray-300'
                : 'text-gray-600 hover:bg-white hover:border hover:border-gray-300'
            }`}
          >
            <span>EN</span>
          </button>
        </div>
      </li>
    );
  }

  // Para versión desktop
  return (
    <div className="relative group mr-4">
      <button 
        className="flex items-center space-x-1 text-gray-600 hover:text-primary-500 focus:outline-none"
        onClick={toggleDropdown}
      >
        <span>{language.toUpperCase()}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 py-2 w-28 bg-white shadow-lg rounded-md z-50">
          <button 
            onClick={() => handleLanguageChange('es')} 
            className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center space-x-2"
          >
            <span>ES</span>
            <span>{t('common.spanish')}</span>
          </button>
          <button 
            onClick={() => handleLanguageChange('en')} 
            className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center space-x-2"
          >
            <span>EN</span>
            <span>{t('common.english')}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector; 
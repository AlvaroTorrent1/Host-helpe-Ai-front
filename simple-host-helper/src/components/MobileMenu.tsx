import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';

interface NavLink {
  text: string;
  href: string;
  isButton?: boolean;
}

interface MobileMenuProps {
  links: NavLink[];
}

const MobileMenu: React.FC<MobileMenuProps> = ({ links }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative md:hidden">
      <button
        className="p-2 text-gray-600 hover:text-primary-500 focus:outline-none"
        onClick={toggleMenu}
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="fixed top-20 left-0 right-0 bg-white shadow-md py-4 px-6 z-50 max-h-[80vh] overflow-y-auto">
          <ul className="space-y-3">
            {links.map((link, index) => (
              <li key={index}>
                {link.href.startsWith('/') ? (
                  <Link
                    to={link.href}
                    className={link.isButton
                      ? "bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md inline-block w-full text-center"
                      : "text-gray-600 hover:text-primary-500 block"
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    {link.text}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-primary-500 block"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.text}
                  </a>
                )}
              </li>
            ))}
            
            {/* Language Selector */}
            <LanguageSelector isMobile={true} />
          </ul>
        </div>
      )}
    </div>
  );
};

export default MobileMenu; 
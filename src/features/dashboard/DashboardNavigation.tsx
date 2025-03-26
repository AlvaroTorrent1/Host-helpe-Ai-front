import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@shared/contexts/LanguageContext';

const DashboardNavigation: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const currentPath = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { path: '/dashboard', label: t('dashboard.menu.dashboard') },
    { path: '/reservations', label: t('dashboard.menu.reservations') },
    { path: '/properties', label: t('dashboard.menu.properties') },
    { path: '/ses-registration', label: t('dashboard.menu.registrations') }
  ];
  
  const isActive = (path: string) => {
    return currentPath === path;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation */}
        <div className="hidden md:flex md:space-x-8 py-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`py-2 px-1 border-b-2 text-sm font-medium ${
                isActive(item.path)
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden py-3">
          <button 
            onClick={toggleMobileMenu}
            className="w-full flex items-center justify-between py-2 px-3 text-gray-700 border rounded-md"
          >
            <span>{navItems.find(item => isActive(item.path))?.label || t('dashboard.menu.dashboard')}</span>
            <svg className={`w-5 h-5 transition-transform ${mobileMenuOpen ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          {mobileMenuOpen && (
            <div className="mt-2 py-2 bg-white rounded-md shadow-lg">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-2 text-sm ${
                    isActive(item.path)
                      ? 'bg-gray-100 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardNavigation; 
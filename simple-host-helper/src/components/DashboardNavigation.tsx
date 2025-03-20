import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const DashboardNavigation: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/reservations', label: 'Reservas' },
    { path: '/properties', label: 'Propiedades' },
    { path: '/ses-registration', label: 'Registro SES' }
  ];
  
  const isActive = (path: string) => {
    return currentPath === path;
  };
  
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 py-3">
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
      </div>
    </div>
  );
};

export default DashboardNavigation; 
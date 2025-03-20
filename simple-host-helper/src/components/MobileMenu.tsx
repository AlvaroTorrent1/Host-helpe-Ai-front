import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="md:hidden">
      <button
        onClick={toggleMenu}
        className="text-gray-600 hover:text-primary-500 focus:outline-none"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-md py-4 px-6 z-50">
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
            <li className="pt-2 border-t border-gray-200">
              <div className="text-gray-600 mb-2">Idioma</div>
              <div className="flex space-x-4">
                <a href="#" className="flex items-center space-x-1 text-gray-800 hover:text-primary-500">
                  <span>ES</span>
                </a>
                <a href="#" className="flex items-center space-x-1 text-gray-600 hover:text-primary-500">
                  <span>EN</span>
                </a>
              </div>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default MobileMenu; 
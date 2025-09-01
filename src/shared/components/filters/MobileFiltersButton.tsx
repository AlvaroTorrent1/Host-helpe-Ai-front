// src/shared/components/filters/MobileFiltersButton.tsx
import React from "react";

interface MobileFiltersButtonProps {
  onOpen: () => void;
  isActive?: boolean;
  className?: string;
}

const MobileFiltersButton: React.FC<MobileFiltersButtonProps> = ({ onOpen, isActive = false, className = "" }) => {
  return (
    <button
      type="button"
      aria-label="Open filters"
      onClick={onOpen}
      className={`md:hidden fixed bottom-4 right-4 z-40 inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ECA408] ${
        isActive ? "bg-[#ECA408] text-white" : "bg-white text-[#ECA408] border border-[#ECA408]"
      } ${className}`}
    >
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path d="M3 5a1 1 0 011-1h16a1 1 0 01.8 1.6l-5.2 6.933V19a1 1 0 01-1.447.894l-3-1.5A1 1 0 0110 17v-3.467L4.2 5.6A1 1 0 013 5z" />
      </svg>
    </button>
  );
};

export default MobileFiltersButton;



// src/shared/components/filters/MobileFiltersSheet.tsx
import React, { useEffect, useRef } from "react";

interface MobileFiltersSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: () => void;
  onClear?: () => void;
  title?: string;
  children: React.ReactNode;
}

const MobileFiltersSheet: React.FC<MobileFiltersSheetProps> = ({
  isOpen,
  onClose,
  onApply,
  onClear,
  title = "Filtros",
  children,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Cerrar al pulsar en el backdrop
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      aria-hidden={!isOpen}
      className={`md:hidden fixed inset-0 z-40 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      onClick={handleBackdrop}
    >
      {/* Backdrop */}
      <div className={`absolute inset-0 bg-black transition-opacity ${isOpen ? "bg-opacity-40" : "bg-opacity-0"}`} />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className={`absolute top-0 right-0 h-full w-[90vw] max-w-[380px] bg-white shadow-2xl transform transition-transform duration-200 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="p-2 rounded hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>

        <div className="px-4 py-3 border-t border-gray-200 bg-white flex items-center justify-between gap-3">
          {onClear && (
            <button
              onClick={onClear}
              className="px-3 py-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300"
            >
              Limpiar
            </button>
          )}
          <button
            onClick={() => {
              onApply?.();
              onClose();
            }}
            className="ml-auto px-4 py-2 text-sm font-medium text-white rounded-lg shadow bg-[#ECA408] hover:bg-[#D69E07]"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileFiltersSheet;



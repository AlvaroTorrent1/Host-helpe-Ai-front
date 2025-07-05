import React, { useRef, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: "sm" | "md" | "lg" | "xl";
  noPadding?: boolean;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = "md",
  noPadding = false,
  children,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Gestionar eventos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Cerrar con ESC
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Focus trap y autofocus al abrir
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();

      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
              document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // No renderizar si no está abierto
  if (!isOpen) return null;

  // Calcular el ancho basado en el tamaño
  const getWidth = () => {
    switch (size) {
      case "sm":
        return "max-w-md";
      case "md":
        return "max-w-xl";
      case "lg":
        return "max-w-3xl";
      case "xl":
        return "max-w-5xl";
      default:
        return "max-w-xl";
    }
  };

  // Manejar clic en el contenedor para cerrar si se hace clic fuera del modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`modal-title-${title}`}
    >
      <div
        className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0"
        onClick={handleBackdropClick}
      >
        {/* Fondo oscuro */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        ></div>

        {/* Truco para centrar modal */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Modal */}
        <div
          ref={modalRef}
          className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${getWidth()} w-full`}
          tabIndex={-1}
        >
          {title && (
            /* Cabecera */
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center">
                <h3
                  id={`modal-title-${title}`}
                  className="text-lg leading-6 font-medium text-gray-900"
                >
                  {title}
                </h3>
                <button
                  ref={closeButtonRef}
                  type="button"
                  className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onClick={onClose}
                  aria-label="Cerrar modal"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Contenido */}
          <div
            className={
              noPadding ? "" : "bg-white px-4 pt-0 pb-4 sm:p-6 sm:pt-0"
            }
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

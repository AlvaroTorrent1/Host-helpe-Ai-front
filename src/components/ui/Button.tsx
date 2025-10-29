import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  // Variantes de estilo soportadas
  variant?: 'primary' | 'secondary' | 'danger' | 'dangerOutline' | 'ghost' | 'link';
  // Tamaños disponibles
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  children: ReactNode;
  className?: string;
  // Iconos opcionales para alinear espaciado sin duplicar clases en llamadas
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  leadingIcon,
  trailingIcon,
  ...rest
}: ButtonProps) => {
  // Configuración de colores según variante
  // Updated: primary now uses brand color (same as PDF button) for consistency
  const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-primary hover:bg-primary-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    dangerOutline: 'text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
    link: 'bg-transparent text-primary-600 hover:text-primary-700 p-0 h-auto',
  };

  // Configuración de tamaños
  const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
    xs: 'text-xs px-2 py-1.5',
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
    icon: 'p-2',
  };

  return (
    <button
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        inline-flex items-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        transition duration-150 ease-in-out
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled}
      {...rest}
    >
      {leadingIcon && <span className="mr-1 inline-flex items-center">{leadingIcon}</span>}
      {children}
      {trailingIcon && <span className="ml-1 inline-flex items-center">{trailingIcon}</span>}
    </button>
  );
};

export default Button; 
import React from "react";

interface SpinnerProps {
  size?: "small" | "medium" | "large";
  color?: string;
}

/**
 * Componente Spinner para mostrar estados de carga
 */
const Spinner: React.FC<SpinnerProps> = ({ 
  size = "medium", 
  color = "primary-500" 
}) => {
  const sizeClasses = {
    small: "w-5 h-5 border-2",
    medium: "w-8 h-8 border-3",
    large: "w-12 h-12 border-4"
  };
  
  return (
    <div className={`${sizeClasses[size]} border-t-${color} border-b-${color} rounded-full animate-spin`} />
  );
};

export default Spinner; 
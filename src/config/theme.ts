/**
 * Configuración centralizada de temas para Host Helper AI
 * Compatible con Tailwind CSS
 */

/**
 * Colores principales de la aplicación
 */
export const COLORS = {
  // Colores primarios - Alineados con tailwind.config.js (marca dorada #ECA408)
  primary: {
    50: "#FFF8E6",
    100: "#FEEFC3",
    200: "#FDE29A",
    300: "#FCD56F",
    400: "#FBC748",
    500: "#ECA408", // Color principal de la marca
    600: "#BC8306",
    700: "#8B6205",
    800: "#5A4003",
    900: "#2D2001",
    950: "#1A1000", // Agregado para consistencia completa
  },

  // Colores de acento
  accent: {
    50: "#f0fdfa",
    100: "#ccfbf1",
    200: "#99f6e4",
    300: "#5eead4",
    400: "#2dd4bf",
    500: "#14b8a6",
    600: "#0d9488",
    700: "#0f766e",
    800: "#115e59",
    900: "#134e4a",
    950: "#042f2e",
  },

  // Escala de grises
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
    950: "#030712",
  },

  // Colores semánticos
  success: "#10b981", // verde
  error: "#ef4444", // rojo
  warning: "#f59e0b", // amarillo
  info: "#3b82f6", // azul
};

/**
 * Configuración de espaciado
 */
export const SPACING = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "2.5rem", // 40px
  "3xl": "3rem", // 48px
};

/**
 * Configuración de tipografía
 */
export const TYPOGRAPHY = {
  fonts: {
    sans: ["Inter", "sans-serif"],
    serif: ["Georgia", "serif"],
    mono: ["Menlo", "monospace"],
  },
  sizes: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
  },
  weights: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
};

/**
 * Configuración de bordes y sombras
 */
export const BORDERS = {
  radius: {
    none: "0",
    sm: "0.125rem", // 2px
    md: "0.25rem", // 4px
    lg: "0.5rem", // 8px
    xl: "0.75rem", // 12px
    "2xl": "1rem", // 16px
    full: "9999px", // círculo
  },
  width: {
    thin: "1px",
    medium: "2px",
    thick: "4px",
  },
};

/**
 * Configuración de sombras
 */
export const SHADOWS = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  none: "none",
};

// Definimos tipos para manejar acceso más seguro
type ThemeCategory =
  | "colors"
  | "spacing"
  | "typography"
  | "borders"
  | "shadows";
type ThemeMap = {
  colors: typeof COLORS;
  spacing: typeof SPACING;
  typography: typeof TYPOGRAPHY;
  borders: typeof BORDERS;
  shadows: typeof SHADOWS;
};

/**
 * Utilidad para usar el tema en componentes
 */
export const getThemeValue = (
  category: ThemeCategory,
  key: string,
  subKey?: string,
): string => {
  const themeMap: ThemeMap = {
    colors: COLORS,
    spacing: SPACING,
    typography: TYPOGRAPHY,
    borders: BORDERS,
    shadows: SHADOWS,
  };

  const categoryObj = themeMap[category];

  // Verificamos si existe la categoría y la clave
  if (!categoryObj || !(key in categoryObj)) {
    return "";
  }

  // Si se proporciona una subclave, intentamos acceder a la propiedad anidada
  if (
    subKey &&
    typeof categoryObj[key as keyof typeof categoryObj] === "object"
  ) {
    const keyObj = categoryObj[key as keyof typeof categoryObj] as Record<
      string,
      unknown
    >;
    return subKey in keyObj ? (keyObj[subKey] as string) : "";
  }

  // Retornamos el valor directo
  return categoryObj[key as keyof typeof categoryObj] as string;
};

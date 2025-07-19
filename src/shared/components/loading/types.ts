// src/shared/components/loading/types.ts
// Tipos unificados para el sistema de loading modular

/**
 * Tamaños disponibles para los spinners
 */
export enum LoadingSize {
  SM = 'sm',    // 16px - Para botones pequeños
  MD = 'md',    // 24px - Para uso general
  LG = 'lg',    // 32px - Para pantallas principales
  XL = 'xl'     // 48px - Para splash screens
}

/**
 * Tipos de loading según el contexto de uso
 */
export enum LoadingType {
  SCREEN = 'screen',     // Pantalla completa
  OVERLAY = 'overlay',   // Sobre contenido existente
  INLINE = 'inline',     // Dentro de componentes
  BUTTON = 'button'      // Botones con estado loading
}

/**
 * Variantes de color para el loading
 */
export enum LoadingVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary', 
  SUCCESS = 'success',
  WARNING = 'warning',
  DANGER = 'danger',
  WHITE = 'white'
}

/**
 * Props base para todos los componentes de loading
 */
export interface BaseLoadingProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  className?: string;
  'data-testid'?: string;
}

/**
 * Props para LoadingSpinner (componente base)
 */
export interface LoadingSpinnerProps extends BaseLoadingProps {
  // Spinner básico solo necesita las props base
}

/**
 * Props para LoadingScreen (pantalla completa)
 */
export interface LoadingScreenProps extends BaseLoadingProps {
  message?: string;
  subtext?: string;
  showLogo?: boolean;
  customContent?: React.ReactNode;
  gradient?: boolean;
  transparent?: boolean;
}

/**
 * Props para LoadingOverlay (overlay sobre contenido)
 */
export interface LoadingOverlayProps extends BaseLoadingProps {
  message?: string;
  blur?: boolean;
  transparent?: boolean;
  zIndex?: number;
}

/**
 * Props para LoadingInline (dentro de componentes)
 */
export interface LoadingInlineProps extends BaseLoadingProps {
  message?: string;
  direction?: 'horizontal' | 'vertical';
  gap?: 'sm' | 'md' | 'lg';
}

/**
 * Props para LoadingButton (botones con loading)
 */
export interface LoadingButtonProps extends BaseLoadingProps {
  loading: boolean;
  loadingText?: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Estado de loading en el contexto global
 */
export interface LoadingState {
  isLoading: boolean;
  type: LoadingType;
  priority: number;
  source: string;
  message?: string;
  config?: Partial<LoadingScreenProps>;
}

/**
 * Contexto global de loading expandido
 */
export interface GlobalLoadingContextType {
  isLoading: boolean;
  loadingStates: Map<string, LoadingState>;
  setLoading: (
    loading: boolean, 
    source: string, 
    type?: LoadingType,
    priority?: number,
    config?: Partial<LoadingScreenProps>
  ) => void;
  clearLoading: (source: string) => void;
  clearAllLoading: () => void;
  getLoadingByType: (type: LoadingType) => LoadingState[];
} 
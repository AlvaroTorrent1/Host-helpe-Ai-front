// src/shared/components/loading/index.ts
// Exports centralizados para el sistema de loading unificado

// Componentes base
export { default as LoadingSpinner, useLoadingSpinner } from './LoadingSpinner';
export { default as LoadingScreen, LoadingScreenVariants } from './LoadingScreen';
export { default as LoadingOverlay, LoadingOverlayVariants } from './LoadingOverlay';
export { default as LoadingInline, LoadingInlineVariants } from './LoadingInline';
export { default as LoadingButton, LoadingButtonVariants } from './LoadingButton';

// Tipos y enums
export type {
  LoadingSpinnerProps,
  LoadingScreenProps,
  LoadingOverlayProps,
  LoadingInlineProps,
  LoadingButtonProps,
  LoadingState,
  GlobalLoadingContextType,
  BaseLoadingProps
} from './types';

export {
  LoadingSize,
  LoadingType,
  LoadingVariant
} from './types'; 
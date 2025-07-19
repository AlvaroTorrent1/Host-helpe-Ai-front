/**
 * @deprecated Este componente está obsoleto. 
 * Usa el nuevo sistema de loading: import { LoadingScreen } from '@shared/components/loading'
 * 
 * Componente LoadingScreen obsoleto
 * Redirige al nuevo sistema de loading unificado
 */

import { LoadingScreen as NewLoadingScreen } from './loading';

const LoadingScreen = () => {
  console.warn(
    '⚠️  LoadingScreen obsoleto: Usa import { LoadingScreen } from "@shared/components/loading" en su lugar'
  );
  
  // Usar el nuevo LoadingScreen como fallback
  return <NewLoadingScreen />;
};

export default LoadingScreen;

import { useEffect, useRef } from 'react';

/**
 * Hook para bloquear/desbloquear el scroll del body
 * Maneja correctamente iOS Safari y otros navegadores móviles
 */
export const useBodyScrollLock = (isLocked: boolean = false) => {
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    if (isLocked) {
      // Guardar la posición actual del scroll
      scrollPositionRef.current = window.pageYOffset || document.documentElement.scrollTop;

      // Aplicar estilos para bloquear scroll
      // Para iOS, necesitamos position:fixed
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflowY = 'scroll'; // Mantener scrollbar para evitar saltos
      
      // Compensar el ancho de la scrollbar si existe
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
    } else {
      // Restaurar estilos originales
      const scrollY = scrollPositionRef.current;
      
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflowY = '';
      document.body.style.paddingRight = '';
      
      // Restaurar la posición del scroll
      window.scrollTo(0, scrollY);
    }

    // Cleanup al desmontar
    return () => {
      if (isLocked) {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflowY = '';
        document.body.style.paddingRight = '';
      }
    };
  }, [isLocked]);
}; 
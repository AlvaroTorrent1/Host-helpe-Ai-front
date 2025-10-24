// src/features/sesregistro/components/SignaturePad.tsx
/**
 * Campo de firma digital para turistas
 * Permite firmar con touch (móvil/tablet) o mouse (desktop)
 * La firma se captura como SVG (vector) para máxima calidad
 */

import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Punto individual en un trazo de firma
interface Point {
  x: number;
  y: number;
}

// Trazo completo (array de puntos)
interface Path {
  points: Point[];
}

interface SignaturePadProps {
  onSignatureChange: (signatureData: string | null) => void;
  signatureData: string | null;
  error?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  onSignatureChange,
  signatureData,
  error,
}) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  
  // Array de trazos para generar SVG
  // Cada trazo es una línea continua (un solo movimiento del dedo/mouse)
  const [paths, setPaths] = useState<Path[]>([]);
  
  // Trazo actual que se está dibujando
  const currentPathRef = useRef<Point[]>([]);

  /**
   * Convierte los trazos capturados a formato SVG
   * Genera un string SVG con todos los paths de la firma
   */
  const convertPathsToSVG = (pathsData: Path[], width: number, height: number): string => {
    // Crear elemento SVG con las dimensiones del canvas
    let svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Convertir cada trazo a un elemento path SVG
    pathsData.forEach((path) => {
      if (path.points.length === 0) return;
      
      // Construir el atributo 'd' del path SVG
      // M = Move to (primer punto), L = Line to (siguientes puntos)
      let pathD = `M ${path.points[0].x} ${path.points[0].y}`;
      
      for (let i = 1; i < path.points.length; i++) {
        pathD += ` L ${path.points[i].x} ${path.points[i].y}`;
      }
      
      // Agregar el path con estilo de trazo
      svgContent += `<path d="${pathD}" stroke="#000000" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    });
    
    svgContent += '</svg>';
    return svgContent;
  };

  // Inicializar canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar estilo del canvas
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Si ya hay una firma guardada, cargarla
    if (signatureData) {
      // Convertir SVG a imagen para renderizar en canvas
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setIsEmpty(false);
      };
      
      // Convertir SVG string a data URL
      // El SVG puede venir como string directo
      if (signatureData.startsWith('<svg')) {
        const svgBlob = new Blob([signatureData], { type: 'image/svg+xml' });
        img.src = URL.createObjectURL(svgBlob);
      } else {
        // Mantener compatibilidad con imágenes base64 anteriores (PNG)
        img.src = signatureData;
      }
    }
  }, [signatureData]);

  // Obtener coordenadas relativas al canvas
  const getCoordinates = (event: MouseEvent | TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in event && event.touches[0]) {
      // Touch event
      return {
        x: (event.touches[0].clientX - rect.left) * scaleX,
        y: (event.touches[0].clientY - rect.top) * scaleY,
      };
    } else if ('clientX' in event) {
      // Mouse event
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      };
    }

    return null;
  };

  // Iniciar dibujo
  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    // Solo preventDefault en mouse events (no en touch para evitar warnings)
    if ('clientX' in event) {
      event.preventDefault();
    }
    
    setIsDrawing(true);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(event.nativeEvent as MouseEvent | TouchEvent);
    if (coords) {
      // Iniciar trazo en canvas (visual)
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      
      // Iniciar nuevo trazo para SVG
      currentPathRef.current = [coords];
    }
  };

  // Dibujar
  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    // Solo preventDefault en mouse events (no en touch para evitar warnings)
    if ('clientX' in event) {
      event.preventDefault();
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(event.nativeEvent as MouseEvent | TouchEvent);
    if (coords) {
      // Dibujar en canvas (visual)
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      setIsEmpty(false);
      
      // Guardar punto para SVG
      currentPathRef.current.push(coords);
    }
  };

  // Finalizar dibujo
  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Guardar el trazo actual en el array de paths
    if (currentPathRef.current.length > 0) {
      const newPaths = [...paths, { points: currentPathRef.current }];
      setPaths(newPaths);
      
      // Generar SVG con todos los trazos
      const canvas = canvasRef.current;
      if (canvas) {
        const svgString = convertPathsToSVG(newPaths, canvas.width, canvas.height);
        
        // Log para verificar el formato SVG (desarrollo)
        console.log('Firma guardada en formato SVG:', svgString.substring(0, 100) + '...');
        
        onSignatureChange(svgString);
      }
      
      // Limpiar trazo actual
      currentPathRef.current = [];
    }
  };

  // Limpiar firma
  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Limpiar canvas visual
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Limpiar datos de SVG
    setPaths([]);
    currentPathRef.current = [];
    
    setIsEmpty(true);
    onSignatureChange(null);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('sesRegistro.signature.title')} <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-600 mb-3">
          {t('sesRegistro.signature.subtitle')}
        </p>
      </div>

      {/* Canvas de firma */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`
            w-full border-2 rounded-lg bg-white cursor-crosshair
            ${error ? 'border-red-500' : 'border-gray-300'}
            hover:border-primary transition-colors
          `}
          style={{
            touchAction: 'none',
            maxHeight: '200px',
            msTouchAction: 'none',
          }}
        />

        {/* Indicador de área vacía */}
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <p className="text-sm font-medium">{t('sesRegistro.signature.signHere')}</p>
            </div>
          </div>
        )}

        {/* Botón de limpiar */}
        {!isEmpty && (
          <button
            type="button"
            onClick={clearSignature}
            className="absolute top-2 right-2 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t('sesRegistro.signature.clear')}
          </button>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="flex items-start gap-2 text-red-600 text-sm">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Información adicional */}
      {!error && isEmpty && (
        <div className="flex items-start gap-2 text-gray-500 text-xs">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{t('sesRegistro.signature.disclaimer')}</span>
        </div>
      )}

      {/* Confirmación de firma */}
      {!isEmpty && !error && (
        <div className="flex items-start gap-2 text-green-600 text-sm">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{t('sesRegistro.signature.captured')}</span>
        </div>
      )}
    </div>
  );
};

export default SignaturePad;


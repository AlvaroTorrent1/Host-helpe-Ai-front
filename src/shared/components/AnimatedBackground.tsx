// src/shared/components/AnimatedBackground.tsx
// Componente reutilizable para el fondo gradiente con puntos en movimiento
// Basado en el sistema de partículas del hero section

import React, { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  className?: string;
  particleCount?: number;
  gradientFrom?: string;
  gradientTo?: string;
  variant?: 'hero' | 'orange'; // Nuevo prop para elegir el estilo
  // Cuando es true, añade un degradado inferior que transiciona a blanco,
  // igual que en el hero de la landing, para facilitar la unión visual
  // con la siguiente sección.
  withBottomWhiteFade?: boolean;
}

class ParticleSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationId: number | null = null;
  private particleCount: number;

  constructor(canvas: HTMLCanvasElement, particleCount: number = 50) {
    this.canvas = canvas;
    this.particleCount = particleCount;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get canvas context');
    this.ctx = context;
    
    this.setupCanvas();
    this.createParticles();
    this.animate();
  }

  private setupCanvas() {
    const resizeCanvas = () => {
      this.canvas.width = this.canvas.offsetWidth * window.devicePixelRatio;
      this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio;
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  private createParticles() {
    // Usar el número de partículas especificado o calculado basado en el tamaño
    const count = this.particleCount || Math.min(80, Math.floor(this.canvas.width * this.canvas.height / 20000));
    
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(
        Math.random() * this.canvas.offsetWidth,
        Math.random() * this.canvas.offsetHeight,
        (Math.random() - 0.5) * 0.4, // Velocidad más lenta para secciones más pequeñas
        (Math.random() - 0.5) * 0.4,
        Math.random() * 1.5 + 0.8, // Partículas ligeramente más pequeñas
        `hsla(${45 + Math.random() * 15}, 85%, 65%, ${Math.random() * 0.5 + 0.3})` // Colores dorados
      ));
    }
  }

  private animate = () => {
    this.ctx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);
    
    // Actualizar y dibujar partículas
    this.particles.forEach((particle, index) => {
      particle.update(this.canvas.offsetWidth, this.canvas.offsetHeight);
      particle.draw(this.ctx);
      
      // Conectar partículas cercanas con líneas doradas
      for (let j = index + 1; j < this.particles.length; j++) {
        const other = this.particles[j];
        const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
        
        if (distance < 80) { // Distancia más corta para secciones más pequeñas
          this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * (1 - distance / 80)})`;
          this.ctx.lineWidth = 0.6;
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(other.x, other.y);
          this.ctx.stroke();
        }
      }
    });

    this.animationId = requestAnimationFrame(this.animate);
  };

  public destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

class Particle {
  constructor(
    public x: number,
    public y: number,
    public vx: number,
    public vy: number,
    public size: number,
    public color: string
  ) {}

  update(width: number, height: number) {
    this.x += this.vx;
    this.y += this.vy;

    // Rebotar en los bordes
    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;

    // Mantener dentro de los límites
    this.x = Math.max(0, Math.min(width, this.x));
    this.y = Math.max(0, Math.min(height, this.y));
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    // Añadir efecto de brillo
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  children,
  className = '',
  particleCount = 50,
  gradientFrom = '#ECA408',
  gradientTo = '#F5B730',
  variant = 'orange',
  withBottomWhiteFade = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | null = null;
    
    // Pequeño delay para asegurar que el DOM esté renderizado
    const timer = setTimeout(() => {
      try {
        if (canvasRef.current) {
          particleSystemRef.current = new ParticleSystem(canvasRef.current, particleCount);
        }
      } catch (error) {
        console.warn('Failed to initialize particle system:', error);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (particleSystemRef.current) {
        particleSystemRef.current.destroy();
      }
    };
  }, [particleCount]);

  // Configuración de estilos según la variante
  const getBackgroundStyle = () => {
    if (variant === 'hero') {
      return 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300';
    }
    return '';
  };

  const getInlineStyle = () => {
    if (variant === 'orange') {
      return { background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})` };
    }
    return {};
  };

  return (
    <section 
      className={`relative overflow-hidden ${getBackgroundStyle()} ${className}`}
      style={getInlineStyle()}
    >
      {/* Canvas para las partículas animadas */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ background: 'transparent' }}
      />

      {/* Elementos de fondo según la variante */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <style>
          {`
            @keyframes morph {
              0%, 100% { 
                transform: scale(1) rotate(0deg);
                border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
              }
              25% { 
                transform: scale(1.1) rotate(90deg);
                border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
              }
              50% { 
                transform: scale(0.9) rotate(180deg);
                border-radius: 50% 40% 60% 30% / 70% 50% 40% 60%;
              }
              75% { 
                transform: scale(1.2) rotate(270deg);
                border-radius: 40% 70% 30% 60% / 40% 70% 60% 50%;
              }
            }
            
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-20px) rotate(180deg); }
            }
            
            @keyframes pulse-golden {
              0%, 100% { opacity: 0.2; transform: scale(1); }
              50% { opacity: 0.5; transform: scale(1.1); }
            }
          `}
        </style>
        
        {/* Forma dorada principal */}
        <div className={`absolute top-1/4 right-1/4 ${variant === 'hero' ? 'w-96 h-96 opacity-40' : 'w-64 h-64 opacity-30'}`}>
          <div className="relative w-full h-full">
            <div 
              className={`absolute inset-0 ${
                variant === 'hero' 
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 blur-3xl' 
                  : 'bg-gradient-to-r from-yellow-300 to-yellow-400 blur-2xl'
              }`}
              style={{ 
                animation: 'morph 12s ease-in-out infinite',
                borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%'
              }}
            ></div>
          </div>
        </div>
        
        {/* Elemento dorado secundario */}
        <div className={`absolute bottom-1/4 left-1/6 ${variant === 'hero' ? 'w-64 h-64 opacity-35' : 'w-48 h-48 opacity-25'}`}>
          <div 
            className={`w-full h-full ${
              variant === 'hero'
                ? 'bg-gradient-to-br from-primary-400 to-primary-500 blur-2xl'
                : 'bg-gradient-to-br from-yellow-200 to-yellow-300 blur-xl'
            }`}
            style={{ 
              animation: 'float 8s ease-in-out infinite',
              borderRadius: '50%'
            }}
          ></div>
        </div>

        {/* Partículas flotantes */}
        <div className={`absolute top-10 left-10 ${variant === 'hero' ? 'w-4 h-4 bg-primary-500 opacity-60' : 'w-3 h-3 bg-yellow-300 opacity-50'} rounded-full animate-bounce`} style={{ animationDelay: '0s' }}></div>
        <div className={`absolute top-32 right-20 ${variant === 'hero' ? 'w-3 h-3 bg-primary-400 opacity-40' : 'w-2 h-2 bg-yellow-200 opacity-40'} rounded-full animate-bounce`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute bottom-20 left-1/4 ${variant === 'hero' ? 'w-2 h-2 bg-primary-500 opacity-50' : 'w-2 h-2 bg-yellow-400 opacity-45'} rounded-full animate-bounce`} style={{ animationDelay: '2s' }}></div>

        {/* Grid de red AI - solo para variante hero */}
        {variant === 'hero' && (
          <div className="absolute inset-0 opacity-15">
            <div className="grid grid-cols-20 gap-2 h-full">
              {Array.from({ length: 400 }, (_, i) => (
                <div 
                  key={i}
                  className="border border-primary-500 aspect-square"
                  style={{
                    animation: `pulse-golden ${2 + (i % 3)}s ease-in-out infinite`,
                    animationDelay: `${(i % 20) * 0.05}s`
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="relative z-10">
        {children}
      </div>
      {withBottomWhiteFade && (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 sm:h-20 lg:h-24 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
        </div>
      )}
    </section>
  );
};

export default AnimatedBackground;

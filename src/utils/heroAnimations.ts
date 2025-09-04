// src/utils/heroAnimations.ts
// Animaciones para el nuevo hero section
// ACTUALIZADO: ChatDemo completamente deshabilitado para evitar elementos verdes dinámicos
// Versión: 2024-12-21 - Cachés limpiados

export class ParticleSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
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
    const particleCount = Math.min(100, Math.floor(this.canvas.width * this.canvas.height / 15000));
    
    for (let i = 0; i < particleCount; i++) {
              this.particles.push(new Particle(
          Math.random() * this.canvas.offsetWidth,
          Math.random() * this.canvas.offsetHeight,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          Math.random() * 2 + 1,
          `hsla(${45 + Math.random() * 15}, 80%, 50%, ${Math.random() * 0.4 + 0.2})`
        ));
    }
  }

  private animate = () => {
    this.ctx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);
    
    // Update and draw particles
    this.particles.forEach((particle, index) => {
      particle.update(this.canvas.offsetWidth, this.canvas.offsetHeight);
      particle.draw(this.ctx);
      
      // Connect nearby particles
      for (let j = index + 1; j < this.particles.length; j++) {
        const other = this.particles[j];
        const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
        
        if (distance < 100) {
          this.ctx.strokeStyle = `rgba(236, 164, 8, ${0.3 * (1 - distance / 100)})`;
          this.ctx.lineWidth = 0.8;
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

    // Bounce off edges
    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;

    // Keep within bounds
    this.x = Math.max(0, Math.min(width, this.x));
    this.y = Math.max(0, Math.min(height, this.y));
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    // Add glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// Text rotation animation
export class TextRotator {
  private element: HTMLElement;
  private texts: string[];
  private currentIndex: number = 0;
  private intervalId: number | null = null;

  constructor(elementId: string, texts: string[], interval: number = 3000) {
    const element = document.getElementById(elementId);
    if (!element) throw new Error(`Element with id ${elementId} not found`);
    
    this.element = element;
    this.texts = texts;
    this.start(interval);
  }

  private start(interval: number) {
    this.intervalId = window.setInterval(() => {
      this.element.style.opacity = '0';
      this.element.style.transform = 'translateY(10px)';
      
      setTimeout(() => {
        this.currentIndex = (this.currentIndex + 1) % this.texts.length;
        this.element.textContent = this.texts[this.currentIndex];
        this.element.style.opacity = '1';
        this.element.style.transform = 'translateY(0)';
      }, 300);
    }, interval);
  }

  public destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// Chat demo animation - COMPLETAMENTE DESHABILITADO
export class ChatDemo {
  private timeoutId: number | null = null;

  constructor(containerId: string) {
    // Clase deshabilitada para mantener conversación estática del iPhone
    console.info(`Chat demo deshabilitado para container: ${containerId}`);
  }

  public destroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

// Counter animation
export class CounterAnimation {
  private element: HTMLElement;
  private targetValue: number;
  private currentValue: number = 0;
  private intervalId: number | null = null;

  constructor(elementId: string, targetValue: number, duration: number = 2000) {
    const element = document.getElementById(elementId);
    if (!element) throw new Error(`Element with id ${elementId} not found`);
    
    this.element = element;
    this.targetValue = targetValue;
    this.animate(duration);
  }

  private animate(duration: number) {
    const increment = this.targetValue / (duration / 16); // 60fps
    
    this.intervalId = window.setInterval(() => {
      this.currentValue += increment;
      
      if (this.currentValue >= this.targetValue) {
        this.currentValue = this.targetValue;
        if (this.intervalId) {
          clearInterval(this.intervalId);
          this.intervalId = null;
        }
      }
      
      this.element.textContent = Math.floor(this.currentValue).toLocaleString();
    }, 16);
  }

  public destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// Initialize all animations
export function initializeHeroAnimations(rotatingWords?: string[]) {
  // Particle system
  const canvas = document.getElementById('particle-canvas') as HTMLCanvasElement;
  let particleSystem: ParticleSystem | null = null;
  
  if (canvas) {
    particleSystem = new ParticleSystem(canvas);
  }

  // Text rotator with dynamic words
  const rotatingTexts = rotatingWords || [
    'reservas',
    'consultas', 
    'check-ins',
    'incidencias',
    'comunicación',
    'upselling'
  ];
  
  let textRotator: TextRotator | null = null;
  try {
    textRotator = new TextRotator('rotating-text', rotatingTexts, 2500);
  } catch (error) {
    console.warn('Text rotator not initialized:', error);
  }

  // Chat demo - DESHABILITADO para mantener conversación estática
  let chatDemo: ChatDemo | null = null;
  try {
    chatDemo = new ChatDemo('chat-demo');
  } catch (error) {
    console.warn('Chat demo not initialized:', error);
  }

  // Counter animations - REMOVED: Now handled by LandingPage.tsx with proper ranges
  // The KPI animations are now managed directly in LandingPage.tsx with defined ranges
  // to avoid conflicts and ensure values stay within acceptable bounds



  // Cleanup function
  return () => {
    particleSystem?.destroy();
    textRotator?.destroy();
    chatDemo?.destroy();
    // Counter animations cleanup removed - now handled by LandingPage.tsx
  };
}

document.addEventListener('DOMContentLoaded', () => {
    const carousel = {
        currentSlide: 0,
        slides: document.querySelectorAll('.carousel-slide'),
        dots: document.querySelectorAll('.carousel-dot'),
        
        init() {
            // Crear dots si no existen
            if (this.dots.length === 0) {
                this.createDots();
            }
            
            // Mostrar primera slide
            this.showSlide(0);
            
            // Agregar event listeners
            document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
                dot.addEventListener('click', () => this.showSlide(index));
            });
            
            // Auto-play opcional
            // setInterval(() => this.nextSlide(), 5000);
        },
        
        showSlide(index) {
            // Ocultar todas las slides
            this.slides.forEach(slide => {
                slide.style.transform = 'translateX(-100%)';
                slide.style.opacity = '0';
            });
            
            // Desactivar todos los dots
            document.querySelectorAll('.carousel-dot').forEach(dot => {
                dot.classList.remove('active');
            });
            
            // Mostrar slide actual
            this.slides[index].style.transform = 'translateX(0)';
            this.slides[index].style.opacity = '1';
            
            // Activar dot actual
            document.querySelectorAll('.carousel-dot')[index].classList.add('active');
            
            this.currentSlide = index;
        },
        
        nextSlide() {
            const next = (this.currentSlide + 1) % this.slides.length;
            this.showSlide(next);
        },
        
        createDots() {
            const nav = document.createElement('div');
            nav.className = 'carousel-nav';
            
            this.slides.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.className = 'carousel-dot';
                dot.setAttribute('aria-label', `Slide ${index + 1}`);
                nav.appendChild(dot);
            });
            
            document.querySelector('.carousel-container').appendChild(nav);
        }
    };
    
    // Inicializar carrusel
    carousel.init();
}); 
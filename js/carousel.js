// Función reutilizable para inicializar carruseles
function initializeCarousel(carouselElement) {
    let isDown = false;
    let startX;
    let scrollLeft;

    carouselElement.addEventListener('mousedown', (e) => {
        isDown = true;
        carouselElement.classList.add('grabbing');
        startX = e.pageX - carouselElement.offsetLeft;
        scrollLeft = carouselElement.scrollLeft;
    });

    carouselElement.addEventListener('mouseleave', () => {
        isDown = false;
        carouselElement.classList.remove('grabbing');
    });

    carouselElement.addEventListener('mouseup', () => {
        isDown = false;
        carouselElement.classList.remove('grabbing');
    });

    carouselElement.addEventListener('mousemove', (e) => {
        if(!isDown) return;
        e.preventDefault();
        const x = e.pageX - carouselElement.offsetLeft;
        const walk = (x - startX) * 2;
        carouselElement.scrollLeft = scrollLeft - walk;
    });
}

function initFeaturesCarousel() {
    const carousel = document.getElementById('featuresCarousel');
    if (!carousel) return;
    
    const cardsContainer = carousel.querySelector('.feature-cards');
    const cards = cardsContainer.querySelectorAll('.feature-card');
    
    // Clonar algunas tarjetas para scroll infinito
    const cardsToClone = Math.min(3, cards.length);
    for (let i = 0; i < cardsToClone; i++) {
        const clone = cards[i].cloneNode(true);
        cardsContainer.appendChild(clone);
    }
    
    // Variables y configuración
    let position = 0;
    const cardWidth = cards[0].offsetWidth + parseInt(getComputedStyle(cards[0]).marginRight);
    let isAuto = true;
    let isHovering = false;
    let autoScrollInterval;
    
    // Funciones principales
    function moveCarousel(newPosition) {
        position = newPosition;
        
        // Usar transform en lugar de scrollLeft para mejor rendimiento
        cardsContainer.style.transform = `translateX(-${position * cardWidth}px)`;
        
        // Resetear al inicio cuando llegamos al final
        if (position >= cards.length) {
            setTimeout(() => {
                cardsContainer.style.transition = 'none';
                position = 0;
                cardsContainer.style.transform = `translateX(0)`;
                setTimeout(() => {
                    cardsContainer.style.transition = 'transform 0.5s ease';
                }, 50);
            }, 500);
        }
    }
    
    function startAutoScroll() {
        if (autoScrollInterval) clearInterval(autoScrollInterval);
        autoScrollInterval = setInterval(() => {
            if (!isHovering && isAuto) {
                moveCarousel(position + 1);
            }
        }, 3000);
    }
    
    // Eventos optimizados
    carousel.addEventListener('mouseenter', () => isHovering = true, {passive: true});
    carousel.addEventListener('mouseleave', () => isHovering = false, {passive: true});
    
    // Evitar cálculos en desplazamiento táctil manual
    let startX, startScrollLeft, isDragging = false;
    
    carousel.addEventListener('touchstart', (e) => {
        isDragging = true;
        isHovering = true;
        startX = e.touches[0].clientX;
        startScrollLeft = position * cardWidth;
        cardsContainer.style.transition = 'none';
    }, {passive: true});
    
    carousel.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.touches[0].clientX;
        const dist = startX - x;
        const newPosition = startScrollLeft + dist;
        cardsContainer.style.transform = `translateX(-${newPosition}px)`;
    });
    
    carousel.addEventListener('touchend', () => {
        isDragging = false;
        cardsContainer.style.transition = 'transform 0.5s ease';
        const newPosition = Math.round((parseInt(cardsContainer.style.transform.match(/-?\d+/) || 0) / cardWidth));
        moveCarousel(newPosition);
        
        setTimeout(() => {
            isHovering = false;
        }, 1000);
    }, {passive: true});
    
    // Usar IntersectionObserver para pausar/reanudar cuando no es visible
    const observer = new IntersectionObserver((entries) => {
        isAuto = entries[0].isIntersecting;
        if (isAuto) {
            startAutoScroll();
        } else {
            clearInterval(autoScrollInterval);
        }
    }, {threshold: 0.1});
    
    observer.observe(carousel);
    
    // Iniciar
    startAutoScroll();
}

// Inicializar todos los carruseles cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar carrusel de clientes
    const clientsCarousel = document.querySelector('.clients-carousel');
    if (clientsCarousel) {
        initializeCarousel(clientsCarousel);
    }

    // Inicializar carrusel de características
    initFeaturesCarousel();
}); 
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
    const carousel = document.querySelector('.features-carousel');
    if (!carousel) return;

    const cards = carousel.querySelector('.feature-cards');
    const cardWidth = carousel.querySelector('.feature-card').offsetWidth;
    let isAutoPlaying = true;
    let autoPlayInterval;
    let currentPosition = 0;

    // Función para el autoplay
    function startAutoPlay() {
        autoPlayInterval = setInterval(() => {
            if (isAutoPlaying) {
                currentPosition -= 1; // Movimiento suave
                // Resetear posición cuando llegue al final
                if (Math.abs(currentPosition) >= (cards.scrollWidth - carousel.offsetWidth)) {
                    currentPosition = 0;
                }
                cards.style.transform = `translateX(${currentPosition}px)`;
            }
        }, 30); // Velocidad del movimiento
    }

    // Eventos para desktop
    if (window.innerWidth > 768) {
        // Pausar en hover
        carousel.addEventListener('mouseenter', () => {
            isAutoPlaying = false;
        });

        carousel.addEventListener('mouseleave', () => {
            isAutoPlaying = true;
        });

        // Iniciar autoplay
        startAutoPlay();
    } else {
        // Comportamiento táctil para móvil
        let isDown = false;
        let startX;
        let scrollLeft;

        carousel.addEventListener('touchstart', (e) => {
            isDown = true;
            carousel.classList.add('active');
            startX = e.touches[0].clientX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
        });

        carousel.addEventListener('touchend', () => {
            isDown = false;
            carousel.classList.remove('active');
        });

        carousel.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.touches[0].clientX - carousel.offsetLeft;
            const walk = (x - startX);
            carousel.scrollLeft = scrollLeft - walk;
        });
    }
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
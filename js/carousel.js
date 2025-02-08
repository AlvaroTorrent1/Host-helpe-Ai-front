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
    const track = document.querySelector('.features-track');
    if (!track) return;

    // Clonar elementos para scroll infinito
    const cards = Array.from(track.children);
    const clonedCards = cards.map(card => card.cloneNode(true));
    clonedCards.forEach(card => track.appendChild(card));

    // Variables para el touch/drag
    let isDown = false;
    let startX;
    let scrollLeft;
    let animationPaused = false;

    function pauseAnimation() {
        if (!animationPaused) {
            track.style.animationPlayState = 'paused';
            animationPaused = true;
        }
    }

    function resumeAnimation() {
        if (animationPaused) {
            track.style.animationPlayState = 'running';
            animationPaused = false;
        }
    }

    // Event listeners para desktop
    if (window.innerWidth > 768) {
        track.addEventListener('mouseenter', pauseAnimation);
        track.addEventListener('mouseleave', resumeAnimation);
    }

    // Touch events para móvil
    track.addEventListener('touchstart', (e) => {
        isDown = true;
        startX = e.touches[0].clientX;
        scrollLeft = track.scrollLeft;
        pauseAnimation();
    });

    track.addEventListener('touchend', () => {
        isDown = false;
        resumeAnimation();
    });

    track.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.touches[0].clientX;
        const walk = (x - startX);
        track.scrollLeft = scrollLeft - walk;
    });

    // Reset animation cuando llega al final
    track.addEventListener('animationend', () => {
        track.style.animation = 'none';
        track.offsetHeight; // Trigger reflow
        track.style.animation = null;
    });
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
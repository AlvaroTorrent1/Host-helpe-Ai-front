function initTouchCarousel(carouselId) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;

    const container = carousel.querySelector('.feature-cards');
    let isDown = false;
    let startX;
    let scrollLeft;

    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        carousel.classList.add('active');
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });

    carousel.addEventListener('mouseleave', () => {
        isDown = false;
        carousel.classList.remove('active');
    });

    carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.classList.remove('active');
    });

    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX);
        carousel.scrollLeft = scrollLeft - walk;
    });

    // Touch events
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
        const x = e.touches[0].clientX - carousel.offsetLeft;
        const walk = (x - startX);
        carousel.scrollLeft = scrollLeft - walk;
    });
}

// Inicializar los carruseles
document.addEventListener('DOMContentLoaded', () => {
    initTouchCarousel('featuresCarousel');
}); 
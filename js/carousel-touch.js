document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.features-carousel');
    if (!carousel) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    // Touch events
    carousel.addEventListener('touchstart', (e) => {
        isDown = true;
        carousel.classList.add('grabbing');
        startX = e.touches[0].pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });

    carousel.addEventListener('touchend', () => {
        isDown = false;
        carousel.classList.remove('grabbing');
    });

    carousel.addEventListener('touchcancel', () => {
        isDown = false;
        carousel.classList.remove('grabbing');
    });

    carousel.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.touches[0].pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
    });

    // Mouse events (para testing en desktop)
    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        carousel.classList.add('grabbing');
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });

    carousel.addEventListener('mouseleave', () => {
        isDown = false;
        carousel.classList.remove('grabbing');
    });

    carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.classList.remove('grabbing');
    });

    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
    });
}); 
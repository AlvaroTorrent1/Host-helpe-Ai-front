function initCarousels() {
    // Inicializar carrusel de clientes
    initCarousel('.clients-carousel-track', '.clients-carousel .carousel-control');
    // Inicializar carrusel de características
    initCarousel('.features-carousel-track', '.features-carousel .carousel-control');
}

function initCarousel(trackSelector, controlsSelector) {
    const track = document.querySelector(trackSelector);
    const cards = Array.from(track.children);
    const prevButton = track.parentElement.querySelector(`${controlsSelector}.prev`);
    const nextButton = track.parentElement.querySelector(`${controlsSelector}.next`);
    
    let currentIndex = 0;
    let isTransitioning = false;
    
    function updateCarousel() {
        if (isTransitioning) return;
        isTransitioning = true;
        
        cards.forEach((card, index) => {
            card.className = trackSelector.includes('features') ? 'feature-card' : 'client-card';
            if (index === currentIndex) {
                card.classList.add('active');
            } else if (index === getNextIndex()) {
                card.classList.add('next');
            } else if (index === getPrevIndex()) {
                card.classList.add('prev');
            }
        });
        
        setTimeout(() => {
            isTransitioning = false;
        }, 500);
    }
    
    function getNextIndex() {
        return (currentIndex + 1) % cards.length;
    }
    
    function getPrevIndex() {
        return (currentIndex - 1 + cards.length) % cards.length;
    }
    
    nextButton.addEventListener('click', () => {
        if (isTransitioning) return;
        currentIndex = getNextIndex();
        updateCarousel();
    });
    
    prevButton.addEventListener('click', () => {
        if (isTransitioning) return;
        currentIndex = getPrevIndex();
        updateCarousel();
    });
    
    updateCarousel();
}

// Función para la animación del typewriter
function initTypewriter() {
    const text = document.getElementById('typewriter');
    const content = text.textContent;
    text.textContent = '';
    
    let i = 0;
    function type() {
        if (i < content.length) {
            text.textContent += content.charAt(i);
            i++;
            setTimeout(type, 30);
        }
    }
    
    // Comenzar a escribir inmediatamente
    type();
}

// Función para controlar el video
function initVideo() {
    const video = document.getElementById('christmasVideo');
    
    // Configurar atributos para reproducción automática
    video.autoplay = true;
    video.muted = true; // Necesario para autoplay en la mayoría de navegadores
    video.playsInline = true; // Para iOS
    
    // Intentar reproducir inmediatamente
    const playVideo = () => {
        video.play()
            .catch(error => {
                console.log("Auto-play was prevented:", error);
            });
    };

    // Intentar reproducir cuando el video esté listo
    video.addEventListener('loadedmetadata', playVideo);
    
    // Intentar reproducir cuando la página esté completamente cargada
    window.addEventListener('load', playVideo);

    // Inicializar video de fondo
    const bgVideo = document.getElementById('backgroundVideo');
    if (bgVideo) {
        bgVideo.play().catch(error => {
            console.log("Background video autoplay was prevented:", error);
        });
    }

    // Inicializar video de fondo de contacto
    const contactBgVideo = document.getElementById('contactBackgroundVideo');
    if (contactBgVideo) {
        contactBgVideo.play().catch(error => {
            console.log("Contact background video autoplay was prevented:", error);
        });
    }
}

// Función para manejar el toggle de precios
function initPricingToggle() {
    const toggle = document.getElementById('billing-toggle');
    const monthlyLabel = document.querySelector('.billing-toggle .toggle-label:first-child');
    const annualLabel = document.querySelector('.billing-toggle .toggle-label:last-of-type');
    const monthlyPrices = document.querySelectorAll('.price.monthly');
    const annualPrices = document.querySelectorAll('.price.annual');

    function updatePrices(showAnnual) {
        if (showAnnual) {
            monthlyPrices.forEach(price => price.classList.remove('active'));
            annualPrices.forEach(price => price.classList.add('active'));
            monthlyLabel.classList.remove('active');
            annualLabel.classList.add('active');
        } else {
            annualPrices.forEach(price => price.classList.remove('active'));
            monthlyPrices.forEach(price => price.classList.add('active'));
            monthlyLabel.classList.add('active');
            annualLabel.classList.remove('active');
        }
    }

    // Establecer estado inicial (anual)
    toggle.checked = true;
    updatePrices(true);

    toggle.addEventListener('change', () => {
        updatePrices(toggle.checked);
    });
}

function initFeaturesCarousel() {
    const track = document.querySelector('.features-track');
    const cards = Array.from(track.children);
    const prevButton = document.querySelector('.carousel-arrow.prev');
    const nextButton = document.querySelector('.carousel-arrow.next');
    let currentIndex = 0;

    // Función para actualizar las clases active
    function updateActiveCards() {
        cards.forEach((card, index) => {
            card.classList.remove('active');
            if (index === currentIndex) {
                card.classList.add('active');
            }
        });
    }

    function updateCarousel(direction) {
        currentIndex = (currentIndex + direction + cards.length) % cards.length;
        
        const moveX = -(currentIndex * (100 / 3) + (100 / 3)); // Centrar la tarjeta activa
        track.style.transform = `translateX(${moveX}%)`;
        
        updateActiveCards();
    }

    // Establecer estado inicial
    updateActiveCards();
    track.style.transform = `translateX(-${100 / 3}%)`; // Centrar primera tarjeta

    prevButton.addEventListener('click', () => updateCarousel(-1));
    nextButton.addEventListener('click', () => updateCarousel(1));

    // Autoplay opcional
    let autoplayInterval = setInterval(() => updateCarousel(1), 5000);

    // Pausar autoplay al hover
    track.addEventListener('mouseenter', () => {
        clearInterval(autoplayInterval);
    });

    track.addEventListener('mouseleave', () => {
        autoplayInterval = setInterval(() => updateCarousel(1), 5000);
    });
}

function initBackgroundVideo() {
    const bgVideo = document.getElementById('backgroundVideo');
    if (bgVideo) {
        bgVideo.play().catch(error => {
            console.log("Background video autoplay was prevented:", error);
            document.addEventListener('click', () => {
                bgVideo.play();
            }, { once: true });
        });
    }
}

function initClientsCarousel() {
    const track = document.querySelector('.clients-track');
    const cards = Array.from(track.children);
    const prevButton = track.parentElement.querySelector('.carousel-arrow.prev');
    const nextButton = track.parentElement.querySelector('.carousel-arrow.next');
    let currentIndex = 0;

    function updateActiveCards() {
        cards.forEach((card, index) => {
            card.classList.remove('active');
            if (index === currentIndex) {
                card.classList.add('active');
            }
        });
    }

    function updateCarousel(direction) {
        currentIndex = (currentIndex + direction + cards.length) % cards.length;
        
        const moveX = -(currentIndex * (100 / 3) + (100 / 3));
        track.style.transform = `translateX(${moveX}%)`;
        
        updateActiveCards();
    }

    // Establecer estado inicial
    updateActiveCards();
    track.style.transform = `translateX(-${100 / 3}%)`;

    prevButton.addEventListener('click', () => updateCarousel(-1));
    nextButton.addEventListener('click', () => updateCarousel(1));

    // Autoplay opcional
    let autoplayInterval = setInterval(() => updateCarousel(1), 5000);

    track.addEventListener('mouseenter', () => {
        clearInterval(autoplayInterval);
    });

    track.addEventListener('mouseleave', () => {
        autoplayInterval = setInterval(() => updateCarousel(1), 5000);
    });
}

// Actualizar la inicialización
document.addEventListener('DOMContentLoaded', () => {
    initCarousels();
    initTypewriter();
    initVideo();
    initPricingToggle();
    initFeaturesCarousel();
    initBackgroundVideo();
    initClientsCarousel();
}); 
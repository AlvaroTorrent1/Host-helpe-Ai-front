// En la inicialización
document.addEventListener('DOMContentLoaded', () => {
    initTypewriter();
    initPricingToggle();
    initClientsCarousel();
    initLanguageSelector();
    initHeroVideo();
    initFeaturesCarousel();
}); 

function initTypewriter() {
    const text = document.getElementById('typewriter');
    if (!text) return;
    
    const content = text.textContent;
    text.textContent = '';
    text.classList.add('typing');
    
    let i = 0;
    function type() {
        if (i < content.length) {
            // Si encontramos un emoji (🎄, 🤖, 🎯), lo añadimos de una vez
            if (content[i].match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/)) {
                text.textContent += content[i] + content[i + 1];
                i += 2;
            } else {
                text.textContent += content[i];
                i++;
            }
            
            // Ajustar la velocidad según el carácter
            let delay = 30;
            if (content[i] === '\n') delay = 500; // Pausa más larga en saltos de línea
            if (content[i] === '.') delay = 300; // Pausa en puntos
            
            setTimeout(type, delay);
        }
    }
    
    // Comenzar a escribir después de un pequeño delay inicial
    setTimeout(type, 500);
}

function initLanguageSelector() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover clase active de todos los botones
            langButtons.forEach(btn => btn.classList.remove('active'));
            // Añadir clase active al botón clickeado
            button.classList.add('active');
            
            // Aquí puedes añadir la lógica para cambiar el idioma
            const lang = button.getAttribute('data-lang');
            // Por ejemplo: changeLanguage(lang);
        });
    });
}

function initClientsCarousel() {
    const carousel = document.querySelector('.clients-carousel');
    if (!carousel) return;
    
    const track = carousel.querySelector('.clients-track');
    const cards = Array.from(track.children);
    const prevButton = carousel.querySelector('.carousel-arrow.prev');
    const nextButton = carousel.querySelector('.carousel-arrow.next');
    
    let currentIndex = 0;
    const cardWidth = cards[0].offsetWidth;
    const gap = 32;
    
    function updateCarousel() {
        const moveX = currentIndex * (cardWidth + gap);
        track.style.transform = `translateX(-${moveX}px)`;
        
        prevButton.style.opacity = currentIndex === 0 ? '0.5' : '1';
        nextButton.style.opacity = currentIndex >= cards.length - 3 ? '0.5' : '1';
        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex >= cards.length - 3;
    }

    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentIndex < cards.length - 3) {
            currentIndex++;
            updateCarousel();
        }
    });

    updateCarousel();
    
    window.addEventListener('resize', () => {
        const newCardWidth = cards[0].offsetWidth;
        const moveX = currentIndex * (newCardWidth + gap);
        track.style.transform = `translateX(-${moveX}px)`;
    });
}

function initPricingToggle() {
    const monthlyBtn = document.querySelector('.billing-toggle .monthly');
    const annualBtn = document.querySelector('.billing-toggle .annual');
    const pricingCards = document.querySelectorAll('.pricing-card');

    if (!monthlyBtn || !annualBtn) return;

    function togglePricing(isAnnual) {
        pricingCards.forEach(card => {
            const monthlyPrice = card.querySelector('.price.monthly');
            const annualPrice = card.querySelector('.price.annual');
            
            if (monthlyPrice && annualPrice) {
                if (isAnnual) {
                    monthlyPrice.style.display = 'none';
                    annualPrice.style.display = 'flex';
                    monthlyBtn.classList.remove('active');
                    annualBtn.classList.add('active');
                } else {
                    monthlyPrice.style.display = 'flex';
                    annualPrice.style.display = 'none';
                    monthlyBtn.classList.add('active');
                    annualBtn.classList.remove('active');
                }
            }
        });
    }

    monthlyBtn.addEventListener('click', () => togglePricing(false));
    annualBtn.addEventListener('click', () => togglePricing(true));

    // Inicializar con precios mensuales
    togglePricing(false);
}

function initFeaturesCarousel() {
    const carousel = document.querySelector('.features-carousel');
    const track = carousel.querySelector('.features-track');
    const cards = Array.from(track.children);
    const prevButton = carousel.querySelector('.carousel-arrow.prev');
    const nextButton = carousel.querySelector('.carousel-arrow.next');
    
    let currentIndex = 0;
    const cardWidth = cards[0].offsetWidth;
    const gap = 32; // El espacio entre tarjetas
    
    function updateCarousel() {
        const moveX = currentIndex * (cardWidth + gap);
        track.style.transform = `translateX(-${moveX}px)`;
        
        // Actualizar estado de los botones
        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex >= cards.length - 3;
        
        // Actualizar opacidad de los botones
        prevButton.style.opacity = currentIndex === 0 ? '0.5' : '1';
        nextButton.style.opacity = currentIndex >= cards.length - 3 ? '0.5' : '1';
    }

    function moveNext() {
        if (currentIndex < cards.length - 3) {
            currentIndex++;
            updateCarousel();
        }
    }

    function movePrev() {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    }

    // Event Listeners
    nextButton.addEventListener('click', moveNext);
    prevButton.addEventListener('click', movePrev);

    // Inicializar carrusel
    updateCarousel();

    // Ajustar el carrusel cuando cambie el tamaño de la ventana
    window.addEventListener('resize', () => {
        const newCardWidth = cards[0].offsetWidth;
        const moveX = currentIndex * (newCardWidth + gap);
        track.style.transform = `translateX(-${moveX}px)`;
    });
} 

function initHeroVideo() {
    const video = document.getElementById('christmasVideo');
    const playPauseBtn = document.querySelector('.hero-video-btn.play-pause');
    const volumeBtn = document.querySelector('.hero-video-btn.volume');
    const volumeSlider = document.querySelector('.volume-slider');
    
    // Configurar video para autoplay
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;

    function updatePlayPauseIcon() {
        const icon = playPauseBtn.querySelector('i');
        if (video.paused) {
            icon.className = 'fas fa-play';
            playPauseBtn.setAttribute('title', 'Reproducir');
        } else {
            icon.className = 'fas fa-pause';
            playPauseBtn.setAttribute('title', 'Pausar');
        }
    }

    function updateVolumeIcon() {
        const icon = volumeBtn.querySelector('i');
        if (video.muted || video.volume === 0) {
            icon.className = 'fas fa-volume-mute';
            volumeBtn.setAttribute('title', 'Activar sonido');
            volumeSlider.value = 0;
        } else if (video.volume < 0.5) {
            icon.className = 'fas fa-volume-down';
            volumeBtn.setAttribute('title', 'Silenciar');
        } else {
            icon.className = 'fas fa-volume-up';
            volumeBtn.setAttribute('title', 'Silenciar');
        }
    }

    // Play/Pause
    playPauseBtn.addEventListener('click', () => {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    });

    // Mute/Unmute
    volumeBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        if (!video.muted && video.volume === 0) {
            video.volume = 0.5;
            volumeSlider.value = 50;
        }
    });

    // Volume Slider
    volumeSlider.addEventListener('input', (e) => {
        const value = e.target.value / 100;
        video.volume = value;
        video.muted = value === 0;
        updateVolumeIcon();
    });

    // Event listeners
    video.addEventListener('play', updatePlayPauseIcon);
    video.addEventListener('pause', updatePlayPauseIcon);
    video.addEventListener('volumechange', updateVolumeIcon);

    // Reproducir automáticamente
    video.play().catch(() => {
        // Si falla el autoplay, actualizar el icono
        updatePlayPauseIcon();
    });

    // Inicializar estados
    updatePlayPauseIcon();
    updateVolumeIcon();
} 
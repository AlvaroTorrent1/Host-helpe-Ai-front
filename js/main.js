import { changeLanguage } from './language.js';

// En la inicialización
document.addEventListener('DOMContentLoaded', () => {
    initTypewriter();
    initPricingToggle();
    initClientsCarousel();
    initLanguageSelector();
    initFeaturesCarousel();
    initMobileMenu();
}); 

function initTypewriter() {
    const text = document.getElementById('typewriter');
    if (!text) return;
    
    // Convertir los saltos de línea del texto original en <br>
    const content = text.textContent.trim().replace(/\n\n/g, '<br><br>');
    text.textContent = '';
    
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async function type() {
        let htmlContent = '';
        const lines = content.split('<br><br>');
        
        for (let line of lines) {
            for (let i = 0; i < line.length; i++) {
                try {
                    // Si encontramos un emoji
                    if (line[i].match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/)) {
                        htmlContent += line[i] + line[i + 1];
                        i++;
                    } 
                    // Para puntos, hacer una pausa más larga
                    else if (line[i] === '.') {
                        htmlContent += line[i];
                        text.innerHTML = htmlContent;
                        await sleep(300);
                    }
                    // Caracteres normales
                    else {
                        htmlContent += line[i];
                        text.innerHTML = htmlContent;
                        await sleep(30);
                    }
                } catch (error) {
                    console.error('Error en el efecto typewriter:', error);
                    text.innerHTML = content;
                    return;
                }
            }
            // Añadir salto de línea después de cada línea
            htmlContent += '<br><br>';
            text.innerHTML = htmlContent;
            await sleep(500);
        }
    }

    // Iniciar el efecto con manejo de errores
    type().catch(error => {
        console.error('Error al iniciar el typewriter:', error);
        text.innerHTML = content.replace(/\n\n/g, '<br><br>');
    });
}

function initLanguageSelector() {
    const langToggle = document.querySelector('.language-toggle');
    const langDropdown = document.querySelector('.language-dropdown');
    const langOptions = document.querySelectorAll('.lang-option');
    const currentLangSpan = document.querySelector('.current-lang');
    
    // Toggle dropdown
    langToggle.addEventListener('click', () => {
        langToggle.classList.toggle('active');
        langDropdown.classList.toggle('show');
    });

    // Select language
    langOptions.forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.getAttribute('data-lang');
            
            // Actualizar UI
            langOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            currentLangSpan.textContent = lang.toUpperCase();
            langToggle.classList.remove('active');
            langDropdown.classList.remove('show');
            
            // Cambiar el idioma usando la función importada
            changeLanguage(lang);
            
            // Guardar preferencia
            localStorage.setItem('preferredLanguage', lang);
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!langToggle.contains(e.target)) {
            langToggle.classList.remove('active');
            langDropdown.classList.remove('show');
        }
    });
    
    // Establecer el idioma inicial
    const preferredLanguage = localStorage.getItem('preferredLanguage') || 'es';
    const initialOption = document.querySelector(`.lang-option[data-lang="${preferredLanguage}"]`);
    if (initialOption) {
        initialOption.classList.add('active');
        currentLangSpan.textContent = preferredLanguage.toUpperCase();
        changeLanguage(preferredLanguage);
    }
}

function initClientsCarousel() {
    const carousel = document.querySelector('.clients-carousel');
    if (!carousel) return;
    
    const track = carousel.querySelector('.clients-track');
    const cards = Array.from(track.children);
    const prevButton = carousel.querySelector('.carousel-arrow.prev');
    const nextButton = carousel.querySelector('.carousel-arrow.next');
    
    // Clonar las primeras y últimas tarjetas para el efecto infinito
    const firstCardClone = cards[0].cloneNode(true);
    const secondCardClone = cards[1].cloneNode(true);
    const lastCardClone = cards[cards.length - 1].cloneNode(true);
    const secondLastCardClone = cards[cards.length - 2].cloneNode(true);
    
    // Añadir clones al inicio y final
    track.appendChild(firstCardClone);
    track.appendChild(secondCardClone);
    track.insertBefore(lastCardClone, cards[0]);
    track.insertBefore(secondLastCardClone, cards[0]);
    
    let currentIndex = 2; // Comenzamos en 2 porque tenemos dos clones al inicio
    const cardWidth = cards[0].offsetWidth;
    const gap = 32;
    
    // Posicionar inicialmente el track
    track.style.transform = `translateX(-${currentIndex * (cardWidth + gap)}px)`;
    
    function updateCarousel(direction) {
        track.style.transition = 'transform 0.5s ease-in-out';
        currentIndex += direction;
        track.style.transform = `translateX(-${currentIndex * (cardWidth + gap)}px)`;
        
        // Manejar el efecto infinito
        if (currentIndex >= cards.length + 2) {
            setTimeout(() => {
                track.style.transition = 'none';
                currentIndex = 2;
                track.style.transform = `translateX(-${currentIndex * (cardWidth + gap)}px)`;
            }, 500);
        } else if (currentIndex <= 1) {
            setTimeout(() => {
                track.style.transition = 'none';
                currentIndex = cards.length + 1;
                track.style.transform = `translateX(-${currentIndex * (cardWidth + gap)}px)`;
            }, 500);
        }
    }

    // Event Listeners
    nextButton.addEventListener('click', () => updateCarousel(1));
    prevButton.addEventListener('click', () => updateCarousel(-1));

    // Reiniciar la transición después de los saltos
    track.addEventListener('transitionend', () => {
        track.style.transition = 'transform 0.5s ease-in-out';
    });

    // Ajustar el carrusel cuando cambie el tamaño de la ventana
    window.addEventListener('resize', () => {
        const newCardWidth = cards[0].offsetWidth;
        track.style.transition = 'none';
        track.style.transform = `translateX(-${currentIndex * (newCardWidth + gap)}px)`;
    });

    // Opcional: Autoplay
    let autoplayInterval;
    
    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            updateCarousel(1);
        }, 5000); // Cambiar cada 5 segundos
    }
    
    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    // Iniciar autoplay
    startAutoplay();

    // Detener autoplay al hover
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
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
    if (!carousel) return;

    const cards = carousel.querySelector('.feature-cards');
    const cardWidth = carousel.querySelector('.feature-card').offsetWidth;
    let startX = 0;
    let scrollLeft = 0;
    let isDown = false;

    carousel.addEventListener('mousedown', e => {
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

    carousel.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
    });

    // Touch events
    carousel.addEventListener('touchstart', e => {
        isDown = true;
        carousel.classList.add('active');
        startX = e.touches[0].clientX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });

    carousel.addEventListener('touchend', () => {
        isDown = false;
        carousel.classList.remove('active');
    });

    carousel.addEventListener('touchmove', e => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.touches[0].clientX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
    });
} 

function initHeroVideo() {
    // La función está vacía porque hemos eliminado el video
    console.log('Video hero eliminado');
} 

function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (!menuBtn || !navLinks) return;
    
    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = menuBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    });

    // Cerrar menú al hacer click en un enlace
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevenir comportamiento por defecto
            navLinks.classList.remove('active');
            menuBtn.querySelector('i').className = 'fas fa-bars';
            // Manejar la navegación después de cerrar el menú
            setTimeout(() => {
                window.location.href = link.href;
            }, 300);
        });
    });

    // Cerrar menú al hacer scroll
    window.addEventListener('scroll', () => {
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            menuBtn.querySelector('i').className = 'fas fa-bars';
        }
    });
} 

// Función para scroll suave al inicio
function scrollToTop() {
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        heroSection.scrollIntoView({ behavior: 'smooth' });
    }
} 
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const galleryTimeline = document.querySelector('.gallery-timeline');
    const galleryData = document.querySelector('.gallery-data');
    const dots = document.querySelectorAll('.dot');
    const prevButton = document.querySelector('.nav-button.prev');
    const nextButton = document.querySelector('.nav-button.next');
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = lightbox.querySelector('img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');

    // State variables
    let currentIndex = 0;
    const totalItems = galleryData.children.length;
    let isAnimating = false;
    let autoPlayInterval;
    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;

    function updateGallery(instant = false) {
        const items = Array.from(galleryData.children);
        galleryTimeline.innerHTML = '';
    
        const prevIndex = (currentIndex - 1 + totalItems) % totalItems;
        const nextIndex = (currentIndex + 1) % totalItems;
    
        const prevClone = items[prevIndex].cloneNode(true);
        const currentClone = items[currentIndex].cloneNode(true);
        const nextClone = items[nextIndex].cloneNode(true);
    
        // Add classes and click handlers
        prevClone.className = 'gallery-item previous';
        currentClone.className = 'gallery-item current';
        nextClone.className = 'gallery-item next';

        // Add click handlers to side images
        prevClone.addEventListener('click', () => {
            if (!isAnimating) navigate('prev');
        });
        nextClone.addEventListener('click', () => {
            if (!isAnimating) navigate('next');
        });
    
        if (instant) {
            prevClone.style.transition = 'none';
            currentClone.style.transition = 'none';
            nextClone.style.transition = 'none';
        }
    
        galleryTimeline.appendChild(prevClone);
        galleryTimeline.appendChild(currentClone);
        galleryTimeline.appendChild(nextClone);
    
        if (instant) {
            // Force reflow
            galleryTimeline.offsetHeight;
            prevClone.style.transition = '';
            currentClone.style.transition = '';
            nextClone.style.transition = '';
        }
    
        updateDots();
        addLightboxHandlers(currentClone);
        
        // Add hover effects
        [prevClone, nextClone].forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'scale(0.95)';
                item.style.opacity = '0.7';
            });
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'scale(0.9)';
                item.style.opacity = '0.4';
            });
        });
    }

    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function addLightboxHandlers(currentClone) {
        currentClone.addEventListener('click', () => openLightbox(currentIndex));
    }

    function navigate(direction) {
        if (isAnimating) return;
        isAnimating = true;

        const items = Array.from(galleryTimeline.children);
        const isMobile = window.innerWidth <= 768;

        items.forEach(item => {
            item.style.transition = 'all 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)';
        });

        if (direction === 'next') {
            currentIndex = (currentIndex + 1) % totalItems;

            // Enhanced animations
            if (isMobile) {
                items[0].style.transform = 'translate3d(-100%, -50%, -100px) scale(0.7)';
                items[0].style.opacity = '0';
                items[1].style.transform = 'translate3d(-50%, -50%, -50px) scale(0.85)';
                items[1].style.opacity = '0.4';
                items[2].style.transform = 'translate3d(-50%, -50%, 0) scale(1)';
                items[2].style.opacity = '1';
            } else {
                items[0].style.transform = 'translateX(-150%) scale(0.7)';
                items[0].style.opacity = '0';
                items[1].style.transform = 'translateX(-100%) scale(0.85)';
                items[1].style.opacity = '0.4';
                items[2].style.transform = 'translateX(0) scale(1)';
                items[2].style.opacity = '1';
            }
        } else {
            currentIndex = (currentIndex - 1 + totalItems) % totalItems;

            // Enhanced animations for previous
            if (isMobile) {
                items[2].style.transform = 'translate3d(100%, -50%, -100px) scale(0.7)';
                items[2].style.opacity = '0';
                items[1].style.transform = 'translate3d(-50%, -50%, -50px) scale(0.85)';
                items[1].style.opacity = '0.4';
                items[0].style.transform = 'translate3d(-50%, -50%, 0) scale(1)';
                items[0].style.opacity = '1';
            } else {
                items[2].style.transform = 'translateX(150%) scale(0.7)';
                items[2].style.opacity = '0';
                items[1].style.transform = 'translateX(100%) scale(0.85)';
                items[1].style.opacity = '0.4';
                items[0].style.transform = 'translateX(0) scale(1)';
                items[0].style.opacity = '1';
            }
        }

        setTimeout(() => {
            updateGallery(true);
            isAnimating = false;
        }, 600);
    }

    function openLightbox(index) {
        const items = Array.from(galleryData.children);
        lightboxImg.src = items[index].querySelector('img').src;
        lightbox.classList.add('active');
        stopAutoPlay();

        // Add smooth transition for lightbox image
        lightboxImg.style.opacity = '0';
        lightboxImg.style.transform = 'scale(0.9)';
        setTimeout(() => {
            lightboxImg.style.opacity = '1';
            lightboxImg.style.transform = 'scale(1)';
        }, 50);
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        startAutoPlay();
    }

    function navigateLightbox(direction) {
        lightboxImg.style.opacity = '0';
        lightboxImg.style.transform = 'scale(0.9)';

        setTimeout(() => {
            if (direction === 'next') {
                currentIndex = (currentIndex + 1) % totalItems;
            } else {
                currentIndex = (currentIndex - 1 + totalItems) % totalItems;
            }
            openLightbox(currentIndex);
            updateGallery();
        }, 300);
    }

    function startAutoPlay() {
        stopAutoPlay();
        autoPlayInterval = setInterval(() => navigate('next'), 5000);
    }

    function stopAutoPlay() {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
    }

    function handleSwipe(event) {
        if (!isSwiping) return;

        const touchEndX = event.type.includes('mouse') ? event.pageX : event.changedTouches[0].clientX;
        const deltaX = touchStartX - touchEndX;

        if (Math.abs(deltaX) > 50) {
            if (deltaX > 0) navigate('next');
            else navigate('prev');
            isSwiping = false;
        }
    }

    // Event listeners
    prevButton.addEventListener('click', () => navigate('prev'));
    nextButton.addEventListener('click', () => navigate('next'));
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => navigateLightbox('prev'));
    lightboxNext.addEventListener('click', () => navigateLightbox('next'));

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (index !== currentIndex) {
                currentIndex = index;
                updateGallery();
            }
        });
    });

    // Touch and mouse events
    galleryTimeline.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        isSwiping = true;
        stopAutoPlay();
    });

    galleryTimeline.addEventListener('touchend', handleSwipe);
    galleryTimeline.addEventListener('mousedown', (e) => {
        touchStartX = e.pageX;
        isSwiping = true;
        stopAutoPlay();
    });

    galleryTimeline.addEventListener('mouseup', handleSwipe);
    galleryTimeline.addEventListener('mouseleave', () => isSwiping = false);

    // Keyboard navigation for lightbox
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'ArrowLeft') navigateLightbox('prev');
        if (e.key === 'ArrowRight') navigateLightbox('next');
        if (e.key === 'Escape') closeLightbox();
    });

    function preloadImages() {
        const items = Array.from(galleryData.children);
        items.forEach(item => {
            const img = item.querySelector('img');
            if (img) {
                const image = new Image();
                image.src = img.src;
            }
        });
    }

    // Initialize
    preloadImages();
    updateGallery(true);
    startAutoPlay();

    // Pause autoplay on hover
    galleryTimeline.addEventListener('mouseenter', stopAutoPlay);
    galleryTimeline.addEventListener('mouseleave', startAutoPlay);
});
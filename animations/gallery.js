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

    function updateGallery() {
        const items = Array.from(galleryData.children);
        galleryTimeline.innerHTML = '';
    
        // Ensure correct indices are calculated
        const prevIndex = (currentIndex - 1 + totalItems) % totalItems;
        const nextIndex = (currentIndex + 1) % totalItems;
    
        // Clone elements from the correct indices
        const prevClone = items[prevIndex]?.cloneNode(true) || items[0].cloneNode(true);
        const currentClone = items[currentIndex]?.cloneNode(true) || items[0].cloneNode(true);
        const nextClone = items[nextIndex]?.cloneNode(true) || items[0].cloneNode(true);
    
        prevClone.className = 'gallery-item previous';
        currentClone.className = 'gallery-item current';
        nextClone.className = 'gallery-item next';
    
        // Append clones in the correct order
        galleryTimeline.appendChild(prevClone);
        galleryTimeline.appendChild(currentClone);
        galleryTimeline.appendChild(nextClone);
    
        // Update styles for animation
        resetStyles([prevClone, currentClone, nextClone]);
    
        updateDots();
        addLightboxHandlers(currentClone);
    }
    
    // Reset styles for clones
    function resetStyles(items) {
        items.forEach(item => {
            item.style.transition = 'none';
            item.style.transform = '';
            item.style.opacity = '';
            item.style.zIndex = '';
        });
    }

    // Update navigation dots
    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    // Add lightbox functionality to current image
    function addLightboxHandlers(currentClone) {
        currentClone.addEventListener('click', () => openLightbox(currentIndex));
    }

    // Navigation function
    function navigate(direction) {
        if (isAnimating) return;
        isAnimating = true;

        const isMobile = window.innerWidth <= 768;
        const items = Array.from(galleryTimeline.children);

        items.forEach(item => {
            item.style.transition = 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 0.6s ease';
        });

        if (direction === 'next') {
            currentIndex = (currentIndex + 1) % totalItems;
        } else {
            currentIndex = (currentIndex - 1 + totalItems) % totalItems;
        }

        if (isMobile) {
            items[1].style.transform = 'translate3d(-50%, -50%, 0) scale(0.85)';
            items[1].style.opacity = '0';
            items[2].style.transform = 'translate3d(-50%, -50%, 0) scale(1)';
            items[2].style.opacity = '1';
            items[2].style.zIndex = '3';
        } else {
            items[0].style.transform = 'translateX(-100%) scale(0.9)';
            items[0].style.opacity = '0';
            items[1].style.transform = 'translateX(-100%)';
            items[1].style.opacity = '0';
            items[2].style.transform = 'translateX(0)';
            items[2].style.opacity = '1';
        }

        setTimeout(() => {
            updateGallery();
            isAnimating = false;
        }, 600);
    }

    // Lightbox functionality
    function openLightbox(index) {
        const items = Array.from(galleryData.children);
        lightboxImg.src = items[index].querySelector('img').src;
        lightbox.classList.add('active');
        stopAutoPlay();
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        startAutoPlay();
    }

    function navigateLightbox(direction) {
        if (direction === 'next') {
            currentIndex = (currentIndex + 1) % totalItems;
        } else {
            currentIndex = (currentIndex - 1 + totalItems) % totalItems;
        }
        openLightbox(currentIndex);
    }

    // Auto play
    function startAutoPlay() {
        stopAutoPlay(); // Clear any existing interval
        autoPlayInterval = setInterval(() => navigate('next'), 5000);
    }

    function stopAutoPlay() {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
    }

    // Swipe handling
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

    galleryTimeline.addEventListener('mouseup', () => isSwiping = false);
    galleryTimeline.addEventListener('mouseleave', () => isSwiping = false);

    // Keyboard navigation
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
    
    // initialization
    preloadImages(); // Initialize
    updateGallery();
    startAutoPlay();


    // Pause auto play on hover
    galleryTimeline.addEventListener('mouseenter', stopAutoPlay);
    galleryTimeline.addEventListener('mouseleave', startAutoPlay);
});

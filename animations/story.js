document.addEventListener('DOMContentLoaded', () => {
    const storySection = document.querySelector('.story-section');
    const cards = document.querySelectorAll('.story-section-card');
    const dots = document.querySelectorAll('.nav-dot');
    
    let currentIndex = 0;
    let isAnimating = false;
    let touchStartX = null;
    let touchStartY = null;
    let touchEndX = null;
    let touchEndY = null;
    
    const ANIMATION_DURATION = 400;
    const TOUCH_THRESHOLD = 40;
    const isMobile = window.innerWidth <= 768;

    function init() {
        // Remove any existing indicators first
        document.querySelectorAll('.interaction-indicator').forEach(el => el.remove());
        
        cards[0].classList.add('active');
        dots[0].classList.add('active');
        const firstCard = cards[0];
        const indicatorTemplate = `
            <div class="click-indicator interaction-indicator"></div>
        `;
        firstCard.insertAdjacentHTML('beforeend', indicatorTemplate);
        
        if (isMobile) {
            addSwipeIndicators();
        }

        if (!isMobile) {
            cards.forEach((card, index) => {
                card.addEventListener('click', () => {
                    if (!isAnimating) {
                        markAsInteracted(card);
                        switchToCard((index + 1) % cards.length, 'next');
                    }
                });
            });
        }
    }

    function markAsInteracted(card) {
        // Immediately hide all indicators
        const allIndicators = document.querySelectorAll('.interaction-indicator');
        allIndicators.forEach(indicator => {
            indicator.style.opacity = '0';
            indicator.style.visibility = 'hidden';
        });
        card.classList.add('interacted');
    }

    function addSwipeIndicators() {
        // Add swipe indicators outside the cards
        const container = document.querySelector('.story-container');
        if (!container.querySelector('.swipe-indicator')) {
            const indicators = `
                <div class="swipe-indicator swipe-left"></div>
                <div class="swipe-indicator swipe-right"></div>
            `;
            container.insertAdjacentHTML('beforeend', indicators);
        }
    }

    function switchToCard(newIndex, direction = 'next') {
        if (isAnimating) return;

        // Handle looping
        if (newIndex < 0) {
            newIndex = cards.length - 1;
            direction = 'prev';
        } else if (newIndex >= cards.length) {
            newIndex = 0;
            direction = 'next';
        }

        if (newIndex === currentIndex) return;

        isAnimating = true;

        // Remove active classes
        cards[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');

        // Set up transition classes
        const exitClass = direction === 'next' ? 'exit-to-left' : 'exit-to-right';
        const enterClass = direction === 'next' ? 'enter-from-right' : 'enter-from-left';

        // Apply transitions
        requestAnimationFrame(() => {
            cards[currentIndex].classList.add(exitClass);
            cards[newIndex].classList.add(enterClass);
            
            requestAnimationFrame(() => {
                cards[newIndex].classList.add('active');
                dots[newIndex].classList.add('active');

            });
        });

        currentIndex = newIndex;

        // Clean up classes after animation
        setTimeout(() => {
            cards.forEach(card => {
                card.classList.remove(exitClass, enterClass);
            });
            isAnimating = false;
        }, ANIMATION_DURATION);
    }

    function handleTouchStart(e) {
        if (isAnimating) return;
        
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchEndX = null;
        touchEndY = null;
    }

    function handleTouchMove(e) {
        if (!touchStartX || isAnimating) return;

        touchEndX = e.touches[0].clientX;
        touchEndY = e.touches[0].clientY;

        const deltaX = touchStartX - touchEndX;
        const deltaY = touchStartY - touchEndY;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            e.preventDefault();
        }
    }

    function handleTouchEnd(e) {
        if (!touchStartX || !touchEndX || isAnimating) return;

        const deltaX = touchStartX - touchEndX;
        const deltaY = touchStartY - touchEndY;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > TOUCH_THRESHOLD) {
            // Mark current card as interacted before switching
            markAsInteracted(cards[currentIndex]);
            
            if (deltaX > 0) {
                // Swipe left - go to next card (with looping)
                switchToCard(currentIndex + 1, 'next');
            } else {
                // Swipe right - go to previous card (with looping)
                switchToCard(currentIndex - 1, 'prev');
            }
        }

        touchStartX = null;
        touchStartY = null;
        touchEndX = null;
        touchEndY = null;
    }

    // Event Listeners
    if (isMobile) {
        storySection.addEventListener('touchstart', handleTouchStart, { passive: true });
        storySection.addEventListener('touchmove', handleTouchMove, { passive: false });
        storySection.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    // Click handler for cards
    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            if (window.innerWidth >= 769 && !isAnimating) {
                markAsInteracted(card);
                switchToCard((index + 1) % cards.length, 'next');
            }
        });
    });

    // Navigation dot handlers
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (!isAnimating && index !== currentIndex) {
                markAsInteracted(cards[currentIndex]);
                const direction = index > currentIndex ? 'next' : 'prev';
                switchToCard(index, direction);
            }
        });
    });

    // Handle resize events
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const newIsMobile = window.innerWidth <= 768;
            if (newIsMobile !== isMobile) {
                window.location.reload();
            }
        }, 250);
    });

    // Initialize
    init();
});
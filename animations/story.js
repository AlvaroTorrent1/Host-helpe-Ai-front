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
    
    const ANIMATION_DURATION = 400; // Reduced from 600ms for smoother feel
    const TOUCH_THRESHOLD = 40; // Reduced threshold for more responsive swipes
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
        // Only add swipe indicators on mobile
        if (isMobile) {
            addSwipeIndicators();
        }

        // Add click handlers for desktop
        if (!isMobile) {
            cards.forEach((card, index) => {
                card.addEventListener('click', () => {
                    if (!isAnimating) {
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
    
        
    // And in the click handler:
    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            if (window.innerWidth >= 769 && !isAnimating) {
                // Immediately mark all cards as interacted to remove all indicators
                cards.forEach(c => markAsInteracted(c));
                switchToCard((index + 1) % cards.length, 'next');
            }
        });
    });


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
        if (isAnimating || newIndex === currentIndex || newIndex < 0 || newIndex >= cards.length) return;

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

        // Only prevent default if horizontal swipe is more significant
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            e.preventDefault();
        }
    }

    function handleTouchEnd(e) {
        if (!touchStartX || !touchEndX || isAnimating) return;

        const deltaX = touchStartX - touchEndX;
        const deltaY = touchStartY - touchEndY;

        // Ensure horizontal swipe is more significant than vertical
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > TOUCH_THRESHOLD) {
            if (deltaX > 0 && currentIndex < cards.length - 1) {
                switchToCard(currentIndex + 1, 'next');
            } else if (deltaX < 0 && currentIndex > 0) {
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

    // Navigation dot handlers
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (!isAnimating && index !== currentIndex) {
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
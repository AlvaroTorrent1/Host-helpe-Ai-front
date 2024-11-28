document.addEventListener('DOMContentLoaded', () => {
    const storySection = document.querySelector('.story-section');
    const cards = document.querySelectorAll('.story-section-card');
    const dots = document.querySelectorAll('.nav-dot');
    
    let currentIndex = 0;
    let isAnimating = false;
    let touchStartX = null;
    let touchStartY = null;
    
    const ANIMATION_DURATION = 600;
    const TOUCH_THRESHOLD = 50;

    function init() {
        cards[0].classList.add('active');
        dots[0].classList.add('active');
        
        // Add indicators to the first card only
        const firstCard = cards[0];
        const indicatorTemplate = `
            <div class="click-indicator interaction-indicator"></div>
            <div class="swipe-indicator swipe-left interaction-indicator"></div>
            <div class="swipe-indicator swipe-right interaction-indicator"></div>
        `;
        firstCard.insertAdjacentHTML('beforeend', indicatorTemplate);

        // Add click handlers for desktop
        cards.forEach((card, index) => {
            card.addEventListener('click', () => {
                if (window.innerWidth >= 769 && !isAnimating) {
                    markAsInteracted(card);
                    switchToCard((index + 1) % cards.length, 'next');
                }
            });
        });
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

    function switchToCard(newIndex, direction = 'next') {
        if (isAnimating || newIndex === currentIndex || newIndex < 0 || newIndex >= cards.length) return;

        isAnimating = true;

        cards[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');

        const exitClass = direction === 'next' ? 'exit-to-left' : 'exit-to-right';
        const enterClass = direction === 'next' ? 'enter-from-right' : 'enter-from-left';

        cards[currentIndex].classList.add(exitClass);
        cards[newIndex].classList.add(enterClass);
        cards[newIndex].classList.add('active');
        dots[newIndex].classList.add('active');

        currentIndex = newIndex;

        // Add indicators to new card if it's not interacted with
        if (!cards[newIndex].classList.contains('interacted')) {
            const indicatorTemplate = `
                <div class="click-indicator interaction-indicator"></div>
                <div class="swipe-indicator swipe-left interaction-indicator"></div>
                <div class="swipe-indicator swipe-right interaction-indicator"></div>
            `;
            cards[newIndex].insertAdjacentHTML('beforeend', indicatorTemplate);
        }

        setTimeout(() => {
            cards.forEach(card => {
                card.classList.remove(exitClass, enterClass);
            });
            isAnimating = false;
        }, ANIMATION_DURATION);
    }

    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }

    function handleTouchMove(e) {
        if (!touchStartX || !touchStartY) return;

        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = touchStartX - touchX;
        const deltaY = touchStartY - touchY;

        // Check if horizontal swipe is more significant than vertical
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > TOUCH_THRESHOLD) {
            e.preventDefault();
            if (deltaX > 0 && currentIndex < cards.length - 1) {
                switchToCard(currentIndex + 1, 'next');
            } else if (deltaX < 0 && currentIndex > 0) {
                switchToCard(currentIndex - 1, 'prev');
            }
            touchStartX = null;
            touchStartY = null;
        }
    }

    function handleTouchEnd() {
        touchStartX = null;
        touchStartY = null;
    }

    // Event Listeners
    storySection.addEventListener('touchstart', handleTouchStart, { passive: true });
    storySection.addEventListener('touchmove', handleTouchMove, { passive: false });
    storySection.addEventListener('touchend', handleTouchEnd, { passive: true });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (!isAnimating && index !== currentIndex) {
                const currentCard = cards[currentIndex];
                if (currentCard) {
                    markAsInteracted(currentCard);
                }
                const direction = index > currentIndex ? 'next' : 'prev';
                switchToCard(index, direction);
            }
        });
    });

    // Initialize
    init();
});
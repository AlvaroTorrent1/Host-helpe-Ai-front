document.addEventListener('DOMContentLoaded', () => {
    const storySection = document.querySelector('.story-section');
    const cards = document.querySelectorAll('.story-section-card');
    const dots = document.querySelectorAll('.nav-dot');
    const progressBar = document.querySelector('.progress-bar');
    
    let currentIndex = 0;
    let isAnimating = false;
    let isStoryActive = false;
    let isExiting = false;
    let canReactivate = true;
    let isNavigatingToSection = false;

    const ANIMATION_DURATION = 600;
    const SCROLL_COOLDOWN = 100;
    const REACTIVATION_DELAY = 800;
    
    function init() {
        cards[0].classList.add('active');
        dots[0].classList.add('active');
        updateProgress();

        // Check if there's a hash in the URL
        if (window.location.hash) {
            isNavigatingToSection = true;
            setTimeout(() => {
                isNavigatingToSection = false;
            }, 1000);
        }
    }

    function handleNavigationClick(e) {
        if (e.target.matches('a[href^="#"]') || e.target.closest('a[href^="#"]')) {
            isNavigatingToSection = true;
            // If story is active, deactivate it
            if (isStoryActive) {
                deactivateStoryMode('down');
            }
            // Reset after navigation is complete
            setTimeout(() => {
                isNavigatingToSection = false;
            }, 1000);
        }
    }

    function updateProgress() {
        const progress = ((currentIndex + 1) / cards.length) * 100;
        progressBar.style.setProperty('--progress', `${progress}%`);
    }

    function isInCenter() {
        const rect = storySection.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const elementCenter = rect.top + rect.height / 2;
        const viewportCenter = viewportHeight / 2;
        const threshold = viewportHeight * (window.innerWidth <= 768 ? 0.25 : 0.35);
        return Math.abs(elementCenter - viewportCenter) < threshold;
    }

    function isNearCenter() {
        const rect = storySection.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const elementCenter = rect.top + rect.height / 2;
        const viewportCenter = viewportHeight / 2;
        return Math.abs(elementCenter - viewportCenter) < viewportHeight * 0.8;
    }

    function preventReactivation() {
        canReactivate = false;
        setTimeout(() => {
            canReactivate = true;
        }, REACTIVATION_DELAY);
    }

    function activateStoryMode(fromBottom = false) {
        if (!isStoryActive && !isExiting && canReactivate && !isNavigatingToSection) {
            const targetScroll = storySection.offsetTop - (window.innerHeight - storySection.offsetHeight) / 2;
            
            const currentScroll = window.scrollY;
            const distance = Math.abs(currentScroll - targetScroll);
            const animationTime = Math.min(800, Math.max(400, distance * 0.5));

            document.documentElement.style.scrollBehavior = 'smooth';

            requestAnimationFrame(() => {
                isStoryActive = true;
                storySection.classList.add('active');
                dots.forEach(dot => dot.style.opacity = '1');
                progressBar.style.opacity = '1';
                updateProgress();

                window.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth'
                });

                setTimeout(() => {
                    document.body.style.overflow = 'hidden';
                    isScrolling = false;
                }, animationTime);
            });
        }
    }

    function deactivateStoryMode(direction) {
        if (!isStoryActive || isExiting) return;

        isExiting = true;
        isStoryActive = false;
        preventReactivation();

        document.body.style.overflow = '';
        storySection.classList.remove('active');
        dots.forEach(dot => dot.style.opacity = '0');
        progressBar.style.opacity = '0';

        const targetScroll = direction === 'down'
            ? storySection.offsetTop + storySection.offsetHeight
            : Math.max(0, storySection.offsetTop - window.innerHeight);

        requestAnimationFrame(() => {
            window.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
        });

        setTimeout(() => {
            currentIndex = 0;
            cards.forEach((card, i) => card.classList.toggle('active', i === 0));
            dots.forEach((dot, i) => dot.classList.toggle('active', i === 0));
            updateProgress();
            isExiting = false;
        }, ANIMATION_DURATION);
    }

    function switchToCard(newIndex, direction = 'next') {
        if (isAnimating || newIndex === currentIndex || newIndex < 0 || newIndex >= cards.length) return;

        isAnimating = true;

        cards[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');

        const exitClass = direction === 'next' ? 'exit-to-top' : 'exit-to-bottom';
        const enterClass = direction === 'next' ? 'enter-from-bottom' : 'enter-from-top';

        cards[currentIndex].classList.add(exitClass);
        cards[newIndex].classList.add(enterClass);
        cards[newIndex].classList.add('active');
        dots[newIndex].classList.add('active');

        currentIndex = newIndex;
        updateProgress();

        setTimeout(() => {
            cards.forEach(card => {
                card.classList.remove(exitClass, enterClass);
            });
            isAnimating = false;
        }, ANIMATION_DURATION);
    }

    let lastWheelTime = Date.now();
    let lastScrollY = window.scrollY;
    let isScrolling = false;
    let scrollTimeout;

    function handleWheel(e) {
        if (!isStoryActive || isExiting || isNavigatingToSection) return;

        const now = Date.now();
        if (now - lastWheelTime < SCROLL_COOLDOWN) {
            e.preventDefault();
            return;
        }

        lastWheelTime = now;

        if (isAnimating) {
            e.preventDefault();
            return;
        }

        e.preventDefault();
        
        if (e.deltaY > 0) {
            if (currentIndex < cards.length - 1) {
                switchToCard(currentIndex + 1, 'next');
            } else {
                deactivateStoryMode('down');
            }
        } else {
            if (currentIndex > 0) {
                switchToCard(currentIndex - 1, 'prev');
            } else {
                deactivateStoryMode('up');
            }
        }
    }

    let touchStartY = null;
    const TOUCH_THRESHOLD = 40;

    function handleTouchStart(e) {
        if (isExiting || isNavigatingToSection) return;
        touchStartY = e.touches[0].clientY;
    }

    function handleTouchMove(e) {
        if (!touchStartY || !isStoryActive || isAnimating || isExiting || isNavigatingToSection) return;
        e.preventDefault();

        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY - touchY;

        if (Math.abs(deltaY) > TOUCH_THRESHOLD) {
            if (deltaY > 0) {
                if (currentIndex < cards.length - 1) {
                    switchToCard(currentIndex + 1, 'next');
                } else {
                    deactivateStoryMode('down');
                }
            } else {
                if (currentIndex > 0) {
                    switchToCard(currentIndex - 1, 'prev');
                } else {
                    deactivateStoryMode('up');
                }
            }
            touchStartY = touchY;
        }
    }

    function handleScroll() {
        if (scrollTimeout || isNavigatingToSection) return;

        const currentScrollY = window.scrollY;
        const scrollSpeed = Math.abs(currentScrollY - lastScrollY);
        const scrollingUp = currentScrollY < lastScrollY;
        lastScrollY = currentScrollY;

        if (!isScrolling) {
            scrollTimeout = setTimeout(() => {
                if (!isStoryActive && !isExiting && !isNavigatingToSection) {
                    if (isInCenter() || (scrollSpeed > 50 && isNearCenter())) {
                        isScrolling = true;
                        activateStoryMode(scrollingUp);
                    }
                }
                scrollTimeout = null;
            }, 50);
        }
    }

    // Event Listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('click', handleNavigationClick);

    window.addEventListener('keydown', (e) => {
        if (!isStoryActive || isAnimating || isExiting || isNavigatingToSection) return;

        switch (e.key) {
            case 'ArrowDown':
            case 'PageDown':
            case ' ':
                e.preventDefault();
                if (currentIndex < cards.length - 1) {
                    switchToCard(currentIndex + 1, 'next');
                } else {
                    deactivateStoryMode('down');
                }
                break;
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                if (currentIndex > 0) {
                    switchToCard(currentIndex - 1, 'prev');
                } else {
                    deactivateStoryMode('up');
                }
                break;
        }
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (isStoryActive && !isAnimating && !isExiting && !isNavigatingToSection && index !== currentIndex) {
                const direction = index > currentIndex ? 'next' : 'prev';
                switchToCard(index, direction);
            }
        });
    });
    
    storySection.addEventListener('touchstart', handleTouchStart, { passive: true });
    storySection.addEventListener('touchmove', handleTouchMove, { passive: false });
    storySection.addEventListener('touchend', () => { touchStartY = null; }, { passive: true });

    // Initialize
    init();
    handleScroll();
});
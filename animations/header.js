document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('header');
    const navLinks = document.querySelectorAll('.nav-link');
    const logo = document.querySelector('.logo');
    const languageSwitcher = document.querySelector('.language-switcher:not(.mobile)');
    let lastScrollTop = 0;
    let ticking = false;

    // Add transitions for smooth effects
    header.style.transition = 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)';

    // Initial state
    updateHeaderState(0);

    window.addEventListener('scroll', () => {
        lastScrollTop = window.scrollY;
        
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateHeaderState(lastScrollTop);
                ticking = false;
            });
            ticking = true;
        }
    });

    function updateHeaderState(scrollTop) {
        if (document.body.classList.contains('menu-open')) return;

        const scrollDistance = 150;
        const scrollPercentage = Math.min(scrollTop / scrollDistance, 1);
        
        // Calculate blur and transparency based on scroll
        const blurValue = scrollPercentage * 5;
        const transparency = 0.9 - (scrollPercentage * 0.4);
        
        // Update header styles
        header.style.backdropFilter = `blur(${blurValue}px)`;
        header.style.webkitBackdropFilter = `blur(${blurValue}px)`;
        header.style.backgroundColor = `rgba(250, 244, 235, ${transparency})`;
        // Scale down nav items
        navLinks.forEach(link => {
            const scale = 1 - (scrollPercentage * 0.1);
            link.style.transform = `scale(${scale})`;
        });
    }
});


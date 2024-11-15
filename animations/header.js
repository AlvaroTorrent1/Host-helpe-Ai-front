document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('header');
    const navLinks = document.querySelectorAll('.nav-link');
    const authButtons = document.querySelector('.auth-buttons');
    const headerContent = document.querySelector('.header-content');
    let lastScrollTop = 0;
    let ticking = false;

    // Add transitions for smooth effects
    header.style.transition = 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)';
    if (authButtons) {
        authButtons.style.transition = 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)';
    }

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
        const scrollDistance = 150; // Reduced distance for faster transition
        const scrollPercentage = Math.min(scrollTop / scrollDistance, 1);
        
        // Calculate blur and transparency based on scroll
        const blurValue = scrollPercentage * 5;
        const transparency = 0.9 - (scrollPercentage * 0.4);
        
        // Update header styles
        header.style.backdropFilter = `blur(${blurValue}px)`;
        header.style.webkitBackdropFilter = `blur(${blurValue}px)`;
        header.style.backgroundColor = `rgba(250, 244, 235, ${transparency})`;
        
        // Handle auth buttons fade out
        if (authButtons) {
            authButtons.style.opacity = 1 - (scrollPercentage * 2); // Faster fade out
            authButtons.style.transform = `translateY(${scrollPercentage * -20}px)`;
            authButtons.style.visibility = scrollPercentage >= 0.5 ? 'hidden' : 'visible';
            // Adjust header height when auth buttons are hidden
            headerContent.style.height = `${48 - (scrollPercentage * 8)}px`; // Smoothly reduce height
        }
        
        if (scrollTop <= 0) {
            // At the very top
            header.classList.remove('header-floating');
            header.classList.add('header-initial');
            header.style.setProperty('--scroll-progress', '0');
        } else {
            // Any scroll position
            header.classList.remove('header-initial');
            header.classList.add('header-floating');
            header.style.setProperty('--scroll-progress', scrollPercentage.toString());
        }
    
        // Smooth transition for width
        if (window.innerWidth > 768) {
            const baseWidth = 90;
            const minWidth = scrollPercentage * 45; // Increased reduction for smaller header
            header.style.width = `${baseWidth - minWidth}%`;
            
            // Additional padding reduction
            const basePadding = 24;
            const minPadding = scrollPercentage * 12;
            header.style.padding = `${basePadding - minPadding}px ${basePadding - minPadding}px`;
        }

        // Scale down nav items
        navLinks.forEach(link => {
            const scale = 1 - (scrollPercentage * 0.1);
            link.style.transform = `scale(${scale})`;
        });
    }

    
    // Language switcher
    window.switchLanguage = function(lang) {
        navLinks.forEach(link => {
            link.textContent = link.getAttribute(`data-${lang}`);
        });
    }

    // Mobile menu toggle
    window.toggleMobileMenu = function() {
        document.body.classList.toggle('mobile-menu-open');
    }

    // Password visibility toggle
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.closest('.input-group').querySelector('input');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        const mobileMenu = document.querySelector('.mobile-menu');
        const mobileMenuButton = document.querySelector('.mobile-menu-button');
        
        if (document.body.classList.contains('mobile-menu-open') &&
            !mobileMenu?.contains(e.target) &&
            !mobileMenuButton?.contains(e.target)) {
            toggleMobileMenu();
        }
    });

    // Handle ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('mobile-menu-open')) {
            toggleMobileMenu();
        }
    });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateHeaderState(lastScrollTop);
        }, 100);
    });
});
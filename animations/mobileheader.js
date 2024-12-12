document.addEventListener('DOMContentLoaded', function () {
    const menuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.getElementById('mobileMenu');
    let isMenuOpen = false;

    console.log('DOM fully loaded and parsed');
    console.log('Menu button:', menuButton);
    console.log('Mobile menu:', mobileMenu);

    // Toggle menu visibility with animation
    function toggleMenu(event) {
        if (event) {
            event.stopPropagation();
        }
        isMenuOpen = !isMenuOpen;
        console.log('Toggling menu. isMenuOpen:', isMenuOpen);

        if (isMenuOpen) {
            mobileMenu.style.visibility = 'visible';
            mobileMenu.style.opacity = 0;
            mobileMenu.style.pointerEvents = 'auto'; // Allow clicks when the menu is open
            setTimeout(() => {
                mobileMenu.classList.add('active');
                menuButton.classList.add('active');
                document.body.style.overflow = 'hidden';
                mobileMenu.style.transition = 'opacity 0.3s ease'; // Apply fade-in animation
                mobileMenu.style.opacity = 1; // Fade in
                console.log('Menu opened');
            }, 10); // Allow reflow for animation
        } else {
            mobileMenu.style.transition = 'opacity 0.3s ease'; // Apply fade-out animation
            mobileMenu.style.opacity = 0;
            mobileMenu.style.pointerEvents = 'none'; // Disable clicks while closing
            setTimeout(() => {
                mobileMenu.classList.remove('active');
                menuButton.classList.remove('active');
                document.body.style.overflow = '';
                mobileMenu.style.visibility = 'hidden'; // Hide after animation
                console.log('Menu closed');
            }, 300); // Match animation duration
        }
    }

    // Simplified scroll function
    function scrollToSection(targetId) {
        console.log('scrollToSection called with targetId:', targetId);
        const targetSection = document.getElementById(targetId);
        if (!targetSection) {
            console.error('Target section not found:', targetId);
            return;
        }

        // Perform a direct scroll to the target
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        console.log('Scrolling to section:', targetId);
    }

    // Event listeners for the menu button and nav links
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('Menu button clicked');
            toggleMenu(e);
        });

        // Attach click handlers to mobile nav links
        const navLinks = mobileMenu.querySelectorAll('.nav-link');
        console.log('Nav links found:', navLinks);
        navLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                console.log('Nav link clicked:', this.getAttribute('href'));
                const targetId = this.getAttribute('href').substring(1);
                toggleMenu(); // Close menu before scrolling
                setTimeout(() => scrollToSection(targetId), 300); // Match menu close timing
            });
        });
    }

    // Close the menu when clicking outside
    document.addEventListener('click', function (event) {
        if (isMenuOpen && !mobileMenu.contains(event.target) && event.target !== menuButton) {
            console.log('Click detected outside menu, closing menu');
            toggleMenu(event);
        }
    });

    // Prevent menu from closing when clicking inside it
    mobileMenu.addEventListener('click', function (event) {
        event.stopPropagation();
        console.log('Click inside mobile menu, propagation stopped');
    });
});

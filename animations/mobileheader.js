document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.getElementById('mobileMenu');
    let isMenuOpen = false;

    function toggleMenu(event) {
        if (event) {
            event.stopPropagation();
        }
        isMenuOpen = !isMenuOpen;
        mobileMenu.classList.toggle('active', isMenuOpen);
        menuButton.setAttribute('aria-expanded', isMenuOpen);
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    }

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', toggleMenu);

        // Close menu when clicking a link
        mobileMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', toggleMenu);
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (isMenuOpen && !mobileMenu.contains(event.target) && event.target !== menuButton) {
            toggleMenu();
        }
    });

    // Prevent menu from closing when clicking inside it
    mobileMenu.addEventListener('click', function(event) {
        event.stopPropagation();
    });
});


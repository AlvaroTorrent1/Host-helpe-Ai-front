document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.getElementById('mobileMenu');
    let isMenuOpen = false;

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        
        if (isMenuOpen) {
            mobileMenu.style.display = 'block';
            setTimeout(() => {
                mobileMenu.classList.add('active');
                menuButton.classList.add('active');
                document.body.style.overflow = 'hidden';
            }, 10);
        } else {
            mobileMenu.classList.remove('active');
            menuButton.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => {
                mobileMenu.style.display = 'none';
            }, 300);
        }
    }

    function scrollToSection(targetId) {
        const targetSection = document.getElementById(targetId);
        if (!targetSection) return;
    
        // Close menu first
        toggleMenu();
    
        // Get header height for offset
        const header = document.querySelector('.header-wrapper');
        const headerHeight = header ? header.offsetHeight : 0;
    
        // Wait for menu close animation
        setTimeout(() => {
            // Calculate the absolute position of the target element relative to the document
            const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset;
            
            // Subtract the header height to account for fixed header
            const offsetPosition = targetPosition - headerHeight;
    
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }, 350);
    }

    if (menuButton && mobileMenu) {
        // Ensure menu is hidden initially
        mobileMenu.style.display = 'none';
        mobileMenu.classList.remove('active');
        
        // Menu button click handler
        menuButton.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMenu();
        });

        // Handle navigation links
        mobileMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                scrollToSection(targetId);
            });
        });

        // Handle desktop nav links as well
        document.querySelectorAll('.nav-link').forEach(link => {
            if (!mobileMenu.contains(link)) {  // Only for non-mobile menu links
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href').substring(1);
                    
                    const header = document.querySelector('.header-wrapper');
                    const headerHeight = header ? header.offsetHeight : 0;
                    
                    const element = document.getElementById(targetId);
                    if (element) {
                        const elementPosition = element.getBoundingClientRect().top;
                        const offsetPosition = window.scrollY + elementPosition - headerHeight;
                        
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                });
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (isMenuOpen && !mobileMenu.contains(e.target) && !menuButton.contains(e.target)) {
                toggleMenu();
            }
        });

        // Prevent menu from closing when clicking inside
        mobileMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });

        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && isMenuOpen) {
                toggleMenu();
            }
        });
    }
});
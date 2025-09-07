// Modern Landing Page JavaScript
// Effects and Interactions for Real Madrid Player Profile

class LandingPage {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollEffects();
        this.setupIntersectionObserver();
        this.setupSmoothScrolling();
        this.setupFormHandling();
        this.setupParticleEffect();
        this.setupNavbarToggle();
        this.setupImageLazyLoading();
        document.addEventListener('DOMContentLoaded', () => {
            this.animateOnLoad();
        });
    }

    // Scroll Effects for Navbar
    setupScrollEffects() {
        const navbar = document.querySelector('.navbar');

        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Intersection Observer for Animations
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe all sections and cards
        document.querySelectorAll('section, .stat-card, .gallery-item, .highlight-item').forEach(el => {
            observer.observe(el);
        });
    }

    // Smooth Scrolling Navigation
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));

                if (target) {
                    const offsetTop = target.offsetTop - 48; // Account for reduced fixed navbar height (80 -> 48)
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Contact Form Handling
    setupFormHandling() {
        const contactForm = document.getElementById('contactForm');

        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();

                // Simulate form submission
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;

                submitBtn.textContent = 'Enviando...';
                submitBtn.disabled = true;

                setTimeout(() => {
                    submitBtn.textContent = '¡Mensaje Enviado!';
                    submitBtn.style.background = '#28a745';

                    setTimeout(() => {
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                        submitBtn.style.background = '';
                        contactForm.reset();
                    }, 2000);
                }, 1500);
            });
        }
    }

    // Particle Effect for Hero Section
    setupParticleEffect() {
        const hero = document.querySelector('.hero');

        // Create particle container
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particles';
        hero.appendChild(particleContainer);

        // Create particles
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 10 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            particleContainer.appendChild(particle);
        }
    }

    // Mobile Navbar Toggle
    setupNavbarToggle() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            });
        }
    }

    // Lazy Loading for Images
    setupImageLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // Initial Load Animations
    animateOnLoad() {
        // Add loading class to body
        document.body.classList.add('loading');

        // Animate hero elements
        const heroElements = document.querySelectorAll('.hero-title, .hero-subtitle, .hero-stats, .hero-buttons, .hero-image');
        heroElements.forEach((el, index) => {
            el.style.animationDelay = (index * 0.2) + 's';
        });

        // Animate stats bars
        const statBars = document.querySelectorAll('.stat-fill');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.width = entry.target.style.width || '0%';
                }
            });
        });

        statBars.forEach(bar => observer.observe(bar));
    }

    // Typing Effect for Hero Title (Optional)
    setupTypingEffect() {
        const heroTitle = document.querySelector('.hero-name');
        if (!heroTitle) return;

        const text = heroTitle.textContent;
        heroTitle.textContent = '';

        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };

        setTimeout(typeWriter, 1000);
    }

    // Parallax Effect for Hero Background
    setupParallaxEffect() {
        const hero = document.querySelector('.hero');
        const heroImage = document.querySelector('.hero-image');

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;

            if (heroImage) {
                heroImage.style.transform = `translateY(${rate}px)`;
            }
        });
    }

    // Mouse Follow Effect
    setupMouseFollowEffect() {
        const hero = document.querySelector('.hero');
        const cursor = document.createElement('div');
        cursor.className = 'cursor-follow';
        hero.appendChild(cursor);

        hero.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        hero.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
        });

        hero.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
        });
    }
}

// Initialize the landing page
const landingPage = new LandingPage();

// Additional modern effects
document.addEventListener('DOMContentLoaded', () => {
    // Add CSS for additional effects
    const style = document.createElement('style');
    style.textContent = `
        /* Particle Effect Styles */
        .particles {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
        }

        .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255, 215, 0, 0.6);
            border-radius: 50%;
            animation: float linear infinite;
        }

        @keyframes float {
            0% {
                transform: translateY(100vh) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100px) rotate(360deg);
                opacity: 0;
            }
        }

        /* Animation Classes */
        .animate-in {
            animation: slideInUp 0.6s ease-out forwards;
        }

        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Cursor Follow Effect */
        .cursor-follow {
            position: fixed;
            width: 20px;
            height: 20px;
            background: rgba(255, 215, 0, 0.3);
            border-radius: 50%;
            pointer-events: none;
            transition: opacity 0.3s ease;
            z-index: 999;
            opacity: 0;
        }

        /* Mobile Menu Styles */
        .nav-toggle {
            display: none;
            flex-direction: column;
            cursor: pointer;
        }

        .nav-toggle span {
            width: 25px;
            height: 3px;
            background: #fff;
            margin: 3px 0;
            transition: 0.3s;
        }

        .nav-toggle.active span:nth-child(1) {
            transform: rotate(-45deg) translate(-5px, 6px);
        }

        .nav-toggle.active span:nth-child(2) {
            opacity: 0;
        }

        .nav-toggle.active span:nth-child(3) {
            transform: rotate(45deg) translate(-5px, -6px);
        }

        @media (max-width: 768px) {
            .nav-toggle {
                display: flex;
            }

            .nav-menu {
                position: fixed;
                top: 48px; /* Reduced header height */
                left: -100%;
                width: 100%;
                height: calc(100vh - 48px); /* Adjust to reduced header height */
                background: rgba(0, 0, 0, 0.95);
                flex-direction: column;
                justify-content: center;
                align-items: center;
                gap: 30px;
                transition: left 0.3s ease;
            }

            .nav-menu.active {
                left: 0;
            }
        }

        /* Loading Animation */
        .loading {
            opacity: 0;
            animation: fadeInBody 1s ease-out forwards;
        }

        @keyframes fadeInBody {
            to {
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    // Add scroll progress indicator
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.innerHTML = '<div class="scroll-progress-fill"></div>';
    document.body.appendChild(progressBar);

    // Update scroll progress
    window.addEventListener('scroll', () => {
        const scrolled = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        document.querySelector('.scroll-progress-fill').style.width = scrolled + '%';
    });

    // Add CSS for scroll progress
    const progressStyle = document.createElement('style');
    progressStyle.textContent = `
        .scroll-progress {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            z-index: 1001;
        }

        .scroll-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--rm-navy), var(--rm-gold));
            width: 0%;
            transition: width 0.3s ease;
        }
    `;
    document.head.appendChild(progressStyle);
});


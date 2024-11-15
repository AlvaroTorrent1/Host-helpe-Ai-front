// Progress bar setup
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #FF9933, #FFB366);
    transform-origin: left;
    transform: scaleX(0);
    z-index: 1000;
    transition: transform 0.1s ease;
`;
document.body.appendChild(progressBar);

// Initialize state variables
let landingPageTicking = false;
let mouseX = 0;
let mouseY = 0;
let currentX = 0;
let currentY = 0;

// Mouse tracking
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
    updateBackgroundShapes();
}, { passive: true });

// Scroll handler
function handlePageScroll() {
    if (!landingPageTicking) {
        requestAnimationFrame(() => {
            updatePageScroll();
            landingPageTicking = false;
        });
        landingPageTicking = true;
    }
}

// Update scroll effects - Modified version
function updatePageScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = document.documentElement.clientHeight;
    const docHeight = document.documentElement.scrollHeight;
    const scrollPercent = (scrollTop / (docHeight - windowHeight));
    
    // Update progress bar
    progressBar.style.transform = `scaleX(${scrollPercent})`;

    // Update feature cards only - removed section updates
    document.querySelectorAll('.feature-card').forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const cardTop = rect.top;
        const cardVisible = cardTop < windowHeight * 0.85;

        if (cardVisible) {
            card.style.transform = 'translateY(0) scale(1)';
        }
    });

    // Update stats animation
    document.querySelectorAll('.stat-card').forEach(stat => {
        const rect = stat.getBoundingClientRect();
        const visible = rect.top < windowHeight * 0.8;
        
        if (visible && !stat.classList.contains('animated')) {
            stat.classList.add('animated');
            animateNumber(stat.querySelector('.stat-value'));
        }
    });
}

// Add this CSS-in-JS definition
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .scroll-progress {
        z-index: 9999;
    }
    
    .feature-card, .stat-card {
        opacity: 1 !important;  /* Ensure cards stay visible */
    }
    
    section {
        transform: none !important; /* Prevent section parallax */
    }
`;
document.head.appendChild(additionalStyles);


// Animate stat numbers
function animateNumber(element) {
    if (!element || element.classList.contains('animating')) return;
    
    element.classList.add('animating');
    const final = parseInt(element.textContent.replace(/\D/g, ''));
    const duration = 2000;
    const start = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(final * easeOutQuart);
        
        element.textContent = current + (element.dataset.suffix || '');
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Background shapes animation
function updateBackgroundShapes() {
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.02;
        currentX += (mouseX - currentX) * speed;
        currentY += (mouseY - currentY) * speed;
        
        const baseScale = 1 + Math.abs(currentX + currentY) * 0.1;
        const breathingScale = 1 + Math.sin(Date.now() * 0.001) * 0.02;
        const scale = baseScale * breathingScale;
        
        shape.style.transform = `translate(${currentX * 100}px, ${currentY * 100}px) scale(${scale})`;
    });
    
    requestAnimationFrame(updateBackgroundShapes);
}

// Feature card interactions
document.querySelectorAll('.feature-card').forEach((card, index) => {
    // Initial state
    card.style.transform = 'translateY(50px) scale(0.95)';
    card.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
    
    // Hover effects
    card.addEventListener('mouseenter', function(e) {
        this.style.transform = 'translateY(-10px) scale(1.05)';
        createParticles(this);
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });

    // Mouse movement effect
    card.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const deltaX = (x - centerX) / centerX;
        const deltaY = (y - centerY) / centerY;
        
        this.style.transform = `perspective(1000px) rotateX(${deltaY * 5}deg) rotateY(${deltaX * 5}deg) translateZ(20px)`;
    });
});

// Particle effect
function createParticles(element) {
    const colors = ['#FF9933', '#FFB366', '#FFD699'];
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 8 + 4;
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1;
            opacity: 0.8;
        `;
        
        element.appendChild(particle);
        animateParticle(particle);
    }
}

function animateParticle(particle) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 60 + 40;
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    
    particle.style.left = startX + '%';
    particle.style.top = startY + '%';
    
    let frame = 0;
    const animate = () => {
        frame += 1;
        const progress = frame / 60;
        
        const currentX = startX + Math.cos(angle) * progress * velocity;
        const currentY = startY + Math.sin(angle) * progress * velocity - (progress * velocity * 0.5);
        
        particle.style.left = currentX + '%';
        particle.style.top = currentY + '%';
        particle.style.opacity = 1 - progress;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            particle.remove();
        }
    };
    
    requestAnimationFrame(animate);
}

// Magnetic button effect
document.querySelectorAll('.cta-button').forEach(button => {
    button.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const deltaX = (x - centerX) * 0.3;
        const deltaY = (y - centerY) * 0.3;
        
        this.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        this.style.transition = 'transform 0.1s ease';
    });

    button.addEventListener('mouseleave', function() {
        this.style.transform = 'translate(0, 0)';
        this.style.transition = 'transform 0.3s ease';
    });
});
// Smooth scroll navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollBy({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});


// Initialize AOS
AOS.init({
    duration: 1000,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    once: true,
    offset: 50
});

// Event listeners
window.addEventListener('scroll', handlePageScroll, { passive: true });
window.addEventListener('resize', () => {
    handlePageScroll();
    AOS.refresh();
}, { passive: true });

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    handlePageScroll();
    document.body.classList.add('loaded');
});
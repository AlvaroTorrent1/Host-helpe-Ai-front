document.addEventListener('DOMContentLoaded', function() {
    let loadingScreen = document.getElementById('loading-screen');
    let mainContent = document.getElementById('main-content');
    let chatDemoSection = document.querySelector('.chat-demo-section');
    let iPhoneFrame = document.querySelector('.iphone-frame');
    let topContent = document.querySelector('.top-content');
    let socialLinks = document.querySelector('.social-links');
    let showcaseContent = document.querySelector('.showcase-content');

    function debugLog(message) {
        console.log(`[Debug] ${message}`);
    }

    debugLog('DOMContentLoaded event fired');

    // Initial setup - hide all animated elements
    if (iPhoneFrame) {
        iPhoneFrame.style.visibility = 'hidden';
        iPhoneFrame.classList.remove('animate');
    }
    if (chatDemoSection) {
        chatDemoSection.style.visibility = 'hidden';
    }
    if (topContent) {
        topContent.querySelectorAll('h1, p').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
        });
    }
    if (socialLinks) {
        socialLinks.style.opacity = '0';
        socialLinks.style.transform = 'translateY(15px)';
    }
    if (showcaseContent) {
        showcaseContent.style.opacity = '0';
        showcaseContent.style.transform = 'translateY(20px)';
        let ctaButton = showcaseContent.querySelector('.cta-button');
        if (ctaButton) {
            ctaButton.style.opacity = '0';
            ctaButton.style.transform = 'translateY(15px)';
        }
    }

    function triggerAnimations() {
        debugLog('Triggering all animations');
        
        // Title animation
        if (topContent) {
            const title = topContent.querySelector('h1');
            if (title) {
                setTimeout(() => {
                    title.style.transition = 'all 0.8s ease';
                    title.style.opacity = '1';
                    title.style.transform = 'translateY(0)';
                }, 300);
            }
            
            const subtitle = topContent.querySelector('p');
            if (subtitle) {
                setTimeout(() => {
                    subtitle.style.transition = 'all 0.8s ease';
                    subtitle.style.opacity = '1';
                    subtitle.style.transform = 'translateY(0)';
                }, 500);
            }
        }

        // Social links animation
        if (socialLinks) {
            setTimeout(() => {
                socialLinks.style.transition = 'all 0.8s ease';
                socialLinks.style.opacity = '1';
                socialLinks.style.transform = 'translateY(0)';
            }, 700);
        }

        // Showcase content animation
        if (showcaseContent) {
            setTimeout(() => {
                showcaseContent.style.transition = 'all 0.8s ease';
                showcaseContent.style.opacity = '1';
                showcaseContent.style.transform = 'translateY(0)';
            }, 900);

            const ctaButton = showcaseContent.querySelector('.cta-button');
            if (ctaButton) {
                setTimeout(() => {
                    ctaButton.style.transition = 'all 0.8s ease';
                    ctaButton.style.opacity = '1';
                    ctaButton.style.transform = 'translateY(0)';
                }, 1100);
            }
        }

        // iPhone animation
        if (iPhoneFrame) {
            iPhoneFrame.style.visibility = 'visible';
            iPhoneFrame.style.opacity = '0';
            iPhoneFrame.classList.remove('animate');
            void iPhoneFrame.offsetWidth;
            iPhoneFrame.classList.add('animate');
        }

        if (chatDemoSection) {
            chatDemoSection.style.visibility = 'visible';
        }
    }

    function showContent() {
        debugLog('Showing content');
        if (loadingScreen && mainContent) {
            startPixelAnimation();
            
            loadingScreen.style.transition = 'opacity 0.5s ease-out';
            loadingScreen.style.opacity = '0';
            
            setTimeout(() => {
                mainContent.style.transition = 'opacity 0.3s ease-in';
                mainContent.style.opacity = '1';
                document.body.classList.add('loaded');
                
                triggerAnimations();
                
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 300);
            }, 400);
        }
    }

    // Rest of your functions remain the same
    function ensureElementsExist() {
        if (!loadingScreen) {
            debugLog('Creating loading screen');
            loadingScreen = document.createElement('div');
            loadingScreen.id = 'loading-screen';
            loadingScreen.style.opacity = '1';
            loadingScreen.innerHTML = '<div class="loading-content"><div class="loading-dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div>';
            document.body.insertBefore(loadingScreen, document.body.firstChild);
        }

        if (!mainContent) {
            debugLog('Creating main content wrapper');
            mainContent = document.createElement('main');
            mainContent.id = 'main-content';
            mainContent.style.opacity = '0';
            document.body.appendChild(mainContent);
        }
    }

    function startPixelAnimation() {
        const pixelSize = 20;
        const rows = Math.ceil(window.innerHeight / pixelSize);
        const cols = Math.ceil(window.innerWidth / pixelSize);

        loadingScreen.innerHTML = '';
        loadingScreen.style.display = 'grid';
        loadingScreen.style.gridTemplateColumns = `repeat(${cols}, ${pixelSize}px)`;

        for (let i = 0; i < rows * cols; i++) {
            const pixel = document.createElement('div');
            pixel.classList.add('pixel');
            pixel.style.setProperty('--pixel-index', i);
            loadingScreen.appendChild(pixel);
        }

        requestAnimationFrame(() => {
            loadingScreen.classList.add('animate-pixels');
        });
    }

    const windowLoaded = new Promise(resolve => {
        if (document.readyState === 'complete') {
            debugLog('Document already complete');
            resolve();
        } else {
            debugLog('Waiting for window load event');
            window.addEventListener('load', () => {
                debugLog('Window load event fired');
                resolve();
            });
        }
    });

    const minimumLoadingTime = new Promise(resolve => {
        debugLog('Starting minimum loading time countdown');
        setTimeout(() => {
            debugLog('Minimum loading time reached');
            resolve();
        }, 2000);
    });

    ensureElementsExist();

    Promise.all([windowLoaded, minimumLoadingTime])
        .then(() => {
            debugLog('All promises resolved, preparing to show content');
            showContent();
        })
        .catch(error => {
            console.error('An error occurred:', error);
            showContent();
        });
});
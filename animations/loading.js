document.addEventListener('DOMContentLoaded', function() {
    let loadingScreen = document.getElementById('loading-screen');
    let mainContent = document.getElementById('main-content');

    function debugLog(message) {
        console.log(`[Debug] ${message}`);
    }

    debugLog('DOMContentLoaded event fired');

    function showContent() {
        debugLog('Showing content');
        if (loadingScreen && mainContent) {
            startPixelAnimation();
            // Fade out loading screen gradually
            loadingScreen.style.transition = 'opacity 0.8s ease-out';
            loadingScreen.style.opacity = '0';
            
            // Fade in main content with a delay
            setTimeout(() => {
                mainContent.style.transition = 'opacity 0.8s ease-in';
                mainContent.style.opacity = '1';
                document.body.classList.add('loaded');
                debugLog('Loading screen hidden');
                
                // Remove loading screen after fade out
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 800);
            }, 700);
        } else {
            console.error('Loading screen or main content elements not found');
            if (!loadingScreen) debugLog('Loading screen element missing');
            if (!mainContent) debugLog('Main content element missing');
        }
    }

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

    // Fallback safety timeout
    setTimeout(() => {
        if (!document.body.classList.contains('loaded')) {
            debugLog('Fallback: Force hiding loading screen after 10 seconds');
            showContent();
        }
    }, 10000);
});
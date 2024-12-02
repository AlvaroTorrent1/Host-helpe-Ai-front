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
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                mainContent.style.opacity = '1';
                document.body.classList.add('loaded');
                debugLog('Loading screen hidden');
            }, 1500); // Adjust this timing to match your animation duration
        } else {
            console.error('Loading screen or main content elements not found');
            if (!loadingScreen) debugLog('Loading screen element missing');
            if (!mainContent) debugLog('Main content element missing');
        }
    }

    function ensureElementsExist() {
        if (!loadingScreen) {
            console.error('Loading screen element not found. Creating a default one.');
            loadingScreen = document.createElement('div');
            loadingScreen.id = 'loading-screen';
            loadingScreen.innerHTML = '<div class="loading-content"><div class="loading-dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div>';
            document.body.insertBefore(loadingScreen, document.body.firstChild);
        }

        if (!mainContent) {
            console.error('Main content element not found. Creating a default one.');
            mainContent = document.createElement('main');
            mainContent.id = 'main-content';
            document.body.appendChild(mainContent);
        }
    }

    function startPixelAnimation() {
        const pixelSize = 20; // Size of each pixel
        const rows = Math.ceil(window.innerHeight / pixelSize);
        const cols = Math.ceil(window.innerWidth / pixelSize);

        loadingScreen.innerHTML = ''; // Clear existing content
        loadingScreen.style.display = 'grid';
        loadingScreen.style.gridTemplateColumns = `repeat(${cols}, ${pixelSize}px)`;

        for (let i = 0; i < rows * cols; i++) {
            const pixel = document.createElement('div');
            pixel.classList.add('pixel');
            loadingScreen.appendChild(pixel);
        }

        // Trigger reflow
        loadingScreen.offsetHeight;

        // Start animation
        loadingScreen.classList.add('animate-pixels');
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
            setTimeout(showContent, 100);
        })
        .catch(error => {
            console.error('An error occurred:', error);
            showContent();
        });

    setTimeout(() => {
        if (!document.body.classList.contains('loaded')) {
            debugLog('Fallback: Force hiding loading screen after 10 seconds');
            showContent();
        }
    }, 10000);
});


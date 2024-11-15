document.addEventListener('DOMContentLoaded', () => {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = lightbox.querySelector('img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    
    let currentImageIndex = 0;
    const images = Array.from(galleryItems).map(item => ({
        src: item.querySelector('img').src,
        alt: item.querySelector('img').alt
    }));

    function showImage(index) {
        if (index < 0 || index >= images.length) return;
        
        lightboxImg.style.opacity = '0';
        setTimeout(() => {
            currentImageIndex = index;
            lightboxImg.src = images[index].src;
            lightboxImg.alt = images[index].alt;
            lightboxImg.style.opacity = '1';
            
            // Update arrow visibility
            lightboxPrev.style.visibility = index === 0 ? 'hidden' : 'visible';
            lightboxNext.style.visibility = index === images.length - 1 ? 'hidden' : 'visible';
        }, 200);
    }

    // Prevent event bubbling for arrows
    lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentImageIndex > 0) {
            showImage(currentImageIndex - 1);
        }
    });

    lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentImageIndex < images.length - 1) {
            showImage(currentImageIndex + 1);
        }
    });

    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            lightbox.classList.add('active');
            showImage(index);
        });
    });

    // Close lightbox
    lightboxClose.addEventListener('click', (e) => {
        e.stopPropagation();
        lightbox.classList.remove('active');
    });

    // Click outside to close
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
        }
    });

    // Prevent closing when clicking the image
    lightboxImg.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                if (currentImageIndex > 0) {
                    showImage(currentImageIndex - 1);
                }
                break;
            case 'ArrowRight':
                if (currentImageIndex < images.length - 1) {
                    showImage(currentImageIndex + 1);
                }
                break;
            case 'Escape':
                lightbox.classList.remove('active');
                break;
        }
    });
});
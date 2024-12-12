// typewriter.js
function typeWriter(element, speed = 50) {
    const text = element.textContent;
    element.textContent = '';
    element.style.opacity = '1';
    
    let i = 0;
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

document.addEventListener('DOMContentLoaded', function() {
    // Get the paragraphs
    const text1 = document.querySelector('[data-translate="text1"]');
    const text2 = document.querySelector('[data-translate="text2"]');
    
    // Start typing with a delay between paragraphs
    setTimeout(() => typeWriter(text1, 40), 500);  // First paragraph
    setTimeout(() => typeWriter(text2, 40), 3500); // Second paragraph
});

// Handle language changes
document.addEventListener('languageChanged', function() {
    const text1 = document.querySelector('[data-translate="text1"]');
    const text2 = document.querySelector('[data-translate="text2"]');
    
    setTimeout(() => typeWriter(text1, 40), 100);  // First paragraph
    setTimeout(() => typeWriter(text2, 40), 3000); // Second paragraph
});
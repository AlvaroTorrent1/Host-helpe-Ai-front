// typewriter.js
function typeWriter(element, text, delay = 50) {
    // Clear any existing text and ensure element is visible
    element.style.opacity = '1';
    element.textContent = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, delay);
        }
    }
    
    type();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get the paragraphs by their data-translate attributes
    const mainParagraph = document.querySelector('[data-translate="text1"]');
    const showcaseParagraph = document.querySelector('[data-translate="text2"]');
    
    // Store the original text content
    const mainText = mainParagraph.textContent;
    const showcaseText = showcaseParagraph.textContent;
    
    // Start the typing animation with a delay between paragraphs
    setTimeout(() => typeWriter(mainParagraph, mainText, 50), 500);  // Start after 500ms
    setTimeout(() => typeWriter(showcaseParagraph, showcaseText, 50), 4000);  // Start after first paragraph
});
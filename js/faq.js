document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Cerrar todos los items
            faqItems.forEach(faq => faq.classList.remove('active'));
            
            // Abrir el seleccionado
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}); 
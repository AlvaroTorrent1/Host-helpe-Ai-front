document.addEventListener('DOMContentLoaded', function() {
    const billingBtns = document.querySelectorAll('.billing-btn');
    const prices = document.querySelectorAll('.price');
    const pricingLinks = document.querySelectorAll('.pricing-link');

    // Función para actualizar precios
    function updatePrices(billingType) {
        prices.forEach(price => {
            if (price.classList.contains(billingType)) {
                price.classList.add('active');
            } else {
                price.classList.remove('active');
            }
        });
    }

    // Nueva función para actualizar enlaces
    function updateLinks(billingType) {
        pricingLinks.forEach(link => {
            const annualLink = link.getAttribute('data-annual-link');
            const monthlyLink = link.getAttribute('data-monthly-link');
            link.href = billingType === 'annual' ? annualLink : monthlyLink;
        });
    }

    // Inicializar con plan anual
    updatePrices('annual');
    updateLinks('annual');

    // Event listeners para los botones
    billingBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const billingType = this.dataset.billing;
            
            // Actualizar botones
            billingBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Actualizar precios y enlaces
            updatePrices(billingType);
            updateLinks(billingType);
        });
    });
}); 
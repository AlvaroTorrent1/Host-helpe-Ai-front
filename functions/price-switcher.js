// Price switching functionality
const PriceSwitcher = () => {
    const prices = {
        monthly: {
            basic: 8.9,
            pro: 19.9,
            enterprise: null // Custom pricing
        },
        annual: {
            basic: 106.80,
            pro: 238.80,
            enterprise: null // Custom pricing
        }
    };

    // Get all DOM elements we need to update
    const priceElements = document.querySelectorAll('.amount');
    const periodElements = document.querySelectorAll('.period');
    const monthlyLabel = document.getElementById('monthly-label');
    const annualLabel = document.getElementById('annual-label');
    
    // Function to format price with 2 decimal places if needed
    const formatPrice = (price) => {
        if (price === null) return '';
        return price % 1 === 0 ? price.toString() : price.toFixed(2);
    };

    // Function to update prices and period text
    const updatePrices = (isAnnual) => {
        const currentPrices = isAnnual ? prices.annual : prices.monthly;
        const currentLang = document.documentElement.lang || 'en';
        const periodText = isAnnual 
            ? translations[currentLang].perYear || '/year'
            : translations[currentLang].perMonth || '/month';

        // Update prices
        priceElements.forEach((element, index) => {
            const planTypes = ['basic', 'pro', 'enterprise'];
            const price = currentPrices[planTypes[index]];
            if (price !== null) {
                element.textContent = formatPrice(price);
            }
        });

        // Update period text
        periodElements.forEach(element => {
            element.textContent = periodText;
        });

        // Update active states on labels
        monthlyLabel.classList.toggle('active', !isAnnual);
        annualLabel.classList.toggle('active', isAnnual);
    };

    // Initialize the price toggle
    const initializePriceToggle = () => {
        if (monthlyLabel && annualLabel) {
            monthlyLabel.addEventListener('click', () => {
                updatePrices(false);
            });

            annualLabel.addEventListener('click', () => {
                updatePrices(true);
            });

            // Set initial state to monthly
            updatePrices(false);
        }
    };

    // Update translations object with new keys
    if (window.translations) {
        // Add year period translations
        window.translations.en.perYear = '/year';
        window.translations.es.perYear = '/año';

        // Update month period translations
        window.translations.en.perMonth = '/month';
        window.translations.es.perMonth = '/mes';
    }

    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePriceToggle);
    } else {
        initializePriceToggle();
    }

    // Add language change handler
    const originalSelectLanguage = window.selectLanguage;
    window.selectLanguage = (lang) => {
        if (originalSelectLanguage) {
            originalSelectLanguage(lang);
        }
        // Update period text for current pricing state
        const isAnnual = annualLabel.classList.contains('active');
        updatePrices(isAnnual);
    };
};

// Initialize the price switcher
PriceSwitcher();
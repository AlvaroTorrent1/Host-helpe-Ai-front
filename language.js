class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('preferred-language') || 'es';
        this.init();
    }

    init() {
        // Inicializar botones
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchLanguage(btn.dataset.lang));
        });
        
        // Aplicar idioma inicial
        this.applyLanguage(this.currentLang);
    }

    switchLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('preferred-language', lang);
        this.applyLanguage(lang);
    }

    applyLanguage(lang) {
        // Actualizar textos
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.dataset.translate;
            element.textContent = translations[lang][key];
        });

        // Actualizar botones activos
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        // Actualizar dirección del texto si es necesario
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
} 
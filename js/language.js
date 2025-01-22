import { translations } from './translations.js';

function changeLanguage(lang) {
    // Guardar la preferencia de idioma
    localStorage.setItem('preferredLanguage', lang);
    
    // Actualizar textos
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const keys = key.split('.');
        let translation = translations[lang];
        
        // Navegar por el objeto de traducciones
        for (const k of keys) {
            if (translation[k]) {
                translation = translation[k];
            } else {
                console.warn(`Missing translation: ${key} for language: ${lang}`);
                return;
            }
        }
        
        // Si el elemento tiene HTML, permitir HTML en la traducción
        if (element.innerHTML && typeof translation === 'string' && translation.includes('<')) {
            element.innerHTML = translation;
        } else {
            element.textContent = translation;
        }
    });

    // Actualizar placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = translations[lang]?.placeholders?.[key];
        if (translation) {
            element.placeholder = translation;
        }
    });

    // Actualizar el atributo lang del HTML
    document.documentElement.lang = lang;
}

function updateContent(lang) {
    // Actualizar elementos con data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.innerHTML = getTranslation(key, lang);
    });

    // Actualizar placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = getTranslation(key, lang);
    });
}

// Inicializar el idioma
document.addEventListener('DOMContentLoaded', () => {
    // Obtener el idioma preferido o usar español por defecto
    const preferredLanguage = localStorage.getItem('preferredLanguage') || 'es';
    
    // Configurar los botones de idioma
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(button => {
        const buttonLang = button.getAttribute('data-lang');
        
        // Marcar el botón del idioma actual como activo
        if (buttonLang === preferredLanguage) {
            button.classList.add('active');
        }
        
        // Añadir evento click
        button.addEventListener('click', () => {
            // Remover clase active de todos los botones
            langButtons.forEach(btn => btn.classList.remove('active'));
            // Añadir clase active al botón clickeado
            button.classList.add('active');
            // Cambiar el idioma
            changeLanguage(buttonLang);
        });
    });
    
    // Establecer el idioma inicial
    changeLanguage(preferredLanguage);
});

export { changeLanguage }; 
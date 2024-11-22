// chat.js FOR THE PHONE

const defaultResponses = {
    en: {
        initial: "Hello! I'm your Airbnb AI Assistant. How can I help you today? 👋",
        towels: "The towels are located in the bathroom under the sink. You'll find both bath towels and hand towels there. 🛁",
        wifi: "The Wi-Fi password is: AirBnB2024#Secure! \nNetwork name: CasaMalaga_5G 📶",
        address: "Your address is: Calle Granada 42, Apartment 3B\nMálaga, Spain 29015 📍",
        help: "I can help you with:\n- Location of items\n- Wi-Fi details\n- Address information\n- Check-in/out times\n- Local recommendations\n- House rules\n\nJust ask me anything! 😊",
        notSure: "I'm not sure about that. Type 'help' to see what I can assist you with! 😊"
    },
    es: {
        initial: "¡Hola! Soy tu Asistente AI de Airbnb. ¿Cómo puedo ayudarte hoy? 👋",
        towels: "Las toallas están ubicadas en el baño debajo del lavabo. Encontrarás toallas de baño y toallas de mano allí. 🛁",
        wifi: "La contraseña del Wi-Fi es: AirBnB2024#Secure! \nNombre de red: CasaMalaga_5G 📶",
        address: "Tu dirección es: Calle Granada 42, Apartamento 3B\nMálaga, España 29015 📍",
        help: "Puedo ayudarte con:\n- Ubicación de artículos\n- Detalles de Wi-Fi\n- Información de dirección\n- Horarios de check-in/out\n- Recomendaciones locales\n- Reglas de la casa\n\n¡Pregúntame lo que necesites! 😊",
        notSure: "No estoy seguro de eso. Escribe 'ayuda' para ver en qué puedo ayudarte. 😊"
    }
};

let currentLanguage = 'en';

// Initialize chat elements
const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');
const quickReplies = document.querySelectorAll('.quick-reply-btn');
const togglePrompts = document.getElementById('togglePrompts');
const quickRepliesContainer = document.getElementById('quickReplies');

// Function to update chat language
window.updateChatLanguage = function(lang) {
    const initialMessage = document.querySelector('.message.received');
    if (initialMessage) {
        initialMessage.textContent = defaultResponses[lang].initial;
    }
};

// Function to update chat language
window.updateChatLanguage = function(lang) {
    currentLanguage = lang;
    const initialMessage = document.querySelector('.message.received');
    if (initialMessage) {
        initialMessage.textContent = defaultResponses[lang].initial;
    }
};

function getResponse(message) {
    // Map questions to response types regardless of language
    const questionMap = {
        // English questions
        "Where are the towels?": 'towels',
        "What's the Wi-Fi password?": 'wifi',
        "What's my address?": 'address',
        "help": 'help',
        
        // Spanish questions
        "¿Dónde están las toallas?": 'towels',
        "¿Cuál es la contraseña del Wi-Fi?": 'wifi',
        "¿Cuál es mi dirección?": 'address',
        "ayuda": 'help',
        
        // Add translations from the window object
        [window.translations.en.whereAreTowels]: 'towels',
        [window.translations.en.wifiPassword]: 'wifi',
        [window.translations.en.whatAddress]: 'address',
        [window.translations.es.whereAreTowels]: 'towels',
        [window.translations.es.wifiPassword]: 'wifi',
        [window.translations.es.whatAddress]: 'address',
    };

    const responseKey = questionMap[message];
    if (responseKey) {
        return defaultResponses[currentLanguage][responseKey];
    }
    return defaultResponses[currentLanguage].notSure;
}

function addMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);
    messageDiv.textContent = message;
    chatContainer.insertBefore(messageDiv, typingIndicator);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showTypingIndicator() {
    typingIndicator.classList.add('typing-active');
}

function hideTypingIndicator() {
    typingIndicator.classList.remove('typing-active');
}

function handleResponse(message) {
    addMessage(message, 'sent');
    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        const response = getResponse(message);
        addMessage(response, 'received');
    }, 1500);
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        handleResponse(message);
        messageInput.value = '';
    }
}

// Event Listeners
togglePrompts.addEventListener('click', () => {
    quickRepliesContainer.classList.toggle('hidden');
    togglePrompts.textContent = quickRepliesContainer.classList.contains('hidden') ? '▲' : '▼';
});

quickReplies.forEach(button => {
    button.addEventListener('click', () => {
        handleResponse(button.textContent);
    });
});

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
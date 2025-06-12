// Current language and translations
let currentLang = 'en';
let translations = {};
let gameState = {
    money: 10000,
    month: 1
};

// Встроенные переводы вместо загрузки файлов
const builtInTranslations = {
    'en': {
        'gameTitle': "IT Businessmen: Rise of Innovation",
        'money': "Money: $",
        'research': "Research",
        'hire': "Hire",
        'software': "Software",
        'nextMonth': "Next Month"
    },
    'ru': {
        'gameTitle': "IT Бизнесмены: На волне инноваций",
        'money': "Деньги: $",
        'research': "Исследовать",
        'hire': "Нанять",
        'software': "Программное обеспечение",
        'nextMonth': "Следующий месяц"
    },
    'zh': {
        'gameTitle': "科技大亨：创新崛起",
        'money': "资金：$",
        'research': "研究",
        'hire': "雇佣",
        'software': "软件",
        'nextMonth': "下个月"
    }
};

// DOM Elements
const elementsToTranslate = {
    'title': 'gameTitle',
    'moneyLabel': 'money',
    'researchBtn': 'research',
    'hireBtn': 'hire',
    'nextMonthBtn': 'nextMonth',
    'softwareTech': 'software'
};

// Load translations from built-in object
function loadTranslations(lang) {
    if (builtInTranslations[lang]) {
        translations = builtInTranslations[lang];
        applyTranslations();
        updateFormattedNumbers();
        localStorage.setItem('preferredLanguage', lang);
    } else {
        // Fallback to English if language not found
        loadTranslations('en');
        document.getElementById('languageSelector').value = 'en';
    }
}

// Apply translations to all UI elements
function applyTranslations() {
    for (const [elementId, translationKey] of Object.entries(elementsToTranslate)) {
        const element = document.getElementById(elementId);
        if (element && translations[translationKey]) {
            element.textContent = translations[translationKey];
        }
    }
}

// Format numbers based on language
function formatMoney(amount) {
    const locales = {
        'en': 'en-US',
        'ru': 'ru-RU',
        'zh': 'zh-CN'
    };
    return amount.toLocaleString(locales[currentLang] || 'en-US');
}

// Update all displayed numbers
function updateFormattedNumbers() {
    document.getElementById('money').textContent = formatMoney(gameState.money);
    if (document.getElementById('month')) {
        document.getElementById('month').textContent = formatMoney(gameState.month);
    }
}

// Initialize game
function initGame() {
    // Load saved language or default to English
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    currentLang = savedLang;
    if (document.getElementById('languageSelector')) {
        document.getElementById('languageSelector').value = savedLang;
        
        // Set up language selector event
        document.getElementById('languageSelector').addEventListener('change', (e) => {
            currentLang = e.target.value;
            loadTranslations(currentLang);
        });
    }
    
    // Load translations
    loadTranslations(savedLang);
    
    // Set up event listeners
    if (document.getElementById('researchBtn')) {
        document.getElementById('researchBtn').addEventListener('click', research);
    }
    if (document.getElementById('nextMonthBtn')) {
        document.getElementById('nextMonthBtn').addEventListener('click', nextMonth);
    }
    
    // Initial UI update
    updateFormattedNumbers();
}

// Game logic functions
function research() {
    gameState.money -= 1000;
    updateFormattedNumbers();
}

function nextMonth() {
    gameState.month++;
    gameState.money += 5000;
    updateFormattedNumbers();
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);
// Game state
const gameState = {
    money: 0,
    reputation: 0,
    techLevel: 1,
    developers: 1,
    products: [],
    language: 'en'
};

// DOM elements
const elements = {
    money: document.getElementById('money'),
    reputation: document.getElementById('reputation'),
    techLevel: document.getElementById('tech-level'),
    productsList: document.getElementById('products-list'),
    eventLog: document.getElementById('event-log'),
    languageSelect: document.getElementById('language-select')
};

// UI text elements that need translation
const textElements = {
    gameTitle: document.getElementById('game-title'),
    moneyLabel: document.getElementById('money-label'),
    reputationLabel: document.getElementById('reputation-label'),
    techLevelLabel: document.getElementById('tech-level-label'),
    actionsLabel: document.getElementById('actions-label'),
    developBtn: document.getElementById('develop-btn'),
    marketBtn: document.getElementById('market-btn'),
    hireBtn: document.getElementById('hire-btn'),
    upgradeBtn: document.getElementById('upgrade-btn'),
    productsLabel: document.getElementById('products-label'),
    eventLogLabel: document.getElementById('event-log-label')
};

// Initialize the game
function initGame() {
    // Load saved language or default to English
    const savedLanguage = localStorage.getItem('techTycoonLanguage');
    gameState.language = savedLanguage || 'en';
    elements.languageSelect.value = gameState.language;
    
    // Load saved game state if exists
    const savedGame = localStorage.getItem('techTycoonGameState');
    if (savedGame) {
        Object.assign(gameState, JSON.parse(savedGame));
    }
    
    // Set up event listeners
    document.getElementById('develop-btn').addEventListener('click', developProduct);
    document.getElementById('market-btn').addEventListener('click', doMarketResearch);
    document.getElementById('hire-btn').addEventListener('click', hireDeveloper);
    document.getElementById('upgrade-btn').addEventListener('click', upgradeTech);
    elements.languageSelect.addEventListener('change', changeLanguage);
    
    // Update UI
    updateUI();
    translateUI();
    
    // Start game loop
    setInterval(gameLoop, 3000);
}

// Change game language
function changeLanguage() {
    gameState.language = elements.languageSelect.value;
    localStorage.setItem('techTycoonLanguage', gameState.language);
    translateUI();
    
    // Update product names to new language
    gameState.products.forEach(product => {
        product.name = getRandomProductName();
    });
    
    updateProductsList();
}

// Translate all UI elements
function translateUI() {
    const lang = translations[gameState.language];
    
    for (const [key, element] of Object.entries(textElements)) {
        if (element) {
            element.textContent = lang[key];
        }
    }
}

// Game loop that runs periodically
function gameLoop() {
    // Generate revenue from products
    gameState.products.forEach(product => {
        const revenue = calculateProductRevenue(product);
        gameState.money += revenue;
        
        // Random events
        if (Math.random() < 0.2) {
            const eventType = Math.floor(Math.random() * 4);
            let message = '';
            
            switch (eventType) {
                case 0:
                    message = translate('productRevenue', { name: product.name, amount: revenue });
                    break;
                case 1:
                    message = translate('productPopular', { name: product.name });
                    product.reputation += 5;
                    break;
                case 2:
                    message = translate('newFeature', { name: product.name });
                    product.quality += 1;
                    break;
                case 3:
                    message = translate('competitor', { name: product.name });
                    product.reputation -= 3;
                    break;
            }
            
            addToLog(message);
        }
    });
    
    // Random events
    if (Math.random() < 0.1) {
        addToLog(translate('bugFixed', { name: gameState.products[Math.floor(Math.random() * gameState.products.length)].name }));
        gameState.reputation += 2;
    }
    
    updateUI();
    saveGame();
}

// Update all UI elements with current game state
function updateUI() {
    elements.money.textContent = '$' + gameState.money.toLocaleString();
    elements.reputation.textContent = gameState.reputation;
    elements.techLevel.textContent = gameState.techLevel;
    
    updateProductsList();
}

// Update the products list in UI
function updateProductsList() {
    elements.productsList.innerHTML = '';
    
    gameState.products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <h3>${product.name}</h3>
            <p>Quality: ${product.quality}</p>
            <p>Reputation: ${product.reputation}</p>
            <p>Revenue: $${product.revenue.toFixed(2)}/cycle</p>
        `;
        
        elements.productsList.appendChild(productCard);
    });
}

// Add a message to the event log
function addToLog(message) {
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.textContent = message;
    
    elements.eventLog.prepend(logEntry);
    
    // Limit log to 20 entries
    if (elements.eventLog.children.length > 20) {
        elements.eventLog.removeChild(elements.eventLog.lastChild);
    }
}

// Translate a message with optional parameters
function translate(key, params = {}) {
    const lang = translations[gameState.language];
    let message = lang[key] || key;
    
    // Replace placeholders with actual values
    for (const [param, value] of Object.entries(params)) {
        message = message.replace(`{${param}}`, value);
        message = message.replace(`'${param}'`, value); // For Chinese translations
    }
    
    return message;
}

// Get a random product name in current language
function getRandomProductName() {
    const names = translations[gameState.language].productNames;
    return names[Math.floor(Math.random() * names.length)];
}

// Calculate revenue for a product
function calculateProductRevenue(product) {
    return (product.quality * 10 + product.reputation * 5) * (1 + gameState.techLevel * 0.1);
}

// Action: Develop a new product
function developProduct() {
    const cost = 100 * gameState.techLevel;
    
    if (gameState.money >= cost) {
        gameState.money -= cost;
        
        const newProduct = {
            name: getRandomProductName(),
            quality: Math.floor(Math.random() * 5) + gameState.techLevel,
            reputation: Math.floor(Math.random() * 10),
            revenue: 0
        };
        
        newProduct.revenue = calculateProductRevenue(newProduct);
        gameState.products.push(newProduct);
        
        addToLog(translate('productDeveloped', { name: newProduct.name }));
        updateUI();
        saveGame();
    } else {
        addToLog(translate('notEnoughMoney'));
    }
}

// Action: Do market research
function doMarketResearch() {
    const cost = 50 * gameState.techLevel;
    
    if (gameState.money >= cost) {
        gameState.money -= cost;
        gameState.reputation += 2;
        
        // Improve random product
        if (gameState.products.length > 0) {
            const product = gameState.products[Math.floor(Math.random() * gameState.products.length)];
            product.reputation += 3;
            product.revenue = calculateProductRevenue(product);
        }
        
        addToLog(translate('marketResearchDone'));
        updateUI();
        saveGame();
    } else {
        addToLog(translate('notEnoughMoney'));
    }
}

// Action: Hire a developer
function hireDeveloper() {
    const cost = 200 * gameState.developers;
    
    if (gameState.money >= cost) {
        gameState.money -= cost;
        gameState.developers += 1;
        
        addToLog(translate('developerHired'));
        updateUI();
        saveGame();
    } else {
        addToLog(translate('notEnoughMoney'));
    }
}

// Action: Upgrade technology
function upgradeTech() {
    const cost = 500 * gameState.techLevel;
    
    if (gameState.money >= cost) {
        gameState.money -= cost;
        gameState.techLevel += 1;
        
        // Update all products' revenue
        gameState.products.forEach(product => {
            product.revenue = calculateProductRevenue(product);
        });
        
        addToLog(translate('techUpgraded', { level: gameState.techLevel }));
        updateUI();
        saveGame();
    } else {
        addToLog(translate('notEnoughMoney'));
    }
}

// Save game state to localStorage
function saveGame() {
    localStorage.setItem('techTycoonGameState', JSON.stringify(gameState));
}

// Initialize the game when the page loads
window.addEventListener('load', initGame);
// Проверка поддержки Web Crypto API
function isCryptoSupported() {
  return window.crypto && window.crypto.subtle;
}

// Хеширование пароля с проверкой поддержки
async function hashPassword(password) {
  if (isCryptoSupported()) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Ошибка при хешировании:', error);
      throw new Error('Ошибка при обработке пароля');
    }
  } else {
    // Fallback для неподдерживаемых браузеров (небезопасно!)
    console.warn('Crypto API не доступен, используется упрощенное хеширование');
    return password.split('').reverse().join('') + password.length;
  }
}


// Глобальная переменная для базы данных
let db;
const dbName = 'AuthDB';
const dbVersion = 1;

// Инициализация базы данных
async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);
        
        request.onerror = (event) => {
            console.error('Ошибка открытия DB:', event.target.error);
            reject('DB error');
        };
        
        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('DB opened successfully');
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            console.log('DB upgrade needed');
            
            // Создаем хранилище пользователей
            const usersStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
            usersStore.createIndex('email', 'email', { unique: true });
            
            console.log('DB structure created');
        };
    });
}

// Упрощенное хеширование пароля (в реальном приложении используйте bcrypt)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Генерация токена авторизации
function generateAuthToken(userId) {
    return `${userId}-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
}

// Регистрация пользователя
async function registerUser(userData) {
    return new Promise(async (resolve, reject) => {
        // Проверяем, что email уникален
        const existingUser = await getUserByEmail(userData.email);
        if (existingUser) {
            reject('Пользователь с таким email уже существует');
            return;
        }
        
        const tx = db.transaction('users', 'readwrite');
        const store = tx.objectStore('users');
        
        const request = store.add(userData);
        
        request.onsuccess = () => {
            resolve();
        };
        
        request.onerror = (event) => {
            console.error('Ошибка регистрации:', event.target.error);
            reject('Ошибка при регистрации пользователя');
        };
    });
}

// Вход пользователя
async function loginUser(email, password) {
    return new Promise(async (resolve, reject) => {
        const user = await getUserByEmail(email);
        
        if (!user) {
            reject('Пользователь с таким email не найден');
            return;
        }
        
        // Проверяем пароль
        const hashedPassword = await hashPassword(password);
        if (user.password !== hashedPassword) {
            reject('Неверный пароль');
            return;
        }
        
        resolve(user);
    });
}

// Получение пользователя по email
async function getUserByEmail(email) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('users', 'readonly');
        const store = tx.objectStore('users');
        const index = store.index('email');
        const request = index.get(email);
        
        request.onsuccess = () => {
            resolve(request.result);
        };
        
        request.onerror = () => {
            reject('Ошибка при поиске пользователя');
        };
    });
}

// Проверка авторизации
async function checkAuth() {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) return null;
    
    // В реальном приложении нужно проверять токен более тщательно
    const userId = parseInt(authToken.split('-')[0]);
    
    return new Promise((resolve, reject) => {
        const tx = db.transaction('users', 'readonly');
        const store = tx.objectStore('users');
        const request = store.get(userId);
        
        request.onsuccess = () => {
            resolve(request.result);
        };
        
        request.onerror = () => {
            reject('Ошибка при проверке авторизации');
        };
    });
}

// Выход из системы
function logout() {
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
}

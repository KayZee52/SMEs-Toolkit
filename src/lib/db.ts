
import Database from 'better-sqlite3';
import crypto from 'crypto';

const db = new Database('smes-toolkit.db');

db.pragma('journal_mode = WAL');

// --- Password Hashing ---
const saltSize = 16;
const keylen = 64;
const iterations = 100000;
const digest = 'sha512';

export function hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex');
}

// Create tables if they don't exist
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        passwordHash TEXT NOT NULL,
        salt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        stock INTEGER NOT NULL,
        price REAL NOT NULL,
        cost REAL NOT NULL,
        category TEXT,
        supplier TEXT,
        lastUpdatedAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        createdAt TEXT NOT NULL,
        notes TEXT,
        type TEXT,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        productId INTEGER,
        customerId INTEGER,
        customerName TEXT NOT NULL,
        productName TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        pricePerUnit REAL NOT NULL,
        total REAL NOT NULL,
        profit REAL NOT NULL,
        notes TEXT,
        date TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE SET NULL,
        FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        notes TEXT,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
        key TEXT NOT NULL,
        userId TEXT NOT NULL,
        value TEXT NOT NULL,
        PRIMARY KEY (key, userId),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
`);

// Create a default user and their settings if they don't exist
try {
    const salt = crypto.randomBytes(saltSize).toString('hex');
    const passwordHash = hashPassword('password', salt);
    const adminId = 'user_admin';
    
    // Use INSERT OR IGNORE to prevent errors on subsequent runs
    db.prepare(`
        INSERT OR IGNORE INTO users (id, username, passwordHash, salt) 
        VALUES (@id, @username, @passwordHash, @salt)
    `).run({
        id: adminId,
        username: 'admin',
        passwordHash: passwordHash,
        salt: salt
    });
    
    const defaultSettings = {
        businessName: "My Business",
        currency: "USD",
        enableAssistant: true,
        autoSuggestions: true,
        language: "en",
    };

    // Use INSERT OR IGNORE for settings as well
    db.prepare(`
        INSERT OR IGNORE INTO settings (key, userId, value) 
        VALUES (@key, @userId, @value)
    `).run({
        key: 'appSettings',
        userId: adminId,
        value: JSON.stringify(defaultSettings)
    });

} catch (e) {
    console.error("Failed to create default user, it might already exist.", e);
}


export { db };

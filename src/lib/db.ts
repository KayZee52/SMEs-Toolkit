
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

// --- Default User Creation ---
const createDefaultUser = (id: string, username: string, password: string) => {
    try {
        const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
        if (existingUser) return; // User already exists

        const salt = crypto.randomBytes(saltSize).toString('hex');
        const passwordHash = hashPassword(password, salt);
        
        db.prepare(`
            INSERT INTO users (id, username, passwordHash, salt) 
            VALUES (@id, @username, @passwordHash, @salt)
        `).run({ id, username, passwordHash, salt });
        
        const defaultSettings = {
            businessName: `${username}'s Business`,
            currency: "USD",
            enableAssistant: true,
            autoSuggestions: true,
            language: "en",
        };

        db.prepare(`
            INSERT OR IGNORE INTO settings (key, userId, value) 
            VALUES (@key, @userId, @value)
        `).run({
            key: 'appSettings',
            userId: id,
            value: JSON.stringify(defaultSettings)
        });
        console.log(`Default user '${username}' created successfully.`);
    } catch (e) {
        console.error(`Failed to create default user '${username}'.`, e);
    }
};

// Create admin user
createDefaultUser('user_admin', 'admin', 'password');

// Create test user
createDefaultUser('user_test', 'testuser', 'test');


export { db };

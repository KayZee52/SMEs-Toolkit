
import Database from 'better-sqlite3';
import { MOCK_PRODUCTS, MOCK_CUSTOMERS, MOCK_SALES, MOCK_EXPENSES } from './mock-data';
import crypto from 'crypto';

const db = new Database('smes-toolkit.db');

db.pragma('journal_mode = WAL');

// --- Hashing function ---
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

// --- Schema Definition ---
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        passwordHash TEXT NOT NULL,
        salt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
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
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        createdAt TEXT NOT NULL,
        notes TEXT,
        type TEXT,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        productId TEXT,
        customerId TEXT,
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
        id TEXT PRIMARY KEY,
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

// --- Automated Seeding Logic ---
const USER_ID = 'user_admin';

// Check if the default user already exists. If not, seed the database.
const userCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE id = ?').get(USER_ID) as { count: number };

if (userCount.count === 0) {
    console.log("Database appears to be empty. Seeding with initial data...");

    db.transaction(() => {
        // 1. Create Default User
        const salt = crypto.randomBytes(16).toString('hex');
        const passwordHash = hashPassword('password', salt);
        db.prepare(`
            INSERT INTO users (id, username, passwordHash, salt) 
            VALUES (@id, @username, @passwordHash, @salt)
        `).run({
            id: USER_ID,
            username: 'admin',
            passwordHash,
            salt
        });

        // 2. Insert Default Settings
        const defaultSettings = {
            businessName: "My Business",
            currency: "USD",
            enableAssistant: true,
            autoSuggestions: true,
            language: "en",
        };
        db.prepare(`
            INSERT INTO settings (key, userId, value) 
            VALUES ('appSettings', ?, ?)
        `).run(USER_ID, JSON.stringify(defaultSettings));

        // 3. Insert Mock Data
        const insertProduct = db.prepare('INSERT INTO products (id, userId, name, description, stock, price, cost, category, supplier, lastUpdatedAt) VALUES (@id, @userId, @name, @description, @stock, @price, @cost, @category, @supplier, @lastUpdatedAt)');
        const insertCustomer = db.prepare('INSERT INTO customers (id, userId, name, phone, createdAt, notes, type) VALUES (@id, @userId, @name, @phone, @createdAt, @notes, @type)');
        const insertSale = db.prepare('INSERT INTO sales (id, userId, productId, customerId, customerName, productName, quantity, pricePerUnit, total, profit, notes, date) VALUES (@id, @userId, @productId, @customerId, @customerName, @productName, @quantity, @pricePerUnit, @total, @profit, @notes, @date)');
        const insertExpense = db.prepare('INSERT INTO expenses (id, userId, description, category, amount, date, notes) VALUES (@id, @userId, @description, @category, @amount, @date, @notes)');
        
        for (const product of MOCK_PRODUCTS) insertProduct.run({ ...product, userId: USER_ID });
        for (const customer of MOCK_CUSTOMERS) insertCustomer.run({ ...customer, userId: USER_ID });
        for (const sale of MOCK_SALES) insertSale.run({ ...sale, userId: USER_ID });
        for (const expense of MOCK_EXPENSES) insertExpense.run({ ...expense, userId: USER_ID });
    })();
    
    console.log("Database seeded successfully!");
}

export { db };

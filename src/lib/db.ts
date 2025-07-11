
import Database from 'better-sqlite3';
import { MOCK_PRODUCTS, MOCK_CUSTOMERS, MOCK_SALES, MOCK_EXPENSES } from './mock-data';

const db = new Database('smes-toolkit.db');

db.pragma('journal_mode = WAL');

// Create tables if they don't exist
db.exec(`
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
        lastUpdatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        createdAt TEXT NOT NULL,
        notes TEXT,
        type TEXT
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
        notes TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
        key TEXT NOT NULL,
        userId TEXT NOT NULL,
        value TEXT NOT NULL,
        PRIMARY KEY (key, userId)
    );
`);

const seedDatabase = () => {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM products');
    const { count } = stmt.get() as { count: number };

    if (count > 0) {
        return; // Database already seeded
    }

    console.log("Seeding database with mock data...");

    const insertProduct = db.prepare('INSERT INTO products (id, userId, name, description, stock, price, cost, category, supplier, lastUpdatedAt) VALUES (@id, @userId, @name, @description, @stock, @price, @cost, @category, @supplier, @lastUpdatedAt)');
    const insertCustomer = db.prepare('INSERT INTO customers (id, userId, name, phone, createdAt, notes, type) VALUES (@id, @userId, @name, @phone, @createdAt, @notes, @type)');
    const insertSale = db.prepare('INSERT INTO sales (id, userId, productId, customerId, customerName, productName, quantity, pricePerUnit, total, profit, notes, date) VALUES (@id, @userId, @productId, @customerId, @customerName, @productName, @quantity, @pricePerUnit, @total, @profit, @notes, @date)');
    const insertExpense = db.prepare('INSERT INTO expenses (id, userId, description, category, amount, date, notes) VALUES (@id, @userId, @description, @category, @amount, @date, @notes)');
    
    const userId = 'user_admin';

    db.transaction(() => {
        for (const product of MOCK_PRODUCTS) insertProduct.run({ ...product, userId });
        for (const customer of MOCK_CUSTOMERS) insertCustomer.run({ ...customer, userId });
        for (const sale of MOCK_SALES) insertSale.run({ ...sale, userId });
        for (const expense of MOCK_EXPENSES) insertExpense.run({ ...expense, userId });
    })();

    console.log("Database seeded successfully.");
};

// --- Default Settings Creation for Single User ---
const ensureDefaultSettings = () => {
    const userId = 'user_admin';
    const settingsKey = 'appSettings';

    const existingSettings = db.prepare('SELECT value FROM settings WHERE userId = ? AND key = ?').get(userId, settingsKey);
    if (existingSettings) return;

    const defaultSettings = {
        businessName: `Admin's Business`,
        currency: "USD",
        enableAssistant: true,
        autoSuggestions: true,
        language: "en",
    };

    db.prepare(`
        INSERT OR IGNORE INTO settings (key, userId, value) 
        VALUES (@key, @userId, @value)
    `).run({
        key: settingsKey,
        userId: userId,
        value: JSON.stringify(defaultSettings)
    });
};

ensureDefaultSettings();
seedDatabase();

export { db };

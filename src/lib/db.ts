
import Database from 'better-sqlite3';
import { MOCK_PRODUCTS, MOCK_CUSTOMERS, MOCK_SALES, MOCK_EXPENSES } from './mock-data';

const db = new Database('smes-toolkit.db');
db.pragma('journal_mode = WAL');

// --- Schema Definition ---
// All user-related tables are removed for single-user mode.
db.exec(`
    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
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
        name TEXT NOT NULL,
        phone TEXT,
        createdAt TEXT NOT NULL,
        notes TEXT,
        type TEXT
    );

    CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
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
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        notes TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    );
`);

// --- Automated Seeding Logic ---
const settingsCountStmt = db.prepare('SELECT COUNT(*) as count FROM settings WHERE key = ?');
const settingsCount = settingsCountStmt.get('appSettings') as { count: number };

if (settingsCount.count === 0) {
    console.log("Database appears to be empty. Seeding with initial data...");

    db.transaction(() => {
        // 1. Insert Default Settings
        const defaultSettings = {
            businessName: "My Business",
            currency: "USD",
            enableAssistant: true,
            autoSuggestions: true,
            language: "en",
        };
        const settingsInsertStmt = db.prepare(`
            INSERT INTO settings (key, value) 
            VALUES ('appSettings', ?)
        `);
        settingsInsertStmt.run(JSON.stringify(defaultSettings));

        // 2. Insert Mock Data
        const insertProduct = db.prepare('INSERT INTO products (id, name, description, stock, price, cost, category, supplier, lastUpdatedAt) VALUES (@id, @name, @description, @stock, @price, @cost, @category, @supplier, @lastUpdatedAt)');
        const insertCustomer = db.prepare('INSERT INTO customers (id, name, phone, createdAt, notes, type) VALUES (@id, @name, @phone, @createdAt, @notes, @type)');
        const insertSale = db.prepare('INSERT INTO sales (id, productId, customerId, customerName, productName, quantity, pricePerUnit, total, profit, notes, date) VALUES (@id, @productId, @customerId, @customerName, @productName, @quantity, @pricePerUnit, @total, @profit, @notes, @date)');
        const insertExpense = db.prepare('INSERT INTO expenses (id, description, category, amount, date, notes) VALUES (@id, @description, @category, @amount, @date, @notes)');
        
        for (const product of MOCK_PRODUCTS) insertProduct.run(product);
        for (const customer of MOCK_CUSTOMERS) insertCustomer.run(customer);
        for (const sale of MOCK_SALES) insertSale.run(sale);
        for (const expense of MOCK_EXPENSES) insertExpense.run(expense);
    })();
    
    console.log("Database seeded successfully!");
}

export { db };

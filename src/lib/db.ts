
import Database from 'better-sqlite3';
import { MOCK_PRODUCTS, MOCK_SALES, MOCK_CUSTOMERS, MOCK_EXPENSES } from './mock-data';

// In an Electron environment, you might want to save this in the app's user data path.
// For this web context, we'll use a simple file name.
const db = new Database('smes-toolkit.db');

// Enable WAL mode for better concurrency.
db.pragma('journal_mode = WAL');

// Check if the database has been initialized
const metaTableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='meta'").get();

if (!metaTableExists) {
    console.log("Database not initialized. Setting up schema and seeding data...");

    // Create meta table to track initialization
    db.exec(`
        CREATE TABLE meta (
            key TEXT PRIMARY KEY,
            value TEXT
        );
    `);

    // Create main application tables
    db.exec(`
        CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            stock INTEGER NOT NULL,
            price REAL NOT NULL,
            cost REAL NOT NULL,
            category TEXT,
            supplier TEXT,
            lastUpdatedAt TEXT NOT NULL
        );

        CREATE TABLE customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT,
            createdAt TEXT NOT NULL,
            notes TEXT,
            type TEXT
        );

        CREATE TABLE sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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
            FOREIGN KEY (productId) REFERENCES products(id),
            FOREIGN KEY (customerId) REFERENCES customers(id)
        );

        CREATE TABLE expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            notes TEXT
        );

        CREATE TABLE settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
    `);
    
    // Seed data using transactions for performance
    const insertProduct = db.prepare('INSERT INTO products (id, name, stock, price, cost, lastUpdatedAt, description, category, supplier) VALUES (@id, @name, @stock, @price, @cost, @lastUpdatedAt, @description, @category, @supplier)');
    const insertCustomer = db.prepare('INSERT INTO customers (id, name, phone, createdAt, type, notes) VALUES (@id, @name, @phone, @createdAt, @type, @notes)');
    const insertSale = db.prepare('INSERT INTO sales (id, productId, customerId, customerName, productName, quantity, pricePerUnit, total, profit, date) VALUES (@id, @productId, @customerId, @customerName, @productName, @quantity, @pricePerUnit, @total, @profit, @date)');
    const insertExpense = db.prepare('INSERT INTO expenses (id, description, category, amount, date, notes) VALUES (@id, @description, @category, @amount, @date, @notes)');

    const seedData = db.transaction(() => {
        // Must convert mock IDs from string to integer for foreign keys
        const productIdMap = new Map<string, number>();
        MOCK_PRODUCTS.forEach((p, index) => {
            const newId = index + 1;
            productIdMap.set(p.id, newId);
            insertProduct.run({ ...p, id: newId });
        });

        const customerIdMap = new Map<string, number>();
        MOCK_CUSTOMERS.forEach((c, index) => {
            const newId = index + 1;
            customerIdMap.set(c.id, newId);
            insertCustomer.run({ ...c, id: newId });
        });

        MOCK_SALES.forEach((s, index) => {
            const newId = index + 1;
            const newProductId = s.productId ? productIdMap.get(s.productId) : null;
            const newCustomerId = s.customerId ? customerIdMap.get(s.customerId) : null;
            insertSale.run({ ...s, id: newId, productId: newProductId, customerId: newCustomerId });
        });
        
        MOCK_EXPENSES.forEach((e, index) => {
            const newId = index + 1;
            insertExpense.run({ ...e, id: newId });
        });

        db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)').run('initialized', 'true');
        console.log("Database initialized and seeded successfully.");
    });

    seedData();
} else {
    console.log("Database already initialized.");
}


// Close the database connection when the app closes
// In a real Electron app, you'd hook into 'app.on('will-quit', ...)'
process.on('exit', () => db.close());


export { db };


import Database from 'better-sqlite3';

const db = new Database('smes-toolkit.db');

db.pragma('journal_mode = WAL');

const metaTableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='meta'").get();

if (!metaTableExists) {
    console.log("Database not initialized. Setting up schema...");

    db.exec(`
        CREATE TABLE meta (
            key TEXT PRIMARY KEY,
            value TEXT
        );

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
    
    const initializeSettings = db.transaction(() => {
        const defaultSettings = {
            businessName: "My Business",
            currency: "USD",
            enableAssistant: true,
            autoSuggestions: true,
            language: "en",
        };
        db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run('appSettings', JSON.stringify(defaultSettings));
        db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)').run('initialized', 'true');
        console.log("Database initialized with empty tables and default settings.");
    });

    initializeSettings();
} else {
    console.log("Database already initialized.");
}


process.on('exit', () => db.close());


export { db };

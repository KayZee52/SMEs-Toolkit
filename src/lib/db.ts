
'use server';

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

        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            passwordHash TEXT NOT NULL,
            salt TEXT NOT NULL
        );

        CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            stock INTEGER NOT NULL,
            price REAL NOT NULL,
            cost REAL NOT NULL,
            category TEXT,
            supplier TEXT,
            lastUpdatedAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id)
        );

        CREATE TABLE customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            name TEXT NOT NULL,
            phone TEXT,
            createdAt TEXT NOT NULL,
            notes TEXT,
            type TEXT,
            FOREIGN KEY (userId) REFERENCES users(id)
        );

        CREATE TABLE sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
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
            FOREIGN KEY (userId) REFERENCES users(id),
            FOREIGN KEY (productId) REFERENCES products(id),
            FOREIGN KEY (customerId) REFERENCES customers(id)
        );

        CREATE TABLE expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            notes TEXT,
            FOREIGN KEY (userId) REFERENCES users(id)
        );

        CREATE TABLE settings (
            key TEXT PRIMARY KEY,
            userId INTEGER,
            value TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id)
        );
    `);
    
    // Default settings are now handled per-user, not globally on init
    db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)').run('initialized', 'true');
    console.log("Database initialized with empty tables.");

} else {
    // Migration for existing users: Add userId columns if they don't exist.
    // This is a simplified migration. A real-world scenario would be more robust.
    const productColumns = db.prepare("PRAGMA table_info(products)").all();
    if (!productColumns.some(col => col.name === 'userId')) {
        db.exec(`
            ALTER TABLE products ADD COLUMN userId INTEGER;
            ALTER TABLE customers ADD COLUMN userId INTEGER;
            ALTER TABLE sales ADD COLUMN userId INTEGER;
            ALTER TABLE expenses ADD COLUMN userId INTEGER;
            ALTER TABLE settings ADD COLUMN userId INTEGER;
        `);
        console.log("Added userId columns to existing tables for migration.");
    }
}


process.on('exit', () => db.close());


export { db };

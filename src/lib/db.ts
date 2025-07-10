
import Database from 'better-sqlite3';
import crypto from 'crypto';

const db = new Database('smes-toolkit.db');

db.pragma('journal_mode = WAL');

const usersTableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();

if (!usersTableExists) {
    console.log("Core tables not found. Re-initializing database schema...");

    // Drop existing tables to start fresh, in case of partial initialization
    db.exec(`
        DROP TABLE IF EXISTS settings;
        DROP TABLE IF EXISTS expenses;
        DROP TABLE IF EXISTS sales;
        DROP TABLE IF EXISTS customers;
        DROP TABLE IF EXISTS products;
        DROP TABLE IF EXISTS users;
    `);

    db.exec(`
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
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            name TEXT NOT NULL,
            phone TEXT,
            createdAt TEXT NOT NULL,
            notes TEXT,
            type TEXT,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
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
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (productId) REFERENCES products(id) ON DELETE SET NULL,
            FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE SET NULL
        );

        CREATE TABLE expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            notes TEXT,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE settings (
            key TEXT NOT NULL,
            userId INTEGER NOT NULL,
            value TEXT NOT NULL,
            PRIMARY KEY (key, userId),
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        );
    `);
    
    console.log("Database schema initialized successfully.");

    // Create a default user
    try {
        const salt = crypto.randomBytes(16).toString('hex');
        const passwordHash = crypto.pbkdf2Sync('password', salt, 100000, 64, 'sha512').toString('hex');
        
        db.prepare('INSERT INTO users (username, passwordHash, salt) VALUES (?, ?, ?)')
          .run('admin', passwordHash, salt);

        console.log("Default user 'admin' created successfully.");
    } catch (e) {
        console.error("Failed to create default user", e);
    }
}

export { db };

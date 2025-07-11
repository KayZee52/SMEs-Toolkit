
import Database from 'better-sqlite3';

const db = new Database('smes-toolkit.db');

db.pragma('journal_mode = WAL');

// Create tables if they don't exist
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

export { db };


import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { MOCK_PRODUCTS, MOCK_SALES, MOCK_CUSTOMERS, MOCK_EXPENSES } from './mock-data';
import type { Settings } from './types';

const dbPath = path.join(process.cwd(), 'smes-toolkit.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Create tables
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
    productId TEXT NOT NULL,
    customerId TEXT,
    customerName TEXT NOT NULL,
    productName TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    pricePerUnit REAL NOT NULL,
    total REAL NOT NULL,
    profit REAL NOT NULL,
    notes TEXT,
    date TEXT NOT NULL,
    FOREIGN KEY (productId) REFERENCES products (id),
    FOREIGN KEY (customerId) REFERENCES customers (id)
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
    data TEXT NOT NULL
  );
`);

// --- Seeding Logic ---
const seedIfEmpty = () => {
    const productCountStmt = db.prepare('SELECT count(*) as count FROM products');
    const productCount = productCountStmt.get() as { count: number };

    if (productCount.count > 0) {
        return; // Database is already seeded
    }

    const seedTransaction = db.transaction(() => {
        // 1. Insert Settings
        const defaultSettings: Settings = {
            businessName: "SME's Toolkit",
            currency: "USD",
            enableAssistant: true,
            autoSuggestions: true,
            language: "en",
            passwordHash: null,
        };
        const settingsInsertStmt = db.prepare("INSERT OR IGNORE INTO settings (key, data) VALUES (?, ?)");
        settingsInsertStmt.run('appSettings', JSON.stringify(defaultSettings));

        // 2. Insert Mock Data
        const insertProduct = db.prepare('INSERT INTO products (id, name, description, stock, price, cost, category, supplier, lastUpdatedAt) VALUES (@id, @name, @description, @stock, @price, @cost, @category, @supplier, @lastUpdatedAt)');
        const insertCustomer = db.prepare('INSERT INTO customers (id, name, phone, createdAt, notes, type) VALUES (@id, @name, @phone, @createdAt, @notes, @type)');
        const insertSale = db.prepare('INSERT INTO sales (id, productId, customerId, customerName, productName, quantity, pricePerUnit, total, profit, notes, date) VALUES (@id, @productId, @customerId, @customerName, @productName, @quantity, @pricePerUnit, @total, @profit, @notes, @date)');
        const insertExpense = db.prepare('INSERT INTO expenses (id, description, category, amount, date, notes) VALUES (@id, @description, @category, @amount, @date, @notes)');

        for (const product of MOCK_PRODUCTS) insertProduct.run(product);
        for (const customer of MOCK_CUSTOMERS) insertCustomer.run(customer);
        for (const sale of MOCK_SALES) insertSale.run(sale);
        for (const expense of MOCK_EXPENSES) insertExpense.run(expense);
    });

    try {
        seedTransaction();
        console.log("Database seeded successfully.");
    } catch (error) {
        console.error("Failed to seed database:", error);
    }
};

// Run seeding logic on startup
seedIfEmpty();

export default db;

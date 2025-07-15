
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { MOCK_PRODUCTS, MOCK_SALES, MOCK_CUSTOMERS, MOCK_EXPENSES } from './mock-data';
import type { Settings } from './types';

// This is a common pattern for ensuring a single DB connection in a Node.js/Next.js environment,
// especially with hot-reloading in development.
const globalForDb = global as unknown as {
  db: Database.Database | undefined;
};

function initializeDb() {
  const dbPath = path.join(process.cwd(), 'smes-toolkit.db');
  const newDbInstance = new Database(dbPath);
  newDbInstance.pragma('journal_mode = WAL');

  // Create tables if they don't exist
  newDbInstance.exec(`
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
  const productCountStmt = newDbInstance.prepare('SELECT count(*) as count FROM products');
  const productCount = productCountStmt.get() as { count: number };

  if (productCount.count === 0) {
    const seedTransaction = newDbInstance.transaction(() => {
      const defaultSettings: Settings = {
        businessName: "SME's Toolkit",
        currency: "USD",
        enableAssistant: true,
        autoSuggestions: true,
        language: "en",
        passwordHash: null,
      };
      const settingsInsertStmt = newDbInstance.prepare("INSERT OR IGNORE INTO settings (key, data) VALUES (?, ?)");
      settingsInsertStmt.run('appSettings', JSON.stringify(defaultSettings));

      const insertProduct = newDbInstance.prepare('INSERT INTO products (id, name, description, stock, price, cost, category, supplier, lastUpdatedAt) VALUES (@id, @name, @description, @stock, @price, @cost, @category, @supplier, @lastUpdatedAt)');
      const insertCustomer = newDbInstance.prepare('INSERT INTO customers (id, name, phone, createdAt, notes, type) VALUES (@id, @name, @phone, @createdAt, @notes, @type)');
      const insertSale = newDbInstance.prepare('INSERT INTO sales (id, productId, customerId, customerName, productName, quantity, pricePerUnit, total, profit, notes, date) VALUES (@id, @productId, @customerId, @customerName, @productName, @quantity, @pricePerUnit, @total, @profit, @notes, @date)');
      const insertExpense = newDbInstance.prepare('INSERT INTO expenses (id, description, category, amount, date, notes) VALUES (@id, @description, @category, @amount, @date, @notes)');

      for (const product of MOCK_PRODUCTS) insertProduct.run(product);
      for (const customer of MOCK_CUSTOMERS) insertCustomer.run(customer);
      for (const sale of MOCK_SALES) insertSale.run(sale);
      for (const expense of MOCK_EXPENSES) insertExpense.run(expense);
    });
    seedTransaction();
    console.log("Database seeded successfully.");
  }

  console.log("Database connection established.");
  return newDbInstance;
}

const db = globalForDb.db ?? initializeDb();

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db;
}

process.on('exit', () => db.close());
process.on('SIGINT', () => db.close());
process.on('SIGTERM', () => db.close());

export default db;

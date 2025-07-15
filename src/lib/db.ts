
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

function createTables(db: Database.Database) {
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
}

function seedDatabase(db: Database.Database) {
  const seedTransaction = db.transaction(() => {
    const defaultSettings: Settings = {
      businessName: "SME's Toolkit",
      currency: "USD",
      enableAssistant: true,
      autoSuggestions: true,
      language: "en",
      passwordHash: null,
      googleApiKey: null,
    };
    const settingsInsertStmt = db.prepare("INSERT OR IGNORE INTO settings (key, data) VALUES (?, ?)");
    settingsInsertStmt.run('appSettings', JSON.stringify(defaultSettings));

    // Mock data insertion is now removed to start with a clean slate.
  });
  seedTransaction();
  console.log("Database default settings applied.");
}


export function initializeDb() {
  const dbPath = path.join(process.cwd(), 'smes-toolkit.db');
  const dbExists = fs.existsSync(dbPath);
  
  if (globalForDb.db && globalForDb.db.open) {
    return globalForDb.db;
  }
  
  const newDbInstance = new Database(dbPath);
  newDbInstance.pragma('journal_mode = WAL');

  createTables(newDbInstance);

  if (!dbExists) {
    seedDatabase(newDbInstance);
  }
  
  globalForDb.db = newDbInstance;
  console.log("Database connection established.");
  return newDbInstance;
}

export function closeDbConnection() {
    if (globalForDb.db && globalForDb.db.open) {
        globalForDb.db.close();
        globalForDb.db = undefined;
        console.log("Database connection closed.");
    }
}

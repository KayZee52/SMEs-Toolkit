
import Database from 'better-sqlite3';
import { MOCK_PRODUCTS, MOCK_CUSTOMERS, MOCK_SALES, MOCK_EXPENSES } from './mock-data';
import crypto from 'crypto';

const db = new Database('smes-toolkit.db');

const USER_ID = 'user_admin';

// Check if data has already been seeded
const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
if (productCount.count > 0) {
    console.log("Database already seeded. Exiting.");
    process.exit(0);
}

// --- Hashing function (must match auth.ts) ---
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

// --- Seeding Logic ---
function seedDatabase() {
    console.log("Seeding database with initial data...");

    // 1. Create Default User
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword('password', salt);
    db.prepare(`
        INSERT INTO users (id, username, passwordHash, salt) 
        VALUES (@id, @username, @passwordHash, @salt)
    `).run({
        id: USER_ID,
        username: 'admin',
        passwordHash,
        salt
    });
    console.log("Default 'admin' user created.");

    // 2. Insert Default Settings
    const defaultSettings = {
        businessName: "My Business",
        currency: "USD",
        enableAssistant: true,
        autoSuggestions: true,
        language: "en",
    };
    db.prepare(`
        INSERT INTO settings (key, userId, value) 
        VALUES ('appSettings', ?, ?)
    `).run(USER_ID, JSON.stringify(defaultSettings));
    console.log("Default settings inserted.");

    // 3. Insert Mock Data (in correct order)
    const insertProduct = db.prepare('INSERT INTO products (id, userId, name, description, stock, price, cost, category, supplier, lastUpdatedAt) VALUES (@id, @userId, @name, @description, @stock, @price, @cost, @category, @supplier, @lastUpdatedAt)');
    const insertCustomer = db.prepare('INSERT INTO customers (id, userId, name, phone, createdAt, notes, type) VALUES (@id, @userId, @name, @phone, @createdAt, @notes, @type)');
    const insertSale = db.prepare('INSERT INTO sales (id, userId, productId, customerId, customerName, productName, quantity, pricePerUnit, total, profit, notes, date) VALUES (@id, @userId, @productId, @customerId, @customerName, @productName, @quantity, @pricePerUnit, @total, @profit, @notes, @date)');
    const insertExpense = db.prepare('INSERT INTO expenses (id, userId, description, category, amount, date, notes) VALUES (@id, @userId, @description, @category, @amount, @date, @notes)');
    
    db.transaction(() => {
        for (const product of MOCK_PRODUCTS) insertProduct.run({ ...product, userId: USER_ID });
        for (const customer of MOCK_CUSTOMERS) insertCustomer.run({ ...customer, userId: USER_ID });
        for (const sale of MOCK_SALES) insertSale.run({ ...sale, userId: USER_ID });
        for (const expense of MOCK_EXPENSES) insertExpense.run({ ...expense, userId: USER_ID });
    })();
    console.log("Mock data inserted.");

    console.log("Database seeded successfully!");
}

try {
    seedDatabase();
} catch (error) {
    console.error("Failed to seed database:", error);
    process.exit(1);
}

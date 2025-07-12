
'use server';

import { db } from '@/lib/db';
import type { Product, Sale, Customer, Expense, Settings, LogSaleFormValues } from "@/lib/types";

// Hardcoded user ID for single-user mode
const USER_ID = 'user_admin';

async function getUserId() {
    return USER_ID;
}

// === READ OPERATIONS ===

export async function getProducts(): Promise<Product[]> {
    const userId = await getUserId();
    return db.prepare("SELECT * FROM products WHERE userId = ? ORDER BY name ASC").all(userId) as Product[];
}

export async function getSales(): Promise<Sale[]> {
    const userId = await getUserId();
    return db.prepare("SELECT * FROM sales WHERE userId = ? ORDER BY date DESC").all(userId) as Sale[];
}

export async function getCustomers(): Promise<Customer[]> {
    const userId = await getUserId();
    return db.prepare("SELECT * FROM customers WHERE userId = ? ORDER BY name ASC").all(userId) as Customer[];
}

export async function getExpenses(): Promise<Expense[]> {
    const userId = await getUserId();
    return db.prepare("SELECT * FROM expenses WHERE userId = ? ORDER BY date DESC").all(userId) as Expense[];
}

export async function getSettings(): Promise<Settings> {
    const userId = await getUserId();
    
    const settingsFromDb = db.prepare("SELECT value FROM settings WHERE userId = ? AND key = 'appSettings'").get(userId) as { value: string } | undefined;
    
    if (settingsFromDb) {
        return JSON.parse(settingsFromDb.value);
    } 
    
    // Fallback if settings are not in the DB for some reason.
    // This should ideally not be reached if the DB is seeded correctly.
    const defaultSettings: Settings = {
        businessName: "My Business",
        currency: "USD",
        enableAssistant: true,
        autoSuggestions: true,
        language: "en",
    };
    return defaultSettings;
}

export async function getInitialData() {
    const userId = await getUserId();
    if (!userId) return null;

    // A check to ensure the db has been seeded.
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
    if (productCount.count === 0) {
        // This should now be a very rare case, but it's a good safeguard.
        console.error("Database is not seeded. The automatic seeding might have failed.");
        // We will return empty arrays to prevent a crash, allowing the app to load.
        return {
            products: [],
            sales: [],
            customers: [],
            expenses: [],
            settings: {
                businessName: "My Business",
                currency: "USD",
                enableAssistant: true,
                autoSuggestions: true,
                language: "en",
            }
        }
    }

    return {
        products: await getProducts(),
        sales: await getSales(),
        customers: await getCustomers(),
        expenses: await getExpenses(),
        settings: await getSettings(),
    }
}


// === WRITE OPERATIONS ===

export async function addProduct(productData: Omit<Product, "id" | "lastUpdatedAt" | "userId">): Promise<Product> {
    const userId = await getUserId();
    const newProduct = {
      ...productData,
      id: `prod_${new Date().getTime()}`,
      userId,
      lastUpdatedAt: new Date().toISOString(),
    };
    db.prepare(`
        INSERT INTO products (id, name, description, stock, price, cost, category, supplier, lastUpdatedAt, userId) 
        VALUES (@id, @name, @description, @stock, @price, @cost, @category, @supplier, @lastUpdatedAt, @userId)
    `).run(newProduct);
    return newProduct;
}

export async function updateProduct(updatedProduct: Product): Promise<Product> {
    const userId = await getUserId();
    if (updatedProduct.userId !== userId) throw new Error("Permission denied");
    const productToUpdate = { ...updatedProduct, lastUpdatedAt: new Date().toISOString() };
    db.prepare(`
        UPDATE products SET 
            name = @name, description = @description, stock = @stock, price = @price, cost = @cost, 
            category = @category, supplier = @supplier, lastUpdatedAt = @lastUpdatedAt
        WHERE id = @id AND userId = @userId
    `).run(productToUpdate);
    return productToUpdate;
}

export async function receiveStock(productId: string, quantity: number, costPerUnit: number): Promise<Product> {
    const userId = await getUserId();
    const product = db.prepare("SELECT * FROM products WHERE id = ? AND userId = ?").get(productId, userId) as Product | undefined;
    if (!product) throw new Error("Product not found");

    const currentStock = Number(product.stock) || 0;
    const currentCost = Number(product.cost) || 0;
    if (quantity <= 0) return product;

    const newStock = currentStock + quantity;
    const newAverageCost = newStock > 0
      ? ((currentCost * currentStock) + (costPerUnit * quantity)) / newStock
      : costPerUnit;
      
    const updatedProduct: Product = {
        ...product,
        stock: newStock,
        cost: isNaN(newAverageCost) ? currentCost : newAverageCost,
        lastUpdatedAt: new Date().toISOString(),
    };

    return await updateProduct(updatedProduct);
}


export async function addSale(saleData: LogSaleFormValues): Promise<{ newSale: Sale, updatedProduct: Product }> {
    const userId = await getUserId();
    const product = db.prepare("SELECT * FROM products WHERE id = ? AND userId = ?").get(saleData.productId, userId) as Product | undefined;
    if (!product) throw new Error("Product not found");
    if (product.stock < saleData.quantity) throw new Error("Not enough stock");

    let customerName = "Walk-in Customer";
    let customerId = saleData.customerId || "walk-in";

    if (customerId !== 'walk-in') {
        const customer = db.prepare("SELECT * FROM customers WHERE id = ? AND userId = ?").get(customerId, userId) as Customer | undefined;
        if(customer) customerName = customer.name;
    }

    const profit = (saleData.pricePerUnit - product.cost) * saleData.quantity;
    const total = saleData.pricePerUnit * saleData.quantity;

    const newSaleData: Omit<Sale, "id" | "userId"> = {
      productId: saleData.productId,
      productName: product.name,
      customerName,
      customerId,
      quantity: saleData.quantity,
      pricePerUnit: saleData.pricePerUnit,
      total,
      profit,
      notes: saleData.notes,
      date: new Date().toISOString(),
    };
    
    const id = `sale_${new Date().getTime()}`;
    db.prepare(`
        INSERT INTO sales (id, productId, customerId, customerName, productName, quantity, pricePerUnit, total, profit, notes, date, userId) 
        VALUES (@id, @productId, @customerId, @customerName, @productName, @quantity, @pricePerUnit, @total, @profit, @notes, @date, @userId)
    `).run({ ...newSaleData, id, userId });
    const newSale = { ...newSaleData, id, userId };
    
    const updatedProductData = { ...product, stock: product.stock - saleData.quantity, lastUpdatedAt: new Date().toISOString() };
    const updatedProduct = await updateProduct(updatedProductData);

    return { newSale, updatedProduct };
}


export async function addCustomer(customerData: Omit<Customer, "id" | "createdAt" | "userId">): Promise<Customer> {
    const userId = await getUserId();
    const newCustomerData = {
      ...customerData,
      id: `cust_${new Date().getTime()}`,
      userId,
      createdAt: new Date().toISOString(),
      type: customerData.type || "Regular",
      notes: customerData.notes || null,
    };
    db.prepare(`
        INSERT INTO customers (id, name, phone, createdAt, notes, type, userId) 
        VALUES (@id, @name, @phone, @createdAt, @notes, @type, @userId)
    `).run(newCustomerData);
    return newCustomerData;
}


export async function updateCustomer(updatedCustomer: Customer): Promise<Customer> {
    const userId = await getUserId();
    if (updatedCustomer.userId !== userId) throw new Error("Permission denied");
    db.prepare(`
        UPDATE customers SET name = @name, phone = @phone, notes = @notes, type = @type
        WHERE id = @id AND userId = @userId
    `).run(updatedCustomer);
    return updatedCustomer;
}

export async function addExpense(expenseData: Omit<Expense, "id" | "date" | "userId">): Promise<Expense> {
    const userId = await getUserId();
    const newExpenseData: Omit<Expense, "id" | "userId"> & { id: string; userId: string; } = { 
        ...expenseData, 
        id: `exp_${new Date().getTime()}`,
        date: new Date().toISOString(),
        userId
    };
    db.prepare(`
        INSERT INTO expenses (id, description, category, amount, date, notes, userId) 
        VALUES (@id, @description, @category, @amount, @date, @notes, @userId)
    `).run(newExpenseData);
    return newExpenseData;
}

export async function updateExpense(updatedExpense: Expense): Promise<Expense> {
    const userId = await getUserId();
    if (updatedExpense.userId !== userId) throw new Error("Permission denied");
    const expenseToUpdate = { ...updatedExpense, date: new Date().toISOString() };
    db.prepare(`
        UPDATE expenses SET description = @description, category = @category, amount = @amount, date = @date, notes = @notes
        WHERE id = @id AND userId = @userId
    `).run(expenseToUpdate);
    return expenseToUpdate;
}


export async function deleteExpense(id: string): Promise<{ success: boolean }> {
    const userId = await getUserId();
    db.prepare("DELETE FROM expenses WHERE id = ? AND userId = ?").run(id, userId);
    return { success: true };
}


export async function updateSettings(newSettings: Settings): Promise<Settings> {
    const userId = await getUserId();
    db.prepare("UPDATE settings SET value = ? WHERE userId = ? AND key = 'appSettings'").run(JSON.stringify(newSettings), userId);
    return newSettings;
}

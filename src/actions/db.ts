
'use server';

import { db } from '@/lib/db';
import type { Product, Sale, Customer, Expense, Settings, LogSaleFormValues } from "@/lib/types";

// === READ OPERATIONS ===

export async function getProducts(): Promise<Product[]> {
    return db.prepare("SELECT * FROM products ORDER BY name ASC").all() as Product[];
}

export async function getSales(): Promise<Sale[]> {
    return db.prepare("SELECT * FROM sales ORDER BY date DESC").all() as Sale[];
}

export async function getCustomers(): Promise<Customer[]> {
    return db.prepare("SELECT * FROM customers ORDER BY name ASC").all() as Customer[];
}

export async function getExpenses(): Promise<Expense[]> {
    return db.prepare("SELECT * FROM expenses ORDER BY date DESC").all() as Expense[];
}

export async function getSettings(): Promise<Settings> {
    const settingsFromDb = db.prepare("SELECT value FROM settings WHERE key = 'appSettings'").get() as { value: string } | undefined;
    
    if (settingsFromDb) {
        return JSON.parse(settingsFromDb.value);
    } 
    
    // This case should ideally not be hit if the DB is seeded correctly.
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

export async function addProduct(productData: Omit<Product, "id" | "lastUpdatedAt">): Promise<Product> {
    const newProduct = {
      ...productData,
      id: `prod_${new Date().getTime()}`,
      lastUpdatedAt: new Date().toISOString(),
    };
    db.prepare(`
        INSERT INTO products (id, name, description, stock, price, cost, category, supplier, lastUpdatedAt) 
        VALUES (@id, @name, @description, @stock, @price, @cost, @category, @supplier, @lastUpdatedAt)
    `).run(newProduct);
    return newProduct;
}

export async function updateProduct(updatedProduct: Product): Promise<Product> {
    const productToUpdate = { ...updatedProduct, lastUpdatedAt: new Date().toISOString() };
    db.prepare(`
        UPDATE products SET 
            name = @name, description = @description, stock = @stock, price = @price, cost = @cost, 
            category = @category, supplier = @supplier, lastUpdatedAt = @lastUpdatedAt
        WHERE id = @id
    `).run(productToUpdate);
    return productToUpdate;
}

export async function receiveStock(productId: string, quantity: number, costPerUnit: number): Promise<Product> {
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(productId) as Product | undefined;
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
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(saleData.productId) as Product | undefined;
    if (!product) throw new Error("Product not found");
    if (product.stock < saleData.quantity) throw new Error("Not enough stock");

    let customerName = "Walk-in Customer";
    let customerId = saleData.customerId || null;

    if (customerId && customerId !== 'walk-in') {
        const customer = db.prepare("SELECT * FROM customers WHERE id = ?").get(customerId) as Customer | undefined;
        if(customer) customerName = customer.name;
    } else {
        customerId = null; // Ensure walk-in is stored as NULL
    }

    const profit = (saleData.pricePerUnit - product.cost) * saleData.quantity;
    const total = saleData.pricePerUnit * saleData.quantity;

    const newSaleData: Omit<Sale, "id"> = {
      productId: saleData.productId,
      productName: product.name,
      customerName,
      customerId: customerId,
      quantity: saleData.quantity,
      pricePerUnit: saleData.pricePerUnit,
      total,
      profit,
      notes: saleData.notes,
      date: new Date().toISOString(),
    };
    
    const id = `sale_${new Date().getTime()}`;
    db.prepare(`
        INSERT INTO sales (id, productId, customerId, customerName, productName, quantity, pricePerUnit, total, profit, notes, date) 
        VALUES (@id, @productId, @customerId, @customerName, @productName, @quantity, @pricePerUnit, @total, @profit, @notes, @date)
    `).run({ ...newSaleData, id });
    const newSale = { ...newSaleData, id };
    
    const updatedProductData = { ...product, stock: product.stock - saleData.quantity, lastUpdatedAt: new Date().toISOString() };
    const updatedProduct = await updateProduct(updatedProductData);

    return { newSale, updatedProduct };
}


export async function addCustomer(customerData: Omit<Customer, "id" | "createdAt">): Promise<Customer> {
    const newCustomerData = {
      ...customerData,
      id: `cust_${new Date().getTime()}`,
      createdAt: new Date().toISOString(),
      type: customerData.type || "Regular",
      notes: customerData.notes || null,
    };
    db.prepare(`
        INSERT INTO customers (id, name, phone, createdAt, notes, type) 
        VALUES (@id, @name, @phone, @createdAt, @notes, @type)
    `).run(newCustomerData);
    return newCustomerData;
}


export async function updateCustomer(updatedCustomer: Customer): Promise<Customer> {
    db.prepare(`
        UPDATE customers SET name = @name, phone = @phone, notes = @notes, type = @type
        WHERE id = @id
    `).run(updatedCustomer);
    return updatedCustomer;
}

export async function addExpense(expenseData: Omit<Expense, "id" | "date">): Promise<Expense> {
    const newExpenseData: Omit<Expense, "id"> & { id: string; date: string; } = { 
        ...expenseData, 
        id: `exp_${new Date().getTime()}`,
        date: new Date().toISOString(),
    };
    db.prepare(`
        INSERT INTO expenses (id, description, category, amount, date, notes) 
        VALUES (@id, @description, @category, @amount, @date, @notes)
    `).run(newExpenseData);
    return newExpenseData;
}

export async function updateExpense(updatedExpense: Expense): Promise<Expense> {
    const expenseToUpdate = { ...updatedExpense, date: new Date().toISOString() };
    db.prepare(`
        UPDATE expenses SET description = @description, category = @category, amount = @amount, date = @date, notes = @notes
        WHERE id = @id
    `).run(expenseToUpdate);
    return expenseToUpdate;
}


export async function deleteExpense(id: string): Promise<{ success: boolean }> {
    db.prepare("DELETE FROM expenses WHERE id = ?").run(id);
    return { success: true };
}


export async function updateSettings(newSettings: Settings): Promise<Settings> {
    db.prepare("UPDATE settings SET value = ? WHERE key = 'appSettings'").run(JSON.stringify(newSettings));
    return newSettings;
}

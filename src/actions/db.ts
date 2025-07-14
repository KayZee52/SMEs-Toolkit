
'use server';

import db from '@/lib/db';
import type {
  Product,
  Sale,
  Customer,
  Expense,
  Settings,
  LogSaleFormValues,
} from '@/lib/types';
import fs from 'fs';
import path from 'path';

// --- Get Functions ---

export async function getProducts(): Promise<Product[]> {
  const stmt = db.prepare('SELECT * FROM products ORDER BY name ASC');
  return stmt.all() as Product[];
}

export async function getSales(): Promise<Sale[]> {
  const stmt = db.prepare('SELECT * FROM sales ORDER BY date DESC');
  return stmt.all() as Sale[];
}

export async function getCustomers(): Promise<Customer[]> {
  const stmt = db.prepare('SELECT * FROM customers ORDER BY createdAt DESC');
  return stmt.all() as Customer[];
}

export async function getExpenses(): Promise<Expense[]> {
  const stmt = db.prepare('SELECT * FROM expenses ORDER BY date DESC');
  return stmt.all() as Expense[];
}

export async function getSettings(): Promise<Settings> {
    const stmt = db.prepare("SELECT data FROM settings WHERE key = 'appSettings'");
    const row = stmt.get() as { data: string } | undefined;
    if (row) {
        return JSON.parse(row.data);
    }
    // Return default if not found
    return {
        businessName: "My Business",
        currency: "USD",
        enableAssistant: true,
        autoSuggestions: true,
        language: "en",
        passwordHash: null,
    };
}


export async function getInitialData() {
  const [products, sales, customers, expenses, settings] = await Promise.all([
    getProducts(),
    getSales(),
    getCustomers(),
    getExpenses(),
    getSettings(),
  ]);
  return { products, sales, customers, expenses, settings };
}

// --- Add/Update Functions ---

export async function addProduct(productData: Omit<Product, 'id' | 'lastUpdatedAt'>): Promise<Product> {
  const newProduct: Product = {
    ...productData,
    id: `prod_${Date.now()}`,
    lastUpdatedAt: new Date().toISOString(),
  };

  const stmt = db.prepare(
    'INSERT INTO products (id, name, description, stock, price, cost, category, supplier, lastUpdatedAt) VALUES (@id, @name, @description, @stock, @price, @cost, @category, @supplier, @lastUpdatedAt)'
  );
  stmt.run(newProduct);
  return newProduct;
}

export async function addMultipleProducts(productsData: Omit<Product, 'id' | 'lastUpdatedAt'>[]): Promise<Product[]> {
    const insertStmt = db.prepare(
        'INSERT INTO products (id, name, description, stock, price, cost, category, supplier, lastUpdatedAt) VALUES (@id, @name, @description, @stock, @price, @cost, @category, @supplier, @lastUpdatedAt)'
    );

    const newProducts: Product[] = [];

    const insertMany = db.transaction((products) => {
        for (const productData of products) {
            const newProduct: Product = {
                ...productData,
                id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                lastUpdatedAt: new Date().toISOString(),
            };
            insertStmt.run(newProduct);
            newProducts.push(newProduct);
        }
    });

    insertMany(productsData);
    return newProducts;
}

export async function updateProduct(updatedProduct: Product): Promise<Product> {
    const productWithTimestamp = {
        ...updatedProduct,
        lastUpdatedAt: new Date().toISOString(),
    }
    const stmt = db.prepare(
        'UPDATE products SET name = @name, description = @description, stock = @stock, price = @price, cost = @cost, category = @category, supplier = @supplier, lastUpdatedAt = @lastUpdatedAt WHERE id = @id'
    );
    stmt.run(productWithTimestamp);
    return productWithTimestamp;
}

export async function receiveStock(productId: string, quantity: number, costPerUnit: number): Promise<Product> {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId) as Product;
    if (!product) {
        throw new Error("Product not found");
    }

    const newStock = product.stock + quantity;
    // Prevent division by zero if current stock is negative or zero, but new quantity is added.
    const totalOldStockValue = product.stock > 0 ? product.cost * product.stock : 0;
    const totalNewStockValue = costPerUnit * quantity;
    const totalStock = product.stock + quantity;
    const newCost = totalStock > 0 ? (totalOldStockValue + totalNewStockValue) / totalStock : costPerUnit;


    const updatedProductData = {
        ...product,
        stock: newStock,
        cost: isNaN(newCost) ? costPerUnit : newCost, // Handle case where initial stock is 0
        lastUpdatedAt: new Date().toISOString()
    };
    
    const stmt = db.prepare(
        'UPDATE products SET stock = @stock, cost = @cost, lastUpdatedAt = @lastUpdatedAt WHERE id = @id'
    );
    stmt.run(updatedProductData);
    return updatedProductData;
}


export async function addSale(saleData: LogSaleFormValues): Promise<Sale> {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(saleData.productId) as Product | undefined;
  if (!product) {
    throw new Error('Product not found');
  }

  if (product.stock < saleData.quantity) {
    throw new Error('Not enough stock available');
  }
  
  const customer = saleData.customerId && saleData.customerId !== 'walk-in'
    ? db.prepare('SELECT * FROM customers WHERE id = ?').get(saleData.customerId) as Customer | undefined
    : undefined;

  const total = saleData.pricePerUnit * saleData.quantity;
  const profit = (saleData.pricePerUnit - product.cost) * saleData.quantity;

  const newSale: Sale = {
    id: `sale_${Date.now()}`,
    productId: product.id,
    customerId: customer?.id || null,
    customerName: customer?.name || "Walk-in Customer",
    productName: product.name,
    quantity: saleData.quantity,
    pricePerUnit: saleData.pricePerUnit,
    total,
    profit,
    notes: saleData.notes,
    date: new Date().toISOString(),
  };

  const saleStmt = db.prepare(
    'INSERT INTO sales (id, productId, customerId, customerName, productName, quantity, pricePerUnit, total, profit, notes, date) VALUES (@id, @productId, @customerId, @customerName, @productName, @quantity, @pricePerUnit, @total, @profit, @notes, @date)'
  );
  
  const stockStmt = db.prepare('UPDATE products SET stock = stock - ?, lastUpdatedAt = ? WHERE id = ?');

  const transaction = db.transaction(() => {
    saleStmt.run(newSale);
    stockStmt.run(newSale.quantity, new Date().toISOString(), newSale.productId);
  });

  transaction();
  return newSale;
}


export async function addCustomer(customerData: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    const newCustomer: Customer = {
        ...customerData,
        id: `cust_${Date.now()}`,
        createdAt: new Date().toISOString(),
        notes: customerData.notes || null,
        type: customerData.type || "Regular",
    };
    const stmt = db.prepare(
        'INSERT INTO customers (id, name, phone, createdAt, notes, type) VALUES (@id, @name, @phone, @createdAt, @notes, @type)'
    );
    stmt.run(newCustomer);
    return newCustomer;
}

export async function updateCustomer(updatedCustomer: Customer): Promise<Customer> {
    const stmt = db.prepare(
        'UPDATE customers SET name = @name, phone = @phone, notes = @notes, type = @type WHERE id = @id'
    );
    stmt.run(updatedCustomer);
    return updatedCustomer;
}


export async function addExpense(expenseData: Omit<Expense, 'id' | 'date'>): Promise<Expense> {
    const newExpense: Expense = {
        ...expenseData,
        id: `exp_${Date.now()}`,
        date: new Date().toISOString(),
    };
    const stmt = db.prepare(
        'INSERT INTO expenses (id, description, category, amount, date, notes) VALUES (@id, @description, @category, @amount, @date, @notes)'
    );
    stmt.run(newExpense);
    return newExpense;
}

export async function updateExpense(updatedExpense: Expense): Promise<Expense> {
    const stmt = db.prepare(
        'UPDATE expenses SET description = @description, category = @category, amount = @amount, notes = @notes WHERE id = @id'
    );
    stmt.run(updatedExpense);
    return updatedExpense;
}

export async function deleteExpense(id: string): Promise<{ id: string }> {
    const stmt = db.prepare('DELETE FROM expenses WHERE id = ?');
    stmt.run(id);
    return { id };
}

export async function updateSettings(newSettings: Settings): Promise<Settings> {
    const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, data) VALUES ('appSettings', ?)");
    stmt.run(JSON.stringify(newSettings));
    return newSettings;
}

export async function recreateDatabase(): Promise<{success: boolean}> {
  const dbPath = path.join(process.cwd(), 'smes-toolkit.db');
  
  // Close the existing connection if it's open
  db.close(); 
  
  try {
    const filesToDelete = [`${dbPath}`, `${dbPath}-shm`, `${dbPath}-wal`];
    filesToDelete.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
    console.log("Database files deleted successfully. The application will re-initialize it on the next action.");
    return { success: true };
  } catch (error) {
    console.error("Error deleting database file:", error);
    // Re-throw to be caught by the caller
    throw new Error("Could not recreate the database.");
  }
}

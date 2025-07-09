
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Product, Sale, Customer, Expense, Settings, AppContextType, LogSaleFormValues } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { getTranslations } from "@/lib/i18n";
import { db } from "@/lib/db";

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultSettings: Settings = {
  businessName: "Ma-D",
  currency: "USD",
  enableAssistant: true,
  autoSuggestions: true,
  language: "en",
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const [isInitialized, setIsInitialized] = useState(false);
  
  const translations = getTranslations(settings.language);

  const loadData = () => {
    try {
      setProducts(db.prepare("SELECT * FROM products ORDER BY name ASC").all() as Product[]);
      setSales(db.prepare("SELECT * FROM sales ORDER BY date DESC").all() as Sale[]);
      setCustomers(db.prepare("SELECT * FROM customers ORDER BY name ASC").all() as Customer[]);
      setExpenses(db.prepare("SELECT * FROM expenses ORDER BY date DESC").all() as Expense[]);
      
      const settingsFromDb = db.prepare("SELECT value FROM settings WHERE key = ?").get('appSettings') as { value: string } | undefined;
      if (settingsFromDb) {
        setSettings(JSON.parse(settingsFromDb.value));
      } else {
        db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run('appSettings', JSON.stringify(defaultSettings));
      }
    } catch (error) {
        console.error("Failed to load data from database:", error);
        toast({
            variant: "destructive",
            title: "Database Error",
            description: "Could not load application data.",
        });
    }
  };

  useEffect(() => {
    // This effect runs only once after the initial render to load data from SQLite.
    loadData();
    setIsInitialized(true);
  }, []); 

  const addProduct = (productData: Omit<Product, "id" | "lastUpdatedAt">) => {
    const newProduct: Omit<Product, "id"> = {
      ...productData,
      lastUpdatedAt: new Date().toISOString(),
    };
    try {
        const stmt = db.prepare(`
            INSERT INTO products (name, description, stock, price, cost, category, supplier, lastUpdatedAt) 
            VALUES (@name, @description, @stock, @price, @cost, @category, @supplier, @lastUpdatedAt)
        `);
        const result = stmt.run(newProduct);
        const insertedProduct = { ...newProduct, id: result.lastInsertRowid.toString() };
        setProducts(prev => [...prev, insertedProduct]);
        toast({ title: "Product Added", description: `${newProduct.name} has been added to inventory.` });
    } catch (error) {
        console.error("Failed to add product:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not add product."});
    }
  };
  
  const updateProduct = (updatedProduct: Product) => {
    const productToUpdate = { ...updatedProduct, lastUpdatedAt: new Date().toISOString() };
    try {
        const stmt = db.prepare(`
            UPDATE products SET 
                name = @name, 
                description = @description, 
                stock = @stock, 
                price = @price, 
                cost = @cost, 
                category = @category, 
                supplier = @supplier, 
                lastUpdatedAt = @lastUpdatedAt
            WHERE id = @id
        `);
        stmt.run(productToUpdate);
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? productToUpdate : p));
        toast({ title: "Product Updated", description: `${updatedProduct.name} has been updated.` });
    } catch (error) {
        console.error("Failed to update product:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not update product."});
    }
  };
  
  const receiveStock = (productId: string, quantity: number, costPerUnit: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      toast({ variant: "destructive", title: "Error", description: "Product not found." });
      return;
    }

    const currentStock = Number(product.stock) || 0;
    const currentCost = Number(product.cost) || 0;
    if (quantity <= 0) return;

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
    updateProduct(updatedProduct);
    toast({ title: "Stock Received", description: `${quantity} units of ${product.name} added.` });
  };


  const addSale = (saleData: LogSaleFormValues) => {
    const product = products.find((p) => p.id === saleData.productId);
    if (!product) {
      toast({ variant: "destructive", title: "Error", description: "Product not found." });
      return;
    }
    if (product.stock < saleData.quantity) {
      toast({ variant: "destructive", title: "Error", description: "Not enough stock." });
      return;
    }

    let customerName = "Walk-in Customer";
    if (saleData.customerId && saleData.customerId !== 'walk-in') {
        const customer = customers.find(c => c.id === saleData.customerId);
        if(customer) customerName = customer.name;
    }

    const profit = (saleData.pricePerUnit - product.cost) * saleData.quantity;
    const total = saleData.pricePerUnit * saleData.quantity;

    const newSaleData: Omit<Sale, "id"> = {
      productId: saleData.productId,
      productName: product.name,
      customerName: customerName,
      customerId: saleData.customerId,
      quantity: saleData.quantity,
      pricePerUnit: saleData.pricePerUnit,
      total,
      profit,
      notes: saleData.notes,
      date: new Date().toISOString(),
    };

    try {
        const stmt = db.prepare(`
            INSERT INTO sales (productId, customerId, customerName, productName, quantity, pricePerUnit, total, profit, notes, date) 
            VALUES (@productId, @customerId, @customerName, @productName, @quantity, @pricePerUnit, @total, @profit, @notes, @date)
        `);
        const result = stmt.run(newSaleData);
        const newSale = { ...newSaleData, id: result.lastInsertRowid.toString() };

        setSales(prev => [newSale, ...prev]);
        
        const updatedProduct = { ...product, stock: product.stock - saleData.quantity, lastUpdatedAt: new Date().toISOString() };
        updateProduct(updatedProduct);

        toast({ title: "Sale Logged", description: `Sold ${saleData.quantity} of ${product.name}.` });
    } catch (error) {
        console.error("Failed to add sale:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not log sale."});
    }
  };
  
  const addCustomer = (customerData: Omit<Customer, "id" | "createdAt">): Customer => {
    const newCustomerData = {
      ...customerData,
      createdAt: new Date().toISOString(),
      type: customerData.type || "Regular",
    };
    try {
        const stmt = db.prepare(`
            INSERT INTO customers (name, phone, createdAt, notes, type) 
            VALUES (@name, @phone, @createdAt, @notes, @type)
        `);
        const result = stmt.run(newCustomerData);
        const newCustomer = { ...newCustomerData, id: result.lastInsertRowid.toString() };
        setCustomers(prev => [newCustomer, ...prev]);
        toast({ title: "Customer Added", description: `${newCustomer.name} has been added.` });
        return newCustomer;
    } catch (error) {
        console.error("Failed to add customer:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not add customer."});
        throw error;
    }
  };
  
  const updateCustomer = (updatedCustomer: Customer) => {
    try {
        const stmt = db.prepare(`
            UPDATE customers SET name = @name, phone = @phone, notes = @notes, type = @type
            WHERE id = @id
        `);
        stmt.run(updatedCustomer);
        setCustomers(prev => prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)));
        toast({ title: "Customer Updated", description: `${updatedCustomer.name}'s details have been updated.` });
    } catch(error) {
        console.error("Failed to update customer:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not update customer."});
    }
  };

  const addExpense = (expenseData: Omit<Expense, "id" | "date">) => {
    const newExpenseData: Omit<Expense, "id"> = {
      ...expenseData,
      date: new Date().toISOString(),
    };
    try {
        const stmt = db.prepare(`
            INSERT INTO expenses (description, category, amount, date, notes) 
            VALUES (@description, @category, @amount, @date, @notes)
        `);
        const result = stmt.run(newExpenseData);
        const newExpense = { ...newExpenseData, id: result.lastInsertRowid.toString() };
        setExpenses(prev => [newExpense, ...prev]);
        toast({ title: "Expense Logged", description: `${expenseData.description} for ${formatCurrency(expenseData.amount)} has been logged.` });
    } catch (error) {
        console.error("Failed to add expense:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not log expense."});
    }
  };
  
  const updateExpense = (updatedExpense: Expense) => {
    const expenseToUpdate = { ...updatedExpense, date: new Date().toISOString() };
    try {
        const stmt = db.prepare(`
            UPDATE expenses SET description = @description, category = @category, amount = @amount, date = @date, notes = @notes
            WHERE id = @id
        `);
        stmt.run(expenseToUpdate);
        setExpenses(prev => prev.map((e) => (e.id === updatedExpense.id ? expenseToUpdate : e)));
        toast({ title: "Expense Updated", description: `${updatedExpense.description} has been updated.` });
    } catch(error) {
        console.error("Failed to update expense:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not update expense."});
    }
  };

  const deleteExpense = (id: string) => {
    try {
        db.prepare("DELETE FROM expenses WHERE id = ?").run(id);
        setExpenses((prev) => prev.filter((e) => e.id !== id));
        toast({ title: "Expense Deleted", description: "The expense has been removed." });
    } catch (error) {
        console.error("Failed to delete expense:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not delete expense."});
    }
  };

  const findCustomerByName = (name: string): Customer | undefined => {
    return customers.find(c => c.name.toLowerCase() === name.toLowerCase());
  }

  const updateSettings = (newSettings: Settings) => {
    try {
        db.prepare("UPDATE settings SET value = ? WHERE key = ?").run(JSON.stringify(newSettings), 'appSettings');
        setSettings(newSettings);
        toast({
            title: "Settings Saved",
            description: "Your changes have been successfully saved.",
        });
    } catch (error) {
        console.error("Failed to update settings:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not save settings."});
    }
  };

  if (!isInitialized) return null;

  const value: AppContextType = {
    products,
    sales,
    customers,
    expenses,
    settings,
    addProduct,
    updateProduct,
    receiveStock,
    addSale,
    addCustomer,
    updateCustomer,
    addExpense,
    updateExpense,
    deleteExpense,
    findCustomerByName,
    updateSettings,
    translations,
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

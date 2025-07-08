
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Product, Sale, Customer, Expense, Settings, AppContextType } from "@/lib/types";
import { MOCK_PRODUCTS, MOCK_SALES, MOCK_CUSTOMERS, MOCK_EXPENSES } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { getTranslations } from "@/lib/i18n";

const AppContext = createContext<AppContextType | undefined>(undefined);

const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [products, setProducts] = useLocalStorage<Product[]>("products", []);
  const [sales, setSales] = useLocalStorage<Sale[]>("sales", []);
  const [customers, setCustomers] = useLocalStorage<Customer[]>("customers", []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>("expenses", []);
  
  const defaultSettings: Settings = {
    businessName: "SMEs Toolkit",
    currency: "USD",
    enableAssistant: true,
    autoSuggestions: true,
    language: "en",
  };
  const [settings, setSettings] = useLocalStorage<Settings>("settings", defaultSettings);

  const [isInitialized, setIsInitialized] = useState(false);
  
  const translations = getTranslations(settings.language);

  useEffect(() => {
    if (localStorage.getItem("dataInitialized") !== "true") {
      setProducts(MOCK_PRODUCTS);
      setSales(MOCK_SALES);
      setCustomers(MOCK_CUSTOMERS);
      setExpenses(MOCK_EXPENSES);
      setSettings(defaultSettings);
      localStorage.setItem("dataInitialized", "true");
    }
    setIsInitialized(true);
  }, []);

  const addProduct = (productData: Omit<Product, "id" | "lastUpdatedAt">) => {
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
      lastUpdatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [...prev, newProduct]);
    toast({ title: "Product Added", description: `${newProduct.name} has been added to inventory.` });
  };
  
  const updateProduct = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? { ...updatedProduct, lastUpdatedAt: new Date().toISOString() } : p)));
    toast({ title: "Product Updated", description: `${updatedProduct.name} has been updated.` });
  };
  
  const receiveStock = (productId: string, quantity: number, costPerUnit: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      toast({ variant: "destructive", title: "Error", description: "Product not found." });
      return;
    }

    const newStock = product.stock + quantity;
    const newAverageCost = ((product.cost * product.stock) + (costPerUnit * quantity)) / newStock;

    const updatedProduct = {
      ...product,
      stock: newStock,
      cost: newAverageCost,
      lastUpdatedAt: new Date().toISOString(),
    };

    setProducts((prev) => prev.map((p) => (p.id === productId ? updatedProduct : p)));
    toast({ title: "Stock Received", description: `${quantity} units of ${product.name} added.` });
  };


  const addSale = (saleData: Omit<Sale, "id" | "total" | "date" | "productName" | "customerName" | "profit">) => {
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
        if (customer) customerName = customer.name;
    }

    const profit = (saleData.pricePerUnit - product.cost) * saleData.quantity;

    const newSale: Sale = {
      ...saleData,
      id: `sale_${Date.now()}`,
      productName: product.name,
      customerName,
      total: saleData.pricePerUnit * saleData.quantity,
      profit,
      date: new Date().toISOString(),
    };

    setSales((prev) => [newSale, ...prev]);
    
    const updatedProduct = { ...product, stock: product.stock - saleData.quantity, lastUpdatedAt: new Date().toISOString() };
    updateProduct(updatedProduct);

    toast({ title: "Sale Logged", description: `Sold ${saleData.quantity} of ${product.name}.` });
  };
  
  const addCustomer = (customerData: Omit<Customer, "id" | "createdAt">): Customer => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust_${Date.now()}`,
      createdAt: new Date().toISOString(),
      type: customerData.type || "Regular",
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    toast({ title: "Customer Added", description: `${newCustomer.name} has been added.` });
    return newCustomer;
  };
  
  const updateCustomer = (updatedCustomer: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)));
    toast({ title: "Customer Updated", description: `${updatedCustomer.name}'s details have been updated.` });
  };

  const addExpense = (expenseData: Omit<Expense, "id" | "date">) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp_${Date.now()}`,
      date: new Date().toISOString(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
    toast({ title: "Expense Logged", description: `${expenseData.description} for ${formatCurrency(expenseData.amount)} has been logged.` });
  };
  
  const updateExpense = (updatedExpense: Expense) => {
    setExpenses((prev) => prev.map((e) => (e.id === updatedExpense.id ? { ...updatedExpense, date: new Date().toISOString() } : e)));
    toast({ title: "Expense Updated", description: `${updatedExpense.description} has been updated.` });
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    toast({ title: "Expense Deleted", description: "The expense has been removed." });
  };

  const findCustomerByName = (name: string): Customer | undefined => {
    return customers.find(c => c.name.toLowerCase() === name.toLowerCase());
  }

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    toast({
      title: "Settings Saved",
      description: "Your changes have been successfully saved.",
    });
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

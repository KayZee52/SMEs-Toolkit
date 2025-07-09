
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Product, Sale, Customer, Expense, Settings, AppContextType, LogSaleFormValues } from "@/lib/types";
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
      if (item) {
        const parsedItem = JSON.parse(item);

        // Guard against data corruption: if we expect an array but don't get one, reset.
        if (Array.isArray(initialValue) && !Array.isArray(parsedItem)) {
          console.warn(`LocalStorage Corruption: Resetting "${key}" because an array was expected.`);
          window.localStorage.setItem("dataInitialized", "false"); // Force re-seed
          return initialValue;
        }

        // The merging logic is only intended for objects (like settings) to be forward-compatible.
        if (typeof initialValue === 'object' && !Array.isArray(initialValue) && initialValue !== null) {
          return { ...initialValue, ...parsedItem };
        }
        
        return parsedItem;
      }
      return initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.error(`Error writing to localStorage key "${key}":`, error);
      }
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  
  const defaultSettings: Settings = {
    businessName: "SMEs Toolkit",
    currency: "USD",
    enableAssistant: true,
    autoSuggestions: true,
    language: "en",
  };

  const [products, setProducts] = useLocalStorage<Product[]>("products", []);
  const [sales, setSales] = useLocalStorage<Sale[]>("sales", []);
  const [customers, setCustomers] = useLocalStorage<Customer[]>("customers", []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>("expenses", []);
  const [settings, setSettings] = useLocalStorage<Settings>("settings", defaultSettings);

  const [isInitialized, setIsInitialized] = useState(false);
  
  const translations = getTranslations(settings.language);

  useEffect(() => {
    // This effect runs only once after the initial render to seed or migrate data.
    if (localStorage.getItem("dataInitialized") !== "true") {
      // First run: seed with mock data.
      const salesWithProfit = MOCK_SALES.map(sale => {
        const product = MOCK_PRODUCTS.find(p => p.id === sale.productId);
        const profit = product ? (sale.pricePerUnit - product.cost) * sale.quantity : 0;
        return { ...sale, profit };
      });

      setProducts(MOCK_PRODUCTS);
      setSales(salesWithProfit);
      setCustomers(MOCK_CUSTOMERS);
      setExpenses(MOCK_EXPENSES);
      setSettings(defaultSettings);
      localStorage.setItem("dataInitialized", "true");
    } else {
      // For returning users, check if their data needs migration.
      let currentProducts = products;
      if (Array.isArray(products)) {
        const needsProductMigration = products.some(p => !p.lastUpdatedAt);
        if (needsProductMigration) {
          console.log("Running data migration for products...");
          const migratedProducts = products.map(p => 
            p.lastUpdatedAt ? p : { ...p, lastUpdatedAt: new Date().toISOString() }
          );
          setProducts(migratedProducts);
          currentProducts = migratedProducts;
        }
      }

      if (Array.isArray(sales)) {
        const needsSaleMigration = sales.some(s => s.profit === undefined);
        if (needsSaleMigration) {
            console.log("Running data migration for sales...");
            const migratedSales = sales.map(sale => {
                if (sale.profit !== undefined) return sale; // Skip if profit already exists
                
                const product = currentProducts.find(p => p.id === sale.productId);
                const profit = product ? (sale.pricePerUnit - product.cost) * sale.quantity : 0;
                return { ...sale, profit };
            });
            setSales(migratedSales);
        }
      }
    }
    setIsInitialized(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array ensures this runs only once on mount.


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

    // Ensure data is numeric
    const currentStock = Number(product.stock) || 0;
    const currentCost = Number(product.cost) || 0;
    
    if (quantity <= 0) return; // Should be handled by form validation

    const newStock = currentStock + quantity;

    // Calculate new average cost. If current stock is 0, new cost is just the cost of new units.
    const newAverageCost = newStock > 0
      ? ((currentCost * currentStock) + (costPerUnit * quantity)) / newStock
      : costPerUnit;

    const updatedProduct: Product = {
      ...product,
      stock: newStock,
      // Fallback to current cost if calculation results in NaN
      cost: isNaN(newAverageCost) ? currentCost : newAverageCost,
      lastUpdatedAt: new Date().toISOString(),
    };

    setProducts((prev) => prev.map((p) => (p.id === productId ? updatedProduct : p)));
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

    let customer: Customer | undefined;
    let customerName: string;

    if (saleData.customerId) {
        customer = customers.find(c => c.id === saleData.customerId);
    }
    
    customerName = customer ? customer.name : "Walk-in Customer";


    const profit = (saleData.pricePerUnit - product.cost) * saleData.quantity;

    const newSale: Sale = {
      id: `sale_${Date.now()}`,
      productId: saleData.productId,
      productName: product.name,
      customerName: customerName,
      customerId: saleData.customerId,
      quantity: saleData.quantity,
      pricePerUnit: saleData.pricePerUnit,
      total: saleData.pricePerUnit * saleData.quantity,
      profit,
      notes: saleData.notes,
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

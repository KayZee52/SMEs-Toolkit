
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import type { Product, Sale, Customer, Expense, Settings, AppContextType, LogSaleFormValues } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { getTranslations } from "@/lib/i18n";
import * as db from "@/actions/db";

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<Settings>({
    businessName: "My Business",
    currency: "USD",
    enableAssistant: true,
    autoSuggestions: true,
    language: "en",
    passwordHash: null,
    googleApiKey: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthRequired, setIsAuthRequired] = useState(false);
  const [backupExists, setBackupExists] = useState(false);


  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await db.getInitialData();
      setProducts(data.products);
      setSales(data.sales);
      setCustomers(data.customers);
      setExpenses(data.expenses);
      setSettings(data.settings);
      setBackupExists(data.backupExists);

      // Authentication check
      if (data.settings.passwordHash) {
          setIsAuthRequired(true);
          setIsAuthenticated(false);
      } else {
          setIsAuthRequired(false);
          setIsAuthenticated(true); // Allow access for setup
      }

    } catch (error) {
      console.error("Fatal: Failed to load initial data from database.", error);
      toast({
        variant: "destructive",
        title: "Database Error",
        description: "Could not load data. The database file might be corrupt. Please check the console for details and consider restarting the application.",
        duration: Infinity,
      });
      return;
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);
  
  const translations = getTranslations(settings.language);

  const login = async (password: string): Promise<boolean> => {
    const { success } = await db.login(password);
    if (success) {
        setIsAuthenticated(true);
        toast({ title: "Login Successful", description: "Welcome back!" });
    } else {
        toast({ variant: "destructive", title: "Login Failed", description: "Incorrect password." });
    }
    return success;
  };

  const verifyPassword = async (password: string): Promise<boolean> => {
    return await db.verifyPassword(password);
  }
  
  const logout = () => {
    setIsAuthenticated(false);
    toast({ title: "App Locked", description: "Please enter your password to continue."});
  }

  const setPassword = async (password: string) => {
    await db.setPassword(password);
    await loadInitialData(); // Reload data to get new settings and hash
    setIsAuthRequired(true);
    setIsAuthenticated(true); // Grant access immediately after setup
    toast({ title: "Password Set", description: "Your application is now password protected." });
  };
  
  const addProduct = async (productData: Omit<Product, "id" | "lastUpdatedAt">) => {
    const newProduct = await db.addProduct(productData);
    setProducts(prev => [...prev, newProduct].sort((a, b) => a.name.localeCompare(b.name)));
    toast({ title: "Product Added", description: `${newProduct.name} has been added.` });
  };

  const addMultipleProducts = async (productsData: Omit<Product, 'id' | 'lastUpdatedAt'>[]) => {
    const newProducts = await db.addMultipleProducts(productsData);
    setProducts(prev => [...prev, ...newProducts].sort((a, b) => a.name.localeCompare(b.name)));
    toast({ title: "Products Added", description: `${newProducts.length} new products have been added.` });
  };
  
  const updateProduct = async (updatedProduct: Product) => {
    const returnedProduct = await db.updateProduct(updatedProduct);
    setProducts(prev => prev.map(p => p.id === returnedProduct.id ? returnedProduct : p));
    toast({ title: "Product Updated", description: `${returnedProduct.name} has been updated.` });
  };
  
  const receiveStock = async (productId: string, quantity: number, costPerUnit: number) => {
    const updatedProduct = await db.receiveStock(productId, quantity, costPerUnit);
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    toast({ title: "Stock Received", description: `${quantity} units of ${updatedProduct.name} added.` });
  };

  const addSale = async (saleData: LogSaleFormValues) => {
    try {
      const newSale = await db.addSale(saleData);
      setSales(prev => [newSale, ...prev]);
      // Optimize by updating stock locally instead of refetching all products
      setProducts(prevProducts => {
        return prevProducts.map(p => {
          if (p.id === newSale.productId) {
            return { ...p, stock: p.stock - newSale.quantity };
          }
          return p;
        });
      });
      toast({ title: "Sale Logged", description: `Sale of ${newSale.productName} recorded.` });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error Logging Sale",
            description: error.message || "An unknown error occurred.",
        });
    }
  };
  
  const addCustomer = async (customerData: Omit<Customer, "id" | "createdAt">): Promise<Customer> => {
    const newCustomer = await db.addCustomer(customerData);
    setCustomers(prev => [newCustomer, ...prev]);
    toast({ title: "Customer Added", description: `${newCustomer.name} has been added.` });
    return newCustomer;
  };
  
  const updateCustomer = async (updatedCustomer: Customer) => {
    const returnedCustomer = await db.updateCustomer(updatedCustomer);
    setCustomers(prev => prev.map(c => c.id === returnedCustomer.id ? returnedCustomer : c));
    toast({ title: "Customer Updated", description: `${returnedCustomer.name} has been updated.` });
  };

  const addExpense = async (expenseData: Omit<Expense, "id" | "date">) => {
    const newExpense = await db.addExpense(expenseData);
    setExpenses(prev => [newExpense, ...prev]);
    toast({ title: "Expense Added", description: `${newExpense.description} has been logged.` });
  };
  
  const updateExpense = async (updatedExpense: Expense) => {
    const returnedExpense = await db.updateExpense(updatedExpense);
    setExpenses(prev => prev.map(e => e.id === returnedExpense.id ? returnedExpense : e));
    toast({ title: "Expense Updated", description: `${returnedExpense.description} has been updated.` });
  };

  const deleteExpense = async (id: string) => {
    await db.deleteExpense(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
    toast({ title: "Expense Deleted", description: "The expense record has been removed." });
  };

  const findCustomerByName = (name: string): Customer | undefined => {
    return customers.find(c => c.name.toLowerCase() === name.toLowerCase());
  }

  const updateSettings = async (newSettings: Settings) => {
    const updatedSettings = await db.updateSettings(newSettings);
    setSettings(updatedSettings);
    toast({
      title: "Settings Updated",
      description: "Your changes have been saved.",
    });
  };

  const recreateDatabase = async () => {
    try {
      await db.recreateDatabase();
      toast({
        title: "Database Resetting",
        description: "Your data has been backed up. Reloading the application now...",
      });
      // Log the user out to force re-authentication on the new database.
      logout();
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: "Could not back up and reset the database. Check console for errors.",
      });
    }
  };

  const restoreDatabase = async () => {
      try {
        await db.restoreDatabase();
        toast({
            title: "Database Restoring",
            description: "Your previous data is being restored. Reloading the application now...",
        });
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        toast({
            variant: "destructive",
            title: "Restore Failed",
            description: "Could not restore the database from backup. Check console for errors.",
        });
      }
  };


  const value: AppContextType = {
    products,
    sales,
    customers,
    expenses,
    settings,
    isLoading,
    isAuthenticated,
    isAuthRequired,
    backupExists,
    login,
    logout,
    setPassword,
    verifyPassword,
    loadInitialData,
    addProduct,
    addMultipleProducts,
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
    recreateDatabase,
    restoreDatabase,
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

    

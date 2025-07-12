
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
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadInitialData = useCallback(async (isRetry = false) => {
    setIsLoading(true);
    try {
      const data = await db.getInitialData();
      setProducts(data.products);
      setSales(data.sales);
      setCustomers(data.customers);
      setExpenses(data.expenses);
      setSettings(data.settings);
    } catch (error) {
      console.error("Failed to load initial data", error);
      
      if (!isRetry) {
        console.log("Attempting to recreate database and retrying...");
        try {
          await db.recreateDatabase();
          // After recreating, we need to force a reload of the app to re-establish db connection
          // A simple window reload is the most effective way in this architecture.
          window.location.reload();
        } catch (recreateError) {
          console.error("Failed to recreate database", recreateError);
           toast({
            variant: "destructive",
            title: "Fatal Error",
            description: "Could not create or load the database. Please restart the application.",
            duration: Infinity,
          });
        }
      } else {
         toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load data even after a retry. Please check console logs.",
          duration: Infinity,
        });
      }
    } finally {
      // Only set loading to false if we didn't trigger a reload
      if (isRetry || !('reload' in window)) {
        setIsLoading(false);
      }
    }
  }, [toast]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);
  
  const translations = getTranslations(settings.language);

  const addProduct = async (productData: Omit<Product, "id" | "lastUpdatedAt">) => {
    const newProduct = await db.addProduct(productData);
    setProducts(prev => [...prev, newProduct]);
    toast({ title: "Product Added", description: `${newProduct.name} has been added.` });
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
      // Refetch products to update stock
      const updatedProducts = await db.getProducts();
      setProducts(updatedProducts);
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
      description: "Your changes have been saved to the database.",
    });
  };

  const value: AppContextType = {
    products,
    sales,
    customers,
    expenses,
    settings,
    isLoading,
    loadInitialData,
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

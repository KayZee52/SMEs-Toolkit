
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import type { Product, Sale, Customer, Expense, Settings, AppContextType, LogSaleFormValues } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { getTranslations } from "@/lib/i18n";
import { MOCK_PRODUCTS, MOCK_SALES, MOCK_CUSTOMERS, MOCK_EXPENSES } from "@/lib/mock-data";


const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [sales, setSales] = useState<Sale[]>(MOCK_SALES);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [settings, setSettings] = useState<Settings>({
                businessName: "My Business",
                currency: "USD",
                enableAssistant: true,
                autoSuggestions: true,
                language: "en",
            });
  const [isLoading, setIsLoading] = useState(false);

  const loadInitialData = useCallback(async () => {
    // This is now a mock setup, so we just ensure loading is false.
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);
  
  const translations = getTranslations(settings.language);

  const showMockWarning = () => {
    toast({
      variant: "destructive",
      title: "Action Disabled",
      description: "Database functionality is currently disabled. This is a mock view.",
    });
  }

  const addProduct = async (productData: Omit<Product, "id" | "lastUpdatedAt">) => {
    showMockWarning();
  };
  
  const updateProduct = async (updatedProduct: Product) => {
    showMockWarning();
  };
  
  const receiveStock = async (productId: string, quantity: number, costPerUnit: number) => {
    showMockWarning();
  };

  const addSale = async (saleData: LogSaleFormValues) => {
    showMockWarning();
  };
  
  const addCustomer = async (customerData: Omit<Customer, "id" | "createdAt">): Promise<Customer> => {
    showMockWarning();
    // Return a mock customer to prevent crashes
    return {
      ...customerData,
      id: `cust_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
  };
  
  const updateCustomer = async (updatedCustomer: Customer) => {
    showMockWarning();
  };

  const addExpense = async (expenseData: Omit<Expense, "id" | "date">) => {
    showMockWarning();
  };
  
  const updateExpense = async (updatedExpense: Expense) => {
    showMockWarning();
  };

  const deleteExpense = async (id: string) => {
    showMockWarning();
  };

  const findCustomerByName = (name: string): Customer | undefined => {
    return customers.find(c => c.name.toLowerCase() === name.toLowerCase());
  }

  const updateSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    toast({
      title: "Settings Updated (Mock)",
      description: "Your changes have been updated in this view.",
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

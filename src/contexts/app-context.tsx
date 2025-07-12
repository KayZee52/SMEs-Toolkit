
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import type { Product, Sale, Customer, Expense, Settings, AppContextType, LogSaleFormValues } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { getTranslations } from "@/lib/i18n";
import {
    getInitialData,
    addProduct as addProductAction,
    updateProduct as updateProductAction,
    receiveStock as receiveStockAction,
    addSale as addSaleAction,
    addCustomer as addCustomerAction,
    updateCustomer as updateCustomerAction,
    addExpense as addExpenseAction,
    updateExpense as updateExpenseAction,
    deleteExpense as deleteExpenseAction,
    updateSettings as updateSettingsAction,
} from "@/actions/db";

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

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
      try {
          const data = await getInitialData();
          if(data) {
            setProducts(data.products);
            setSales(data.sales);
            setCustomers(data.customers);
            setExpenses(data.expenses);
            setSettings(data.settings);
          }
      } catch (error) {
          console.error("Failed to load initial data", error);
      } finally {
        setIsLoading(false);
      }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);
  
  const translations = getTranslations(settings.language);

  const addProduct = async (productData: Omit<Product, "id" | "lastUpdatedAt">) => {
    try {
        const newProduct = await addProductAction(productData);
        setProducts(prev => [...prev, newProduct].sort((a,b) => a.name.localeCompare(b.name)));
        toast({ title: "Product Added", description: `${newProduct.name} has been added to inventory.` });
    } catch (error) {
        console.error("Failed to add product:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not add product."});
    }
  };
  
  const updateProduct = async (updatedProduct: Product) => {
    try {
        const productToUpdate = await updateProductAction(updatedProduct);
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? productToUpdate : p));
        toast({ title: "Product Updated", description: `${updatedProduct.name} has been updated.` });
    } catch (error) {
        console.error("Failed to update product:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not update product."});
    }
  };
  
  const receiveStock = async (productId: string, quantity: number, costPerUnit: number) => {
    try {
        const updatedProduct = await receiveStockAction(productId, quantity, costPerUnit);
        setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
        toast({ title: "Stock Received", description: `${quantity} units of ${updatedProduct.name} added.` });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Error", description: errorMessage });
    }
  };


  const addSale = async (saleData: LogSaleFormValues) => {
    try {
        const { newSale, updatedProduct } = await addSaleAction(saleData);
        setSales(prev => [newSale, ...prev]);
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        toast({ title: "Sale Logged", description: `Sold ${saleData.quantity} of ${newSale.productName}.` });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        console.error("Failed to add sale:", error);
        toast({ variant: "destructive", title: "Error", description: errorMessage});
    }
  };
  
  const addCustomer = async (customerData: Omit<Customer, "id" | "createdAt">): Promise<Customer> => {
    try {
        const newCustomer = await addCustomerAction(customerData);
        setCustomers(prev => [...prev, newCustomer].sort((a,b) => a.name.localeCompare(b.name)));
        toast({ title: "Customer Added", description: `${newCustomer.name} has been added.` });
        return newCustomer;
    } catch (error) {
        console.error("Failed to add customer:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not add customer."});
        throw error;
    }
  };
  
  const updateCustomer = async (updatedCustomer: Customer) => {
    try {
        const customer = await updateCustomerAction(updatedCustomer);
        setCustomers(prev => prev.map((c) => (c.id === customer.id ? customer : c)));
        toast({ title: "Customer Updated", description: `${customer.name}'s details have been updated.` });
    } catch(error) {
        console.error("Failed to update customer:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not update customer."});
    }
  };

  const addExpense = async (expenseData: Omit<Expense, "id" | "date">) => {
    try {
        const newExpense = await addExpenseAction(expenseData);
        setExpenses(prev => [newExpense, ...prev]);
        toast({ title: "Expense Logged", description: `${expenseData.description} for ${formatCurrency(expenseData.amount)} has been logged.` });
    } catch (error) {
        console.error("Failed to add expense:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not log expense."});
    }
  };
  
  const updateExpense = async (updatedExpense: Expense) => {
    try {
        const expense = await updateExpenseAction(updatedExpense);
        setExpenses(prev => prev.map((e) => (e.id === expense.id ? expense : e)));
        toast({ title: "Expense Updated", description: `${expense.description} has been updated.` });
    } catch(error) {
        console.error("Failed to update expense:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not update expense."});
    }
  };

  const deleteExpense = async (id: string) => {
    try {
        await deleteExpenseAction(id);
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

  const updateSettings = async (newSettings: Settings) => {
    try {
        const settings = await updateSettingsAction(newSettings);
        setSettings(settings);
        toast({
            title: "Settings Saved",
            description: "Your changes have been successfully saved.",
        });
    } catch (error) {
        console.error("Failed to update settings:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not save settings."});
    }
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

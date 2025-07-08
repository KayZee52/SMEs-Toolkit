"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Product, Sale, Customer } from "@/lib/types";
import { MOCK_PRODUCTS, MOCK_SALES, MOCK_CUSTOMERS } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

interface AppContextType {
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (product: Product) => void;
  addSale: (sale: Omit<Sale, "id" | "total" | "date" | "productName" | "customerName">) => void;
  addCustomer: (customer: Omit<Customer, "id" | "createdAt">) => Customer;
  findCustomerByName: (name: string) => Customer | undefined;
}

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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("dataInitialized") !== "true") {
      setProducts(MOCK_PRODUCTS);
      setSales(MOCK_SALES);
      setCustomers(MOCK_CUSTOMERS);
      localStorage.setItem("dataInitialized", "true");
    }
    setIsInitialized(true);
  }, []);

  const addProduct = (productData: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
    };
    setProducts((prev) => [...prev, newProduct]);
    toast({ title: "Product Added", description: `${newProduct.name} has been added to inventory.` });
  };
  
  const updateProduct = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    toast({ title: "Product Updated", description: `${updatedProduct.name} has been updated.` });
  };

  const addSale = (saleData: Omit<Sale, "id" | "total" | "date" | "productName" | "customerName">) => {
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
    if (saleData.customerId) {
        const customer = customers.find(c => c.id === saleData.customerId);
        if (customer) customerName = customer.name;
    }

    const newSale: Sale = {
      ...saleData,
      id: `sale_${Date.now()}`,
      productName: product.name,
      customerName,
      total: saleData.pricePerUnit * saleData.quantity,
      date: new Date().toISOString(),
    };

    setSales((prev) => [newSale, ...prev]);
    
    const updatedProduct = { ...product, stock: product.stock - saleData.quantity };
    updateProduct(updatedProduct);

    toast({ title: "Sale Logged", description: `Sold ${saleData.quantity} of ${product.name}.` });
  };
  
  const addCustomer = (customerData: Omit<Customer, "id" | "createdAt">): Customer => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [...prev, newCustomer]);
    toast({ title: "Customer Added", description: `${newCustomer.name} has been added.` });
    return newCustomer;
  };

  const findCustomerByName = (name: string): Customer | undefined => {
    return customers.find(c => c.name.toLowerCase() === name.toLowerCase());
  }

  if (!isInitialized) return null;

  return (
    <AppContext.Provider value={{ products, sales, customers, addProduct, updateProduct, addSale, addCustomer, findCustomerByName }}>
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

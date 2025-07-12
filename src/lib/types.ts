
import type { Translation } from "./i18n";

export type Product = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  stock: number;
  price: number;
  cost: number;
  category?: string;
  supplier?: string;
  lastUpdatedAt: string;
};

export type Sale = {
  id: string;
  userId: string;
  productId: string;
  customerId: string | null; // Can be null for walk-in customers
  customerName: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
  profit: number;
  notes?: string;
  date: string;
};

export type Customer = {
  id:string;
  userId: string;
  name: string;
  phone?: string;
  createdAt: string;
  notes?: string;
  type?: "Regular" | "VIP" | "Debtor";
};

export type Expense = {
  id: string;
  userId: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  notes?: string;
};

export type Settings = {
  businessName: string;
  currency: "USD" | "LRD" | "NGN";
  enableAssistant: boolean;
  autoSuggestions: boolean;
  language: "en" | "en-lr" | "fr";
};

export type LogSaleFormValues = {
  productId: string;
  customerId: string; 
  quantity: number;
  pricePerUnit: number;
  notes?: string;
};

export interface AppContextType {
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  expenses: Expense[];
  settings: Settings;
  isLoading: boolean;
  loadInitialData: () => Promise<void>;
  addProduct: (product: Omit<Product, "id" | "lastUpdatedAt" | "userId">) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  receiveStock: (productId: string, quantity: number, costPerUnit: number) => Promise<void>;
  addSale: (sale: LogSaleFormValues) => Promise<void>;
  addCustomer: (customer: Omit<Customer, "id" | "createdAt" | "userId">) => Promise<Customer>;
  updateCustomer: (customer: Customer) => Promise<void>;
  addExpense: (expense: Omit<Expense, "id" | "date" | "userId">) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  findCustomerByName: (name: string) => Customer | undefined;
  updateSettings: (settings: Settings) => Promise<void>;
  translations: Translation;
}

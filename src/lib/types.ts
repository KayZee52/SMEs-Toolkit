
import type { Translation } from "./i18n";

export type Product = {
  id: string;
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
  productId: string;
  customerId: string | null;
  customerName: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
  profit: number;
  notes?: string | null;
  date: string;
};

export type Customer = {
  id:string;
  name: string;
  phone?: string;
  createdAt: string;
  notes?: string | null;
  type?: "Regular" | "VIP" | "Debtor";
};

export type Expense = {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  notes?: string | null;
};

export type Settings = {
  businessName: string;
  currency: "USD" | "LRD" | "NGN";
  enableAssistant: boolean;
  autoSuggestions: boolean;
  language: "en" | "en-lr" | "fr";
  passwordHash: string | null;
};

export type LogSaleFormValues = {
  productId: string;
  customerId?: string; 
  quantity: number;
  pricePerUnit: number;
  notes?: string;
};

export type BulkAddProductFormValues = Omit<Product, "id" | "lastUpdatedAt">;

export interface AppContextType {
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  expenses: Expense[];
  settings: Settings;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAuthRequired: boolean;
  backupExists: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  setPassword: (password: string) => Promise<void>;
  verifyPassword: (password: string) => Promise<boolean>;
  loadInitialData: () => Promise<void>;
  addProduct: (product: Omit<Product, "id" | "lastUpdatedAt">) => Promise<void>;
  addMultipleProducts: (products: Omit<Product, "id" | "lastUpdatedAt">[]) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  receiveStock: (productId: string, quantity: number, costPerUnit: number) => Promise<void>;
  addSale: (sale: LogSaleFormValues) => Promise<void>;
  addCustomer: (customer: Omit<Customer, "id" | "createdAt">) => Promise<Customer>;
  updateCustomer: (customer: Customer) => Promise<void>;
  addExpense: (expense: Omit<Expense, "id" | "date">) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  findCustomerByName: (name: string) => Customer | undefined;
  updateSettings: (settings: Settings, isSecurityUpdate?: boolean) => Promise<void>;
  recreateDatabase: () => Promise<void>;
  restoreDatabase: () => Promise<void>;
  translations: Translation;
}

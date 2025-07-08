
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
  customerId?: string;
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
  name: string;
  phone?: string;
  createdAt: string;
  notes?: string;
  type?: "Regular" | "VIP" | "Debtor";
};

export type Expense = {
  id: string;
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
  customerName?: string;
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
  addProduct: (product: Omit<Product, "id" | "lastUpdatedAt">) => void;
  updateProduct: (product: Product) => void;
  receiveStock: (productId: string, quantity: number, costPerUnit: number) => void;
  addSale: (sale: LogSaleFormValues) => void;
  addCustomer: (customer: Omit<Customer, "id" | "createdAt">) => Customer;
  updateCustomer: (customer: Customer) => void;
  addExpense: (expense: Omit<Expense, "id" | "date">) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  findCustomerByName: (name: string) => Customer | undefined;
  updateSettings: (settings: Settings) => void;
  translations: Translation;
}


import type { Product, Customer, Sale, Expense } from "./types";

export const MOCK_PRODUCTS: Product[] = [
  { id: "prod_1", name: "Classic Leather Wallet", stock: 25, price: 49.99, cost: 15.5, lastUpdatedAt: new Date().toISOString() },
  { id: "prod_2", name: "Stainless Steel Watch", stock: 15, price: 129.99, cost: 45.0, lastUpdatedAt: new Date().toISOString() },
  { id: "prod_3", name: "Canvas Messenger Bag", stock: 30, price: 79.99, cost: 25.0, lastUpdatedAt: new Date().toISOString() },
  { id: "prod_4", name: "Silk Tie", stock: 50, price: 29.99, cost: 8.0, lastUpdatedAt: new Date().toISOString() },
  { id: "prod_5", name: "Wool Scarf", stock: 8, price: 39.99, cost: 12.5, lastUpdatedAt: new Date().toISOString() },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: "cust_1", name: "Alice Johnson", phone: "555-0101", createdAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(), type: "VIP", notes: "Prefers gift wrapping." },
  { id: "cust_2", name: "Bob Williams", phone: "555-0102", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), type: "Regular" },
  { id: "cust_3", name: "Charlie Brown", phone: "555-0103", createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), type: "Debtor", notes: "Owes $20 from last purchase." },
];

export const MOCK_SALES: Sale[] = [
  { id: "sale_1", productId: "prod_2", customerId: "cust_1", customerName: "Alice Johnson", productName: "Stainless Steel Watch", quantity: 1, pricePerUnit: 129.99, total: 129.99, profit: 84.99, date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), notes: "Customer requested gift wrapping." },
  { id: "sale_2", productId: "prod_4", customerId: "cust_2", customerName: "Bob Williams", productName: "Silk Tie", quantity: 2, pricePerUnit: 29.99, total: 59.98, profit: 43.98, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "sale_3", productId: "prod_5", customerName: "Walk-in Customer", productName: "Wool Scarf", quantity: 1, pricePerUnit: 39.99, total: 39.99, profit: 27.49, date: new Date().toISOString() },
  { id: "sale_4", productId: "prod_1", customerId: "cust_1", customerName: "Alice Johnson", productName: "Classic Leather Wallet", quantity: 1, pricePerUnit: 49.99, total: 49.99, profit: 34.49, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }, // A second sale for Alice, within 30 days
  { id: "sale_5", productId: "prod_3", customerId: "cust_3", customerName: "Charlie Brown", productName: "Canvas Messenger Bag", quantity: 1, pricePerUnit: 79.99, total: 79.99, profit: 54.99, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
];

export const MOCK_EXPENSES: Expense[] = [
    { id: "exp_1", description: "Office rent", category: "Rent", amount: 500, date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(), notes: "Monthly rent payment." },
    { id: "exp_2", description: "Fuel for delivery", category: "Transportation", amount: 50, date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString() },
    { id: "exp_3", description: "Packing materials", category: "Supplies", amount: 25, date: new Date().toISOString(), notes: "Boxes and tape." },
    { id: "exp_4", description: "Website hosting", category: "Utilities", amount: 20, date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString() },
    { id: "exp_5", description: "Lunch for team", category: "Other", amount: 45, date: new Date().toISOString() },
    { id: "exp_6", description: "Internet Bill", category: "Utilities", amount: 60, date: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString() },
  ];

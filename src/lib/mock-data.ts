
import type { Product, Customer, Sale, Expense } from "./types";

export const MOCK_PRODUCTS: Omit<Product, 'userId'>[] = [
  { id: "prod_1", name: "Classic Leather Wallet", stock: 25, price: 49.99, cost: 15.5, lastUpdatedAt: new Date().toISOString(), description: "A timeless wallet.", category: "Accessories", supplier: "Leather Co." },
  { id: "prod_2", name: "Stainless Steel Watch", stock: 15, price: 129.99, cost: 45.0, lastUpdatedAt: new Date().toISOString(), description: "Elegant and durable.", category: "Watches", supplier: "Timepiece Inc." },
  { id: "prod_3", name: "Canvas Messenger Bag", stock: 30, price: 79.99, cost: 25.0, lastUpdatedAt: new Date().toISOString(), description: "Perfect for daily use.", category: "Bags", supplier: "Urban Gear" },
  { id: "prod_4", name: "Silk Tie", stock: 50, price: 29.99, cost: 8.0, lastUpdatedAt: new Date().toISOString(), description: "A touch of class.", category: "Accessories", supplier: "Gentlemen's Attire" },
  { id: "prod_5", name: "Wool Scarf", stock: 8, price: 39.99, cost: 12.5, lastUpdatedAt: new Date().toISOString(), description: "Warm and stylish.", category: "Accessories", supplier: "Winter Wears" },
  { id: "prod_6", name: "Cat Food", stock: 100, price: 19.99, cost: 5.0, lastUpdatedAt: new Date().toISOString(), description: "Nutritious and delicious.", category: "Pet Supplies", supplier: "Happy Paws" },
];

export const MOCK_CUSTOMERS: Omit<Customer, 'userId'>[] = [
  { id: "cust_1", name: "Alice Johnson", phone: "555-0101", createdAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(), type: "VIP", notes: "Prefers gift wrapping." },
  { id: "cust_2", name: "Bob Williams", phone: "555-0102", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), type: "Regular" },
  { id: "cust_3", name: "Charlie Brown", phone: "555-0103", createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), type: "Debtor", notes: "Owes $20 from last purchase." },
];

const now = new Date();
const day = 24 * 60 * 60 * 1000;

export const MOCK_SALES: Omit<Sale, 'userId'>[] = [
  // Day -6
  { id: "sale_d6_1", productId: "prod_5", customerName: "Walk-in Customer", productName: "Wool Scarf", quantity: 1, pricePerUnit: 39.99, total: 39.99, profit: 27.49, date: new Date(now.getTime() - 6 * day).toISOString(), customerId: null },
  
  // Day -5
  { id: "sale_d5_1", productId: "prod_4", customerName: "Walk-in Customer", productName: "Silk Tie", quantity: 1, pricePerUnit: 29.99, total: 29.99, profit: 21.99, date: new Date(now.getTime() - 5 * day).toISOString(), customerId: null },

  // Day -4
  { id: "sale_d4_1", productId: "prod_1", customerName: "Walk-in Customer", productName: "Classic Leather Wallet", quantity: 1, pricePerUnit: 49.99, total: 49.99, profit: 34.49, date: new Date(now.getTime() - 4 * day).toISOString(), customerId: null },

  // Day -3
  { id: "sale_d3_1", productId: "prod_2", customerId: "cust_1", customerName: "Alice Johnson", productName: "Stainless Steel Watch", quantity: 1, pricePerUnit: 129.99, total: 129.99, profit: 84.99, date: new Date(now.getTime() - 3 * day).toISOString() },

  // Day -2
  { id: "sale_d2_1", productId: "prod_6", customerId: "cust_2", customerName: "Bob Williams", productName: "Cat Food", quantity: 5, pricePerUnit: 19.99, total: 99.95, profit: 74.95, date: new Date(now.getTime() - 2 * day).toISOString() },
  { id: "sale_d2_2", productId: "prod_3", customerName: "Walk-in Customer", productName: "Canvas Messenger Bag", quantity: 1, pricePerUnit: 79.99, total: 79.99, profit: 54.99, date: new Date(now.getTime() - 2 * day).toISOString(), customerId: null },

  // Day -1
  { id: "sale_d1_1", productId: "prod_6", customerName: "Walk-in Customer", productName: "Cat Food", quantity: 15, pricePerUnit: 19.99, total: 299.85, profit: 224.85, date: new Date(now.getTime() - 1 * day).toISOString(), customerId: null },

  // Today
  { id: "sale_d0_1", productId: "prod_6", customerId: "cust_1", customerName: "Alice Johnson", productName: "Cat Food", quantity: 50, pricePerUnit: 19.99, total: 999.50, profit: 749.50, date: new Date(now.getTime() - 1 * 1000).toISOString() },
];

export const MOCK_EXPENSES: Omit<Expense, 'userId'>[] = [
    { id: "exp_1", description: "Office rent", category: "Rent", amount: 500, date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(), notes: "Monthly rent payment." },
    { id: "exp_2", description: "Fuel for delivery", category: "Transportation", amount: 50, date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString() },
    { id: "exp_3", description: "Packing materials", category: "Supplies", amount: 25, date: new Date().toISOString(), notes: "Boxes and tape." },
    { id: "exp_4", description: "Website hosting", category: "Utilities", amount: 20, date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString() },
    { id: "exp_5", description: "Lunch for team", category: "Other", amount: 45, date: new Date().toISOString() },
    { id: "exp_6", description: "Internet Bill", category: "Utilities", amount: 60, date: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString() },
  ];

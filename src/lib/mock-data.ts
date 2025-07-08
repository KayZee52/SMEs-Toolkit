import type { Product, Customer, Sale } from "./types";

export const MOCK_PRODUCTS: Product[] = [
  { id: "prod_1", name: "Classic Leather Wallet", stock: 25, price: 49.99, cost: 15.5 },
  { id: "prod_2", name: "Stainless Steel Watch", stock: 15, price: 129.99, cost: 45.0 },
  { id: "prod_3", name: "Canvas Messenger Bag", stock: 30, price: 79.99, cost: 25.0 },
  { id: "prod_4", name: "Silk Tie", stock: 50, price: 29.99, cost: 8.0 },
  { id: "prod_5", name: "Wool Scarf", stock: 8, price: 39.99, cost: 12.5 },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: "cust_1", name: "Alice Johnson", phone: "555-0101", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "cust_2", name: "Bob Williams", phone: "555-0102", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
];

export const MOCK_SALES: Sale[] = [
  { id: "sale_1", productId: "prod_2", customerId: "cust_1", customerName: "Alice Johnson", productName: "Stainless Steel Watch", quantity: 1, pricePerUnit: 129.99, total: 129.99, profit: 84.99, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), notes: "Customer requested gift wrapping." },
  { id: "sale_2", productId: "prod_4", customerId: "cust_2", customerName: "Bob Williams", productName: "Silk Tie", quantity: 2, pricePerUnit: 29.99, total: 59.98, profit: 43.98, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "sale_3", productId: "prod_5", customerName: "Walk-in Customer", productName: "Wool Scarf", quantity: 1, pricePerUnit: 39.99, total: 39.99, profit: 27.49, date: new Date().toISOString() },
];

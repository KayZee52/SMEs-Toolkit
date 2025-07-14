'use server';

import * as dbService from '@/services/db';
import type {
  Product,
  Sale,
  Customer,
  Expense,
  Settings,
  LogSaleFormValues,
} from '@/lib/types';

export async function getProducts(): Promise<Product[]> {
  return await dbService.getProducts();
}

export async function getSales(): Promise<Sale[]> {
  return await dbService.getSales();
}

export async function getCustomers(): Promise<Customer[]> {
  return await dbService.getCustomers();
}

export async function getExpenses(): Promise<Expense[]> {
  return await dbService.getExpenses();
}

export async function getSettings(): Promise<Settings> {
  return await dbService.getSettings();
}

export async function doesBackupExist(): Promise<boolean> {
  return await dbService.doesBackupExist();
}

export async function getInitialData() {
  return await dbService.getInitialData();
}

// Auth Actions
export async function login(password: string): Promise<{ success: boolean }> {
    return await dbService.login(password);
}

export async function verifyPassword(password: string): Promise<boolean> {
    return await dbService.verifyPassword(password);
}

export async function setPassword(password: string): Promise<void> {
    return await dbService.setPassword(password);
}

// Data Mutation Actions
export async function addProduct(productData: Omit<Product, 'id' | 'lastUpdatedAt'>): Promise<Product> {
  return await dbService.addProduct(productData);
}

export async function addMultipleProducts(productsData: Omit<Product, 'id' | 'lastUpdatedAt'>[]): Promise<Product[]> {
  return await dbService.addMultipleProducts(productsData);
}

export async function updateProduct(updatedProduct: Product): Promise<Product> {
  return await dbService.updateProduct(updatedProduct);
}

export async function receiveStock(productId: string, quantity: number, costPerUnit: number): Promise<Product> {
  return await dbService.receiveStock(productId, quantity, costPerUnit);
}

export async function addSale(saleData: LogSaleFormValues): Promise<Sale> {
  return await dbService.addSale(saleData);
}

export async function addCustomer(customerData: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
  return await dbService.addCustomer(customerData);
}

export async function updateCustomer(updatedCustomer: Customer): Promise<Customer> {
  return await dbService.updateCustomer(updatedCustomer);
}

export async function addExpense(expenseData: Omit<Expense, 'id' | 'date'>): Promise<Expense> {
  return await dbService.addExpense(expenseData);
}

export async function updateExpense(updatedExpense: Expense): Promise<Expense> {
  return await dbService.updateExpense(updatedExpense);
}

export async function deleteExpense(id: string): Promise<{ id: string }> {
  return await dbService.deleteExpense(id);
}

export async function updateSettings(newSettings: Settings): Promise<Settings> {
  return await dbService.updateSettings(newSettings);
}

export async function recreateDatabase(): Promise<{success: boolean}> {
  return await dbService.recreateDatabase();
}

export async function restoreDatabase(): Promise<{success: boolean}> {
  return await dbService.restoreDatabase();
}

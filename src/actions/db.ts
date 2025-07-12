
'use server';

import type { Product, Sale, Customer, Expense, Settings, LogSaleFormValues } from "@/lib/types";

// NOTE: All database functionality has been removed to start fresh.
// We will rebuild these functions step-by-step.

export async function getProducts(): Promise<Product[]> {
    return [];
}

export async function getSales(): Promise<Sale[]> {
    return [];
}

export async function getCustomers(): Promise<Customer[]> {
    return [];
}

export async function getExpenses(): Promise<Expense[]> {
    return [];
}

export async function getSettings(): Promise<Settings> {
    const defaultSettings: Settings = {
        businessName: "My Business",
        currency: "USD",
        enableAssistant: true,
        autoSuggestions: true,
        language: "en",
    };
    return defaultSettings;
}

export async function getInitialData() {
    return {
        products: [],
        sales: [],
        customers: [],
        expenses: [],
        settings: await getSettings(),
    }
}

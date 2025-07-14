"use server";

import * as aiService from "@/services/ai";
import type { Product, Sale, Expense, Customer, Settings } from "@/lib/types";

export async function getAiReply(
  query: string,
  context: {
    products: Product[];
    sales: Sale[];
    expenses: Expense[];
    customers: Customer[];
    settings: Pick<Settings, 'businessName' | 'currency'>;
  }
) {
  return await aiService.getAiReply(query, context);
}

export async function getCustomerInfoFromText(salesLog: string) {
  return await aiService.getCustomerInfoFromText(salesLog);
}

export async function generateDescriptionForProduct(
  productName: string,
  category?: string
) {
  return await aiService.generateDescriptionForProduct(productName, category);
}

export async function getReportSummary(context: {
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
  dateRange: { from: string; to: string };
}) {
  return await aiService.getReportSummary(context);
}

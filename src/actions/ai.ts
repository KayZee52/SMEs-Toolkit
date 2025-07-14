
"use server";

import { kemzAssistant } from "@/ai/flows/kemz-assistant-flow";
import { generateProductDescription } from "@/ai/flows/generate-product-description";
import { extractCustomerInfo } from "@/ai/flows/extract-customer-info";
import { summarizeReport } from "@/ai/flows/summarize-report-flow";
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
  try {
    const result = await kemzAssistant({ query, ...context });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `AI request failed: ${errorMessage}` };
  }
}

export async function getCustomerInfoFromText(salesLog: string) {
  try {
    const result = await extractCustomerInfo({ salesLog });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `Failed to extract customer info: ${errorMessage}` };
  }
}

export async function generateDescriptionForProduct(
  productName: string,
  category?: string
) {
  try {
    const result = await generateProductDescription({
      productName,
      productCategory: category,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `Failed to generate description: ${errorMessage}` };
  }
}

export async function getReportSummary(context: {
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
  dateRange: { from: string; to: string };
}) {
  try {
    const result = await summarizeReport(context);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `AI request failed: ${errorMessage}` };
  }
}

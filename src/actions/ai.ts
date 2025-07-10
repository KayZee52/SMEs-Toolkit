
"use server";

import { aiAssistedQuery } from "@/ai/flows/ai-powered-query-assistance";
import { generateProductDescription } from "@/ai/flows/generate-product-description";
import { extractCustomerInfo } from "@/ai/flows/extract-customer-info";
import { summarizeReport } from "@/ai/flows/summarize-report-flow";
import type { Product, Sale, Expense } from "@/lib/types";
import { getSession } from "./auth";

// Helper to ensure all actions are authenticated
async function checkAuth() {
    const session = await getSession();
    if (!session) {
        throw new Error("User not authenticated");
    }
    return session;
}


export async function getAiReply(
  query: string,
  context: { products: Product[]; sales: Sale[] }
) {
  await checkAuth();
  try {
    const result = await aiAssistedQuery({ query, ...context });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `AI request failed: ${errorMessage}` };
  }
}

export async function getCustomerInfoFromText(salesLog: string) {
  await checkAuth();
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
  await checkAuth();
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
  await checkAuth();
  try {
    const result = await summarizeReport(context);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `AI request failed: ${errorMessage}` };
  }
}

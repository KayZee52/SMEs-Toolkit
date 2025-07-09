
"use server";

import { aiAssistedQuery } from "@/ai/flows/ai-powered-query-assistance";
import { generateProductDescription } from "@/ai/flows/generate-product-description";
import { extractCustomerInfo } from "@/ai/flows/extract-customer-info";
import type { Product, Sale } from "@/lib/types";

export async function getAiReply(
  query: string,
  context: { products: Product[]; sales: Sale[] }
) {
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

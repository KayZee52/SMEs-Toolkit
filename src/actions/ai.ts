
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
    return { success: false, error: "Failed to get AI reply." };
  }
}

export async function getCustomerInfoFromText(salesLog: string) {
  try {
    const result = await extractCustomerInfo({ salesLog });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to extract customer info." };
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
    return { success: false, error: "Failed to generate description." };
  }
}

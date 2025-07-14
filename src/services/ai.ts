
"use server";

import { kemzAssistant } from "@/ai/flows/kemz-assistant-flow";
import { generateProductDescription } from "@/ai/flows/generate-product-description";
import { extractCustomerInfo } from "@/ai/flows/extract-customer-info";
import { summarizeReport } from "@/ai/flows/summarize-report-flow";
import type { Product, Sale, Expense, Customer, Settings } from "@/lib/types";
import { getSettings } from "./db";

async function getCallOptions() {
    const settings = await getSettings();
    const apiKey = settings.googleApiKey;
    if (!apiKey) {
      throw new Error("API_KEY_NOT_SET");
    }
    return { apiKey };
}

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
    const { apiKey } = await getCallOptions();
    const result = await kemzAssistant({ query, ...context, apiKey });
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    if (errorMessage.includes("API_KEY_NOT_SET")) {
        return { success: false, error: "The Google AI API key is not set. Please add it in the settings to enable AI features." };
    }
    return { success: false, error: `AI request failed. Please check if your API key is valid.` };
  }
}

export async function getCustomerInfoFromText(salesLog: string) {
  try {
    const { apiKey } = await getCallOptions();
    const result = await extractCustomerInfo({ salesLog, apiKey });
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    if (errorMessage.includes("API_KEY_NOT_SET")) {
        return { success: false, error: "The Google AI API key is not set. Please add it in the settings to enable AI features." };
    }
    return { success: false, error: `Failed to extract customer info: ${errorMessage}` };
  }
}

export async function generateDescriptionForProduct(
  productName: string,
  category?: string
) {
  try {
    const { apiKey } = await getCallOptions();
    const result = await generateProductDescription(
      {
        productName,
        productCategory: category,
        apiKey,
      }
    );
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    if (errorMessage.includes("API_KEY_NOT_SET")) {
        return { success: false, error: "The Google AI API key is not set. Please add it in the settings to enable AI features." };
    }
    return { success: false, error: `Failed to generate description. Please check if your API key is valid.` };
  }
}

export async function getReportSummary(context: {
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
  dateRange: { from: string; to: string };
}) {
  try {
    const { apiKey } = await getCallOptions();
    const result = await summarizeReport({ ...context, apiKey });
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
     if (errorMessage.includes("API_KEY_NOT_SET")) {
        return { success: false, error: "The Google AI API key is not set. Please add it in the settings to enable AI features." };
    }
    return { success: false, error: `AI request failed. Please check if your API key is valid.` };
  }
}

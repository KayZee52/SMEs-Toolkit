
"use server";

import { kemzAssistant } from "@/ai/flows/kemz-assistant-flow";
import { generateProductDescription } from "@/ai/flows/generate-product-description";
import { extractCustomerInfo } from "@/ai/flows/extract-customer-info";
import { summarizeReport } from "@/ai/flows/summarize-report-flow";
import type { Product, Sale, Expense, Customer, Settings } from "@/lib/types";

function handleError(error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    if (errorMessage.includes("API key not valid") || errorMessage.includes("API key is invalid")) {
        return { success: false, error: "Your Google AI API key is not valid. Please check it in the settings or .env file." };
    }
     if (errorMessage.includes("permission")) {
        return { success: false, error: "The API key is valid, but it may not be enabled for the Gemini API. Please check your Google Cloud project." };
    }
    return { success: false, error: `An AI error occurred: ${errorMessage}` };
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
    if (!process.env.GOOGLE_API_KEY) {
       return { success: false, error: "Google AI API key is not configured. Please set it in the .env file." };
    }
    const result = await kemzAssistant({ query, ...context });
    return { success: true, data: result };
  } catch (error) {
    return handleError(error);
  }
}

export async function getCustomerInfoFromText(salesLog: string) {
  try {
     if (!process.env.GOOGLE_API_KEY) {
       return { success: false, error: "Google AI API key is not configured. Please set it in the .env file." };
    }
    const result = await extractCustomerInfo({ salesLog });
    return { success: true, data: result };
  } catch (error) {
    return handleError(error);
  }
}

export async function generateDescriptionForProduct(
  productName: string,
  category?: string
) {
  try {
     if (!process.env.GOOGLE_API_KEY) {
       return { success: false, error: "Google AI API key is not configured. Please set it in the .env file." };
    }
    const result = await generateProductDescription(
      {
        productName,
        productCategory: category,
      }
    );
    return { success: true, data: result };
  } catch (error) {
    return handleError(error);
  }
}

export async function getReportSummary(context: {
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
  dateRange: { from: string; to: string };
}) {
  try {
     if (!process.env.GOOGLE_API_KEY) {
       return { success: false, error: "Google AI API key is not configured. Please set it in the .env file." };
    }
    const result = await summarizeReport({ ...context });
    return { success: true, data: result };
  } catch (error) {
    return handleError(error);
  }
}


"use server";

import { kemzAssistant } from "@/ai/flows/kemz-assistant-flow";
import { generateProductDescription } from "@/ai/flows/generate-product-description";
import { extractCustomerInfo } from "@/ai/flows/extract-customer-info";
import { summarizeReport } from "@/ai/flows/summarize-report-flow";
import type { Product, Sale, Expense, Customer, Settings } from "@/lib/types";

// Helper function to introduce a delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry utility
async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 1000, finalErrMessage: string = "An unknown AI error occurred."): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      // Check for API key before every attempt
      if (!process.env.GOOGLE_API_KEY) {
        throw new Error("Google AI API key is not configured. Please set it in the .env file.");
      }
      return await fn();
    } catch (error) {
      lastError = error;
      if (error instanceof Error && (error.message.includes('503') || error.message.toLowerCase().includes('overloaded'))) {
        console.log(`AI service unavailable, attempt ${i + 1} of ${retries}. Retrying in ${delay}ms...`);
        await sleep(delay);
        delay *= 2; // Exponential backoff
        continue;
      }
      // For other errors, including API key errors, fail immediately
      throw error;
    }
  }
  // If all retries fail on a recoverable error
  if (lastError instanceof Error) {
       if (lastError.message.includes('503') || lastError.message.toLowerCase().includes('overloaded')) {
            throw new Error("The AI model is temporarily overloaded. Please try again in a few moments.");
       }
  }
  throw lastError;
}


function handleError(error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    if (errorMessage.includes("API key not valid") || errorMessage.includes("API key is invalid")) {
        return { success: false, error: "Your Google AI API key is not valid. Please check it in the settings or .env file." };
    }
     if (errorMessage.includes("permission")) {
        return { success: false, error: "The API key is valid, but it may not be enabled for the Gemini API. Please check your Google Cloud project." };
    }
    if (errorMessage.includes("not configured")) {
        return { success: false, error: errorMessage };
    }
    return { success: false, error: `AI Error: ${errorMessage}` };
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
    const result = await retry(() => kemzAssistant({ query, ...context }));
    return { success: true, data: result };
  } catch (error) {
    return handleError(error);
  }
}

export async function getCustomerInfoFromText(salesLog: string) {
  try {
    const result = await retry(() => extractCustomerInfo({ salesLog }));
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
    const result = await retry(() => generateProductDescription(
      {
        productName,
        productCategory: category,
      }
    ));
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
    const result = await retry(() => summarizeReport({ ...context }));
    return { success: true, data: result };
  } catch (error) {
    return handleError(error);
  }
}

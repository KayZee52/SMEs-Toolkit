"use server";

import { aiAssistedQuery } from "@/ai/flows/ai-powered-query-assistance";
import { extractCustomerInfo } from "@/ai/flows/extract-customer-info";

export async function getAiReply(query: string) {
  try {
    const result = await aiAssistedQuery({ query });
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

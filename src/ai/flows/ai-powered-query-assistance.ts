
'use server';

/**
 * @fileOverview An AI assistant that answers natural language queries about sales data and inventory.
 *
 * - aiAssistedQuery - A function that handles the AI-assisted query process.
 * - AiAssistedQueryInput - The input type for the aiAssistedQuery function.
 * - AiAssistedQueryOutput - The return type for the aiAssistedQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Zod schemas for data types, mirroring src/lib/types.ts
const ProductSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    stock: z.number(),
    price: z.number(),
    cost: z.number(),
    category: z.string().optional(),
    supplier: z.string().optional(),
    lastUpdatedAt: z.string(),
});

const SaleSchema = z.object({
    id: z.string(),
    productId: z.string(),
    customerId: z.string().nullable().optional(),
    customerName: z.string(),
    productName: z.string(),
    quantity: z.number(),
    pricePerUnit: z.number(),
    total: z.number(),
    profit: z.number(),
    notes: z.string().nullable().optional(),
    date: z.string(),
});

const ExpenseSchema = z.object({
  id: z.string(),
  description: z.string(),
  category: z.string(),
  amount: z.number(),
  date: z.string(),
  notes: z.string().nullable().optional(),
});

const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string().optional(),
  createdAt: z.string(),
  notes: z.string().nullable().optional(),
  type: z.enum(["Regular", "VIP", "Debtor"]).optional(),
});

const SettingsSchema = z.object({
    businessName: z.string(),
    currency: z.string(),
});

const AiAssistedQueryInputSchema = z.object({
  query: z.string().describe('The natural language query from the user.'),
  products: z.array(ProductSchema).describe('The list of all products in inventory.'),
  sales: z.array(SaleSchema).describe('The list of all sales transactions.'),
  expenses: z.array(ExpenseSchema).describe('The list of all expense transactions.'),
  customers: z.array(CustomerSchema).describe('The list of all customers.'),
  settings: SettingsSchema.describe('General business settings.'),
});
export type AiAssistedQueryInput = z.infer<typeof AiAssistedQueryInputSchema>;

// This is the schema for the prompt's input, which extends the flow's input.
const PromptInputSchema = AiAssistedQueryInputSchema.extend({
    currentDate: z.string().describe("The current date in ISO format, to be used as a reference for 'today'."),
});

const AiAssistedQueryOutputSchema = z.object({
  answer: z.string().describe('The answer to the query.'),
});
export type AiAssistedQueryOutput = z.infer<typeof AiAssistedQueryOutputSchema>;

export async function aiAssistedQuery(input: AiAssistedQueryInput): Promise<AiAssistedQueryOutput> {
  return aiAssistedQueryFlow(input);
}

// Define the prompt at the top level, outside the flow.
const prompt = ai.definePrompt({
  name: 'aiAssistedQueryPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: { schema: PromptInputSchema }, // Use the extended schema
  output: { schema: AiAssistedQueryOutputSchema },
  system: `You are Ma-D, an expert AI business analyst for a small business. Your goal is to provide insightful answers based on the complete business data provided.

**Core Instructions:**

1.  **Identity Response:** If the user asks who you are, what you are, or anything about yourself, you MUST respond with this exact text and nothing else: "Hello! I’m Ma-D — your digital business buddy. I’m here to help you manage your sales, inventory, reports, and more — all in one smart, simple toolkit. Whether you’re running a shop, a startup, or something in between, I’ve got your back. Just ask me anything!"

2.  **Data Analysis:** You are given the complete business data in JSON format: sales, products, expenses, customers, and business settings. You must use this data to answer the user's query. Use the provided 'currentDate' as your reference for today.
    *   **Profitability**: To determine profit, use the 'profit' field in sales records or calculate it as (price - cost) * quantity. Net profit is total sales revenue minus total expenses.
    *   **Top Performers**: To find top-selling or most profitable products, you must aggregate the 'total' or 'profit' fields from the 'sales' data, grouping by product.
    *   **Inventory Status**: Check the 'stock' field in the 'products' data. "Low stock" is generally considered to be less than 10 units.
    *   **Inventory Forecasting**: To predict when an item will run out, calculate its average daily sales over the last 30 days and divide its current 'stock' by that average.
    *   **Customer Analysis**: Identify top customers by summing their total spending from sales data. Identify debtors by checking for customers with type 'Debtor'.
    *   **Date Filtering**: You must filter data based on the 'date' field to answer time-based questions (e.g., "this week", "today", "last month").

3.  **General Knowledge & Advice:** For questions not related to the provided business data, use your general knowledge to provide helpful and concise business advice. For example, "Suggest marketing ideas for my store" or "How can I improve customer loyalty?".

4.  **Formatting & Tone:**
    *   When presenting currency, use the currency symbol from the settings (e.g., $, L$, ₦). Format it with two decimal places (e.g., $1,234.56).
    *   Your tone should be helpful, professional, and encouraging.
    *   IMPORTANT: Always respond with just the final, user-facing text answer in the 'answer' field. Do not output JSON.
`,
  prompt: `
  Current Date: {{{currentDate}}}

  Business Data:
  Settings: {{{json settings}}}
  Products: {{{json products}}}
  Sales: {{{json sales}}}
  Expenses: {{{json expenses}}}
  Customers: {{{json customers}}}

  User Query: {{{query}}}
  `,
});


const aiAssistedQueryFlow = ai.defineFlow(
  {
    name: 'aiAssistedQueryFlow',
    inputSchema: AiAssistedQueryInputSchema,
    outputSchema: AiAssistedQueryOutputSchema,
  },
  async (flowInput) => {
    // Call the single, top-level prompt with all the necessary data.
    const response = await prompt({
        ...flowInput,
        currentDate: new Date().toISOString(),
    });
    
    const output = response.output;

    if (output?.answer) {
      return output;
    }
    
    // Fallback in case structured output fails
    const textResponse = response.text;
    if (textResponse) {
        // Attempt to parse if it's a JSON string with an answer key
        try {
            const parsed = JSON.parse(textResponse);
            if (parsed.answer) return { answer: parsed.answer };
        } catch (e) {
            // Not a JSON string, so return the raw text
            return { answer: textResponse };
        }
        return { answer: textResponse };
    }

    throw new Error("AI failed to generate a valid response.");
  }
);

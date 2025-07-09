
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
    customerId: z.string().optional(),
    customerName: z.string(),
    productName: z.string(),
    quantity: z.number(),
    pricePerUnit: z.number(),
    total: z.number(),
    profit: z.number(),
    notes: z.string().optional(),
    date: z.string(),
});

const AiAssistedQueryInputSchema = z.object({
  query: z.string().describe('The natural language query about sales data or inventory.'),
  products: z.array(ProductSchema).describe('The list of all products in inventory.'),
  sales: z.array(SaleSchema).describe('The list of all sales transactions.'),
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
  system: `You are Ma-D, a helpful AI assistant and digital business buddy from KEMZ. Your goal is to answer questions about sales data, provide business insights, and represent the KEMZ brand based on the knowledge provided.

**Core Instructions:**

1.  **Identity Response:** If the user asks who you are, what you are, or anything about yourself, you MUST respond with this exact text and nothing else: "Hello! I’m Ma-D — your digital business buddy from KEMZ. I’m here to help you manage your sales, inventory, reports, and more — all in one smart, simple toolkit. Whether you’re running a shop, a startup, or something in between, I’ve got your back. Just ask me anything!"

2.  **KEMZ Knowledge:** If asked about KEMZ, its founder, services, or products, you must use the information provided in the "KEMZ Internal Knowledge Base" section below. Your tone should be friendly, helpful, proud, and down-to-earth.

3.  **Data Analysis:** You will be given a user's query, the current date, and complete inventory and sales data in JSON format. Your task is to analyze this data to answer the user's query. Here are your capabilities:
    *   **Inventory Status**: To check stock levels, refer to the 'stock' field for each item in the 'products' data.
    *   **Sales Summary**: To get sales totals for a period (e.g., today, this week), you must filter the 'sales' data by the 'date' field. Use the provided 'currentDate' as your reference for today.
    *   **Product Profitability**: To find the most profitable product, you must calculate the total profit for each product. The profit for a single sale is already provided as the 'profit' field in each sale object. You need to sum these profits grouped by 'productName'.
    *   **Top-Selling Products**: To find the best-selling products, you must sum the 'total' field for each sale, grouped by 'productName'.
    *   **Inventory Forecasting**: To predict when an item will run out of stock, calculate its average daily sales over the last 30 days and divide its current 'stock' by that daily average.

4.  **Formatting & Tone:**
    *   When presenting currency, format it with a dollar sign and two decimal places (e.g., $1,234.56).
    *   Be concise and friendly in your response.
    *   IMPORTANT: Always respond with just the final, user-facing text answer in the 'answer' field. Do not output JSON.

---

**KEMZ Internal Knowledge Base:**

*   **Brand Name:** KEMZ
*   **What is KEMZ?** KEMZ is a modern Liberian tech company dedicated to empowering individuals and small businesses through technology, mentorship, and practical digital solutions.
*   **Mission:** To deliver exceptional tech support and mentorship with practical, innovative solutions that help individuals and businesses grow in the digital age.
*   **Vision:** To be a leading force in the tech industry, simplifying and elevating the digital experience across Liberia and beyond.
*   **Core Values:** Innovation, Integrity, Excellence, Customer-Centricity, Continuous Learning, Collaboration.
*   **Main Services:**
    1.  **Tech Support:** Troubleshooting, device maintenance, tech consultations.
    2.  **Mentorship:** Tech skills development, career coaching, project guidance.
    3.  **Consulting:** Tech strategy planning, digital transformation, tailored software solutions.
*   **Flagship Product (This App):** The SME Digital Toolkit is a desktop-based business management software for small and medium-sized enterprises (SMEs), with both offline-first and AI-powered support. It features sales/inventory/expense tracking, customer management, reports, and AI assistance from Ma-D.
*   **Partnerships:** KEMZ collaborates with LISAC Liberia, Wannie Studios, and local academic institutions.
*   **Initiatives:** KEMZ runs KEMZ SAFENET (a cybersecurity initiative), Student Mentorship Tracks, and developed ResQNet (an AI emergency response app).
*   **Founder:** Kelvin Zammie, a Liberian tech educator, cybersecurity student, and visionary entrepreneur focused on using technology to unlock grassroots potential.
`,
  prompt: `
  Current Date: {{{currentDate}}}

  Data:
  Products: {{{json products}}}
  Sales: {{{json sales}}}

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


'use server';

/**
 * @fileOverview An AI assistant that answers natural language queries about sales data and inventory using tools.
 *
 * - aiAssistedQuery - A function that handles the AI-assisted query process.
 * - AiAssistedQueryInput - The input type for the aiAssistedQuery function.
 * - AiAssistedQueryOutput - The return type for the aiAssistedQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {subDays} from 'date-fns';

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

const AiAssistedQueryOutputSchema = z.object({
  answer: z.string().describe('The answer to the query.'),
});
export type AiAssistedQueryOutput = z.infer<typeof AiAssistedQueryOutputSchema>;

export async function aiAssistedQuery(input: AiAssistedQueryInput): Promise<AiAssistedQueryOutput> {
  return aiAssistedQueryFlow(input);
}

const aiAssistedQueryFlow = ai.defineFlow(
  {
    name: 'aiAssistedQueryFlow',
    inputSchema: AiAssistedQueryInputSchema,
    outputSchema: AiAssistedQueryOutputSchema,
  },
  async (flowInput) => {
    // Tools are defined within the flow to have access to the data passed in the input.
    const getInventoryStatus = ai.defineTool(
      {
        name: 'getInventoryStatus',
        description: 'Get the current stock levels for all products or a specific product.',
        inputSchema: z.object({ productName: z.string().optional().describe("The name of a specific product to check.") }),
        outputSchema: z.array(z.object({ name: z.string(), stock: z.number() })),
      },
      async ({ productName }) => {
        if (productName) {
            const product = flowInput.products.find(p => p.name.toLowerCase() === productName.toLowerCase());
            return product ? [{ name: product.name, stock: product.stock }] : [];
        }
        return flowInput.products.map(p => ({ name: p.name, stock: p.stock }));
      }
    );

    const getSalesSummary = ai.defineTool(
        {
            name: 'getSalesSummary',
            description: "Get a summary of sales totals over a given period. Default is today (1 day).",
            inputSchema: z.object({
                periodInDays: z.number().optional().describe("The number of past days to summarize. e.g., 1 for today, 7 for the last week.")
            }),
            outputSchema: z.object({ totalRevenue: z.number(), totalProfit: z.number(), itemsSold: z.number() })
        },
        async ({ periodInDays = 1 }) => {
            const fromDate = subDays(new Date(), periodInDays);
            const filteredSales = flowInput.sales.filter(s => new Date(s.date) >= fromDate);

            const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
            const totalProfit = filteredSales.reduce((sum, s) => sum + s.profit, 0);
            const itemsSold = filteredSales.reduce((sum, s) => sum + s.quantity, 0);
            
            return { totalRevenue, totalProfit, itemsSold };
        }
    );

    const getProductProfitability = ai.defineTool(
        {
            name: 'getProductProfitability',
            description: 'Get a list of products ranked by their total profitability. Can be used to find the most or least profitable product.',
            inputSchema: z.object({}), // No input needed, uses data from the flow's context.
            outputSchema: z.array(z.object({ name: z.string(), totalProfit: z.number() }))
        },
        async () => {
            const profitability: Record<string, number> = {};
            for (const sale of flowInput.sales) {
                profitability[sale.productName] = (profitability[sale.productName] || 0) + sale.profit;
            }
            
            return Object.entries(profitability)
                .map(([name, totalProfit]) => ({ name, totalProfit }))
                .sort((a, b) => b.totalProfit - a.totalProfit);
        }
    );

    const prompt = ai.definePrompt({
      name: 'aiAssistedQueryPromptWithTools',
      model: 'googleai/gemini-1.5-flash-latest',
      tools: [getInventoryStatus, getSalesSummary, getProductProfitability],
      system: `You are a helpful AI assistant for a small business owner. Your goal is to answer questions about sales data and inventory.
      Use the available tools to find the information needed to answer the user's query.
      When presenting currency, format it with a dollar sign and two decimal places (e.g., $1,234.56).
      Be concise and friendly in your response.`,
      output: {schema: AiAssistedQueryOutputSchema},
    });

    const {output} = await prompt({ query: flowInput.query });
    return output!;
  }
);

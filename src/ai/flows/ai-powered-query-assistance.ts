
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
import {subDays, startOfDay} from 'date-fns';

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
    lastUpdatedAt: z.string().optional(),
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
            description: "Get a summary of sales totals over a given period of days.",
            inputSchema: z.object({
                periodInDays: z.number().describe("The number of past days to summarize. For 'today', use 1. For 'this week' or 'last 7 days', use 7.")
            }),
            outputSchema: z.object({ totalRevenue: z.number(), totalProfit: z.number(), itemsSold: z.number() })
        },
        async ({ periodInDays = 1 }) => {
            const fromDate = startOfDay(subDays(new Date(), periodInDays - 1));
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
    
    const getTopSellingProducts = ai.defineTool(
        {
            name: 'getTopSellingProducts',
            description: 'Get a list of products ranked by total sales revenue. Can be used to find the best-selling products.',
            inputSchema: z.object({}),
            outputSchema: z.array(z.object({ name: z.string(), totalRevenue: z.number() }))
        },
        async () => {
            const productRevenue: Record<string, number> = {};
            for (const sale of flowInput.sales) {
                productRevenue[sale.productName] = (productRevenue[sale.productName] || 0) + sale.total;
            }

            return Object.entries(productRevenue)
                .map(([name, totalRevenue]) => ({ name, totalRevenue }))
                .sort((a, b) => b.totalRevenue - a.totalRevenue);
        }
    );

    const getInventoryForecast = ai.defineTool(
      {
        name: 'getInventoryForecast',
        description: 'Forecasts inventory levels based on recent sales velocity to predict when products might run out of stock.',
        inputSchema: z.object({ productName: z.string().optional().describe("The specific product to forecast. If omitted, forecasts for all products with recent sales.") }),
        outputSchema: z.array(z.object({
            productName: z.string(),
            stock: z.number(),
            thirtyDaySales: z.number(),
            dailyVelocity: z.number().describe("Average units sold per day over the last 30 days."),
            daysUntilEmpty: z.string().describe("Estimated days until stock runs out. 'N/A' if no recent sales."),
        })),
      },
      async ({ productName }) => {
        const relevantProducts = productName 
            ? flowInput.products.filter(p => p.name.toLowerCase() === productName.toLowerCase())
            : flowInput.products;

        const thirtyDaysAgo = startOfDay(subDays(new Date(), 30));
        const recentSales = flowInput.sales.filter(s => new Date(s.date) >= thirtyDaysAgo);

        const forecasts = relevantProducts.map(product => {
            const productSales = recentSales.filter(s => s.productId === product.id);
            const thirtyDaySales = productSales.reduce((sum, s) => sum + s.quantity, 0);
            const dailyVelocity = thirtyDaySales / 30;
            
            let daysUntilEmpty = 'N/A';
            if (dailyVelocity > 0) {
                const days = Math.floor(product.stock / dailyVelocity);
                daysUntilEmpty = days.toString();
            }

            return {
                productName: product.name,
                stock: product.stock,
                thirtyDaySales,
                dailyVelocity: parseFloat(dailyVelocity.toFixed(2)),
                daysUntilEmpty,
            };
        });

        // If a specific product was requested, return only that. Otherwise, return all forecasts with recent sales.
        if (productName) {
            return forecasts;
        }
        return forecasts.filter(f => f.thirtyDaySales > 0);
      }
    );

    const prompt = ai.definePrompt({
      name: 'aiAssistedQueryPromptWithTools',
      model: 'googleai/gemini-1.5-flash-latest',
      tools: [getInventoryStatus, getSalesSummary, getProductProfitability, getTopSellingProducts, getInventoryForecast],
      system: `You are a helpful AI assistant for a small business owner. Your goal is to answer questions about sales data, provide predictive insights, and help with marketing.

- Use the available tools to find the information needed to answer the user's query.
- For questions about specific time periods (e.g., "today", "this week", "last 7 days"), use the 'getSalesSummary' tool with the appropriate 'periodInDays' value (e.g., for "today", use periodInDays: 1. for "this week" or "last 7 days", use periodInDays: 7).
- Use the getProductProfitability tool to answer questions about which products are most or least profitable.
- Use the getTopSellingProducts tool to answer questions about best-selling or top-selling items.
- You can perform comparisons, like comparing sales this month vs. last month, by calling the necessary tools multiple times with different parameters.
- When presenting currency, format it with a dollar sign and two decimal places (e.g., $1,234.56).
- If asked to create marketing content, like an email, use the product information available to you to write a compelling draft.
- Use the getInventoryForecast tool to predict when items might run out of stock.
- Be concise and friendly in your response.
- IMPORTANT: Always respond with just the final, user-facing text answer. Do not output JSON.`,
    });

    const response = await prompt({ query: flowInput.query });
    const answer = response.text;
    
    if (answer) {
      return { answer };
    }
    
    throw new Error("AI failed to generate a valid response.");
  }
);

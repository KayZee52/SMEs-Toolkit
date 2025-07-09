
'use server';
/**
 * @fileOverview An AI agent that summarizes business performance for a given period.
 *
 * - summarizeReport - A function that handles the report summarization process.
 * - SummarizeReportInput - The input type for the summarizeReport function.
 * - SummarizeReportOutput - The return type for the summarizeReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { format } from 'date-fns';

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

const ExpenseSchema = z.object({
  id: z.string(),
  description: z.string(),
  category: z.string(),
  amount: z.number(),
  date: z.string(),
  notes: z.string().optional(),
});

const SummarizeReportInputSchema = z.object({
  sales: z.array(SaleSchema).describe('The list of sales transactions for the period.'),
  expenses: z.array(ExpenseSchema).describe('The list of expenses for the period.'),
  products: z.array(ProductSchema).describe('The list of all products.'),
  dateRange: z.object({
    from: z.string().describe("The start date of the report period in ISO format."),
    to: z.string().describe("The end date of the report period in ISO format."),
  }).describe('The date range for the report.'),
});
export type SummarizeReportInput = z.infer<typeof SummarizeReportInputSchema>;

const SummarizeReportOutputSchema = z.object({
  summary: z.string().describe('A concise, natural language summary of the business performance for the period.'),
});
export type SummarizeReportOutput = z.infer<typeof SummarizeReportOutputSchema>;

export async function summarizeReport(input: SummarizeReportInput): Promise<SummarizeReportOutput> {
  return summarizeReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeReportPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: SummarizeReportInputSchema},
  output: {schema: SummarizeReportOutputSchema},
  system: `You are a savvy business analyst AI. Your task is to provide a clear and concise summary of business performance based on the provided sales and expense data for a specific date range.

Your summary should be a single paragraph and achieve the following:
1.  State the date range being summarized.
2.  Report the total sales revenue, total expenses, and the resulting net profit.
3.  Identify the top-selling product by revenue during the period. If there are no sales, state that.
4.  Briefly mention the category with the highest expenses. If there are no expenses, state that.
5.  Maintain a helpful and professional tone.
`,
  templateHelpers: {
    formatDate: (dateString: string) => format(new Date(dateString), "MMM d, yyyy"),
    totalSales: (sales: z.infer<typeof SaleSchema>[]) => sales.reduce((sum, s) => sum + s.total, 0),
    totalExpenses: (expenses: z.infer<typeof ExpenseSchema>[]) => expenses.reduce((sum, e) => sum + e.amount, 0),
    netProfit: (sales: z.infer<typeof SaleSchema>[], expenses: z.infer<typeof ExpenseSchema>[]) => {
        const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        return totalSales - totalExpenses;
    },
    topProduct: (sales: z.infer<typeof SaleSchema>[]) => {
        if (sales.length === 0) return "N/A";
        const productRevenue: Record<string, number> = {};
        for (const sale of sales) {
            productRevenue[sale.productName] = (productRevenue[sale.productName] || 0) + sale.total;
        }
        return Object.entries(productRevenue)
            .sort((a, b) => b[1] - a[1])[0][0];
    },
    topExpenseCategory: (expenses: z.infer<typeof ExpenseSchema>[]) => {
        if (expenses.length === 0) return "N/A";
        const categoryExpenses: Record<string, number> = {};
        for (const expense of expenses) {
            categoryExpenses[expense.category] = (categoryExpenses[expense.category] || 0) + expense.amount;
        }
        return Object.entries(categoryExpenses)
            .sort((a, b) => b[1] - a[1])[0][0];
    }
  },
  prompt: `
Date Range: {{formatDate dateRange.from}} to {{formatDate dateRange.to}}
Sales Data: {{{json sales}}}
Expense Data: {{{json expenses}}}
`,
});


const summarizeReportFlow = ai.defineFlow(
  {
    name: 'summarizeReportFlow',
    inputSchema: SummarizeReportInputSchema,
    outputSchema: SummarizeReportOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    
    if (output) {
      return output;
    }
    
    throw new Error("AI failed to generate a valid report summary.");
  }
);


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
import {googleAI} from '@genkit-ai/googleai';

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

export async function summarizeReport(
  input: SummarizeReportInput,
): Promise<SummarizeReportOutput> {
  return summarizeReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeReportPrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
  input: {schema: SummarizeReportInputSchema},
  output: {schema: SummarizeReportOutputSchema},
  prompt: `You are a savvy business analyst AI. Your task is to provide a clear and concise summary of business performance based on the provided data for a specific date range.

Your summary should be a single paragraph and achieve the following:
1.  State the date range being summarized. The dates are in ISO format; present them in a human-readable format like "MMM d, yyyy".
2.  Calculate and report the total sales revenue, total expenses, and the resulting net profit (revenue - expenses).
3.  Identify the top-selling product by revenue during the period. If there are no sales, state that.
4.  Identify the category with the highest expenses. If there are no expenses, state that.
5.  Maintain a helpful and professional tone.
6.  Format all monetary values with a dollar sign and two decimal places (e.g., $1,234.56).

Here is the data for your analysis:

Date Range: From {{dateRange.from}} to {{dateRange.to}}

Sales Data:
{{{json sales}}}

Expense Data:
{{{json expenses}}}
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

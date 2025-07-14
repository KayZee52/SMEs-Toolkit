
'use server';

/**
 * @fileOverview The Ma-D Assistant, a smart business assistant for the SME Toolkit.
 *
 * This AI flow provides a comprehensive, self-aware assistant that understands its
 * identity, the KEMZ brand, and the user's business context. It adheres to strict
 * privacy and behavioral rules.
 *
 * - kemzAssistant - A function that handles the AI-assisted query process.
 * - KemzAssistantInput - The input type for the kemzAssistant function.
 * - KemzAssistantOutput - The return type for the kemzAssistant function.
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

const KemzAssistantInputSchema = z.object({
  query: z.string().describe('The natural language query from the user.'),
  products: z.array(ProductSchema).describe('The list of all products in inventory.'),
  sales: z.array(SaleSchema).describe('The list of all sales transactions.'),
  expenses: z.array(ExpenseSchema).describe('The list of all expense transactions.'),
  customers: z.array(CustomerSchema).describe('The list of all customers.'),
  settings: SettingsSchema.describe('General business settings.'),
});
export type KemzAssistantInput = z.infer<typeof KemzAssistantInputSchema>;

const PromptInputSchema = KemzAssistantInputSchema.extend({
    currentDate: z.string().describe("The current date in ISO format, to be used as a reference for 'today'."),
});


const KemzAssistantOutputSchema = z.object({
  answer: z.string().describe('The answer to the query.'),
});
export type KemzAssistantOutput = z.infer<typeof KemzAssistantOutputSchema>;


export async function kemzAssistant(input: KemzAssistantInput): Promise<KemzAssistantOutput> {
  return kemzAssistantFlow(input);
}


const prompt = ai.definePrompt({
  name: 'kemzAssistantPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: { schema: PromptInputSchema },
  output: { schema: KemzAssistantOutputSchema },
  system: `You are Ma-D, a smart, friendly, and helpful digital business buddy. Your identity, knowledge base, and rules are defined below. You must strictly adhere to these rules.

## Your Core Identity & Knowledge Base

When asked about yourself, you should introduce yourself this way: "Hello! I’m Ma-D — your digital business buddy. I’m here to help you manage your sales, inventory, reports, and more — all in one smart, simple toolkit. Whether you’re running a shop, a startup, or something in between, I’ve got your back. Just ask me anything!"

Use the following information to answer any other questions about your developer or the KEMZ brand. When asked about your creator, briefly mention their mission before stating the founder's names.

- ai_name: "Ma-D"
- powered_by: "Gemini API (online)"
- role: "Digital business buddy"
- developer": "KEMZ"
- founder": "Kelvin Zammie"
- co_founder": "Elisha Benson"
- launch_year": "2023"
- base_location": "Liberia"

**Brand Profile (KEMZ):**
- mission: "To simplify technology through practical solutions and expert guidance."
- vision: "To be a leading force in the tech industry, simplifying and elevating the digital experience for underserved communities and small businesses."
- values: ["Innovation", "Integrity", "Excellence", "Customer-Centricity", "Continuous Learning", "Collaboration"]
- voice_tone: "Helpful, clear, friendly, professional, empowering (e.g., 'Boss, you're doing well!')"
- voice_style: "Conversational but respectful"
- voice_language: "English, with future support for Liberian English"

**KEMZ Products:**
1.  SME Toolkit:
    - description: "An offline-first business assistant app designed for small and medium-sized enterprises in Africa."
    - features: ["Sales tracking", "Inventory management", "Customer profiles", "Expenses logging", "AI Assistant", "Reports and analysis", "Secure offline storage with optional sync"]
    - platforms: ["Windows (MVP)", "Android (planned)"]
2.  KEMZ SAFENET:
    - description: "A cybersecurity support initiative for SMEs in Liberia to help protect their systems and data during digital transition."
    - launch_date: "October 30, 2024"
    - partners: ["LISAC Liberia", "Wannie Studios"]
    - early_impact: ["Rose Academy", "several SMEs"]

**Target Audience:**
- regions: ["Liberia", "West Africa (future expansion)"]
- users: ["Small business owners", "Informal traders", "Retail shopkeepers", "Young entrepreneurs", "Non-technical business users"]
- user_environment: Low/unstable internet, basic Windows PCs and Android phones. This is why the SME Toolkit is offline-first.

## Behavior and Business Analysis Rules

1.  **Business Data Analysis:** You are given the complete business data for the user's session in JSON format: sales, products, expenses, and customers. Use this data to answer queries.
    *   **Reference Date:** Use the 'currentDate' provided as the reference for "today".
    *   **Profitability**: Calculate profit as (price - cost) * quantity. Net profit is total sales revenue minus total expenses.
    *   **Top Performers**: To find top-selling/most profitable products, aggregate the 'total' or 'profit' from sales data.
    *   **Inventory**: "Low stock" is less than 10 units. Suggest restocks based on fast-moving items that are also low in stock.
    *   **Customer Analysis**: Identify top customers by total spending. Identify debtors by checking for customers with type 'Debtor'.
    *   **Summaries**: When asked to summarize, provide a concise overview of sales, expenses, and key activities for the requested period (e.g., today, this week).

2.  **Privacy and Safety:**
    *   You only process data for the current session. You do not store, transmit, or reuse personal data.
    *   Never access or ask for passwords, PINs, or raw payment details.
    *   Do not offer legal or tax advice.
    *   Do not give financial investment recommendations.
    *   If you are unsure about something, ask for clarification.

3.  **Tone and Formatting:**
    *   Use the business's currency from the settings when presenting financial figures.
    *   Maintain a helpful, professional, and encouraging tone as defined in the Brand Profile.
    *   Always respond with just the final, user-facing text answer in the 'answer' field. Do not output JSON or markdown.
`,
  prompt: `
  Current Date: {{{currentDate}}}

  User's Business Data:
  Settings: {{{json settings}}}
  Products: {{{json products}}}
  Sales: {{{json sales}}}
  Expenses: {{{json expenses}}}
  Customers: {{{json customers}}}

  User Query: {{{query}}}
  `,
});

const kemzAssistantFlow = ai.defineFlow(
  {
    name: 'kemzAssistantFlow',
    inputSchema: KemzAssistantInputSchema,
    outputSchema: KemzAssistantOutputSchema,
  },
  async (flowInput) => {
    const response = await prompt({
        ...flowInput,
        currentDate: new Date().toISOString(),
    });
    
    // Prefer the structured JSON output if it exists and is valid.
    const output = response.output;
    if (output?.answer) {
      return output;
    }
    
    // Fallback to the raw text response if structured output fails.
    const textResponse = response.text;
    if (textResponse) {
      return { answer: textResponse };
    }

    throw new Error("AI failed to generate a valid response.");
  }
);

    
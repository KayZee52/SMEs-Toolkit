
'use server';
/**
 * @fileOverview Generates a product description using AI.
 *
 * - generateProductDescription - A function that generates a product description.
 * - GenerateProductDescriptionInput - The input type for the function.
 * - GenerateProductDescriptionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { Flow, FlowAuth, FlowCallOptions } from 'genkit/flow';

const GenerateProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productCategory: z.string().optional().describe('The category of the product.'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

const GenerateProductDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated product description.'),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;

// This is the exported wrapper function. It now accepts callOptions.
export async function generateProductDescription(
  input: GenerateProductDescriptionInput,
  callOptions: FlowCallOptions<FlowAuth>
): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input, callOptions);
}

const prompt = ai.definePrompt({
  name: 'generateProductDescriptionPrompt',
  input: {schema: GenerateProductDescriptionInputSchema},
  output: {schema: GenerateProductDescriptionOutputSchema},
  prompt: `You are a marketing expert specializing in writing compelling, concise, and attractive product descriptions.

  Generate a product description for the following product. The description should be a single paragraph, around 2-3 sentences long. Highlight its key features and benefits in an appealing way.
  
  Product Name: {{{productName}}}
  {{#if productCategory}}
  Product Category: {{{productCategory}}}
  {{/if}}
  `,
});

// The flow now receives callOptions and passes them to the prompt.
const generateProductDescriptionFlow: Flow<GenerateProductDescriptionInput, GenerateProductDescriptionOutput> = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async (input, streamingCallback, callOptions) => {
    const response = await prompt(input, callOptions); // Pass callOptions here
    if (response.output) {
      return response.output;
    }
    const textResponse = response.text;
    if (textResponse) {
      return { description: textResponse };
    }
    throw new Error("AI failed to generate a description.");
  }
);

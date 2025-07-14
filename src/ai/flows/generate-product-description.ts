
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
import {Flow, FlowCallOptions} from 'genkit/flow';

const GenerateProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productCategory: z.string().optional().describe('The category of the product.'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

const GenerateProductDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated product description.'),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;

export async function generateProductDescription(
  input: GenerateProductDescriptionInput,
  callOptions?: FlowCallOptions
): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow.run(input, callOptions);
}

const prompt = ai.definePrompt({
  name: 'generateProductDescriptionPrompt',
  model: 'googleai/gemini-2.0-flash',
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

const generateProductDescriptionFlow: Flow<GenerateProductDescriptionInput, GenerateProductDescriptionOutput> = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async (input, flowOptions) => {
    const response = await prompt.run(input, flowOptions);
    if (response.output) {
      return response.output;
    }
    // Fallback to using the raw text response if structured output fails.
    const textResponse = response.text;
    if (textResponse) {
      return { description: textResponse };
    }
    // If all else fails, throw an error.
    throw new Error("AI failed to generate a description.");
  }
);

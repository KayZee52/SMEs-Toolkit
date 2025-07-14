
'use server';

/**
 * @fileOverview Extracts customer information (name, phone number) from sales logs.
 *
 * - extractCustomerInfo - A function that extracts customer information from sales logs.
 * - ExtractCustomerInfoInput - The input type for the extractCustomerInfo function.
 * - ExtractCustomerInfoOutput - The return type for the extractCustomerInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { Flow, FlowAuth, FlowCallOptions } from 'genkit/flow';

const ExtractCustomerInfoInputSchema = z.object({
  salesLog: z.string().describe('The sales log to extract customer information from.'),
});
export type ExtractCustomerInfoInput = z.infer<typeof ExtractCustomerInfoInputSchema>;

const ExtractCustomerInfoOutputSchema = z.object({
  customerName: z.string().describe('The name of the customer.'),
  customerPhoneNumber: z
    .string()
    .optional()
    .describe('The phone number of the customer, if available.'),
});
export type ExtractCustomerInfoOutput = z.infer<typeof ExtractCustomerInfoOutputSchema>;

// This is the exported wrapper function. It now accepts callOptions.
export async function extractCustomerInfo(
  input: ExtractCustomerInfoInput,
  callOptions: FlowCallOptions<FlowAuth>
): Promise<ExtractCustomerInfoOutput> {
  return extractCustomerInfoFlow(input, callOptions);
}

const prompt = ai.definePrompt({
  name: 'extractCustomerInfoPrompt',
  input: {schema: ExtractCustomerInfoInputSchema},
  output: {schema: ExtractCustomerInfoOutputSchema},
  prompt: `You are an AI assistant tasked with extracting customer information from sales logs.

  Given the following sales log, extract the customer's name and phone number, if available.  If no phone number is mentioned, leave that field blank.

  Sales Log: {{{salesLog}}}

  Output the customer's name and phone number in JSON format.
  `,
});

// The flow now receives callOptions and passes them to the prompt.
const extractCustomerInfoFlow: Flow<ExtractCustomerInfoInput, ExtractCustomerInfoOutput> = ai.defineFlow(
  {
    name: 'extractCustomerInfoFlow',
    inputSchema: ExtractCustomerInfoInputSchema,
    outputSchema: ExtractCustomerInfoOutputSchema,
  },
  async (input, streamingCallback, callOptions) => {
    const {output} = await prompt(input, callOptions); // Pass callOptions here
    if (output) {
      return output;
    }
    return { customerName: "" };
  }
);

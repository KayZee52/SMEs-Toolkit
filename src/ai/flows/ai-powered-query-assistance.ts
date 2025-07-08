// Implemented the AI assistant flow to handle natural language queries about sales data and inventory.

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

const AiAssistedQueryInputSchema = z.object({
  query: z.string().describe('The natural language query about sales data or inventory.'),
});
export type AiAssistedQueryInput = z.infer<typeof AiAssistedQueryInputSchema>;

const AiAssistedQueryOutputSchema = z.object({
  answer: z.string().describe('The answer to the query.'),
});
export type AiAssistedQueryOutput = z.infer<typeof AiAssistedQueryOutputSchema>;

export async function aiAssistedQuery(input: AiAssistedQueryInput): Promise<AiAssistedQueryOutput> {
  return aiAssistedQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiAssistedQueryPrompt',
  input: {schema: AiAssistedQueryInputSchema},
  output: {schema: AiAssistedQueryOutputSchema},
  prompt: `You are a helpful AI assistant designed to answer questions about sales data and inventory.

  Answer the following question based on the available information.

  Question: {{{query}}}

  If the question is unanswerable with the information available, respond that you do not have the information to answer the question.
  `,
});

const aiAssistedQueryFlow = ai.defineFlow(
  {
    name: 'aiAssistedQueryFlow',
    inputSchema: AiAssistedQueryInputSchema,
    outputSchema: AiAssistedQueryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

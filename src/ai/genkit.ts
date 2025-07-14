import {genkit, type GenkitConfig} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// This configuration prevents Genkit from automatically using an environment
// variable key. The placeholder key here will be overridden by the key
// from user settings at the time of each API call in `src/services/ai.ts`.
export const ai = genkit({
  plugins: [googleAI({apiKey: 'placeholder'})],
});

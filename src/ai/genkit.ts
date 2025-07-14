import {genkit, type GenkitConfig} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// By leaving the plugins array empty here, we prevent Genkit from
// automatically initializing the Google AI plugin with a fallback/environment
// API key. The plugin will be provided manually at the time of each call
// in `src/services/ai.ts`, ensuring we only use the key from user settings.
export const ai = genkit({
  plugins: [],
});

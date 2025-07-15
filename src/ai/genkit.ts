
import {genkit, Plugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import genkitx from '@genkit-ai/next';

// This configuration now uses the API key directly from the .env file.
// Make sure to set GOOGLE_API_KEY in your .env file.
export const ai = genkit({
  plugins: [
    googleAI(),
    genkitx({
      allowDevUI: true,
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

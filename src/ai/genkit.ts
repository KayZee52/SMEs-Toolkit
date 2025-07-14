
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// This configuration now uses a placeholder API key.
// This prevents Genkit from automatically using an environment variable key.
// The real key from user settings will be passed with each API call in the flow files.
export const ai = genkit({
  plugins: [googleAI({apiKey: 'placeholder-will-be-overridden'})],
});

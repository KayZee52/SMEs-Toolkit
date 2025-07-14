import {genkit, type GenkitConfig} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {getSettings} from '@/services/db';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: (async () => {
        const settings = await getSettings();
        // Use the user's stored key, or fall back to an environment variable if not present.
        // This supports both user-provided keys and developer-side testing.
        return settings.googleApiKey || process.env.GOOGLE_API_KEY || '';
      })(),
    }),
  ],
});

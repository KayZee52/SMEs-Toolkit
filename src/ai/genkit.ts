import {genkit, type GenkitConfig} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {getSettings} from '@/services/db';

export const ai = genkit({
  plugins: [
    googleAI({
      // By using requestMiddleware, we ensure the API key is fetched dynamically
      // for each request, rather than only once at startup. This allows users
      // to update their key in settings and have it apply immediately.
      requestMiddleware: async (req, next) => {
        const settings = await getSettings();
        const apiKey = settings.googleApiKey || process.env.GOOGLE_API_KEY || '';
        
        if (!apiKey) {
            throw new Error("Google AI API key is not set. Please add it in the settings.");
        }

        // Clone the request and add the API key to the headers.
        const newReq = new Request(req);
        newReq.headers.set('x-goog-api-key', apiKey);
        return await next(newReq);
      },
    }),
  ],
});

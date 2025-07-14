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
        const apiKey = settings.googleApiKey; // No fallback here
        
        if (!apiKey) {
            // Throw a specific error that the service layer can catch.
            throw new Error("API_KEY_NOT_SET");
        }

        // Clone the request and add the API key to the headers.
        const newReq = new Request(req);
        newReq.headers.set('x-goog-api-key', apiKey);
        return await next(newReq);
      },
    }),
  ],
});

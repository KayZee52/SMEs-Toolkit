import { config } from 'dotenv';
config();

import '@/ai/flows/kemz-assistant-flow.ts';
import '@/ai/flows/extract-customer-info.ts';
import '@/ai/flows/generate-product-description.ts';
import '@/ai/flows/summarize-report-flow.ts';

import 'dotenv/config';
import { z } from 'zod';
const schema = z.object({
  MONGODB_URI: z.string().min(1), JWT_SECRET: z.string().min(32, 'JWT_SECRET must be 32+ chars'),
  PORT: z.coerce.number().default(4000), FRONTEND_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  UPLOAD_MAX_MB: z.coerce.number().default(3), DEMO_PASSWORD: z.string().optional(),
});
const r = schema.safeParse(process.env);
if (!r.success) { console.error('Invalid environment:', r.error.issues.map(i => `${i.path}: ${i.message}`).join('; ')); process.exit(1); }
export const env = r.data;

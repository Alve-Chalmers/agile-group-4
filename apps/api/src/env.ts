import { z } from 'zod';

export const env = z
  .object({
    SPOONACULAR_API_KEY: z.string(),
    DATABASE_URL: z.string(),
    BETTER_AUTH_URL: z.string().default('http://localhost:3000'),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_CROSS_SITE_COOKIES: z.string().optional(),
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    PORT: z.number().default(3000),
  })
  .parse(process.env);

export type Env = z.infer<typeof env>;

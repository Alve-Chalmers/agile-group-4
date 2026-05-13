/**
 * Vercel default export (see https://hono.dev/docs/getting-started/vercel).
 * Type-only consumers: `import type { AppRouter } from '@0waste/api'`.
 */
import { app } from './app.js';
import './load-env.js';

export type { AppRouter } from './trpc/routers/index.js';
export { app };

export default app;

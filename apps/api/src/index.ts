/**
 * Vercel default export (see https://hono.dev/docs/getting-started/vercel).
 * Type-only consumers: `import type { AppRouter } from '@0waste/api'`.
 */
import './load-env.js';
import { app } from './app.js';

export { app };
export type { AppRouter } from './trpc/router.js';

export default app;

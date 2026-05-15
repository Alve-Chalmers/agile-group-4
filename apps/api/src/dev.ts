import { serve } from '@hono/node-server';
import './load-env.js';

import { env } from '@/env.js';
import { app } from './app.js';

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.info(`API listening on http://localhost:${info.port}`);
  },
);

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { auth } from './lib/auth.js';
import { createContext } from './trpc/context.js';
import { appRouter } from './trpc/routers/index.js';

const app = new Hono();

app.use(
  '*',
  cors({
    origin: (origin) => origin,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  }),
);

app.get('/health', (c) => c.json({ status: 'ok' }));

app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw));

app.use('/trpc/*', (c) =>
  fetchRequestHandler({
    endpoint: '/trpc',
    router: appRouter,
    req: c.req.raw,
    createContext,
  }),
);

export { app };

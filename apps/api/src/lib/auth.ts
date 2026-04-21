import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { db } from '../db/index.js';
import * as tables from '../db/schema.js';

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? 'development-secret-min-32-chars-long!!',
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: tables.user,
      session: tables.session,
      account: tables.account,
      verification: tables.verification,
    },
  }),
  trustedOrigins: [
    'http://localhost:8081',
    'http://localhost:19006',
    'http://localhost:3000',
    'zerowaste://',
    'exp://',
  ],
});

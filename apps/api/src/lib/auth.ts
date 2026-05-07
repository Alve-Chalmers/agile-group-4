import { betterAuth } from 'better-auth';
import { createAuthMiddleware } from 'better-auth/api';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createHomeForUser } from '../db/home.js';

import { db } from '../db/index.js';
import * as tables from '../db/schema.js';

/** Credentialed fetch from another origin (e.g. Expo web :8081 → API :3000) needs SameSite=None; browsers require Secure (localhost is exempt for HTTP). */
function crossSiteSessionCookiesEnabled() {
  const raw = process.env.BETTER_AUTH_CROSS_SITE_COOKIES;
  if (raw === '0' || raw === 'false') {
    return false;
  }
  if (raw === '1' || raw === 'true') {
    return true;
  }
  // Default: on in development (split localhost ports), opt-in in production.
  return process.env.NODE_ENV !== 'production';
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? 'development-secret-min-32-chars-long!!',
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  emailAndPassword: {
    enabled: true,
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: tables.user,
      session: tables.session,
      account: tables.account,
      verification: tables.verification,
    },
  }),
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith('/sign-up')) {
        const newSession = ctx.context.newSession;
        if (newSession) {
          // Create a default home for the new user
          await createHomeForUser(newSession.user.id);
        }
      }
    }),
  },

  ...(crossSiteSessionCookiesEnabled()
    ? {
        advanced: {
          defaultCookieAttributes: {
            sameSite: 'none',
            secure: true,
          },
        },
      }
    : {}),
  trustedOrigins: [
    'http://localhost:8081',
    'http://localhost:19006',
    'http://localhost:3000',
    'zerowaste://',
    'exp://',
  ],
});

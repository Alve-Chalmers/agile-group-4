import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createAuthMiddleware } from 'better-auth/api';
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

/** Origins allowed to call the auth API from a browser (CSRF / Origin checks). localhost ≠ 127.0.0.1 for this purpose. */
const defaultTrustedOrigins = [
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'http://localhost:8082',
  'http://127.0.0.1:8082',
  'http://localhost:19006',
  'http://127.0.0.1:19006',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'zerowaste://',
  'exp://',
];

function trustedOriginsFromEnv(): string[] {
  const raw = process.env.BETTER_AUTH_TRUSTED_ORIGINS;
  if (!raw?.trim()) {
    return [];
  }
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
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
  trustedOrigins: [...defaultTrustedOrigins, ...trustedOriginsFromEnv()],
});

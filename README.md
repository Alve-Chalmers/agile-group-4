# 0waste

Monorepo: Expo SDK 55 app (`apps/mobile`) and Hono API (`apps/api`) with tRPC, Better Auth, Drizzle, and Neon.

## Prerequisites

- Node.js 20+ (see [Expo SDK 55](https://expo.dev/changelog/sdk-55) tool versions)
- [pnpm](https://pnpm.io/) 9+
- Postgres: a [Neon](https://neon.tech/) database for hosted dev/prod, or a **local Postgres 14+** instance (see [Local Postgres](#local-postgres-for-development))

## Install

```bash
pnpm install
```

Use **pnpm only**; a single `pnpm-lock.yaml` is expected at the repo root.

## Environment

- Copy [`.env.example`](.env.example) for variable names.
- **Mobile:** set `EXPO_PUBLIC_API_URL` (e.g. `http://localhost:3000` or your deployed API URL) in `apps/mobile/.env` or via EAS.
- **API:** copy [`apps/api/.env.example`](apps/api/.env.example) to `apps/api/.env` and set `DATABASE_URL`, `BETTER_AUTH_SECRET` (≥32 random bytes in production), and `BETTER_AUTH_URL` (public origin of the API, no trailing slash).

## Local Postgres for development

Install Postgres on the machine that runs the API (or on a host you can reach from it, for example WSL when the API runs in Linux). Hosted URLs often use `?sslmode=require`; **local** servers usually omit SSL in the URL (see the example in [`apps/api/.env.example`](apps/api/.env.example)).

1. Install and start the Postgres service for your OS (e.g. `postgresql` on Linux, Postgres.app or Homebrew on macOS, or the Windows installer).
2. Create an empty database, for example:

   ```bash
   createdb zerowaste
   ```

   (If your OS uses a `postgres` system user or a different default user, run this as that user or use `psql` with `-U`.)
3. Set `DATABASE_URL` in `apps/api/.env` to match your user, password, host, port, and database name, e.g. `postgresql://YOUR_USER:YOUR_PASSWORD@127.0.0.1:5432/zerowaste`.
4. Continue with [Database migrations](#database-migrations-api) (`pnpm db:migrate` from the repo root).

## Database migrations (API)

From the repo root (with `DATABASE_URL` set, e.g. in `apps/api/.env`):

```bash
pnpm db:migrate
```

Generate new migrations after editing [`apps/api/src/db/schema.ts`](apps/api/src/db/schema.ts):

```bash
pnpm db:generate
```

Regenerate Better Auth–managed tables after auth config changes:

```bash
pnpm --filter @0waste/api auth:generate
pnpm db:generate
```

## Develop

Run API and mobile together:

```bash
pnpm dev
```

- API: [http://localhost:3000](http://localhost:3000) — `GET /health`, Better Auth under `/api/auth/*`, tRPC under `/trpc`.
- Mobile: Expo dev server (default Metro / dev client as you configure).

## Deploy API (Vercel + Neon)

1. Create a Neon project and copy the connection string into Vercel as `DATABASE_URL`.
2. Set `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (your production API URL), and any OAuth secrets you use.
3. In Vercel, create a project with **Root Directory** `apps/api` (or equivalent monorepo settings). This repo includes [`apps/api/vercel.json`](apps/api/vercel.json) so installs run from the monorepo root.
4. Prefer the **Node.js** runtime for routes using Better Auth and tRPC unless you have verified Edge compatibility.
5. Run `pnpm db:migrate` against the production database (or your Neon branch) before or as part of release.

## Mobile → production API

Point `EXPO_PUBLIC_API_URL` at the deployed API (EAS secrets / env for release builds). The app scheme for deep linking is `zerowaste` (see `apps/mobile/app.json`).

## Conventions

- From the mobile app, only import the API as types: `import type { AppRouter } from '@0waste/api'` — no runtime server imports in Expo.

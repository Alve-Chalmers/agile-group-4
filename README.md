# 0waste

Monorepo: Expo SDK 55 app (`apps/mobile`) and Hono API (`apps/api`) with tRPC, Better Auth, Drizzle, and Neon.

## Prerequisites

- Node.js 20+ (see [Expo SDK 55](https://expo.dev/changelog/sdk-55) tool versions)
- [pnpm](https://pnpm.io/) 9+
- A [Neon](https://neon.tech/) Postgres database (or any Postgres URL compatible with `@neondatabase/serverless`)

## Install

From the **repository root** (the folder that contains `pnpm-workspace.yaml`):

```bash
corepack enable
pnpm install
```

Use **pnpm only**; a single `pnpm-lock.yaml` is expected at the repo root.

### Troubleshooting installs / `pnpm db:migrate`

- **`WARN Local package.json exists, but node_modules missing`** under `apps/api` was a misleading pnpm message when a script failed and the workspace package had no `node_modules` folder (hoisted installs often omit it). The root `postinstall` creates empty `apps/*/node_modules` so failed scripts do not print that warning; the real error is shown above it.
- **`DATABASE_URL` / Postgres driver `url: undefined`:** create `apps/api/.env` from `apps/api/.env.example` and set `DATABASE_URL` before `pnpm db:migrate`.

## Environment

- Copy [`.env.example`](.env.example) for variable names.
- **Mobile:** set `EXPO_PUBLIC_API_URL` (e.g. `http://localhost:3000` or your deployed API URL) in `apps/mobile/.env` or via EAS.
- **API:** copy [`apps/api/.env.example`](apps/api/.env.example) to `apps/api/.env` and set `DATABASE_URL`, `BETTER_AUTH_SECRET` (≥32 random bytes in production), and `BETTER_AUTH_URL` (public origin of the API, no trailing slash).

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

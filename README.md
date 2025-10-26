# PoshPilot

A security-focused monorepo for managing Poshmark automations. The `apps/web` Next.js app provides onboarding flows,
credential storage, and dashboards backed by a shared Prisma schema located in `packages/db`.

## Getting started

```bash
pnpm install
pnpm prisma:migrate
pnpm dev:web
```

Set the environment variables defined in `.env.example` before running the dev server. `ENCRYPTION_KEY` should be a
base64-encoded 32 byte string (generate with `openssl rand -base64 32`). Toggle `NEXT_PUBLIC_GITHUB_ENABLED` to `true`
only when `GITHUB_ID` and `GITHUB_SECRET` are configured.

## Tech highlights

- **Authentication** via NextAuth with optional GitHub OAuth and hardened email/password credentials.
- **Database** managed with Prisma and PostgreSQL, including encrypted `poshmark_accounts` storage.
- **Encryption** performed using libsodium secretboxes with symmetric keys sourced from environment-specific key
  management services.

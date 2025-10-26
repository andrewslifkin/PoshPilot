# PoshPilot

Monorepo scaffold for the PoshPilot platform. It ships a mobile-first Next.js web application and a background worker service powered by BullMQ.

## Project layout

- `apps/web` – Next.js 14 application configured with TypeScript, Tailwind CSS, ESLint and Prettier.
- `services/worker` – TypeScript worker that connects to Redis via BullMQ.
- `docker-compose.yml` – Local development stack with PostgreSQL and Redis.
- `.github/workflows/ci.yml` – Continuous integration pipeline running linting, type-checking, and tests on pull requests.

## Requirements

- Node.js 20+ (Corepack will provide `pnpm`).
- Docker Desktop or Docker Engine + Docker Compose v2 (optional but recommended for local infrastructure).

## Getting started

1. **Install dependencies**

   ```bash
   corepack enable
   pnpm install
   ```

2. **Run the web app**

   ```bash
   pnpm --filter @poshpilot/web dev
   ```

   The Next.js application runs on [http://localhost:3000](http://localhost:3000).

3. **Run the worker**

   ```bash
   pnpm --filter @poshpilot/worker dev
   ```

4. **Launch the full stack with Docker Compose**

   ```bash
   docker compose up --build
   ```

   This starts the Next.js dev server, the worker, PostgreSQL, and Redis using the configuration defined in `.env.example`.

## Environment variables

Copy `.env.example` to `.env.local` (for the web app) and `.env` (for Docker Compose) to customise values.

| Variable | Description | Default |
| --- | --- | --- |
| `POSTGRES_USER` | PostgreSQL username | `poshpilot` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `poshpilot` |
| `POSTGRES_DB` | PostgreSQL database name | `poshpilot` |
| `POSTGRES_HOST` | PostgreSQL host | `postgres` |
| `POSTGRES_PORT` | PostgreSQL port | `5432` |
| `REDIS_HOST` | Redis host used by worker and web app | `redis` |
| `REDIS_PORT` | Redis port | `6379` |
| `QUEUE_NAME` | BullMQ queue name for worker jobs | `poshpilot-jobs` |
| `NEXT_PUBLIC_API_URL` | Base API URL exposed to the web app | `http://localhost:3000/api` |

## Scripts

- `pnpm lint` – Run ESLint across all workspaces.
- `pnpm typecheck` – Execute TypeScript in all packages.
- `pnpm --filter @poshpilot/web dev` – Start the Next.js development server.
- `pnpm --filter @poshpilot/worker dev` – Start the worker in watch mode.

## Continuous integration

GitHub Actions runs on pushes and pull requests targeting `main`. The workflow installs dependencies with pnpm, then runs linting, type-checking, and package-level tests if defined.

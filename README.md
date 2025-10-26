# PoshPilot

This repository contains an Express API and a Playwright-powered worker that coordinate automated listing shares.

## Services

### API (`services/api`)

* `POST /api/share-jobs` — queues a share job by persisting it to PostgreSQL and enqueuing work in Redis/BullMQ.
* `GET /api/share-jobs/:id/status` — fetches the latest job status and ordered event log for UI consumption.

### Worker (`services/worker`)

* Polls the `share-jobs` queue with BullMQ.
* Launches Playwright to replay vendored share flows, respecting randomized rate limits.
* Refreshes authentication cookies when required and captures CAPTCHA/2FA challenges.
* Emits structured job/share events and writes them back to PostgreSQL.

## Getting started

Set the following environment variables for both services:

```bash
export DATABASE_URL=postgres://user:pass@localhost:5432/poshpilot
export REDIS_URL=redis://localhost:6379
```

Install dependencies:

```bash
npm install
```

Run the API:

```bash
npm run start:api
```

Run the worker:

```bash
npm run start:worker
```

Both services rely on the shared package in `packages/shared` for queue names, payload contracts, and response types.

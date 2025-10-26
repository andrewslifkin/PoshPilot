# PoshPilot

Operational scaffolding for the PoshPilot share pipeline. This repository now includes an Express-based API, an in-memory worker, correlated logging, per-user rate limits, Prometheus metrics, and admin tooling.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the API:

   ```bash
   npm start
   ```

3. Start the worker (in a separate terminal) to process share jobs:

   ```bash
   npm run worker
   ```

   > Set `START_WORKER_WITH_API=true` to start the worker alongside the API process.

## Configuration

Environment variables:

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | API listen port. |
| `LOG_LEVEL` | `info` | Pino log level. |
| `ADMIN_TOKEN` | `changeme-admin-token` | Token required for `/admin` routes. |
| `API_MAX_SHARES_PER_HOUR` | `120` | Per-user hourly API rate limit. |
| `API_MAX_SHARES_PER_DAY` | `600` | Per-user daily API rate limit. |
| `WORKER_MAX_SHARES_PER_HOUR` | `180` | Worker-side hourly guardrail. |
| `WORKER_MAX_SHARES_PER_DAY` | `900` | Worker-side daily guardrail. |
| `WORKER_CONCURRENCY` | `2` | Concurrent jobs processed by the worker. |
| `WORKER_POLL_INTERVAL_MS` | `1000` | Polling interval for idle workers. |
| `STUCK_JOB_THRESHOLD_MS` | `900000` | Threshold for highlighting stuck jobs in the dashboard. |

## Logging with Correlation IDs

- The API assigns a correlation ID for each request and propagates it to enqueued jobs.
- Worker logs run within the originating correlation context, making it possible to trace a share end-to-end across services.
- Supply your own `X-Correlation-Id` header to propagate upstream identifiers.

## Metrics & Alerts

- Prometheus metrics are exposed at `GET /metrics`.
- Key series:
  - `share_jobs_success_total`
  - `share_jobs_failure_total`
  - `share_job_duration_seconds`
  - `share_jobs_queued_total`
  - `share_jobs_processing_total`
- Sample Alertmanager configuration is provided in [`monitoring/alerts.yml`](monitoring/alerts.yml).

## Admin Dashboard

- Accessible at `/admin/dashboard` with header `X-Admin-Token: <ADMIN_TOKEN>`.
- Provides stuck job visibility, recent job history, and credential revocation tooling.
- JSON APIs for automation:
  - `GET /admin/jobs`
  - `POST /admin/credentials/rescind`
  - `POST /admin/credentials/restore`
  - `POST /admin/jobs/:jobId/requeue`

## Documentation

The `docs/wiki` directory contains content intended for the project wiki:

- [Incident Response Procedures](docs/wiki/incident-response.md)
- [ToS Compliance Considerations](docs/wiki/tos-compliance.md)

Mirror these pages into the GitHub wiki to satisfy operational requirements.

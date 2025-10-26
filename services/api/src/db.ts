import { Pool } from "pg";
import type {
  ShareEventType,
  ShareJobPayload,
  ShareJobRecord,
  ShareJobStatus,
  ShareJobStatusResponse,
} from "@poshpilot/shared";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const getDbPool = () => pool;

export async function ensureSchema(): Promise<void> {
  await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS share_jobs (
      id UUID PRIMARY KEY,
      audience TEXT NOT NULL,
      rate_min_ms INTEGER NOT NULL,
      rate_max_ms INTEGER NOT NULL,
      listing_ids JSONB NOT NULL,
      session_cookies JSONB NOT NULL,
      auth_refresh_url TEXT,
      status TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS share_events (
      id UUID PRIMARY KEY,
      job_id UUID REFERENCES share_jobs(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      payload JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export async function insertJob(job: ShareJobPayload): Promise<void> {
  const { id, audience, rate, listingIds, status, sessionCookies, authRefreshUrl } = job;
  await pool.query(
    `INSERT INTO share_jobs (
      id, audience, rate_min_ms, rate_max_ms, listing_ids, session_cookies, auth_refresh_url, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      id,
      audience,
      rate.minMs,
      rate.maxMs,
      JSON.stringify(listingIds),
      JSON.stringify(sessionCookies),
      authRefreshUrl ?? null,
      status,
    ]
  );
}

export async function updateJobStatus(id: string, status: ShareJobStatus): Promise<void> {
  await pool.query(
    `UPDATE share_jobs SET status = $2, updated_at = NOW() WHERE id = $1`,
    [id, status]
  );
}

export async function logEvent(
  jobId: string,
  type: ShareEventType,
  message: string,
  payload?: Record<string, unknown>
): Promise<void> {
  await pool.query(
    `INSERT INTO share_events (id, job_id, type, message, payload)
     VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
    [jobId, type, message, payload ? JSON.stringify(payload) : null]
  );
}

export async function getJobWithEvents(id: string): Promise<ShareJobStatusResponse | null> {
  const client = await pool.connect();
  try {
    const jobResult = await client.query(
      `SELECT id, audience, rate_min_ms, rate_max_ms, listing_ids, status, created_at, updated_at
       FROM share_jobs WHERE id = $1`,
      [id]
    );

    if (jobResult.rowCount === 0) {
      return null;
    }

    const jobRow = jobResult.rows[0];
    const listingIds: string[] = Array.isArray(jobRow.listing_ids)
      ? jobRow.listing_ids
      : JSON.parse(jobRow.listing_ids);

    const job: ShareJobRecord = {
      id: jobRow.id,
      audience: jobRow.audience,
      rate: { minMs: jobRow.rate_min_ms, maxMs: jobRow.rate_max_ms },
      listingIds,
      status: jobRow.status,
      createdAt: jobRow.created_at.toISOString(),
      updatedAt: jobRow.updated_at.toISOString(),
    };

    const eventsResult = await client.query(
      `SELECT id, job_id, type, message, payload, created_at
       FROM share_events WHERE job_id = $1 ORDER BY created_at ASC`,
      [id]
    );

    const events = eventsResult.rows.map((row) => ({
      id: row.id,
      jobId: row.job_id,
      type: row.type,
      message: row.message,
      payload: row.payload,
      createdAt: row.created_at.toISOString(),
    }));

    return { job, events };
  } finally {
    client.release();
  }
}

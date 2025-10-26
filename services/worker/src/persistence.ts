import type { Pool } from "pg";
import type { ShareEventType, ShareJobStatus } from "@poshpilot/shared";

export async function updateJobStatus(pool: Pool, id: string, status: ShareJobStatus) {
  await pool.query(`UPDATE share_jobs SET status = $2, updated_at = NOW() WHERE id = $1`, [id, status]);
}

export async function logEvent(
  pool: Pool,
  jobId: string,
  type: ShareEventType,
  message: string,
  payload?: Record<string, unknown>
) {
  await pool.query(
    `INSERT INTO share_events (id, job_id, type, message, payload)
     VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
    [jobId, type, message, payload ? JSON.stringify(payload) : null]
  );
}

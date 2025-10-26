import "dotenv/config";
import { Worker, Job } from "bullmq";
import { SHARE_JOB_QUEUE, ShareJobPayload } from "@poshpilot/shared";
import { createExecutor } from "./executor/playwrightShareExecutor";
import { Pool } from "pg";
import { logEvent, updateJobStatus } from "./persistence";

const connection = {
  connection: {
    url: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
  },
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const executor = createExecutor(pool);

const worker = new Worker<ShareJobPayload>(
  SHARE_JOB_QUEUE,
  async (job: Job<ShareJobPayload>) => {
    const payload = job.data;
    await updateJobStatus(pool, payload.id, "running");
    await logEvent(pool, payload.id, "job-started", "Worker accepted job", {
      bullJobId: job.id,
    });

    try {
      const summary = await executor.execute(payload);
      await updateJobStatus(pool, payload.id, "completed");
      await logEvent(pool, payload.id, "job-completed", "Job completed successfully", summary);
    } catch (error) {
      await updateJobStatus(pool, payload.id, "failed");
      await logEvent(pool, payload.id, "job-failed", "Job failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  },
  connection
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed`, err);
});

console.log("Share worker started");

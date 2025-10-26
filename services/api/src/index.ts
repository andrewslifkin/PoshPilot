import "dotenv/config";
import express from "express";
import { randomUUID } from "crypto";
import { shareQueue } from "./queue";
import { ensureSchema, insertJob, logEvent, getJobWithEvents } from "./db";
import { SHARE_JOB_QUEUE, ShareJobPayload, ShareJobRequest } from "@poshpilot/shared";
import { z } from "zod";

const app = express();
app.use(express.json());

const shareJobSchema = z.object({
  listingIds: z.array(z.string()).nonempty(),
  audience: z.enum(["followers", "party"]),
  rate: z.object({
    minMs: z.number().int().positive(),
    maxMs: z.number().int().positive(),
  }),
  sessionCookies: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
      domain: z.string().optional(),
      path: z.string().optional(),
      expires: z.number().optional(),
      httpOnly: z.boolean().optional(),
      secure: z.boolean().optional(),
      sameSite: z.enum(["Strict", "Lax", "None"]).optional(),
    })
  ),
  authRefreshUrl: z.string().url().optional(),
});

app.post("/api/share-jobs", async (req, res) => {
  const result = shareJobSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.format() });
  }

  const payload: ShareJobRequest = result.data;

  if (payload.rate.maxMs < payload.rate.minMs) {
    return res.status(400).json({
      error: "rate.maxMs must be greater than or equal to rate.minMs",
    });
  }

  const jobId = randomUUID();
  const job: ShareJobPayload = {
    id: jobId,
    status: "queued",
    ...payload,
  };

  await ensureSchema();
  await insertJob(job);
  await logEvent(jobId, "job-queued", "Job queued for processing", {
    listingCount: job.listingIds.length,
  });
  await shareQueue.add(SHARE_JOB_QUEUE, job, { jobId });

  return res.status(202).json({ id: jobId, status: job.status });
});

app.get("/api/share-jobs/:id/status", async (req, res) => {
  const { id } = req.params;
  await ensureSchema();
  const job = await getJobWithEvents(id);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  return res.json(job);
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

ensureSchema()
  .then(() => {
    app.listen(port, () => {
      console.log(`API listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database schema", error);
    process.exit(1);
  });

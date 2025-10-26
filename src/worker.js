const shareQueue = require('./shareQueue');
const { getLogger, runWithCorrelation } = require('./logger');
const { workerRateLimiter } = require('./rateLimiter');
const { processShareJob } = require('./shareProcessor');
const { recordJobFailure, recordJobSuccess } = require('./metrics');

const workerLogger = getLogger({ service: 'share-worker' });
const MAX_CONCURRENCY = Number(process.env.WORKER_CONCURRENCY || 2);

let activeWorkers = 0;

async function handleJob(job) {
  return runWithCorrelation(job.correlationId || job.id, async () => {
    const logger = getLogger({ service: 'share-worker', jobId: job.id, userId: job.userId });
    const startTime = process.hrtime.bigint();

    const guard = workerRateLimiter.tryConsume(job.userId);
    if (!guard.allowed) {
      shareQueue.markRateLimited(job.id, guard);
      recordJobFailure(job, `worker_${guard.scope}_limit`);
      logger.warn({ guard }, 'Job skipped due to worker rate guard');
      return;
    }

    try {
      logger.info('Starting share job');
      const result = await processShareJob(job);
      shareQueue.markComplete(job.id, result);
      const durationSeconds = Number(process.hrtime.bigint() - startTime) / 1e9;
      recordJobSuccess(job, durationSeconds);
      logger.info({ durationSeconds }, 'Share job completed');
    } catch (error) {
      shareQueue.markFailed(job.id, error);
      recordJobFailure(job, error.code || 'error');
      getLogger({ service: 'share-worker', jobId: job.id }).error({ err: error }, 'Share job failed');
    }
  });
}

async function processNextJob() {
  if (activeWorkers >= MAX_CONCURRENCY) {
    return;
  }
  const job = shareQueue.nextJob();
  if (!job) {
    return;
  }

  activeWorkers += 1;
  try {
    await handleJob(job);
  } finally {
    activeWorkers -= 1;
    setImmediate(processNextJob);
  }
}

function startWorker() {
  workerLogger.info('Worker starting');
  shareQueue.on('job:queued', () => {
    setImmediate(processNextJob);
  });

  processNextJob();
  setInterval(processNextJob, Number(process.env.WORKER_POLL_INTERVAL_MS || 1000)).unref();
}

if (require.main === module) {
  startWorker();
}

module.exports = {
  startWorker
};

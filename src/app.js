const express = require('express');
const { correlationMiddleware, getLogger } = require('./logger');
const { metricsHandler } = require('./metrics');
const { apiRateLimiter } = require('./rateLimiter');
const shareService = require('./shareService');
const adminRouter = require('./routes/admin');
const shareQueue = require('./shareQueue');

const app = express();
const logger = getLogger({ service: 'api' });

app.use(express.json());
app.use(correlationMiddleware);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.post('/api/shares', (req, res) => {
  const { userId, payload, metadata } = req.body || {};
  if (!userId) {
    res.status(400).json({ error: 'userId_required' });
    return;
  }

  const rateResult = apiRateLimiter.tryConsume(userId);
  if (!rateResult.allowed) {
    getLogger({ userId, route: 'create-share' }).warn({ rateResult }, 'Rate limit exceeded');
    res.status(429).json({
      error: 'rate_limit_exceeded',
      scope: rateResult.scope,
      limit: rateResult.limit,
      remaining: rateResult.remaining,
      resetInMs: rateResult.resetInMs
    });
    return;
  }

  const job = shareService.enqueueShareJob({
    userId,
    payload,
    metadata,
    correlationId: req.correlationId
  });

  res.status(202).json({
    jobId: job.id,
    correlationId: req.correlationId,
    status: job.status
  });
});

app.get('/api/shares/:jobId', (req, res) => {
  const job = shareService.getShareJob(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: 'job_not_found' });
    return;
  }
  res.json({ job });
});

app.get('/metrics', metricsHandler);

app.use('/admin', adminRouter);

const port = Number(process.env.PORT || 3000);

function start() {
  app.listen(port, () => {
    logger.info({ port }, 'API server listening');
  });
}

if (require.main === module) {
  start();
  const shouldStartWorker = process.env.START_WORKER_WITH_API === 'true';
  if (shouldStartWorker) {
    const { startWorker } = require('./worker');
    startWorker();
  }
}

module.exports = {
  app,
  start,
  shareQueue
};

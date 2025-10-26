const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const jobSuccessCounter = new client.Counter({
  name: 'share_jobs_success_total',
  help: 'Total number of share jobs processed successfully',
  labelNames: ['job_type']
});

const jobFailureCounter = new client.Counter({
  name: 'share_jobs_failure_total',
  help: 'Total number of share jobs that failed',
  labelNames: ['job_type', 'failure_reason']
});

const jobDurationHistogram = new client.Histogram({
  name: 'share_job_duration_seconds',
  help: 'Duration of share job execution in seconds',
  labelNames: ['job_type'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 20, 30, 60]
});

const jobQueueGauge = new client.Gauge({
  name: 'share_jobs_queued_total',
  help: 'Current number of queued share jobs',
  labelNames: ['job_type']
});

const jobInFlightGauge = new client.Gauge({
  name: 'share_jobs_processing_total',
  help: 'Current number of share jobs being processed',
  labelNames: ['job_type']
});

register.registerMetric(jobSuccessCounter);
register.registerMetric(jobFailureCounter);
register.registerMetric(jobDurationHistogram);
register.registerMetric(jobQueueGauge);
register.registerMetric(jobInFlightGauge);

function getJobType(job) {
  return job?.metadata?.jobType || 'share';
}

function recordJobQueued(job) {
  jobQueueGauge.labels(getJobType(job)).inc();
}

function recordJobDequeued(job) {
  jobQueueGauge.labels(getJobType(job)).dec();
  jobInFlightGauge.labels(getJobType(job)).inc();
}

function recordJobSettled(job) {
  jobInFlightGauge.labels(getJobType(job)).dec();
}

function recordJobSuccess(job, durationSeconds) {
  const jobType = getJobType(job);
  jobSuccessCounter.labels(jobType).inc();
  if (typeof durationSeconds === 'number') {
    jobDurationHistogram.labels(jobType).observe(durationSeconds);
  }
}

function recordJobFailure(job, reason) {
  const jobType = getJobType(job);
  jobFailureCounter.labels(jobType, reason || 'unknown').inc();
}

async function metricsHandler(_req, res) {
  res.setHeader('Content-Type', register.contentType);
  res.end(await register.metrics());
}

module.exports = {
  metricsHandler,
  recordJobDequeued,
  recordJobFailure,
  recordJobQueued,
  recordJobSettled,
  recordJobSuccess
};

const shareQueue = require('./shareQueue');
const { getLogger } = require('./logger');

function enqueueShareJob({ userId, payload, metadata = {}, correlationId }) {
  const logger = getLogger({ userId, event: 'enqueue-share' });
  const job = shareQueue.createJob({ userId, payload, metadata, correlationId });
  logger.info({ jobId: job.id }, 'Enqueued share job');
  return shareQueue.serialize(job);
}

function getShareJob(jobId) {
  const job = shareQueue.getJob(jobId);
  return shareQueue.serialize(job);
}

function listShareJobs(filter = {}) {
  return shareQueue.listJobs(filter).map((job) => shareQueue.serialize(job));
}

module.exports = {
  enqueueShareJob,
  getShareJob,
  listShareJobs
};

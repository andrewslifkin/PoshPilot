const { getLogger } = require('./logger');

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processShareJob(job) {
  const logger = getLogger({ userId: job.userId, jobId: job.id, event: 'share-process' });
  const payload = job.payload || {};

  logger.info('Processing share job payload');
  await delay(payload.simulatedLatencyMs || 50);

  if (payload.simulateFailure) {
    const error = new Error('Simulated share failure');
    error.code = payload.simulateFailureCode || 'simulated_failure';
    throw error;
  }

  logger.debug({ payload }, 'Share job processed successfully');
  return { delivered: true };
}

module.exports = {
  processShareJob
};

const { EventEmitter } = require('events');
const { randomUUID } = require('crypto');
const {
  recordJobQueued,
  recordJobDequeued,
  recordJobSettled
} = require('./metrics');

class ShareQueue extends EventEmitter {
  constructor() {
    super();
    this.jobs = new Map();
    this.pending = [];
  }

  createJob({ userId, payload, metadata = {}, correlationId }) {
    const job = {
      id: randomUUID(),
      userId,
      payload,
      metadata,
      status: 'queued',
      correlationId,
      attempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      history: []
    };

    this.jobs.set(job.id, job);
    this.pending.push(job.id);
    this._appendHistory(job, 'queued');
    recordJobQueued(job);
    this.emit('job:queued', job);
    return job;
  }

  _appendHistory(job, event, data = {}) {
    job.history.push({
      event,
      data,
      at: new Date()
    });
  }

  nextJob() {
    while (this.pending.length) {
      const jobId = this.pending.shift();
      const job = this.jobs.get(jobId);
      if (!job) {
        continue;
      }

      if (job.status !== 'queued') {
        continue;
      }

      job.status = 'processing';
      job.attempts += 1;
      job.startedAt = new Date();
      job.updatedAt = new Date();
      this._appendHistory(job, 'dequeued');
      recordJobDequeued(job);
      return job;
    }

    return null;
  }

  markComplete(jobId, result = {}) {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    job.status = 'succeeded';
    job.result = result;
    job.finishedAt = new Date();
    job.updatedAt = new Date();
    this._appendHistory(job, 'completed', result);
    recordJobSettled(job);
    this.emit('job:completed', job);
    return job;
  }

  markFailed(jobId, error) {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    job.status = 'failed';
    job.error = {
      message: error?.message || 'Unknown error',
      code: error?.code,
      stack: error?.stack
    };
    job.finishedAt = new Date();
    job.updatedAt = new Date();
    this._appendHistory(job, 'failed', job.error);
    recordJobSettled(job);
    this.emit('job:failed', job);
    return job;
  }

  markRateLimited(jobId, details) {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    job.status = 'rate_limited';
    job.rateLimit = {
      ...details,
      at: new Date()
    };
    job.updatedAt = new Date();
    this._appendHistory(job, 'rate_limited', job.rateLimit);
    recordJobSettled(job);
    this.emit('job:rate_limited', job);
    return job;
  }

  requeue(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    job.status = 'queued';
    job.updatedAt = new Date();
    delete job.error;
    delete job.rateLimit;
    delete job.result;
    delete job.finishedAt;
    delete job.startedAt;
    this.pending.push(job.id);
    this._appendHistory(job, 'requeued');
    recordJobQueued(job);
    this.emit('job:queued', job);
    return job;
  }

  getJob(jobId) {
    return this.jobs.get(jobId) || null;
  }

  listJobs({ status, limit = 100, userId } = {}) {
    let jobs = Array.from(this.jobs.values());

    if (status) {
      jobs = jobs.filter((job) => job.status === status);
    }

    if (userId) {
      jobs = jobs.filter((job) => job.userId === userId);
    }

    jobs.sort((a, b) => b.createdAt - a.createdAt);

    if (limit) {
      jobs = jobs.slice(0, limit);
    }

    return jobs;
  }

  findStuckJobs(thresholdMs) {
    const now = Date.now();
    return Array.from(this.jobs.values()).filter((job) => {
      if (job.status !== 'processing' || !job.startedAt) {
        return false;
      }
      return now - job.startedAt.getTime() > thresholdMs;
    });
  }

  serialize(job) {
    if (!job) return null;

    const serializeDate = (value) => (value instanceof Date ? value.toISOString() : value);

    return {
      ...job,
      createdAt: serializeDate(job.createdAt),
      updatedAt: serializeDate(job.updatedAt),
      startedAt: serializeDate(job.startedAt),
      finishedAt: serializeDate(job.finishedAt),
      history: job.history.map((entry) => ({
        ...entry,
        at: serializeDate(entry.at)
      }))
    };
  }
}

module.exports = new ShareQueue();

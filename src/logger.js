const pino = require('pino');
const { AsyncLocalStorage } = require('async_hooks');
const { randomUUID } = require('crypto');

const asyncLocalStorage = new AsyncLocalStorage();

const baseLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: {
    service: 'poshpilot'
  },
  messageKey: 'message',
  redact: ['req.headers.authorization', 'res.headers.authorization']
});

function getCorrelationStore() {
  return asyncLocalStorage.getStore();
}

function getCorrelationId() {
  return getCorrelationStore()?.correlationId;
}

function runWithCorrelation(correlationId, callback) {
  return asyncLocalStorage.run({ correlationId }, callback);
}

function withNewCorrelation(callback) {
  const correlationId = randomUUID();
  return runWithCorrelation(correlationId, () => callback(correlationId));
}

function getLogger(bindings = {}) {
  const correlationId = getCorrelationId();
  if (correlationId) {
    return baseLogger.child({ correlationId, ...bindings });
  }
  return baseLogger.child(bindings);
}

function correlationMiddleware(req, res, next) {
  const headerId = req.headers['x-correlation-id'];
  const correlationId = headerId ? String(headerId) : randomUUID();
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);

  runWithCorrelation(correlationId, () => next());
}

module.exports = {
  correlationMiddleware,
  getCorrelationId,
  getLogger,
  runWithCorrelation,
  withNewCorrelation
};

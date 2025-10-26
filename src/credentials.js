const { getLogger } = require('./logger');

const credentialsStore = new Map();

function revokeCredential(userId, { reason, actor }) {
  const logger = getLogger({ userId, event: 'credential-revocation' });
  const existing = credentialsStore.get(userId) || { status: 'active' };

  const record = {
    userId,
    status: 'revoked',
    reason: reason || 'unspecified',
    actor: actor || 'system',
    revokedAt: new Date().toISOString(),
    previousStatus: existing.status
  };

  credentialsStore.set(userId, record);
  logger.warn({ reason, actor }, 'Credential revoked');
  return record;
}

function restoreCredential(userId, actor = 'system') {
  const logger = getLogger({ userId, event: 'credential-restore' });
  const record = {
    userId,
    status: 'active',
    restoredAt: new Date().toISOString(),
    actor
  };
  credentialsStore.set(userId, record);
  logger.info({ actor }, 'Credential restored');
  return record;
}

function getCredential(userId) {
  return credentialsStore.get(userId) || { userId, status: 'unknown' };
}

function listCredentials(status) {
  const records = Array.from(credentialsStore.values());
  if (!status) {
    return records;
  }
  return records.filter((record) => record.status === status);
}

module.exports = {
  getCredential,
  listCredentials,
  revokeCredential,
  restoreCredential
};

const HOUR_IN_MS = 60 * 60 * 1000;
const DAY_IN_MS = 24 * HOUR_IN_MS;

class SlidingWindowRateLimiter {
  constructor({ limit, windowMs, name }) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.name = name;
    this.store = new Map();
  }

  snapshot(key, now = Date.now()) {
    const entry = this.store.get(key);
    if (!entry || entry.expiresAt <= now) {
      return { count: 0, expiresAt: now + this.windowMs };
    }
    return { count: entry.count, expiresAt: entry.expiresAt };
  }

  commit(key, snapshot, tokens = 1, now = Date.now()) {
    let expiresAt = snapshot.expiresAt;
    let count = snapshot.count;
    if (expiresAt <= now) {
      expiresAt = now + this.windowMs;
      count = 0;
    }
    const updated = { count: count + tokens, expiresAt };
    this.store.set(key, updated);
    return updated;
  }

  remainingFromSnapshot(snapshot, tokens, now = Date.now()) {
    if (snapshot.expiresAt <= now) {
      return this.limit - tokens;
    }
    return this.limit - (snapshot.count + tokens);
  }
}

function createRateLimiterSet({ hourLimit, dayLimit, name }) {
  const hourlyLimiter = new SlidingWindowRateLimiter({
    limit: hourLimit,
    windowMs: HOUR_IN_MS,
    name: `${name}-hour`
  });
  const dailyLimiter = new SlidingWindowRateLimiter({
    limit: dayLimit,
    windowMs: DAY_IN_MS,
    name: `${name}-day`
  });

  function tryConsume(key, tokens = 1, now = Date.now()) {
    const hourlySnapshot = hourlyLimiter.snapshot(key, now);
    if (hourlySnapshot.count + tokens > hourLimit) {
      return {
        allowed: false,
        scope: 'hour',
        limit: hourLimit,
        remaining: Math.max(hourLimit - hourlySnapshot.count, 0),
        resetInMs: Math.max(hourlySnapshot.expiresAt - now, 0)
      };
    }

    const dailySnapshot = dailyLimiter.snapshot(key, now);
    if (dailySnapshot.count + tokens > dayLimit) {
      return {
        allowed: false,
        scope: 'day',
        limit: dayLimit,
        remaining: Math.max(dayLimit - dailySnapshot.count, 0),
        resetInMs: Math.max(dailySnapshot.expiresAt - now, 0)
      };
    }

    const hourlyCommit = hourlyLimiter.commit(key, hourlySnapshot, tokens, now);
    const dailyCommit = dailyLimiter.commit(key, dailySnapshot, tokens, now);

    return {
      allowed: true,
      scope: 'ok',
      remaining: {
        hour: Math.max(hourLimit - hourlyCommit.count, 0),
        day: Math.max(dayLimit - dailyCommit.count, 0)
      },
      resetInMs: {
        hour: Math.max(hourlyCommit.expiresAt - now, 0),
        day: Math.max(dailyCommit.expiresAt - now, 0)
      }
    };
  }

  return {
    tryConsume
  };
}

const apiRateLimiter = createRateLimiterSet({
  hourLimit: Number(process.env.API_MAX_SHARES_PER_HOUR || 120),
  dayLimit: Number(process.env.API_MAX_SHARES_PER_DAY || 600),
  name: 'api'
});

const workerRateLimiter = createRateLimiterSet({
  hourLimit: Number(process.env.WORKER_MAX_SHARES_PER_HOUR || 180),
  dayLimit: Number(process.env.WORKER_MAX_SHARES_PER_DAY || 900),
  name: 'worker'
});

module.exports = {
  apiRateLimiter,
  workerRateLimiter,
  createRateLimiterSet
};

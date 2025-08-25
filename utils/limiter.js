// utils/rateLimiter.js
const limits = new Map();

function isRateLimited(key, maxRequests, windowMs) {
  const now = Date.now();

  if (!limits.has(key)) {
    limits.set(key, { count: 1, start: now });
    return false;
  }

  const entry = limits.get(key);

  // reset if time window passed
  if (now - entry.start > windowMs) {
    limits.set(key, { count: 1, start: now });
    return false;
  }

  // check limit
  if (entry.count >= maxRequests) return true;

  entry.count++;
  return false;
}

module.exports = { isRateLimited };

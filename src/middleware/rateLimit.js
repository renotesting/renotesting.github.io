/**
 * Rate limits for public endpoints, counted per client IP.
 * Behind a proxy, TRUST_PROXY must be set or every visitor shares one limit.
 */

const { rateLimit } = require('express-rate-limit');

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

// TODO: counts live in memory, so they reset on restart and aren't shared between instances.
function createLimiter({ windowMs, limit, message, skipSuccessfulRequests = false }) {
  return rateLimit({
    windowMs,
    limit,
    skipSuccessfulRequests,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message }
  });
}

module.exports = {
  // Only failed attempts count, so people aren't locked out for logging in normally.
  loginLimiter: createLimiter({
    windowMs: 15 * MINUTE,
    limit: 10,
    skipSuccessfulRequests: true,
    message: 'Too many failed login attempts. Please try again in 15 minutes.'
  }),
  registerLimiter: createLimiter({
    windowMs: HOUR,
    limit: 10,
    message: 'Too many registration attempts. Please try again later.'
  }),
  subscribeLimiter: createLimiter({
    windowMs: HOUR,
    limit: 10,
    message: 'Too many subscription attempts. Please try again later.'
  }),
  // Generous because large mail providers send one-click unsubscribes from shared IPs.
  unsubscribeLimiter: createLimiter({
    windowMs: 15 * MINUTE,
    limit: 100,
    message: 'Too many requests. Please try again later.'
  }),
  contactLimiter: createLimiter({
    windowMs: HOUR,
    limit: 10,
    message: 'Too many messages sent. Please try again later.'
  })
};

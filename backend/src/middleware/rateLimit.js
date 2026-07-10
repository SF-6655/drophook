const rateLimit = require('express-rate-limit');

// Applied to the webhook receiver endpoint POST /i/:id
// Limits each IP to 100 requests per hour per session
// Prevents abuse and protects the free-tier DB from spam
const webhookLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Limit is 100 per hour per IP.',
  },
  keyGenerator: (req) => {
    // Rate limit per IP + session combo
    return `${req.ip}-${req.params.id}`;
  },
});

// General API limiter — applied to all /api/* routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

module.exports = { webhookLimiter, apiLimiter };
import rateLimit from "express-rate-limit";

/**
 * General API rate limiter: 100 requests per 15 minutes.
 */
// Applies a broad default throttle to reduce abuse across normal API traffic.
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Too many requests, please try again later",
    },
  },
});

/**
 * Strict rate limiter for auth endpoints: 10 requests per 15 minutes.
 */
// Uses a tighter limit on auth routes to slow brute-force and credential stuffing attempts.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, //10
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Too many authentication attempts, please try again later",
    },
  },
});

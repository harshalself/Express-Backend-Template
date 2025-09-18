import rateLimit from 'express-rate-limit';
import { RequestHandler } from 'express';
import { logger } from '../utils/logger';

// Auth endpoints - strict rate limiting (5 requests per 15 minutes)
export const authRateLimit: RequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => {
    // Skip rate limiting in test environment
    return process.env.NODE_ENV === 'test';
  },
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
    });
    res.status(429).json({
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes',
    });
  },
});

// General API endpoints - moderate rate limiting (100 requests per minute)
export const apiRateLimit: RequestHandler = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per window
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => {
    // Skip localhost in development or in test environment
    return (
      (process.env.NODE_ENV === 'development' && req.ip === '127.0.0.1') ||
      process.env.NODE_ENV === 'test'
    );
  },
});

// File upload endpoints - stricter rate limiting (10 requests per minute)
export const uploadRateLimit: RequestHandler = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per window
  message: {
    error: 'Too many upload requests, please try again later.',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

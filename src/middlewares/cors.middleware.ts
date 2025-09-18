import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Enhanced CORS middleware with environment-based configuration
 * Handles cross-origin requests with configurable allowed origins
 */
export const corsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:8081',
  ];

  const origin = req.headers.origin;

  // Log CORS requests for monitoring
  if (origin && !allowedOrigins.includes(origin)) {
    logger.warn(`CORS: Rejected origin ${origin}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: (req as { requestId?: string }).requestId,
    });
  }

  // Allow requests without origin (like Postman, mobile apps)
  if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Reject unauthorized origins
    res.status(403).json({
      error: 'CORS: Origin not allowed',
      requestId: (req as { requestId?: string }).requestId,
    });
    return;
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
};

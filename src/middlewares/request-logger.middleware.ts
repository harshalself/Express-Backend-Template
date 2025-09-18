import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { logger, stream } from '../utils/logger';
import { RequestWithUser } from '../interfaces/auth.interface';
import { RequestWithId } from './request-id.middleware';

// Combined interface for requests with both user and request ID
interface RequestWithUserAndId extends RequestWithUser, RequestWithId {}

/**
 * Request logging middleware with structured JSON logging for production
 * and detailed API request logging with user context
 */

/**
 * Morgan middleware for HTTP request logging
 * Uses JSON format in production, dev format in development
 */
export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const env = process.env.NODE_ENV || 'development';

  if (env === 'production') {
    // JSON format for production with structured data
    return morgan(
      (tokens: morgan.TokenIndexer, req: Request, res: Response) => {
        const requestWithContext = req as RequestWithUserAndId;
        return JSON.stringify({
          timestamp: tokens.date(req, res, 'iso'),
          level: 'http',
          method: tokens.method(req, res),
          url: tokens.url(req, res),
          status: parseInt(tokens.status(req, res) || '0', 10),
          responseTime: parseFloat(tokens['response-time'](req, res) || '0'),
          requestId: requestWithContext.requestId || 'unknown',
          userId: requestWithContext.user?.id || 'anonymous',
          userAgent: tokens['user-agent'](req, res),
          ip: tokens['remote-addr'](req, res),
          contentLength: tokens.res(req, res, 'content-length') || '0',
          service: 'express-backend-template',
          version: process.env.npm_package_version || '1.0.0',
        });
      },
      { stream }
    )(req, res, next);
  } else {
    // Development format
    return morgan('dev', { stream })(req, res, next);
  }
};

/**
 * API request logging middleware with user context
 * Logs detailed information after authentication
 */
export const apiRequestLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const requestWithContext = req as RequestWithUserAndId;
    logger.info('API Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      requestId: requestWithContext.requestId,
      userId: requestWithContext.user?.id || 'anonymous',
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });
  });

  next();
};

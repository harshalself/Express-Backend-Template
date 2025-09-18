import { NextFunction, Request, Response } from 'express';
import HttpException from '../utils/HttpException';
import { logger } from '../utils/logger';

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  try {
    const requestId = (req as { requestId?: string }).requestId || 'unknown';
    const status: number = error.status || 500;
    const message: string = error.message || 'Something went wrong';

    // Create detailed error context
    const errorContext = {
      requestId,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as { userId?: string }).userId,
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        status: status,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    };

    // Log error with full context
    if (status >= 500) {
      logger.error('Server Error:', errorContext);
    } else {
      logger.warn('Client Error:', errorContext);
    }

    // Return structured error response
    res.status(status).json({
      success: false,
      error: {
        message: message,
        code: error.name || 'INTERNAL_ERROR',
        requestId: requestId,
        timestamp: errorContext.timestamp,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default errorMiddleware;

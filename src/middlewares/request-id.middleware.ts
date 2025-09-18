import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from '../utils/uuid';

// Add request ID to all requests for tracing
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();

  // Add to request object
  (req as Request & { requestId: string }).requestId = requestId;

  // Add to response headers
  res.setHeader('X-Request-ID', requestId);

  next();
};

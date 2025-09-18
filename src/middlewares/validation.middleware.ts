import { RequestHandler } from 'express';
import { z } from 'zod';
import HttpException from '../utils/HttpException';
import { logger } from '../utils/logger';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Validation middleware using Zod schemas
 * Validates request data and replaces it with parsed/sanitized version
 *
 * @param schema - Zod schema to validate against
 * @param target - Which part of the request to validate (body, query, params)
 */
const validationMiddleware = (
  schema: z.ZodSchema,
  target: ValidationTarget = 'body'
): RequestHandler => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req[target]);

      if (!result.success) {
        const errorMessages = result.error.issues
          .map(issue => `${issue.path.join('.')}: ${issue.message}`)
          .join(', ');

        // Log validation failure for debugging
        logger.debug('Validation failed', {
          target,
          path: req.path,
          errors: result.error.issues,
          requestId: (req as { requestId?: string }).requestId,
        });

        return next(new HttpException(400, errorMessages));
      }

      // Replace the request property with the validated and sanitized data
      req[target] = result.data;
      next();
    } catch (error) {
      // Log unexpected validation errors
      logger.error('Validation middleware error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        target,
        path: req.path,
        requestId: (req as { requestId?: string }).requestId,
      });

      next(new HttpException(500, 'Validation error occurred'));
    }
  };
};

export default validationMiddleware;

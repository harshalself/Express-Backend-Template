import { Request, Response, NextFunction } from 'express';
import { RequestWithUser } from '../interfaces/auth.interface';
import HttpException from './HttpException';

/**
 * Simple utility functions for common controller operations
 * These solve actual repeated patterns without forcing abstractions
 */

/**
 * Parse and validate ID parameter from request
 * Used in every getById, update, delete operation
 */
export function parseIdParam(req: Request, paramName: string = 'id'): number {
  const id = Number(req.params[paramName]);

  if (isNaN(id) || id <= 0) {
    throw new HttpException(400, `Invalid ${paramName} parameter`);
  }

  return id;
}

/**
 * Extract authenticated user ID from request
 * Used in every controller that needs user context
 */
export function getUserId(req: RequestWithUser): number {
  const userId = req.userId || req.user?.id;

  if (!userId) {
    throw new HttpException(401, 'User authentication required');
  }

  return userId;
}

/**
 * Wrapper for async controller methods to handle errors consistently
 * Eliminates the need to write try-catch in every method
 */
export function asyncHandler(
  fn: (req: Request | RequestWithUser, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request | RequestWithUser, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Parse pagination parameters with defaults
 * Used for any paginated endpoint
 */
export function getPaginationParams(req: Request): { page: number; limit: number; offset: number } {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10)); // Max 100, default 10
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Validate required query parameters
 * Common pattern for search/filter endpoints
 */
export function requireQueryParams(req: Request, ...params: string[]): void {
  const missing = params.filter(param => !req.query[param]);

  if (missing.length > 0) {
    throw new HttpException(400, `Missing required query parameters: ${missing.join(', ')}`);
  }
}

/**
 * Safe number parsing for query parameters
 * Returns null if invalid instead of NaN
 */
export function parseNumberQuery(value: unknown, defaultValue?: number): number | null {
  if (value === undefined || value === null || value === '') {
    return defaultValue ?? null;
  }

  const parsed = Number(value);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Safe boolean parsing for query parameters
 */
export function parseBooleanQuery(value: unknown, defaultValue: boolean = false): boolean {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  const str = String(value).toLowerCase();
  return str === 'true' || str === '1' || str === 'yes';
}

/**
 * Extract common filter parameters from query
 * Standard pattern for list endpoints
 */
export function getCommonFilters(req: Request) {
  return {
    search: (req.query.search as string) || '',
    sortBy: (req.query.sortBy as string) || 'created_at',
    sortOrder: (req.query.sortOrder as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc',
    createdAfter: req.query.createdAfter ? new Date(req.query.createdAfter as string) : null,
    createdBefore: req.query.createdBefore ? new Date(req.query.createdBefore as string) : null,
  };
}

import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import HttpException from '../utils/HttpException';
import { logger } from '../utils/logger';
import { DataStoredInToken, RequestWithUser } from '../interfaces/auth.interface';

// Initialize DB connection once
let DB: import('knex').Knex | null = null;
const initDB = async (): Promise<import('knex').Knex> => {
  if (!DB) {
    const { default: database } = await import('../../database/index.schema');
    DB = database;
  }
  return DB;
};

// Define allowed database schemas to prevent SQL injection
const ALLOWED_SCHEMAS = ['public', 'tenant1', 'tenant2', 'admin'];

// Define routes that don't require authentication
const EXEMPT_ROUTES = ['/users/register', '/users/login', '/health', '/api-docs', '/api-docs.json'];

// Helper function to check if route is exempt from authentication
const isExemptRoute = (path: string): boolean => {
  return EXEMPT_ROUTES.includes(path) || path.startsWith('/api-docs');
};

// Helper function to parse bearer token
const parseBearerToken = (
  authHeader: string | undefined
): { token: string | null; schema: string } => {
  if (!authHeader) {
    return { token: null, schema: 'public' };
  }

  const parts = authHeader.split(' ');
  const token = parts[1];
  const schema = parts[2] || 'public';

  return {
    token: token && token !== 'null' ? token : null,
    schema: ALLOWED_SCHEMAS.includes(schema) ? schema : 'public',
  };
};

// Helper function to set database schema
const setDatabaseSchema = async (schema: string): Promise<void> => {
  const db = await initDB();
  await db.raw('SET search_path TO ??', [schema]);
};

const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    // Check if the current route is exempt from authentication
    if (isExemptRoute(req.path)) {
      await setDatabaseSchema('public');
      return next();
    }

    const { token, schema } = parseBearerToken(req.headers['authorization']);

    if (!token) {
      return next(new HttpException(401, 'Authentication token missing'));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(new HttpException(500, 'JWT secret not configured'));
    }

    const verificationResponse = jwt.verify(token, secret) as DataStoredInToken;

    // Set database schema and attach user ID to request
    await setDatabaseSchema(schema);
    req.userId = verificationResponse.id;

    next();
  } catch (error) {
    // Log the actual error for debugging (but don't expose to client)
    logger.error('Auth middleware error:', error);

    // Provide more specific error messages based on JWT errors
    if (error instanceof jwt.JsonWebTokenError) {
      next(new HttpException(401, 'Invalid authentication token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new HttpException(401, 'Authentication token expired'));
    } else {
      next(new HttpException(401, 'Authentication failed'));
    }
  }
};

export default authMiddleware;

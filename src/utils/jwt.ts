import jwt, { SignOptions } from 'jsonwebtoken';
import HttpException from './HttpException';
import { logger } from './logger';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  logger.error('JWT_SECRET environment variable is not set!');
}

/**
 * Generate a JWT token with the provided payload
 * @param payload - Data to encode in the token
 * @param expiresIn - Token expiration time (default: '1d')
 * @returns Signed JWT token string
 */
export const generateToken = (payload: object, expiresIn: string = '1d'): string => {
  try {
    if (!JWT_SECRET) {
      throw new HttpException(500, 'JWT secret is not configured');
    }
    return jwt.sign(payload, JWT_SECRET, { expiresIn } as SignOptions);
  } catch (error: unknown) {
    const err = error as Error;
    throw new HttpException(500, `Error generating token: ${err.message}`);
  }
};

/**
 * Verify and decode a JWT token
 * @param token - JWT token string to verify
 * @returns Decoded token payload
 */
export const verifyToken = (token: string): string | jwt.JwtPayload => {
  try {
    if (!JWT_SECRET) {
      throw new HttpException(500, 'JWT secret is not configured');
    }
    return jwt.verify(token, JWT_SECRET);
  } catch (error: unknown) {
    const err = error as Error;
    if (err.name === 'TokenExpiredError') {
      throw new HttpException(401, 'Token has expired');
    }
    if (err.name === 'JsonWebTokenError') {
      throw new HttpException(401, 'Invalid token');
    }
    throw new HttpException(500, `Token verification error: ${err.message}`);
  }
};

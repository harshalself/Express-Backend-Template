import jwt, { SignOptions } from 'jsonwebtoken';
import HttpException from './HttpException';
import { logger } from './logger';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  logger.error('JWT_SECRET environment variable is not set!');
}

export const generateToken = (payload: object, expiresIn: string = '1d') => {
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

export const verifyToken = (token: string) => {
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

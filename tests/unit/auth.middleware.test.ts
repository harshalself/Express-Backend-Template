import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import authMiddleware from '../../src/middlewares/auth.middleware';
import HttpException from '../../src/utils/HttpException';
import { RequestWithUser } from '../../src/interfaces/auth.interface';

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

// Mock the database
const mockDB = {
  raw: jest.fn().mockResolvedValue(true),
};

jest.mock('../../database/index.schema', () => ({
  default: mockDB,
}));

// Mock the dynamic import for the database
jest.mock('../../database/index.schema', () => ({
  __esModule: true,
  default: mockDB,
}));

describe('Auth Middleware', () => {
  let mockRequest: Partial<RequestWithUser> & { path: string; headers: Record<string, string> };
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      path: '/users',
      headers: {},
    };
    mockResponse = {};
    nextFunction = jest.fn();
    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  describe('exempt routes', () => {
    const exemptRoutes = [
      '/users/register',
      '/users/login',
      '/health',
      '/api-docs',
      '/api-docs.json',
      '/api-docs/swagger.json',
    ];

    exemptRoutes.forEach(route => {
      it(`should allow access to ${route} without token`, async () => {
        mockRequest.path = route;

        await authMiddleware(
          mockRequest as RequestWithUser,
          mockResponse as Response,
          nextFunction
        );

        expect(nextFunction).toHaveBeenCalledWith();
      });
    });
  });

  describe('token validation', () => {
    it('should fail when no authorization header provided', async () => {
      await authMiddleware(mockRequest as RequestWithUser, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException));
      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error.status).toBe(401);
      expect(error.message).toContain('missing');
    });

    it('should fail with invalid token format', async () => {
      mockRequest.headers = {
        authorization: 'InvalidTokenFormat',
      };

      await authMiddleware(mockRequest as RequestWithUser, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException));
      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error.status).toBe(401);
    });

    it('should fail with "null" token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer null',
      };

      await authMiddleware(mockRequest as RequestWithUser, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException));
      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error.status).toBe(401);
    });

    it('should succeed with valid token', async () => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = jwt.sign(payload, 'test-jwt-secret', { expiresIn: '1h' });

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      await authMiddleware(mockRequest as RequestWithUser, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
      expect(mockRequest.userId).toBe(1);
    });

    it('should fail with expired token', async () => {
      const payload = { id: 1, email: 'test@example.com' };
      // Create a token that expires in the past
      const expiredToken = jwt.sign(payload, 'test-jwt-secret', { expiresIn: '1ms' });

      // Wait a bit to ensure token is expired
      await new Promise(resolve => setTimeout(resolve, 10));

      mockRequest.headers = {
        authorization: `Bearer ${expiredToken}`,
      };

      await authMiddleware(mockRequest as RequestWithUser, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException));
      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error.status).toBe(401);
      expect(error.message).toContain('Invalid');
    });

    it('should fail with invalid token signature', async () => {
      const payload = { id: 1, email: 'test@example.com' };
      const tokenWithWrongSecret = jwt.sign(payload, 'wrong-secret', { expiresIn: '1h' });

      mockRequest.headers = {
        authorization: `Bearer ${tokenWithWrongSecret}`,
      };

      await authMiddleware(mockRequest as RequestWithUser, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException));
      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error.status).toBe(401);
      expect(error.message).toContain('Invalid');
    });
  });

  describe('schema handling', () => {
    it('should use public schema by default', async () => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = jwt.sign(payload, 'test-jwt-secret', { expiresIn: '1h' });

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      await authMiddleware(mockRequest as RequestWithUser, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should use requested schema if valid', async () => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = jwt.sign(payload, 'test-jwt-secret', { expiresIn: '1h' });

      mockRequest.headers = {
        authorization: `Bearer ${token} tenant1`,
      };

      await authMiddleware(mockRequest as RequestWithUser, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });
  });

  describe('error handling', () => {
    it('should handle JWT secret not configured', async () => {
      delete process.env.JWT_SECRET;

      const payload = { id: 1, email: 'test@example.com' };
      const token = jwt.sign(payload, 'any-secret', { expiresIn: '1h' });

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      await authMiddleware(mockRequest as RequestWithUser, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException));
      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error.status).toBe(500);
    });
  });
});

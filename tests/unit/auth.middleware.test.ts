import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import authMiddleware from '../../src/middlewares/auth.middleware';
import HttpException from '../../src/utils/HttpException';
import { RequestWithUser } from '../../src/interfaces/auth.interface';

describe('Auth Middleware', () => {
  let req: Partial<RequestWithUser> & { path: string; headers: Record<string, string> };
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { path: '/users', headers: {} };
    res = {};
    next = jest.fn();
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
        req.path = route;

        await authMiddleware(req as RequestWithUser, res as Response, next);

        expect(next).toHaveBeenCalledWith();
      });
    });
  });

  describe('token validation', () => {
    it('should fail when no authorization header provided', async () => {
      await authMiddleware(req as RequestWithUser, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpException));
    });

    it('should fail with invalid token format', async () => {
      req.headers = { authorization: 'InvalidFormat' };

      await authMiddleware(req as RequestWithUser, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpException));
    });

    it('should fail with "null" token', async () => {
      req.headers = { authorization: 'Bearer null' };

      await authMiddleware(req as RequestWithUser, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpException));
    });

    it('should succeed with valid token', async () => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = jwt.sign(payload, 'test-jwt-secret', { expiresIn: '1h' });
      req.headers = { authorization: `Bearer ${token}` };

      await authMiddleware(req as RequestWithUser, res as Response, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.userId).toBe(1);
    });

    it('should fail with expired token', async () => {
      const payload = { id: 1, email: 'test@example.com' };
      const expiredToken = jwt.sign(payload, 'test-jwt-secret', { expiresIn: '1ms' });

      await new Promise(resolve => setTimeout(resolve, 10));

      req.headers = { authorization: `Bearer ${expiredToken}` };

      await authMiddleware(req as RequestWithUser, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpException));
    });

    it('should fail with invalid token signature', async () => {
      const payload = { id: 1, email: 'test@example.com' };
      const wrongToken = jwt.sign(payload, 'wrong-secret', { expiresIn: '1h' });
      req.headers = { authorization: `Bearer ${wrongToken}` };

      await authMiddleware(req as RequestWithUser, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpException));
    });
  });

  describe('schema handling', () => {
    it('should use public schema by default', async () => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = jwt.sign(payload, 'test-jwt-secret', { expiresIn: '1h' });
      req.headers = { authorization: `Bearer ${token}` };

      await authMiddleware(req as RequestWithUser, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should use requested schema if valid', async () => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = jwt.sign(payload, 'test-jwt-secret', { expiresIn: '1h' });
      req.headers = { authorization: `Bearer ${token} tenant1` };

      await authMiddleware(req as RequestWithUser, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('error handling', () => {
    it('should handle JWT secret not configured', async () => {
      delete process.env.JWT_SECRET;

      const token = jwt.sign({ id: 1 }, 'any-secret', { expiresIn: '1h' });
      req.headers = { authorization: `Bearer ${token}` };

      await authMiddleware(req as RequestWithUser, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpException));
    });
  });
});

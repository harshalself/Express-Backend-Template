import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import validationMiddleware from '../../src/middlewares/validation.middleware';
import HttpException from '../../src/utils/HttpException';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
    nextFunction = jest.fn();
  });

  describe('body validation', () => {
    it('should pass validation with valid data', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      mockRequest.body = { name: 'John', age: 25 };

      const middleware = validationMiddleware(schema, 'body');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
      expect(mockRequest.body).toEqual({ name: 'John', age: 25 });
    });

    it('should fail validation with invalid data', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      mockRequest.body = { name: 'John', age: 'invalid' };

      const middleware = validationMiddleware(schema, 'body');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException));
      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error.status).toBe(400);
      expect(error.message).toContain('age');
    });

    it('should fail validation with missing required fields', () => {
      const schema = z.object({
        name: z.string(),
        email: z.string().email(),
      });

      mockRequest.body = { name: 'John' };

      const middleware = validationMiddleware(schema, 'body');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException));
      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error.status).toBe(400);
      expect(error.message).toContain('email');
    });
  });

  describe('query validation', () => {
    it('should validate query parameters', () => {
      const schema = z.object({
        page: z.string().transform(Number),
        limit: z.string().transform(Number),
      });

      mockRequest.query = { page: '1', limit: '10' };

      const middleware = validationMiddleware(schema, 'query');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
      expect(mockRequest.query).toEqual({ page: 1, limit: 10 });
    });

    it('should fail query validation with invalid data', () => {
      const schema = z.object({
        page: z.string().regex(/^\d+$/).transform(Number),
      });

      mockRequest.query = { page: 'invalid' };

      const middleware = validationMiddleware(schema, 'query');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException));
      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error.status).toBe(400);
    });
  });

  describe('params validation', () => {
    it('should validate URL parameters', () => {
      const schema = z.object({
        id: z.string().uuid(),
      });

      mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };

      const middleware = validationMiddleware(schema, 'params');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should fail params validation with invalid UUID', () => {
      const schema = z.object({
        id: z.string().uuid(),
      });

      mockRequest.params = { id: 'invalid-uuid' };

      const middleware = validationMiddleware(schema, 'params');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException));
    });
  });

  describe('default validation (body)', () => {
    it('should default to body validation when no value specified', () => {
      const schema = z.object({
        test: z.string(),
      });

      mockRequest.body = { test: 'value' };

      const middleware = validationMiddleware(schema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
      expect(mockRequest.body).toEqual({ test: 'value' });
    });
  });

  describe('error handling', () => {
    it('should handle schema parsing errors gracefully', () => {
      const schema = z.object({
        data: z.string(),
      });

      // Simulate an error in schema parsing
      mockRequest.body = undefined;

      const middleware = validationMiddleware(schema, 'body');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(HttpException));
    });
  });
});

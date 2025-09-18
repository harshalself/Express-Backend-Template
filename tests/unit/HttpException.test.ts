import HttpException, {
  ValidationException,
  AuthenticationException,
  AuthorizationException,
  NotFoundError,
  ConflictError,
} from '../../src/utils/HttpException';

describe('HttpException', () => {
  describe('Basic HttpException', () => {
    it('should create exception with status and message', () => {
      const exception = new HttpException(400, 'Bad Request');

      expect(exception.status).toBe(400);
      expect(exception.message).toBe('Bad Request');
      expect(exception.code).toBe('BAD_REQUEST');
      expect(exception instanceof Error).toBe(true);
    });

    it('should create exception with custom code', () => {
      const exception = new HttpException(400, 'Custom error', 'CUSTOM_ERROR');

      expect(exception.status).toBe(400);
      expect(exception.message).toBe('Custom error');
      expect(exception.code).toBe('CUSTOM_ERROR');
    });

    it('should map common status codes to default codes', () => {
      const testCases = [
        { status: 400, expectedCode: 'BAD_REQUEST' },
        { status: 401, expectedCode: 'UNAUTHORIZED' },
        { status: 403, expectedCode: 'FORBIDDEN' },
        { status: 404, expectedCode: 'NOT_FOUND' },
        { status: 409, expectedCode: 'CONFLICT' },
        { status: 429, expectedCode: 'TOO_MANY_REQUESTS' },
        { status: 500, expectedCode: 'INTERNAL_SERVER_ERROR' },
        { status: 999, expectedCode: 'UNKNOWN_ERROR' },
      ];

      testCases.forEach(({ status, expectedCode }) => {
        const exception = new HttpException(status, 'Test message');
        expect(exception.code).toBe(expectedCode);
      });
    });
  });

  describe('ValidationException', () => {
    it('should create validation exception with default message', () => {
      const exception = new ValidationException();

      expect(exception.status).toBe(400);
      expect(exception.message).toBe('Validation failed');
      expect(exception.code).toBe('VALIDATION_ERROR');
    });

    it('should create validation exception with custom message', () => {
      const exception = new ValidationException('Email is required');

      expect(exception.status).toBe(400);
      expect(exception.message).toBe('Email is required');
      expect(exception.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('AuthenticationException', () => {
    it('should create authentication exception with default message', () => {
      const exception = new AuthenticationException();

      expect(exception.status).toBe(401);
      expect(exception.message).toBe('Authentication required');
      expect(exception.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should create authentication exception with custom message', () => {
      const exception = new AuthenticationException('Invalid token');

      expect(exception.status).toBe(401);
      expect(exception.message).toBe('Invalid token');
      expect(exception.code).toBe('AUTHENTICATION_ERROR');
    });
  });

  describe('AuthorizationException', () => {
    it('should create authorization exception with default message', () => {
      const exception = new AuthorizationException();

      expect(exception.status).toBe(403);
      expect(exception.message).toBe('Access denied');
      expect(exception.code).toBe('AUTHORIZATION_ERROR');
    });

    it('should create authorization exception with custom message', () => {
      const exception = new AuthorizationException('Insufficient permissions');

      expect(exception.status).toBe(403);
      expect(exception.message).toBe('Insufficient permissions');
      expect(exception.code).toBe('AUTHORIZATION_ERROR');
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with default resource', () => {
      const exception = new NotFoundError();

      expect(exception.status).toBe(404);
      expect(exception.message).toBe('Resource not found');
      expect(exception.code).toBe('NOT_FOUND');
    });

    it('should create not found error with custom resource', () => {
      const exception = new NotFoundError('User');

      expect(exception.status).toBe(404);
      expect(exception.message).toBe('User not found');
      expect(exception.code).toBe('NOT_FOUND');
    });
  });

  describe('ConflictError', () => {
    it('should create conflict error with default message', () => {
      const exception = new ConflictError();

      expect(exception.status).toBe(409);
      expect(exception.message).toBe('Resource conflict');
      expect(exception.code).toBe('CONFLICT');
    });

    it('should create conflict error with custom message', () => {
      const exception = new ConflictError('Email already exists');

      expect(exception.status).toBe(409);
      expect(exception.message).toBe('Email already exists');
      expect(exception.code).toBe('CONFLICT');
    });
  });
});

import { generateToken, verifyToken } from '../../src/utils/jwt';
import HttpException from '../../src/utils/HttpException';

// Mock the logger to avoid console output during tests
jest.mock('../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('JWT Utils', () => {
  beforeEach(() => {
    // Set test JWT secret
    process.env.JWT_SECRET = 'test-jwt-secret-for-unit-tests';
  });

  describe('generateToken', () => {
    it('should generate a valid token with default expiry', () => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect((token as string).split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should generate a token with custom expiry', () => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = generateToken(payload, '2h');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should handle invalid payload gracefully', () => {
      const circularPayload: Record<string, unknown> = {};
      (circularPayload as Record<string, unknown>).self = circularPayload;

      expect(() => generateToken(circularPayload)).toThrow(HttpException);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = generateToken(payload);

      const decoded = verifyToken(token) as { id: number; email: string; iat: number; exp: number };

      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(1);
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => verifyToken(invalidToken)).toThrow(HttpException);
      expect(() => verifyToken(invalidToken)).toThrow('Invalid token');
    });

    it('should handle malformed token', () => {
      const malformedToken = 'not.a.valid.jwt.token';

      expect(() => verifyToken(malformedToken)).toThrow(HttpException);
    });
  });
});

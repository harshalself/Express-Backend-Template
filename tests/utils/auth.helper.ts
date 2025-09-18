import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { dbHelper } from './database.helper';
import { TestUser } from './factories';

export class AuthTestHelper {
  static generateJwtToken(userId: number, email: string): string {
    const secret = process.env.JWT_SECRET || 'test-jwt-secret';
    return jwt.sign({ id: userId, email }, secret, { expiresIn: '24h' });
  }

  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  static async createTestUser(
    userData: TestUser
  ): Promise<{ user: { id: number; email: string; name: string }; token: string }> {
    const hashedPassword = await this.hashPassword(userData.password);

    const [user] = await dbHelper
      .getDb()('users')
      .insert({
        ...userData,
        password: hashedPassword,
        created_by: 1, // Use system user ID for tests
      })
      .returning('*');

    const token = this.generateJwtToken(user.id, user.email);

    return { user, token };
  }

  static async createTestUserWithToken(): Promise<{
    user: { id: number; email: string; name: string };
    token: string;
    rawPassword: string;
  }> {
    const rawPassword = 'TestPassword123!';
    const userData = {
      email: 'testuser@example.com',
      password: rawPassword,
      name: 'Test User',
    };

    const { user, token } = await this.createTestUser(userData);
    return { user, token, rawPassword };
  }

  static getAuthHeaders(token: string): { Authorization: string } {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  static async verifyToken(
    token: string
  ): Promise<{ id: number; email: string; iat: number; exp: number }> {
    const secret = process.env.JWT_SECRET || 'test-jwt-secret';
    return jwt.verify(token, secret) as { id: number; email: string; iat: number; exp: number };
  }
}

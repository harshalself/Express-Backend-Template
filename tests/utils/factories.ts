import { UuidTestHelper } from './uuid.helper';

export interface TestUser {
  id?: number;
  email: string;
  password: string;
  name?: string;
  created_by?: number;
  created_at?: Date;
}

export interface TestAgent {
  id?: number;
  user_id: number;
  name: string;
  description?: string;
  system_prompt?: string;
  created_at?: Date;
}

export interface TestSource {
  id?: number;
  user_id: number;
  name: string;
  type: string;
  content?: string;
  metadata?: Record<string, unknown>;
  created_at?: Date;
}

export interface TestChatSession {
  id?: number;
  user_id: number;
  agent_id?: number;
  title?: string;
  created_at?: Date;
}

/**
 * Test Data Factory - Creates realistic test data with proper UUID generation
 */
export class TestDataFactory {
  /**
   * Create a test user with unique email and realistic data
   */
  static createUser(overrides: Partial<TestUser> = {}): TestUser {
    // Use timestamp + random to ensure uniqueness
    const uniqueId = `${Date.now()}.${Math.random().toString(36).substr(2, 5)}`;
    return {
      email: `testuser.${uniqueId}@example.com`,
      password: 'TestPassword123!',
      name: `Test User ${uniqueId.substr(-8)}`,
      created_by: 1, // Use system user ID for tests
      created_at: new Date(),
      ...overrides,
    };
  }

  /**
   * Create a test agent with realistic data
   */
  static createAgent(userId: number, overrides: Partial<TestAgent> = {}): TestAgent {
    const uniqueId = `${Date.now()}.${Math.random().toString(36).substr(2, 5)}`;
    return {
      user_id: userId,
      name: `Test Agent ${uniqueId.substr(-8)}`,
      description: `Test agent description ${uniqueId.substr(-8)}`,
      system_prompt: 'You are a helpful test assistant.',
      created_at: new Date(),
      ...overrides,
    };
  }

  /**
   * Create a test source with realistic data
   */
  static createSource(userId: number, overrides: Partial<TestSource> = {}): TestSource {
    const uniqueId = `${Date.now()}.${Math.random().toString(36).substr(2, 5)}`;
    return {
      user_id: userId,
      name: `Test Source ${uniqueId.substr(-8)}`,
      type: 'text',
      content: `Test content for source ${uniqueId.substr(-8)}`,
      metadata: { test: true, uuid: UuidTestHelper.generateRealId() },
      created_at: new Date(),
      ...overrides,
    };
  }

  /**
   * Create a test chat session with realistic data
   */
  static createChatSession(
    userId: number,
    overrides: Partial<TestChatSession> = {}
  ): TestChatSession {
    const uniqueId = `${Date.now()}.${Math.random().toString(36).substr(2, 5)}`;
    return {
      user_id: userId,
      title: `Test Chat ${uniqueId.substr(-8)}`,
      created_at: new Date(),
      ...overrides,
    };
  }

  /**
   * Create multiple unique users for testing
   */
  static createMultipleUsers(count: number): TestUser[] {
    return Array.from({ length: count }, (_, index) => {
      // Add index to ensure uniqueness even with rapid creation
      const delay = index * 10; // Small delay to ensure timestamp uniqueness
      return this.createUser({
        email: `testuser.${Date.now() + delay}.${index}@example.com`,
      });
    });
  }

  /**
   * Create multiple unique agents for testing
   */
  static createMultipleAgents(userId: number, count: number): TestAgent[] {
    return Array.from({ length: count }, (_, index) => {
      const delay = index * 10;
      return this.createAgent(userId, {
        name: `Test Agent ${Date.now() + delay}.${index}`,
      });
    });
  }
}

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

export class TestDataFactory {
  static createUser(overrides: Partial<TestUser> = {}): TestUser {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);

    return {
      email: `testuser.${timestamp}.${random}@example.com`,
      password: 'TestPassword123!',
      name: `Test User ${random}`,
      created_by: 1,
      created_at: new Date(),
      ...overrides,
    };
  }

  static createAgent(userId: number, overrides: Partial<TestAgent> = {}): TestAgent {
    const random = Math.random().toString(36).substr(2, 5);

    return {
      user_id: userId,
      name: `Test Agent ${random}`,
      description: `Test agent description ${random}`,
      system_prompt: 'You are a helpful test assistant.',
      created_at: new Date(),
      ...overrides,
    };
  }

  static createSource(userId: number, overrides: Partial<TestSource> = {}): TestSource {
    const random = Math.random().toString(36).substr(2, 5);

    return {
      user_id: userId,
      name: `Test Source ${random}`,
      type: 'text',
      content: `Test content for source ${random}`,
      metadata: { test: true, uuid: UuidTestHelper.generateRealId() },
      created_at: new Date(),
      ...overrides,
    };
  }

  static createChatSession(
    userId: number,
    overrides: Partial<TestChatSession> = {}
  ): TestChatSession {
    const random = Math.random().toString(36).substr(2, 5);

    return {
      user_id: userId,
      title: `Test Chat ${random}`,
      created_at: new Date(),
      ...overrides,
    };
  }

  static createMultipleUsers(count: number): TestUser[] {
    return Array.from({ length: count }, (_, index) =>
      this.createUser({
        email: `testuser.${Date.now()}.${index}@example.com`,
      })
    );
  }

  static createMultipleAgents(userId: number, count: number): TestAgent[] {
    return Array.from({ length: count }, (_, index) =>
      this.createAgent(userId, {
        name: `Test Agent ${Date.now()}.${index}`,
      })
    );
  }
}

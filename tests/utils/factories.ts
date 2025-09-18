import { v4 as uuidv4 } from 'uuid';

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
    const id = uuidv4().substring(0, 8);
    return {
      email: `testuser${id}@example.com`,
      password: 'TestPassword123!',
      name: `Test User ${id}`,
      created_by: 1, // Use system user ID for tests
      created_at: new Date(),
      ...overrides,
    };
  }

  static createAgent(userId: number, overrides: Partial<TestAgent> = {}): TestAgent {
    const id = uuidv4().substring(0, 8);
    return {
      user_id: userId,
      name: `Test Agent ${id}`,
      description: `Test agent description ${id}`,
      system_prompt: 'You are a helpful test assistant.',
      created_at: new Date(),
      ...overrides,
    };
  }

  static createSource(userId: number, overrides: Partial<TestSource> = {}): TestSource {
    const id = uuidv4().substring(0, 8);
    return {
      user_id: userId,
      name: `Test Source ${id}`,
      type: 'text',
      content: `Test content for source ${id}`,
      metadata: { test: true },
      created_at: new Date(),
      ...overrides,
    };
  }

  static createChatSession(
    userId: number,
    overrides: Partial<TestChatSession> = {}
  ): TestChatSession {
    const id = uuidv4().substring(0, 8);
    return {
      user_id: userId,
      title: `Test Chat ${id}`,
      created_at: new Date(),
      ...overrides,
    };
  }

  static createMultipleUsers(count: number): TestUser[] {
    return Array.from({ length: count }, () => this.createUser());
  }

  static createMultipleAgents(userId: number, count: number): TestAgent[] {
    return Array.from({ length: count }, () => this.createAgent(userId));
  }
}

import knex, { Knex } from 'knex';
import { config } from 'dotenv';

config();

export class DatabaseTestHelper {
  private static instance: DatabaseTestHelper;
  private db: Knex;

  private constructor() {
    // Use test database configuration
    this.db = knex({
      client: 'pg',
      connection: {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'admin123',
        database: process.env.DB_DATABASE || 'postgres_test',
      },
      pool: { min: 0, max: 10 },
    });
  }

  public static getInstance(): DatabaseTestHelper {
    if (!DatabaseTestHelper.instance) {
      DatabaseTestHelper.instance = new DatabaseTestHelper();
    }
    return DatabaseTestHelper.instance;
  }

  public getDb(): Knex {
    return this.db;
  }

  // Clean all test tables
  public async cleanup(): Promise<void> {
    try {
      await this.db.raw('TRUNCATE TABLE messages CASCADE');
      await this.db.raw('TRUNCATE TABLE chat_sessions CASCADE');
      await this.db.raw('TRUNCATE TABLE agents CASCADE');
      await this.db.raw('TRUNCATE TABLE sources CASCADE');
      await this.db.raw('TRUNCATE TABLE users CASCADE');
      await this.db.raw('TRUNCATE TABLE provider_models CASCADE');
    } catch (error) {
      console.warn('Cleanup warning:', error);
    }
  }

  // Close database connection
  public async close(): Promise<void> {
    await this.db.destroy();
  }

  // Reset sequences
  public async resetSequences(): Promise<void> {
    try {
      await this.db.raw('ALTER SEQUENCE users_id_seq RESTART WITH 1');
      await this.db.raw('ALTER SEQUENCE agents_id_seq RESTART WITH 1');
      await this.db.raw('ALTER SEQUENCE sources_id_seq RESTART WITH 1');
      await this.db.raw('ALTER SEQUENCE chat_sessions_id_seq RESTART WITH 1');
      await this.db.raw('ALTER SEQUENCE messages_id_seq RESTART WITH 1');
      await this.db.raw('ALTER SEQUENCE provider_models_id_seq RESTART WITH 1');
    } catch (error) {
      console.warn('Reset sequences warning:', error);
    }
  }
}

export const dbHelper = DatabaseTestHelper.getInstance();

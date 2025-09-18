import DB from './index.schema';
import { seeds } from './seeds';
import { logger } from '../src/utils/logger';

// Import schema modules
import * as Users from './users.schema';
import * as Sources from './sources.schema';
import * as FileSources from './file_sources.schema';
import * as TextSources from './text_sources.schema';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to drop a table
const dropTable = async (
  schema: {
    dropTable: () => Promise<void>;
  },
  tableName: string
) => {
  logger.info(`Dropping ${tableName} table...`);
  await schema.dropTable();
};

// Helper function to create and optionally seed a table
const createAndSeedTable = async (
  schema: {
    createTable: () => Promise<void>;
  },
  tableName: string,
  data: unknown[],
  doSeed: boolean
) => {
  logger.info(`Creating ${tableName} table...`);
  await schema.createTable();
  if (doSeed && data && data.length > 0) {
    logger.info(`Seeding ${tableName} table...`);
    await DB(tableName).del(); // Clear existing data
    await DB(tableName).insert(data);
  }
};

export const migrateAll = async (dropFirst = false, doSeed = true) => {
  try {
    logger.info('Starting database migration and seeding...\n');

    if (dropFirst) {
      logger.info('🗑️  Dropping all tables in reverse dependency order...\n');
      // Level 2: Drop sources and source types
      logger.info('Level 2: Dropping source type tables...');
      await Promise.all([
        dropTable(TextSources, 'text_sources'),
        dropTable(FileSources, 'file_sources'),
      ]);
      logger.info('✓ Source type tables dropped');

      // Drop sources table
      await dropTable(Sources, 'sources');
      logger.info('✓ Sources table dropped\n');

      // Small delay to ensure cleanup
      await sleep(1000);

      // Level 1: Drop base tables last
      logger.info('Level 1: Dropping base tables...');
      await dropTable(Users, 'users');
      logger.info('✓ Users table dropped\n');

      logger.info('🎯 All tables dropped successfully!\n');
    }

    // Now create tables in correct dependency order
    logger.info('🏗️  Creating all tables in dependency order...\n');

    // Level 1: Base Tables
    logger.info('Level 1: Creating base tables...');
    await createAndSeedTable(Users, 'users', seeds.users, doSeed);
    logger.info(`✓ Users table created${doSeed ? ' and seeded' : ''}\n`);

    // Small delay to ensure foreign keys are ready
    await sleep(1000);

    // Level 2: Sources and source types
    logger.info('Level 2: Creating sources and source types...');
    await createAndSeedTable(Sources, 'sources', seeds.sources, doSeed);
    logger.info(`✓ Sources table created${doSeed ? ' and seeded' : ''}`);

    // Create all source type tables in parallel
    await Promise.all([
      createAndSeedTable(FileSources, 'file_sources', seeds.fileSources, doSeed),
      createAndSeedTable(TextSources, 'text_sources', seeds.textSources, doSeed),
    ]);
    logger.info(`✓ All source type tables created${doSeed ? ' and seeded' : ''}\n`);

    logger.info('✨ All database migrations and seeding completed successfully!');
  } catch (error) {
    logger.error('Error during migration:', error);
    throw error;
  }
};

// Run directly if this file is being executed directly

if (require.main === module) {
  const args = process.argv.slice(2);
  const dropFirst = args.includes('--drop');
  const noSeed = args.includes('--no-seed');
  migrateAll(dropFirst, !noSeed)
    .then(() => {
      logger.info('Migration and seeding completed');
      process.exit(0);
    })
    .catch(error => {
      logger.error('Error during migration and seeding:', error);
      process.exit(1);
    });
}

/*
Usage:

1. To run ALL migrations without dropping tables (keeps existing data):
   npx ts-node src/database/migrate.schema.ts


2. To run ALL migrations and reset all data:
   npx ts-node src/database/migrate.schema.ts --drop

3. To run ALL migrations and reset all tables (no seed data):
   npx ts-node src/database/migrate.schema.ts --drop --no-seed


3. To run individual schema migrations:
   npx ts-node database/users.schema.ts         # Migrate users table
   npx ts-node database/sources.schema.ts       # Migrate sources table
   npx ts-node database/file_sources.schema.ts  # Migrate file sources table
   npx ts-node database/text_sources.schema.ts  # Migrate text sources table

Note: When running individual migrations, make sure to maintain the dependency order:
1. Users
2. Sources, File Sources, Text Sources
*/

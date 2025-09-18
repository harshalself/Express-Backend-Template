import DB from './index.schema';
import { seeds } from './seeds';
import { logger } from '../src/utils/logger';

export const SOURCES_TABLE = 'sources';

// Schema Definition
export const createTable = async () => {
  await DB.schema.createTable(SOURCES_TABLE, table => {
    table.increments('id').primary();
    table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('source_type').notNullable().checkIn(['file', 'text']);
    table.string('name').notNullable();
    table.text('description').nullable();
    table
      .text('status')
      .defaultTo('pending')
      .checkIn(['pending', 'processing', 'completed', 'failed']);
    table.boolean('is_embedded').defaultTo(false); // Track if content is vectorized
    table.integer('created_by').notNullable();
    table.timestamp('created_at').defaultTo(DB.fn.now());
    table.integer('updated_by').nullable();
    table.timestamp('updated_at').defaultTo(DB.fn.now());
    table.boolean('is_deleted').defaultTo(false);
    table.integer('deleted_by').nullable();
    table.timestamp('deleted_at').nullable();
  });

  // Create the update_timestamp trigger
  await DB.raw(`
    CREATE TRIGGER update_sources_timestamp
    BEFORE UPDATE ON ${SOURCES_TABLE}
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp();
  `);
};

// Drop Table (handles dependencies)
export const dropTable = async () => {
  // Drop all dependent tables first
  const dependentTables = ['file_sources', 'text_sources'];

  for (const table of dependentTables) {
    logger.info(`Dropping dependent table: ${table}...`);
    await DB.schema.dropTableIfExists(table);
  }

  // Then drop the sources table
  await DB.schema.dropTableIfExists(SOURCES_TABLE);
};

// Seed table with data from central seeds file
export const seedTable = async () => {
  if (seeds.sources && seeds.sources.length > 0) {
    await DB(SOURCES_TABLE).del();
    await DB(SOURCES_TABLE).insert(seeds.sources);
  }
};

// For individual table migration (when run directly)
if (require.main === module) {
  const dropFirst = process.argv.includes('--drop');
  const skipSeed = process.argv.includes('--no-seed');

  (async () => {
    try {
      if (dropFirst) {
        logger.info(`Dropping ${SOURCES_TABLE} table and its dependencies...`);
        await dropTable();
      }
      logger.info(`Creating ${SOURCES_TABLE} table...`);
      await createTable();

      if (!skipSeed) {
        logger.info(`Seeding ${SOURCES_TABLE} table...`);
        await seedTable();
      }

      logger.info(
        `${SOURCES_TABLE} table ${dropFirst ? 'recreated' : 'created'}${
          skipSeed ? '' : ' and seeded'
        }`
      );
      process.exit(0);
    } catch (error) {
      logger.error(`Error with ${SOURCES_TABLE} table:`, error);
      process.exit(1);
    }
  })();
}

/* Usage:
   npx ts-node database/sources.schema.ts       # Create and seed table
   npx ts-node database/sources.schema.ts --drop # Recreate and seed table (drops dependent tables too)
   npx ts-node database/sources.schema.ts --no-seed # Create table without seeding
   npx ts-node database/sources.schema.ts --drop --no-seed # Recreate table without seeding

   Note: This table has dependencies. The following tables will be dropped if --drop is used:
   - file_sources
   - text_sources
*/

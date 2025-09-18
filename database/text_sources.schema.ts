import DB from './index.schema';
import { seeds } from './seeds';
import { logger } from '../src/utils/logger';

export const TEXT_SOURCES_TABLE = 'text_sources';

// Schema Definition
export const createTable = async () => {
  await DB.schema.createTable(TEXT_SOURCES_TABLE, table => {
    table.increments('id').primary();
    table
      .integer('source_id')
      .notNullable()
      .references('id')
      .inTable('sources')
      .onDelete('CASCADE');
    table.text('content').notNullable();
  });

  // Create the update_timestamp trigger
  await DB.raw(`
    CREATE TRIGGER update_text_sources_timestamp
    BEFORE UPDATE ON ${TEXT_SOURCES_TABLE}
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp();
  `);
};

// Drop Table
export const dropTable = async () => {
  await DB.schema.dropTableIfExists(TEXT_SOURCES_TABLE);
};

// Seed table with data from central seeds file
export const seedTable = async () => {
  if (seeds.textSources && seeds.textSources.length > 0) {
    await DB(TEXT_SOURCES_TABLE).del();
    await DB(TEXT_SOURCES_TABLE).insert(seeds.textSources);
  }
};

// For individual table migration (when run directly)
if (require.main === module) {
  const dropFirst = process.argv.includes('--drop');
  const skipSeed = process.argv.includes('--no-seed');

  (async () => {
    try {
      if (dropFirst) {
        logger.info(`Dropping ${TEXT_SOURCES_TABLE} table...`);
        await dropTable();
      }
      logger.info(`Creating ${TEXT_SOURCES_TABLE} table...`);
      await createTable();

      if (!skipSeed) {
        logger.info(`Seeding ${TEXT_SOURCES_TABLE} table...`);
        await seedTable();
      }

      logger.info(
        `${TEXT_SOURCES_TABLE} table ${dropFirst ? 'recreated' : 'created'}${
          skipSeed ? '' : ' and seeded'
        }`
      );
      process.exit(0);
    } catch (error) {
      logger.error(`Error with ${TEXT_SOURCES_TABLE} table:`, error);
      process.exit(1);
    }
  })();
}

/* Usage:
   npx ts-node database/text_sources.schema.ts       # Create and seed table
   npx ts-node database/text_sources.schema.ts --drop # Recreate and seed table
   npx ts-node database/text_sources.schema.ts --no-seed # Create table without seeding
   npx ts-node database/text_sources.schema.ts --drop --no-seed # Recreate table without seeding

   Note: This table depends on the sources table. Make sure it exists before migrating.
*/

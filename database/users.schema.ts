import DB from "./index.schema";
import { seeds } from "./seeds";
import { logger } from "../src/utils/logger";

export const USERS_TABLE = "users";

// Schema Definition
export const createTable = async () => {
  // First, create the update_timestamp function if it doesn't exist
  // This is needed by all tables but we'll create it here since users is our first table
  await DB.raw(`
    CREATE OR REPLACE FUNCTION update_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create users table
  await DB.schema.createTable(USERS_TABLE, (table) => {
    table.increments("id").primary();
    table.text("name").notNullable();
    table.text("email").unique().notNullable();
    table.text("password").notNullable();
    table.text("phone_number").nullable();
    table.integer("created_by").notNullable();
    table.timestamp("created_at").defaultTo(DB.fn.now());
    table.integer("updated_by").nullable();
    table.timestamp("updated_at").defaultTo(DB.fn.now());
    table.boolean("is_deleted").defaultTo(false);
    table.integer("deleted_by").nullable();
    table.timestamp("deleted_at").nullable();
  });

  // Create the update_timestamp trigger
  await DB.raw(`
    CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE ON ${USERS_TABLE}
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp();
  `);
};

// Drop Table
export const dropTable = async () => {
  await DB.schema.dropTableIfExists(USERS_TABLE);
};

// Seed table with data from central seeds file
export const seedTable = async () => {
  if (seeds.users && seeds.users.length > 0) {
    await DB(USERS_TABLE).del();
    await DB(USERS_TABLE).insert(seeds.users);
  }
};

// For individual table migration (when run directly)
if (require.main === module) {
  const dropFirst = process.argv.includes("--drop");
  const skipSeed = process.argv.includes("--no-seed");

  (async () => {
    try {
      if (dropFirst) {
        logger.info(`Dropping ${USERS_TABLE} table...`);
        await dropTable();
      }
      logger.info(`Creating ${USERS_TABLE} table...`);
      await createTable();

      if (!skipSeed) {
        logger.info(`Seeding ${USERS_TABLE} table...`);
        await seedTable();
      }

      logger.info(
        `${USERS_TABLE} table ${dropFirst ? "recreated" : "created"}${
          skipSeed ? "" : " and seeded"
        }`
      );
      process.exit(0);
    } catch (error) {
      logger.error(`Error with ${USERS_TABLE} table:`, error);
      process.exit(1);
    }
  })();
}

/* Usage:
   npx ts-node database/users.schema.ts       # Create and seed table
   npx ts-node database/users.schema.ts --drop # Recreate and seed table
   npx ts-node database/users.schema.ts --no-seed # Create table without seeding
   npx ts-node database/users.schema.ts --drop --no-seed # Recreate table without seeding

   Note: This is a base table that other tables depend on. It should be migrated first.
*/

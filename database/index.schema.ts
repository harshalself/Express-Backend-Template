import dotenv from "dotenv";
dotenv.config({ quiet: true });

import knex from "knex";

const awsConfig = {
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT || "5432"),
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  },
  pool: { min: 1, max: 5 },
  searchPath: "public",
};

const DB = knex(awsConfig);

export default DB;

// Table Names
import { USERS_TABLE } from "./users.schema";
import { SOURCES_TABLE } from "./sources.schema";
import { FILE_SOURCES_TABLE } from "./file_sources.schema";
import { TEXT_SOURCES_TABLE } from "./text_sources.schema";

// Table Names
export const T = {
  USERS_TABLE,
  SOURCES_TABLE,
  FILE_SOURCES_TABLE,
  TEXT_SOURCES_TABLE,
};

// Creates the procedure that is then added as a trigger to every table
// Only needs to be run once on each postgres schema
export const createProcedure = async () => {
  await DB.raw(`
      CREATE OR REPLACE FUNCTION update_timestamp() RETURNS TRIGGER
      LANGUAGE plpgsql
      AS
      $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$;
    `);
};

// const run = async () => {
//   createProcedure();
// };
// run();

import App from "./app";
import { logger } from "./utils/logger";
import validateEnv from "./utils/validateEnv";
import UserRoute from "./features/user/user.route";
import BaseSourceRoute from "./features/source/source.route";
import FileSourceRoute from "./features/source/file/file-source.route";
import TextSourceRoute from "./features/source/text/text-source.route";
import { testDbConnection } from "./utils/testdbConnection";
import { testRedisConnection } from "./utils/redis";

validateEnv();

async function bootstrap() {
  try {
    logger.info("🚀 Starting Express Backend Template...");

    // Check DB connection
    await testDbConnection();

    // Initialize Redis connection (optional)
    await testRedisConnection();

    // Start Express app
    const app = new App([
      new UserRoute(),
      new BaseSourceRoute(),
      new FileSourceRoute(),
      new TextSourceRoute(),
    ]);

    app.listen();
    logger.info("✅ Express Backend Template started successfully!");
  } catch (error) {
    logger.error(
      "App failed to start: " + (error && error.stack ? error.stack : error)
    );
    process.exit(1); // Stop if critical services fail
  }
}

bootstrap();

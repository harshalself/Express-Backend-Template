import cookieParser from 'cookie-parser';
import express from 'express';
import hpp from 'hpp';
import compression from 'compression';
import { authRateLimit, apiRateLimit } from './middlewares/rate-limit.middleware';
import { requestIdMiddleware } from './middlewares/request-id.middleware';
import { securityMiddleware } from './middlewares/security.middleware';
import { corsMiddleware } from './middlewares/cors.middleware';
import {
  requestLoggerMiddleware,
  apiRequestLoggerMiddleware,
} from './middlewares/request-logger.middleware';
import Routes from './interfaces/route.interface';
import errorMiddleware from './middlewares/error.middleware';
import { logger } from './utils/logger';
import authMiddleware from './middlewares/auth.middleware';
import { setupSwagger, updateSwaggerServers } from '../docs/swagger';

class App {
  public app: express.Application;
  public port: string | number;
  public env: string;

  constructor(routes: Routes[]) {
    // Initialize the express app
    this.app = express();
    this.port = process.env.PORT || 8000;
    this.env = process.env.NODE_ENV || 'development';

    this.app.use(cookieParser());
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();

    this.app.get('/', (req, res) => {
      res.send('Welcome to Express Backend Template API');
    });

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: this.env,
        uptime: process.uptime(),
        memory: {
          used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
          total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
        },
        version: process.env.npm_package_version || '1.0.0',
      });
    });
  }

  public listen() {
    const port = Number(this.port);
    this.app.listen(port, '0.0.0.0', () => {
      logger.info(
        `🚀 Express Backend Template API listening on port ${port}. Environment: ${this.env}.`
      );
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    // Request ID middleware (must be first)
    this.app.use(requestIdMiddleware);

    // Security middlewares
    this.app.use(securityMiddleware);
    this.app.use(corsMiddleware);
    this.app.use(hpp());

    // Logging middleware
    this.app.use(requestLoggerMiddleware);

    // Compression
    this.app.use(compression());

    // Rate limiting
    this.app.use('/api/v1/users/login', authRateLimit);
    this.app.use('/api/v1/users/register', authRateLimit);
    this.app.use('/api/v1/', apiRateLimit);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ limit: '10mb', extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
    // Add logging middleware after auth for user context
    this.app.use('/api/v1/', apiRequestLoggerMiddleware);

    this.app.use('/api/v1/', authMiddleware);
    routes.forEach(route => {
      this.app.use('/api/v1/', route.router);
    });
  }

  private initializeSwagger() {
    // Update server URLs based on environment
    const serverUrl = `http://localhost:${this.port}`;
    updateSwaggerServers([
      {
        url: serverUrl,
        description: `${this.env} server (Root routes)`,
      },
      {
        url: `${serverUrl}/api/v1`,
        description: `${this.env} server (API routes)`,
      },
    ]);

    // Setup Swagger documentation
    setupSwagger(this.app, '/api-docs');
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;

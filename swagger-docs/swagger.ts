import swaggerUi from 'swagger-ui-express';
import { parse as parseYaml } from 'yaml';
import fs from 'fs';
import path from 'path';
import { Application } from 'express';
import { logger } from '../src/utils/logger';
import { SwaggerDocument, SwaggerRequestType, SwaggerResponseType } from './swagger.interface';

/**
 * Swagger Configuration Module
 * Sets up Swagger UI documentation for the API
 */
class SwaggerConfig {
  private swaggerDocument: SwaggerDocument | null;

  constructor() {
    this.swaggerDocument = null;
    this.loadSwaggerDocument();
  }

  /**
   * Load the OpenAPI specification from YAML file
   */
  private loadSwaggerDocument(): void {
    try {
      // Enhanced YAML parse error logging for main swagger.yaml
      const swaggerPath = path.join(__dirname, 'swagger.yaml');
      try {
        this.swaggerDocument = parseYaml(fs.readFileSync(swaggerPath, 'utf8'));
      } catch (err: unknown) {
        const error = err as Error & {
          mark?: { name?: string; line: number; column: number };
        };
        logger.error('YAML Parse Error in swagger.yaml:', error.message);
        if (error.mark) {
          logger.error(
            `At ${error.mark.name || 'swagger.yaml'} line ${
              error.mark.line + 1
            }, column ${error.mark.column + 1}`
          );
        }
        logger.error(error.stack);
        fs.appendFileSync('error.log', `[${new Date().toISOString()}] ${error.stack}\n`);
        throw err;
      }

      // Load and integrate module-specific API docs
      const apiModules = [
        {
          name: 'Sources',
          path: 'sources.yaml',
        },
        {
          name: 'File Sources',
          path: 'file-sources.yaml',
        },
        {
          name: 'Text Sources',
          path: 'text-sources.yaml',
        },
        {
          name: 'Users',
          path: 'users.yaml',
        },
        { name: 'System', path: 'system.yaml' },
      ];

      // Process each API module
      for (const module of apiModules) {
        try {
          const modulePath = path.join(__dirname, module.path);
          let moduleDoc;
          try {
            moduleDoc = parseYaml(fs.readFileSync(modulePath, 'utf8'));
          } catch (err: unknown) {
            const error = err as Error & {
              mark?: { name?: string; line: number; column: number };
            };
            logger.error(`YAML Parse Error in ${module.path}:`, error.message);
            if (error.mark) {
              logger.error(
                `At ${error.mark.name || module.path} line ${
                  error.mark.line + 1
                }, column ${error.mark.column + 1}`
              );
            }
            logger.error(error.stack);
            fs.appendFileSync('error.log', `[${new Date().toISOString()}] ${error.stack}\n`);
            throw err;
          }

          // Merge paths from module YAML into main swagger document
          if (moduleDoc && moduleDoc.paths) {
            this.swaggerDocument.paths = {
              ...this.swaggerDocument.paths,
              ...moduleDoc.paths,
            };
          }

          // Merge all components from module YAML into main swagger document
          if (moduleDoc && moduleDoc.components) {
            // Ensure components object exists in the main document
            if (!this.swaggerDocument.components) {
              this.swaggerDocument.components = {};
            }

            // Merge each component type (schemas, responses, parameters, etc.)
            Object.keys(moduleDoc.components).forEach(componentType => {
              if (!this.swaggerDocument.components[componentType]) {
                this.swaggerDocument.components[componentType] = {};
              }

              this.swaggerDocument.components[componentType] = {
                ...this.swaggerDocument.components[componentType],
                ...moduleDoc.components[componentType],
              };
            });
          }

          // Silent success - no individual module logs
        } catch (moduleError) {
          logger.warn(`Failed to integrate ${module.name} API documentation:`, moduleError);
        }
      }

      // Validate the merged Swagger document
      this.validateSwaggerDocument();
    } catch (error) {
      logger.error('Error loading Swagger YAML file:', error);
      throw new Error('Failed to load Swagger documentation');
    }
  }

  /**
   * Validates the merged Swagger document for common issues
   */
  private validateSwaggerDocument(): void {
    if (!this.swaggerDocument) {
      logger.error('Swagger document is null or undefined');
      return;
    }

    // Check for empty paths
    if (!this.swaggerDocument.paths || Object.keys(this.swaggerDocument.paths).length === 0) {
      logger.warn(
        'Swagger document has no paths defined. Check that module files are correctly loaded.'
      );
    }

    // Check for components
    if (!this.swaggerDocument.components) {
      logger.warn('Swagger document has no components defined.');
    }

    logger.info(`✅ Swagger documentation loaded successfully.`);
  }

  /**
   * Configure Swagger UI options
   */
  private getSwaggerOptions() {
    return {
      explorer: true,
      swaggerOptions: {
        docExpansion: 'none', // 'list', 'full', 'none'
        filter: true,
        showRequestDuration: true,
        tryItOutEnabled: true,
        requestInterceptor: (request: SwaggerRequestType) => {
          // Add any request interceptors here
          return request;
        },
        responseInterceptor: (response: SwaggerResponseType) => {
          // Add any response interceptors here
          return response;
        },
      },
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { color: #3b82f6 }
        .swagger-ui .scheme-container { background: #f8fafc; border: 1px solid #e2e8f0; }
      `,
      customSiteTitle: 'Express Backend Template API Documentation',
      customfavIcon: '/favicon.ico',
    };
  }

  /**
   * Setup Swagger middleware for Express app
   * @param app Express application instance
   * @param docsPath Path where documentation will be served (default: '/api-docs')
   */
  public setupSwagger(app: Application, docsPath: string = '/api-docs'): void {
    if (!this.swaggerDocument) {
      logger.warn('Swagger document not loaded. Skipping Swagger setup.');
      return;
    }

    const options = this.getSwaggerOptions();

    // Serve Swagger UI
    app.use(docsPath, swaggerUi.serve);
    app.get(docsPath, swaggerUi.setup(this.swaggerDocument, options));

    // Serve raw OpenAPI JSON
    app.get(`${docsPath}.json`, (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(this.swaggerDocument);
    });

    logger.info(`📚 Swagger documentation available at: ${docsPath}`);
  }

  /**
   * Get the loaded Swagger document
   */
  public getSwaggerDocument(): SwaggerDocument | null {
    return this.swaggerDocument;
  }

  /**
   * Update server URLs dynamically based on environment
   * @param servers Array of server objects
   */
  public updateServers(servers: Array<{ url: string; description: string }>): void {
    if (this.swaggerDocument && this.swaggerDocument.servers) {
      this.swaggerDocument.servers = servers;
    }
  }
}

// Export a singleton instance
const swaggerConfig = new SwaggerConfig();

/**
 * Setup Swagger documentation for Express app
 * @param app Express application instance
 * @param docsPath Path where documentation will be served (default: '/api-docs')
 */
export const setupSwagger = (app: Application, docsPath?: string) => {
  swaggerConfig.setupSwagger(app, docsPath);
};

/**
 * Update server URLs in Swagger document
 * @param servers Array of server objects
 */
export const updateSwaggerServers = (servers: Array<{ url: string; description: string }>) => {
  swaggerConfig.updateServers(servers);
};

/**
 * Get the Swagger document
 */
export const getSwaggerDocument = () => {
  return swaggerConfig.getSwaggerDocument();
};

export default swaggerConfig;

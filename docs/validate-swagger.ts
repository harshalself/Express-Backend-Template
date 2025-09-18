/**
 * Swagger Documentation Validator
 *
 * This utility script validates the Swagger documentation structure and checks
 * for common issues in the modular API documentation approach.
 *
 * Usage:
 * npx ts-node docs/validate-swagger.ts
 */

import path from "path";
import fs from "fs";
import YAML from "yamljs";
import { logger } from "../src/utils/logger";

interface ModuleInfo {
  name: string;
  path: string;
  doc?: {
    paths?: Record<string, unknown>;
    components?: {
      schemas?: Record<string, unknown>;
    };
  };
}

class SwaggerValidator {
  private swaggerDocument: {
    paths?: Record<string, unknown>;
    components?: {
      schemas?: Record<string, unknown>;
    };
  } | null = null;
  private modules: ModuleInfo[] = [];
  private docsDir: string;

  constructor() {
    this.docsDir = path.join(__dirname);
    this.loadMainSwagger();
    this.detectModules();
  }

  private loadMainSwagger(): void {
    try {
      const swaggerPath = path.join(this.docsDir, "swagger.yaml");
      this.swaggerDocument = YAML.load(swaggerPath);
      logger.info("✅ Main swagger.yaml loaded successfully");
    } catch (error) {
      logger.error("❌ Failed to load main swagger.yaml:", error);
    }
  }

  private detectModules(): void {
    try {
      // Get all yaml files in the docs directory
      const files = fs
        .readdirSync(this.docsDir)
        .filter((file) => file.endsWith(".yaml") && file !== "swagger.yaml");

      // Load each module
      files.forEach((file) => {
        try {
          const modulePath = path.join(this.docsDir, file);
          const moduleDoc = YAML.load(modulePath);
          this.modules.push({
            name: file.replace(".yaml", ""),
            path: file,
            doc: moduleDoc,
          });
          logger.info(`✅ Detected module: ${file}`);
        } catch (moduleError) {
          logger.warn(`❌ Failed to load module ${file}:`, moduleError);
        }
      });

      logger.info(`Found ${this.modules.length} API documentation modules`);
    } catch (error) {
      logger.error("Failed to detect modules:", error);
    }
  }

  public validateAll(): void {
    this.validateMainSwagger();
    this.validateModules();
    this.checkForDuplicatePaths();
    this.checkForMissingComponents();
    this.summarize();
  }

  private validateMainSwagger(): void {
    if (!this.swaggerDocument) {
      logger.error("❌ Main swagger.yaml not loaded");
      return;
    }

    // Check base structure
    const requiredFields = ["openapi", "info", "paths", "components"];
    const missingFields = requiredFields.filter(
      (field) => !(this.swaggerDocument as Record<string, unknown>)[field]
    );

    if (missingFields.length > 0) {
      logger.warn(
        `❌ Main swagger.yaml is missing required fields: ${missingFields.join(
          ", "
        )}`
      );
    } else {
      logger.info("✅ Main swagger.yaml has all required top-level fields");
    }

    // Check if paths is empty (as expected in our modular approach)
    const pathCount = Object.keys(this.swaggerDocument.paths || {}).length;
    if (pathCount > 0) {
      logger.warn(
        `⚠️ Main swagger.yaml contains ${pathCount} paths that should be in module files`
      );
    } else {
      logger.info("✅ Main swagger.yaml has empty paths section as expected");
    }
  }

  private validateModules(): void {
    if (this.modules.length === 0) {
      logger.warn("❌ No API documentation modules detected");
      return;
    }

    this.modules.forEach((module) => {
      if (!module.doc) {
        logger.warn(`❌ Module ${module.name} could not be parsed`);
        return;
      }

      // Check if module has paths
      const pathCount = Object.keys(module.doc.paths || {}).length;
      if (pathCount === 0) {
        logger.warn(`❌ Module ${module.name} has no paths defined`);
      } else {
        logger.info(`✅ Module ${module.name} has ${pathCount} paths defined`);
      }

      // Check if module has components
      if (!module.doc.components || !module.doc.components.schemas) {
        logger.warn(
          `⚠️ Module ${module.name} has no component schemas defined`
        );
      } else {
        const schemaCount = Object.keys(module.doc.components.schemas).length;
        logger.info(
          `✅ Module ${module.name} has ${schemaCount} schemas defined`
        );
      }
    });
  }

  private checkForDuplicatePaths(): void {
    const pathMap = new Map<string, string[]>();

    // Collect paths from all modules
    this.modules.forEach((module) => {
      if (!module.doc || !module.doc.paths) return;

      Object.keys(module.doc.paths).forEach((path) => {
        if (!pathMap.has(path)) {
          pathMap.set(path, []);
        }
        pathMap.get(path)?.push(module.name);
      });
    });

    // Check for duplicates
    let hasDuplicates = false;
    pathMap.forEach((modules, path) => {
      if (modules.length > 1) {
        logger.warn(
          `❌ Path "${path}" is defined in multiple modules: ${modules.join(
            ", "
          )}`
        );
        hasDuplicates = true;
      }
    });

    if (!hasDuplicates) {
      logger.info("✅ No duplicate paths found across modules");
    }
  }

  private checkForMissingComponents(): void {
    // Collect all referenced schemas
    const referencedSchemas = new Set<string>();

    this.modules.forEach((module) => {
      if (!module.doc || !module.doc.paths) return;

      // Function to extract $ref values recursively
      const extractRefs = (obj: unknown): void => {
        if (!obj || typeof obj !== "object") return;

        const objRecord = obj as Record<string, unknown>;
        if (objRecord.$ref && typeof objRecord.$ref === "string") {
          // Extract schema name from "#/components/schemas/SchemaName"
          const match = objRecord.$ref.match(/#\/components\/schemas\/(\w+)/);
          if (match && match[1]) {
            referencedSchemas.add(match[1]);
          }
        }

        // Process all properties
        Object.values(objRecord).forEach((value) => extractRefs(value));
      };

      // Extract from paths
      extractRefs(module.doc.paths);
    });

    // Check if all referenced schemas are defined
    const definedSchemas = new Set<string>();

    // Add schemas from main swagger
    if (this.swaggerDocument?.components?.schemas) {
      Object.keys(this.swaggerDocument.components.schemas).forEach((schema) =>
        definedSchemas.add(schema)
      );
    }

    // Add schemas from modules
    this.modules.forEach((module) => {
      if (!module.doc?.components?.schemas) return;

      Object.keys(module.doc.components.schemas).forEach((schema) =>
        definedSchemas.add(schema)
      );
    });

    // Find missing schemas
    const missingSchemas: string[] = [];
    referencedSchemas.forEach((schema) => {
      if (!definedSchemas.has(schema)) {
        missingSchemas.push(schema);
      }
    });

    if (missingSchemas.length > 0) {
      logger.warn(
        `❌ Found ${
          missingSchemas.length
        } referenced schemas that are not defined: ${missingSchemas.join(", ")}`
      );
    } else {
      logger.info(
        `✅ All ${referencedSchemas.size} referenced schemas are properly defined`
      );
    }
  }

  private summarize(): void {
    console.log("\n=== Swagger Documentation Validation Summary ===");
    console.log(
      `Main swagger.yaml: ${this.swaggerDocument ? "✅ Valid" : "❌ Invalid"}`
    );
    console.log(`API Modules: ${this.modules.length} detected`);

    const totalPaths = this.modules.reduce((count, module) => {
      return count + Object.keys(module.doc?.paths || {}).length;
    }, 0);
    console.log(`Total API Paths: ${totalPaths}`);

    const totalSchemas = this.modules.reduce((count, module) => {
      return count + Object.keys(module.doc?.components?.schemas || {}).length;
    }, 0);
    console.log(`Total Schemas: ${totalSchemas}`);

    console.log("\nModules Status:");
    this.modules.forEach((module) => {
      const pathCount = Object.keys(module.doc?.paths || {}).length;
      const schemaCount = Object.keys(
        module.doc?.components?.schemas || {}
      ).length;
      console.log(
        `- ${module.name}: ${pathCount} paths, ${schemaCount} schemas`
      );
    });

    console.log("\nRun with 'npx ts-node docs/validate-swagger.ts'");
  }
}

// Run validation
const validator = new SwaggerValidator();
validator.validateAll();

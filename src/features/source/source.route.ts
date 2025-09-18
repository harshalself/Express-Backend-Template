import { Router } from "express";
import BaseSourceController from "./source.controller";
import Route from "../../interfaces/route.interface";
import {
  createSourceSchema,
  updateSourceSchema,
} from "./file/source.validation";
import validationMiddleware from "../../middlewares/validation.middleware";

class BaseSourceRoute implements Route {
  public path = "/sources";
  public router = Router();
  public baseSourceController = new BaseSourceController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // General source routes
    this.router.get(
      `${this.path}`,
      this.baseSourceController.getAllSourcesByUserId
    );
    this.router.post(
      `${this.path}`,
      validationMiddleware(createSourceSchema),
      this.baseSourceController.createSource
    );
    this.router.get(
      `${this.path}/:id`,
      this.baseSourceController.getSourceById
    );
    this.router.put(
      `${this.path}/:id`,
      validationMiddleware(updateSourceSchema),
      this.baseSourceController.updateSource
    );
    this.router.delete(
      `${this.path}/:id`,
      this.baseSourceController.deleteSource
    );
  }
}

export default BaseSourceRoute;

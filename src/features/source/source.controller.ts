import { NextFunction, Request, Response } from "express";
import BaseSourceService from "./source.service";
import { RequestWithUser } from "../../interfaces/auth.interface";
import HttpException from "../../utils/HttpException";
import { CreateSource, UpdateSource } from "./file/source.validation";

class BaseSourceController {
  public baseSourceService = new BaseSourceService();

  // Generic source methods
  public getAllSourcesByUserId = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.userId || req.user?.id;

      if (!userId) {
        throw new HttpException(401, "User authentication required");
      }

      const sources = await this.baseSourceService.getAllSourcesByUserId(
        userId
      );

      res
        .status(200)
        .json({ data: sources, message: "Sources retrieved successfully" });
    } catch (error) {
      next(error);
    }
  };

  public getSourceById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const sourceId = Number(req.params.id);
      const source = await this.baseSourceService.getSourceById(sourceId);

      res
        .status(200)
        .json({ data: source, message: "Source retrieved successfully" });
    } catch (error) {
      next(error);
    }
  };

  public deleteSource = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const sourceId = Number(req.params.id);
      const userId = req.userId || req.user?.id;

      if (!userId) {
        throw new HttpException(401, "User authentication required");
      }

      await this.baseSourceService.deleteSource(sourceId, userId);

      res.status(200).json({ message: "Source deleted successfully" });
    } catch (error) {
      next(error);
    }
  };

  public createSource = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const sourceData: CreateSource = req.body;
      const userId = req.userId || req.user?.id;

      if (!userId) {
        throw new HttpException(401, "User authentication required");
      }

      const source = await this.baseSourceService.createSource(
        sourceData,
        userId
      );

      res
        .status(201)
        .json({ data: source, message: "Source created successfully" });
    } catch (error) {
      next(error);
    }
  };

  public updateSource = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const sourceId = Number(req.params.id);
      const sourceData: UpdateSource = req.body;
      const userId = req.userId || req.user?.id;

      if (!userId) {
        throw new HttpException(401, "User authentication required");
      }

      const updatedSource = await this.baseSourceService.updateSource(
        sourceId,
        sourceData,
        userId
      );

      res.status(200).json({
        data: updatedSource,
        message: "Source updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default BaseSourceController;

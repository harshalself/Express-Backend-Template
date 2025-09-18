import { NextFunction, Request, Response } from "express";
import { CreateTextSource, UpdateTextSource } from "../file/source.validation";
import TextSourceService from "./text-source.service";
import { RequestWithUser } from "../../../interfaces/auth.interface";
import HttpException from "../../../utils/HttpException";

class TextSourceController {
  public textSourceService = new TextSourceService();

  public getAllTextSources = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.userId || req.user?.id;

      if (!userId) {
        throw new HttpException(401, "User authentication required");
      }

      const textSources = await this.textSourceService.getAllTextSources(
        userId
      );

      res.status(200).json({
        data: textSources,
        message: "Text sources retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public getTextSourceById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const sourceId = Number(req.params.id);
      const textSource = await this.textSourceService.getTextSourceById(
        sourceId
      );

      res.status(200).json({
        data: textSource,
        message: "Text source retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public createTextSource = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const textSourceData: CreateTextSource = req.body;
      const userId = req.userId || req.user?.id;

      if (!userId) {
        throw new HttpException(401, "User authentication required");
      }

      const textSource = await this.textSourceService.createTextSource(
        userId,
        textSourceData.name,
        textSourceData.description,
        textSourceData.content,
        userId
      );

      res.status(201).json({
        data: textSource,
        message: "Text source created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public updateTextSource = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const sourceId = Number(req.params.id);
      const textSourceData: UpdateTextSource = req.body;
      const userId = req.userId || req.user?.id;

      if (!userId) {
        throw new HttpException(401, "User authentication required");
      }

      const updatedTextSource = await this.textSourceService.updateTextSource(
        sourceId,
        textSourceData,
        userId
      );

      res.status(200).json({
        data: updatedTextSource,
        message: "Text source updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default TextSourceController;

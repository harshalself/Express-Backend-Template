import { NextFunction, Request, Response } from 'express';
import { CreateTextSource, UpdateTextSource } from '../file/source.validation';
import TextSourceService from './text-source.service';
import { RequestWithUser } from '../../../interfaces/auth.interface';
import HttpException from '../../../utils/HttpException';
import { ResponseFormatter } from '../../../utils/responseFormatter';

class TextSourceController {
  public textSourceService = new TextSourceService();

  public getAllTextSources = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId || req.user?.id;

      if (!userId) {
        throw new HttpException(401, 'User authentication required');
      }

      const textSources = await this.textSourceService.getAllTextSources(userId);

      ResponseFormatter.success(res, textSources, 'Text sources retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getTextSourceById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sourceId = Number(req.params.id);
      const textSource = await this.textSourceService.getTextSourceById(sourceId);

      ResponseFormatter.success(res, textSource, 'Text source retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public createTextSource = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const textSourceData: CreateTextSource = req.body;
      const userId = req.userId || req.user?.id;

      if (!userId) {
        throw new HttpException(401, 'User authentication required');
      }

      const textSource = await this.textSourceService.createTextSource(
        userId,
        textSourceData.name,
        textSourceData.description,
        textSourceData.content,
        userId
      );

      ResponseFormatter.created(res, textSource, 'Text source created successfully');
    } catch (error) {
      next(error);
    }
  };

  public updateTextSource = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const sourceId = Number(req.params.id);
      const textSourceData: UpdateTextSource = req.body;
      const userId = req.userId || req.user?.id;

      if (!userId) {
        throw new HttpException(401, 'User authentication required');
      }

      const updatedTextSource = await this.textSourceService.updateTextSource(
        sourceId,
        textSourceData,
        userId
      );

      ResponseFormatter.success(res, updatedTextSource, 'Text source updated successfully');
    } catch (error) {
      next(error);
    }
  };
}

export default TextSourceController;

import { NextFunction, Request, Response } from 'express';
import BaseSourceService from './source.service';
import { RequestWithUser } from '../../interfaces/auth.interface';
import HttpException from '../../utils/HttpException';
import { CreateSource, UpdateSource } from './file/source.validation';
import { ResponseFormatter } from '../../utils/responseFormatter';

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
        throw new HttpException(401, 'User authentication required');
      }

      const sources = await this.baseSourceService.getAllSourcesByUserId(userId);

      ResponseFormatter.success(res, sources, 'Sources retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getSourceById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sourceId = Number(req.params.id);
      const source = await this.baseSourceService.getSourceById(sourceId);

      ResponseFormatter.success(res, source, 'Source retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public deleteSource = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const sourceId = Number(req.params.id);
      const userId = req.userId || req.user?.id;

      if (!userId) {
        throw new HttpException(401, 'User authentication required');
      }

      await this.baseSourceService.deleteSource(sourceId, userId);

      ResponseFormatter.success(res, null, 'Source deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  public createSource = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const sourceData: CreateSource = req.body;
      const userId = req.userId || req.user?.id;

      if (!userId) {
        throw new HttpException(401, 'User authentication required');
      }

      const source = await this.baseSourceService.createSource(sourceData, userId);

      ResponseFormatter.created(res, source, 'Source created successfully');
    } catch (error) {
      next(error);
    }
  };

  public updateSource = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const sourceId = Number(req.params.id);
      const sourceData: UpdateSource = req.body;
      const userId = req.userId || req.user?.id;

      if (!userId) {
        throw new HttpException(401, 'User authentication required');
      }

      const updatedSource = await this.baseSourceService.updateSource(sourceId, sourceData, userId);

      ResponseFormatter.success(res, updatedSource, 'Source updated successfully');
    } catch (error) {
      next(error);
    }
  };
}

export default BaseSourceController;

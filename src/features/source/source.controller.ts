import { Request, Response } from 'express';
import BaseSourceService from './source.service';
import { RequestWithUser } from '../../interfaces/auth.interface';
import { CreateSource, UpdateSource } from './file/source.validation';
import { ResponseFormatter } from '../../utils/responseFormatter';
import { asyncHandler, parseIdParam, getUserId } from '../../utils/controllerHelpers';

class BaseSourceController {
  public baseSourceService = new BaseSourceService();

  // Generic source methods
  public getAllSourcesByUserId = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const userId = getUserId(req);
    const sources = await this.baseSourceService.getAllSourcesByUserId(userId);

    ResponseFormatter.success(res, sources, 'Sources retrieved successfully');
  });

  public getSourceById = asyncHandler(async (req: Request, res: Response) => {
    const sourceId = parseIdParam(req);
    const source = await this.baseSourceService.getSourceById(sourceId);

    ResponseFormatter.success(res, source, 'Source retrieved successfully');
  });

  public deleteSource = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const sourceId = parseIdParam(req);
    const userId = getUserId(req);

    await this.baseSourceService.deleteSource(sourceId, userId);

    ResponseFormatter.success(res, null, 'Source deleted successfully');
  });

  public createSource = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const sourceData: CreateSource = req.body;
    const userId = getUserId(req);

    const source = await this.baseSourceService.createSource(sourceData, userId);

    ResponseFormatter.created(res, source, 'Source created successfully');
  });

  public updateSource = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const sourceId = parseIdParam(req);
    const sourceData: UpdateSource = req.body;
    const userId = getUserId(req);

    const updatedSource = await this.baseSourceService.updateSource(sourceId, sourceData, userId);

    ResponseFormatter.success(res, updatedSource, 'Source updated successfully');
  });
}

export default BaseSourceController;

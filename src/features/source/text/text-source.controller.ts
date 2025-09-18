import { Request, Response } from 'express';
import { CreateTextSource, UpdateTextSource } from '../file/source.validation';
import TextSourceService from './text-source.service';
import { RequestWithUser } from '../../../interfaces/auth.interface';
import { ResponseFormatter } from '../../../utils/responseFormatter';
import { asyncHandler, parseIdParam, getUserId } from '../../../utils/controllerHelpers';

class TextSourceController {
  public textSourceService = new TextSourceService();

  public getAllTextSources = asyncHandler(
    async (req: RequestWithUser, res: Response): Promise<void> => {
      const userId = getUserId(req);
      const textSources = await this.textSourceService.getAllTextSources(userId);

      ResponseFormatter.success(res, textSources, 'Text sources retrieved successfully');
    }
  );

  public getTextSourceById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const sourceId = parseIdParam(req);
    const textSource = await this.textSourceService.getTextSourceById(sourceId);

    ResponseFormatter.success(res, textSource, 'Text source retrieved successfully');
  });

  public createTextSource = asyncHandler(
    async (req: RequestWithUser, res: Response): Promise<void> => {
      const textSourceData: CreateTextSource = req.body;
      const userId = getUserId(req);

      const textSource = await this.textSourceService.createTextSource(
        userId,
        textSourceData.name,
        textSourceData.description,
        textSourceData.content,
        userId
      );

      ResponseFormatter.created(res, textSource, 'Text source created successfully');
    }
  );

  public updateTextSource = asyncHandler(
    async (req: RequestWithUser, res: Response): Promise<void> => {
      const sourceId = parseIdParam(req);
      const textSourceData: UpdateTextSource = req.body;
      const userId = getUserId(req);

      const updatedTextSource = await this.textSourceService.updateTextSource(
        sourceId,
        textSourceData,
        userId
      );

      ResponseFormatter.success(res, updatedTextSource, 'Text source updated successfully');
    }
  );
}

export default TextSourceController;

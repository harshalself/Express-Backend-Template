import { NextFunction, Request, Response } from 'express';
import { UpdateFileSource } from './source.validation';
import FileSourceService from './file-source.service';
import { RequestWithUser } from '../../../interfaces/auth.interface';
import { uploadFile, uploadMultipleFiles } from '../../../utils/fileupload';
import HttpException from '../../../utils/HttpException';

class FileSourceController {
  public fileSourceService = new FileSourceService();

  public getAllFileSources = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId || req.user?.id;

      if (!userId) {
        throw new HttpException(401, 'User authentication required');
      }

      const fileSources = await this.fileSourceService.getAllFileSources(userId);
      res.status(200).json({
        data: fileSources,
        message: 'File sources retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public getFileSourceById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sourceId = Number(req.params.id);
      const fileSource = await this.fileSourceService.getFileSourceById(sourceId);
      res.status(200).json({
        data: fileSource,
        message: 'File source retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public createFileSource = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId || req.user?.id;
      if (!userId) {
        throw new HttpException(401, 'User authentication required');
      }
      // Handle multipart/form-data uploads
      if (req.file) {
        const name = req.body.name;
        const description = req.body.description;

        if (!name) {
          throw new HttpException(400, 'Name is required');
        }

        const folderPath = await this.fileSourceService.getFolderPathForUser(userId);
        const uploadResult = await uploadFile(req.file, folderPath);
        const fileSource = await this.fileSourceService.createFileSourceFromUpload(
          userId,
          name,
          description,
          uploadResult
        );
        return res.status(201).json({
          data: fileSource,
          message: 'File source created successfully from upload',
        });
      }
      // For direct file source creation (this now requires source_id)
      throw new HttpException(400, 'File upload is required');
    } catch (error) {
      next(error);
    }
  };

  public updateFileSource = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const sourceId = Number(req.params.id);
      const fileSourceData: UpdateFileSource = req.body;
      const userId = req.userId || req.user?.id;
      if (!userId) {
        throw new HttpException(401, 'User authentication required');
      }
      const updatedFileSource = await this.fileSourceService.updateFileSource(
        sourceId,
        fileSourceData,
        userId
      );
      res.status(200).json({
        data: updatedFileSource,
        message: 'File source updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public createMultipleFileSources = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.userId || req.user?.id;
      if (!userId) {
        throw new HttpException(401, 'User authentication required');
      }
      const names: string[] = req.body.names;
      const descriptions: string[] = req.body.descriptions;

      if (!names || !Array.isArray(names) || names.length === 0) {
        throw new HttpException(400, 'Names array is required');
      }
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new HttpException(400, 'No files uploaded');
      }
      if (req.files.length !== names.length) {
        throw new HttpException(400, 'Number of files must match number of names');
      }

      const folderPath = await this.fileSourceService.getFolderPathForUser(userId);
      const uploadResults = await uploadMultipleFiles(req.files, folderPath);

      const fileSources = await this.fileSourceService.createMultipleFileSources(
        userId,
        uploadResults,
        names,
        descriptions
      );

      res.status(201).json({
        data: fileSources,
        message: 'Multiple file sources created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public createMultipleFilesWithMulter = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.userId || req.user?.id;
      if (!userId) {
        throw new HttpException(401, 'User authentication required');
      }
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new HttpException(400, 'No files uploaded');
      }
      const folderPath = await this.fileSourceService.getFolderPathForUser(userId);
      const uploadResults = await uploadMultipleFiles(req.files, folderPath);
      const fileSourcePromises = uploadResults.map((result, index) => {
        const name = req.body.names?.[index];
        const description = req.body.descriptions?.[index];

        if (!name) {
          throw new HttpException(400, `Name is required for file at index ${index}`);
        }

        return this.fileSourceService.createFileSourceFromUpload(userId, name, description, result);
      });
      const fileSources = await Promise.all(fileSourcePromises);
      res.status(201).json({
        data: fileSources,
        message: 'Multiple file sources created successfully from upload',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default FileSourceController;

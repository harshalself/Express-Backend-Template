import knex from '../../../database/index.schema';
import { Source, SourceInput, SourceUpdateInput } from './file/source.interface';
import HttpException from '../../utils/HttpException';
import { extractInsertedId } from '../../utils/fileupload';

class BaseSourceService {
  // Generic source methods
  public async getAllSourcesByUserId(userId: number): Promise<Source[]> {
    try {
      const sources = await knex('sources')
        .where('user_id', userId)
        .where('is_deleted', false)
        .select('*');

      return sources;
    } catch (error) {
      throw new HttpException(500, `Error fetching sources: ${error.message}`);
    }
  }

  public async getSourceById(sourceId: number): Promise<Source> {
    try {
      const source = await knex('sources').where('id', sourceId).where('is_deleted', false).first();

      if (!source) {
        throw new HttpException(404, 'Source not found');
      }

      return source;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Error fetching source: ${error.message}`);
    }
  }

  public async deleteSource(sourceId: number, userId: number): Promise<void> {
    try {
      const source = await knex('sources').where('id', sourceId).where('is_deleted', false).first();

      if (!source) {
        throw new HttpException(404, 'Source not found');
      }

      // Use soft delete
      await knex('sources').where('id', sourceId).update({
        is_deleted: true,
        deleted_at: new Date(),
        deleted_by: userId,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Error deleting source: ${error.message}`);
    }
  }

  public async createSource(sourceData: SourceInput, userId: number): Promise<Source> {
    try {
      const result = await knex('sources')
        .insert({
          user_id: sourceData.user_id,
          source_type: sourceData.source_type,
          name: sourceData.name,
          description: sourceData.description,
          status: 'pending',
          is_embedded: false,
          created_by: userId,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('id');

      const sourceId = extractInsertedId(result);
      return await this.getSourceById(sourceId);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Error creating source: ${error.message}`);
    }
  }

  public async updateSource(
    sourceId: number,
    sourceData: SourceUpdateInput,
    userId: number
  ): Promise<Source> {
    try {
      const source = await knex('sources').where('id', sourceId).where('is_deleted', false).first();

      if (!source) {
        throw new HttpException(404, 'Source not found');
      }

      await knex('sources')
        .where('id', sourceId)
        .update({
          ...sourceData,
          updated_by: userId,
          updated_at: new Date(),
        });

      return await this.getSourceById(sourceId);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Error updating source: ${error.message}`);
    }
  }
}

export default BaseSourceService;

import knex from "../../../../database/index.schema";
import { TextSource, TextSourceUpdateInput } from "../file/source.interface";
import HttpException from "../../../utils/HttpException";
import { extractInsertedId } from "../../../utils/fileupload";

class TextSourceService {
  public async getAllTextSources(userId: number): Promise<TextSource[]> {
    try {
      const textSources = await knex("sources")
        .join("text_sources", "sources.id", "text_sources.source_id")
        .where("sources.user_id", userId)
        .where("sources.is_deleted", false)
        .select("sources.*", "text_sources.*");
      return textSources;
    } catch (error) {
      throw new HttpException(
        500,
        `Error fetching text sources: ${error.message}`
      );
    }
  }

  public async getTextSourceById(
    sourceId: number,
    trx?: typeof knex
  ): Promise<TextSource> {
    try {
      const query = (trx || knex)("sources")
        .join("text_sources", "sources.id", "text_sources.source_id")
        .where("sources.id", sourceId)
        .where("sources.is_deleted", false)
        .select("sources.*", "text_sources.*")
        .first();
      const textSource = await query;
      if (!textSource) {
        throw new HttpException(404, "Text source not found");
      }
      return textSource;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        500,
        `Error fetching text source: ${error.message}`
      );
    }
  }

  public async createTextSource(
    userId: number,
    name: string,
    description: string,
    content: string,
    createdBy: number
  ): Promise<TextSource> {
    try {
      return await knex.transaction(async (trx) => {
        const result = await trx("sources")
          .insert({
            user_id: userId,
            source_type: "text",
            name,
            description,
            status: "pending",
            is_embedded: false,
            created_by: createdBy,
            created_at: new Date(),
            updated_at: new Date(),
            is_deleted: false,
          })
          .returning("id");
        const sourceId = extractInsertedId(result);
        await trx("text_sources").insert({
          source_id: sourceId,
          content,
        });
        const joined = await this.getTextSourceById(sourceId, trx);
        return joined;
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        500,
        `Error creating text source: ${error.message}`
      );
    }
  }

  public async updateTextSource(
    sourceId: number,
    sourceData: TextSourceUpdateInput,
    userId: number
  ): Promise<TextSource> {
    try {
      if (!sourceData) {
        throw new HttpException(400, "Source data is empty");
      }

      const source = await knex("sources")
        .join("text_sources", "sources.id", "text_sources.source_id")
        .where("sources.id", sourceId)
        .where("sources.is_deleted", false)
        .first();

      if (!source) {
        throw new HttpException(404, "Text source not found");
      }

      const { content } = sourceData;

      return await knex.transaction(async (trx) => {
        // Update the text_sources table
        if (content !== undefined) {
          await trx("text_sources")
            .where("source_id", sourceId)
            .update({ content });
        }

        // Update the sources table with audit fields
        await trx("sources").where("id", sourceId).update({
          updated_by: userId,
          updated_at: new Date(),
        });

        return await this.getTextSourceById(sourceId);
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        500,
        `Error updating text source: ${error.message}`
      );
    }
  }
}

export default TextSourceService;

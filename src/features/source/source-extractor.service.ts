import knex from "../../../database/index.schema";
import HttpException from "../../utils/HttpException";
import { logger } from "../../utils/logger";

export interface ExtractedSource {
  sourceId: number;
  sourceType: "file" | "text";
  content: string;
  name: string;
}

export interface TransformedVectorRecord {
  id: string;
  text: string;
  category: string;
  sourceId: number;
  sourceType: "file" | "text";
}

export class SourceExtractorService {
  /**
   * Extract content from all sources for a specific user
   */
  public async extractAllSourcesForUser(
    userId: number
  ): Promise<ExtractedSource[]> {
    try {
      logger.info(`🔄 Extracting sources for user ${userId}`);

      const extractedSources: ExtractedSource[] = [];

      // Get all sources for the user that are ready to be embedded
      const sources = await knex("sources")
        .where({
          user_id: userId,
          is_deleted: false,
          is_embedded: false, // Only process sources that haven't been embedded yet
        })
        .whereIn("status", ["pending", "completed"]) // Process both pending and completed sources
        .select("id", "source_type", "name");

      logger.info(`📊 Found ${sources.length} sources for user ${userId}`);

      for (const source of sources) {
        try {
          let content = "";

          switch (source.source_type) {
            case "file":
              content = await this.extractFromFileSource(source.id);
              break;
            case "text":
              content = await this.extractFromTextSource(source.id);
              break;
            default:
              logger.warn(
                `⚠️ Unknown source type: ${source.source_type} for source ${source.id}`
              );
              continue;
          }

          if (content.trim()) {
            extractedSources.push({
              sourceId: source.id,
              sourceType: source.source_type as "file" | "text",
              content: content.trim(),
              name: source.name,
            });
            logger.info(
              `✅ Extracted content from ${source.source_type} source ${source.id} (${content.length} chars)`
            );
          } else {
            logger.warn(
              `⚠️ No content found for ${source.source_type} source ${source.id}`
            );
          }
        } catch (error) {
          logger.error(
            `❌ Failed to extract from ${source.source_type} source ${source.id}:`,
            error
          );
          // Continue with other sources even if one fails
        }
      }

      logger.info(
        `✅ Successfully extracted ${extractedSources.length} sources for user ${userId}`
      );
      return extractedSources;
    } catch (error) {
      logger.error(`❌ Failed to extract sources for user ${userId}:`, error);
      throw new HttpException(
        500,
        `Failed to extract sources: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Extract content from file source (text_content column)
   */
  private async extractFromFileSource(sourceId: number): Promise<string> {
    const fileSource = await knex("file_sources")
      .where({ source_id: sourceId })
      .select("text_content")
      .first();

    if (!fileSource) {
      throw new Error(`File source not found for source ID ${sourceId}`);
    }

    return fileSource.text_content || "";
  }

  /**
   * Extract content from text source (content column)
   */
  private async extractFromTextSource(sourceId: number): Promise<string> {
    const textSource = await knex("text_sources")
      .where({ source_id: sourceId })
      .select("content")
      .first();

    if (!textSource) {
      throw new Error(`Text source not found for source ID ${sourceId}`);
    }

    return textSource.content || "";
  }

  /**
   * Transform extracted sources to vector format
   */
  public transformToVectorFormat(
    userId: number,
    extractedSources: ExtractedSource[]
  ): TransformedVectorRecord[] {
    logger.info(
      `🔄 Transforming ${extractedSources.length} sources to vector format for user ${userId}`
    );

    const vectorRecords: TransformedVectorRecord[] = extractedSources
      .map((source) => {
        // Handle chunking for large content (split if > 8000 characters)
        const chunks = this.chunkContent(source.content, 8000);

        return chunks.map((chunk, index) => ({
          id:
            chunks.length > 1
              ? `user_${userId}_${source.sourceType}_source_${
                  source.sourceId
                }_chunk_${index + 1}`
              : `user_${userId}_${source.sourceType}_source_${source.sourceId}`,
          text: chunk,
          category: source.sourceType,
          sourceId: source.sourceId,
          sourceType: source.sourceType,
        }));
      })
      .flat(); // Flatten array of arrays

    logger.info(
      `✅ Transformed to ${vectorRecords.length} vector records (including chunks)`
    );
    return vectorRecords;
  }

  /**
   * Chunk large content into smaller pieces
   */
  private chunkContent(content: string, maxChunkSize: number = 8000): string[] {
    if (content.length <= maxChunkSize) {
      return [content];
    }

    const chunks: string[] = [];
    let currentIndex = 0;

    while (currentIndex < content.length) {
      let endIndex = currentIndex + maxChunkSize;

      // Try to break at word boundary
      if (endIndex < content.length) {
        const lastSpaceIndex = content.lastIndexOf(" ", endIndex);
        if (lastSpaceIndex > currentIndex) {
          endIndex = lastSpaceIndex;
        }
      }

      chunks.push(content.slice(currentIndex, endIndex).trim());
      currentIndex = endIndex;
    }

    return chunks.filter((chunk) => chunk.length > 0);
  }

  /**
   * Validate extracted content
   */
  public validateExtractedContent(extractedSources: ExtractedSource[]): {
    valid: ExtractedSource[];
    invalid: ExtractedSource[];
  } {
    const valid: ExtractedSource[] = [];
    const invalid: ExtractedSource[] = [];

    for (const source of extractedSources) {
      if (this.isValidContent(source.content)) {
        valid.push(source);
      } else {
        invalid.push(source);
        logger.warn(
          `⚠️ Invalid content for source ${source.sourceId}: too short or empty`
        );
      }
    }

    logger.info(
      `✅ Content validation: ${valid.length} valid, ${invalid.length} invalid`
    );
    return { valid, invalid };
  }

  /**
   * Check if content is valid for embedding
   */
  private isValidContent(content: string): boolean {
    // Content should be at least 10 characters and not empty
    return content && content.trim().length >= 10;
  }

  /**
   * Get extraction statistics
   */
  public getExtractionStats(extractedSources: ExtractedSource[]): {
    totalSources: number;
    fileCount: number;
    textCount: number;
    totalCharacters: number;
    averageLength: number;
  } {
    const stats = {
      totalSources: extractedSources.length,
      fileCount: extractedSources.filter((s) => s.sourceType === "file").length,
      textCount: extractedSources.filter((s) => s.sourceType === "text").length,
      totalCharacters: extractedSources.reduce(
        (sum, s) => sum + s.content.length,
        0
      ),
      averageLength: 0,
    };

    stats.averageLength =
      stats.totalSources > 0
        ? Math.round(stats.totalCharacters / stats.totalSources)
        : 0;

    return stats;
  }

  /**
   * Mark sources as embedded after successful processing
   */
  public async markSourcesAsEmbedded(sourceIds: number[]): Promise<void> {
    try {
      if (sourceIds.length === 0) {
        return;
      }

      await knex("sources").whereIn("id", sourceIds).update({
        is_embedded: true,
        status: "completed", // Also update status to completed if it was pending
        updated_at: new Date(),
      });

      logger.info(`✅ Marked ${sourceIds.length} sources as embedded`);
    } catch (error) {
      logger.error("❌ Failed to mark sources as embedded:", error);
      throw error;
    }
  }
}

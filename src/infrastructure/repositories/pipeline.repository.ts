import { Pipeline } from "../../domain/entities/pipeline.js";
import { PipelineRepository } from "../../domain/repositories/pipeline-repository.js";
import { db } from "../database/connection.js";
import { eq } from "drizzle-orm";
import { PipelineRow, pipelines } from "../database/schema.js";
import { ActionType } from "../../domain/types/action-type.js";

export class PipelineRepositoryImpl implements PipelineRepository {
  private toDomain(row: PipelineRow): Pipeline {
    return {
      ...row,
      actionType: row.actionType as ActionType,
    };
  }

  async getById(id: string): Promise<Pipeline | null> {
    const result = await db.query.pipelines.findFirst({
      where: eq(pipelines.id, id),
    });

    if (!result) return null;

    return this.toDomain(result);
  }
  async getByWebhookPath(path: string): Promise<Pipeline | null> {
    const result = await db.query.pipelines.findFirst({
      where: eq(pipelines.webhookPath, path),
    });

    if (!result) return null;

    return this.toDomain(result);
  }

  async getAll(): Promise<Pipeline[]> {
    const result = await db.query.pipelines.findMany({
      where: eq(pipelines.isDeleted, false),
    });

    return result.map((r) => this.toDomain(r));
  }

  async save(pipeline: Pipeline): Promise<Pipeline> {
    const [result] = await db
      .insert(pipelines)
      .values({
        id: pipeline.id,
        name: pipeline.name,
        description: pipeline.description,
        webhookPath: pipeline.webhookPath,
        actionType: pipeline.actionType,
        createdAt: pipeline.createdAt,
        updatedAt: pipeline.updatedAt,
        isDeleted: pipeline.isDeleted,
      })
      .returning();

    return this.toDomain(result);
  }

  async update(pipeline: Pipeline): Promise<Pipeline> {
    const [result] = await db
      .update(pipelines)
      .set({
        name: pipeline.name,
        description: pipeline.description,
        webhookPath: pipeline.webhookPath,
        actionType: pipeline.actionType,
        updatedAt: pipeline.updatedAt,
        isDeleted: pipeline.isDeleted,
      })
      .where(eq(pipelines.id, pipeline.id))
      .returning();

    return this.toDomain(result);
  }
}

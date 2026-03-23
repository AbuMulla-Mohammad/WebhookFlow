import { Pipeline } from "../../domain/entities/pipeline.js";
import {
  PipelineRepository,
  PipelineWithSubscribers,
} from "../../domain/repositories/pipeline.repository.js";
import { db } from "../database/connection.js";
import { and, desc, eq } from "drizzle-orm";
import {
  PipelineRow,
  pipelines,
  SubscriberRow,
  subscribers,
} from "../database/schema.js";
import { ActionType } from "../../domain/types/action-type.js";
import { Subscriber } from "../../domain/entities/subscriber.js";

export class PipelineRepositoryImpl implements PipelineRepository {
  constructor(private readonly database: typeof db) {}
  private toDomain(row: PipelineRow): Pipeline {
    return {
      ...row,
      actionType: row.actionType as ActionType,
    };
  }

  private toSubscriber(row: SubscriberRow): Subscriber {
    return { ...row };
  }

  private mapPipelineWithSubscribers(
    rows: Array<{ pipeline: PipelineRow; subscriber: SubscriberRow | null }>,
  ): PipelineWithSubscribers {
    const pipeline = this.toDomain(rows[0].pipeline);

    const pipelineSubscribers = rows
      .map((r) => r.subscriber)
      .filter((s): s is SubscriberRow => s !== null)
      .map((s) => this.toSubscriber(s));

    return {
      ...pipeline,
      subscribers: pipelineSubscribers,
    };
  }

  async getById(id: string): Promise<Pipeline | null> {
    const result = await this.database.query.pipelines.findFirst({
      where: and(eq(pipelines.id, id), eq(pipelines.isDeleted, false)),
    });

    if (!result) return null;

    return this.toDomain(result);
  }

  async getByIdWithSubscribers(
    id: string,
  ): Promise<PipelineWithSubscribers | null> {
    const rows = await this.database
      .select({
        pipeline: pipelines,
        subscriber: subscribers,
      })
      .from(pipelines)
      .leftJoin(
        subscribers,
        and(
          eq(subscribers.pipelineId, pipelines.id),
          eq(subscribers.isDeleted, false),
        ),
      )
      .where(and(eq(pipelines.id, id), eq(pipelines.isDeleted, false)));

    if (rows.length === 0) return null;
    return this.mapPipelineWithSubscribers(rows);
  }

  async getByWebhookPath(path: string): Promise<Pipeline | null> {
    const result = await this.database.query.pipelines.findFirst({
      where: and(
        eq(pipelines.webhookPath, path),
        eq(pipelines.isDeleted, false),
      ),
    });

    if (!result) return null;

    return this.toDomain(result);
  }

  async getByWebhookPathWithSubscribers(
    path: string,
  ): Promise<PipelineWithSubscribers | null> {
    const rows = await this.database
      .select({
        pipeline: pipelines,
        subscriber: subscribers,
      })
      .from(pipelines)
      .leftJoin(
        subscribers,
        and(
          eq(subscribers.pipelineId, pipelines.id),
          eq(subscribers.isDeleted, false),
        ),
      )
      .where(
        and(eq(pipelines.webhookPath, path), eq(pipelines.isDeleted, false)),
      );

    if (rows.length === 0) return null;
    return this.mapPipelineWithSubscribers(rows);
  }

  async getAll(limit: number = 10, offset: number = 0): Promise<Pipeline[]> {
    const result = await this.database.query.pipelines.findMany({
      where: eq(pipelines.isDeleted, false),
      orderBy: [desc(pipelines.createdAt)],
      limit,
      offset,
    });

    return result.map((r) => this.toDomain(r));
  }

  async save(pipeline: Pipeline): Promise<Pipeline> {
    const [result] = await this.database
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
    const [result] = await this.database
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

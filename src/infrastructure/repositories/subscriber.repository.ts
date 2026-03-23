import { and, eq } from "drizzle-orm";
import { Subscriber } from "../../domain/entities/subscriber.js";
import { SubscriberRepository } from "../../domain/repositories/subscriber.repository.js";
import { db } from "../database/connection.js";
import { subscribers } from "../database/schema.js";

type SubscriberRow = typeof subscribers.$inferSelect;

export class SubscriberRepositoryImpl implements SubscriberRepository {
  constructor(private readonly database: typeof db) {}
  private toDomain(row: SubscriberRow): Subscriber {
    return { ...row };
  }

  async getById(id: string): Promise<Subscriber | null> {
    const result = await this.database.query.subscribers.findFirst({
      where: and(eq(subscribers.id, id), eq(subscribers.isDeleted, false)),
    });

    if (!result) return null;
    return this.toDomain(result);
  }

  async getByPipelineId(pipelineId: string): Promise<Subscriber[]> {
    const result = await this.database.query.subscribers.findMany({
      where: and(
        eq(subscribers.pipelineId, pipelineId),
        eq(subscribers.isDeleted, false),
      ),
    });

    return result.map((r) => this.toDomain(r));
  }

  async save(subscriber: Subscriber): Promise<void> {
    await this.database.insert(subscribers).values({
      id: subscriber.id,
      pipelineId: subscriber.pipelineId,
      targetUrl: subscriber.targetUrl,
      createdAt: subscriber.createdAt,
      updatedAt: subscriber.updatedAt,
      isDeleted: subscriber.isDeleted,
    });
  }

  async update(subscriber: Subscriber): Promise<void> {
    await this.database
      .update(subscribers)
      .set({
        pipelineId: subscriber.pipelineId,
        targetUrl: subscriber.targetUrl,
        updatedAt: new Date(),
        isDeleted: subscriber.isDeleted,
      })
      .where(eq(subscribers.id, subscriber.id));
  }

  async delete(id: string): Promise<void> {
    await this.database
      .update(subscribers)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(eq(subscribers.id, id));
  }

  async saveMany(subscribersList: Subscriber[]): Promise<void> {
    if (subscribersList.length === 0) return;
    await this.database.insert(subscribers).values(
      subscribersList.map((s) => ({
        id: s.id,
        pipelineId: s.pipelineId,
        targetUrl: s.targetUrl,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        isDeleted: s.isDeleted,
      })),
    );
  }
}

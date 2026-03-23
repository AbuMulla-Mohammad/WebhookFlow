import { and, desc, eq } from "drizzle-orm";
import { DeliveryAttempt } from "../../domain/entities/delivery-attempt.js";
import { DeliveryAttemptRepository } from "../../domain/repositories/delivery-attempt.repository.js";
import { DeliveryStatus } from "../../domain/types/delivery-status.js";
import { db } from "../database/connection.js";
import { deliveryAttempts } from "../database/schema.js";

type DeliveryAttemptRow = typeof deliveryAttempts.$inferSelect;

export class DeliveryAttemptRepositoryImpl implements DeliveryAttemptRepository {
  constructor(private readonly database: typeof db) {}
  private toDomain(row: DeliveryAttemptRow): DeliveryAttempt {
    return {
      ...row,
      errorMessage: row.errorMessage ?? undefined,
      responseCode: row.responseCode ?? undefined,
      status: row.status as DeliveryStatus,
    };
  }

  async save(attempt: DeliveryAttempt): Promise<void> {
    await this.database.insert(deliveryAttempts).values({
      id: attempt.id,
      createdAt: attempt.createdAt,
      updatedAt: attempt.updatedAt,
      isDeleted: attempt.isDeleted,
      jobId: attempt.jobId,
      subscriberId: attempt.subscriberId,
      status: attempt.status,
      responseCode: attempt.responseCode,
      errorMessage: attempt.errorMessage,
      attemptNumber: attempt.attemptNumber,
    });
  }

  async getById(id: string): Promise<DeliveryAttempt | null> {
    const result = await this.database.query.deliveryAttempts.findFirst({
      where: and(
        eq(deliveryAttempts.id, id),
        eq(deliveryAttempts.isDeleted, false),
      ),
    });

    if (!result) return null;
    return this.toDomain(result);
  }

  async getByJobId(jobId: string): Promise<DeliveryAttempt[]> {
    const result = await this.database.query.deliveryAttempts.findMany({
      where: and(
        eq(deliveryAttempts.jobId, jobId),
        eq(deliveryAttempts.isDeleted, false),
      ),
      orderBy: [desc(deliveryAttempts.createdAt)],
    });

    return result.map((r) => this.toDomain(r));
  }

  async getBySubscriberId(subscriberId: string): Promise<DeliveryAttempt[]> {
    const result = await this.database.query.deliveryAttempts.findMany({
      where: and(
        eq(deliveryAttempts.subscriberId, subscriberId),
        eq(deliveryAttempts.isDeleted, false),
      ),
      orderBy: [desc(deliveryAttempts.createdAt)],
    });

    return result.map((r) => this.toDomain(r));
  }

  async getFailedAttempts(limit = 100): Promise<DeliveryAttempt[]> {
    const safeLimit = limit > 0 ? limit : 100;

    const result = await this.database.query.deliveryAttempts.findMany({
      where: and(
        eq(deliveryAttempts.status, "failed"),
        eq(deliveryAttempts.isDeleted, false),
      ),
      orderBy: [desc(deliveryAttempts.createdAt)],
      limit: safeLimit,
    });

    return result.map((r) => this.toDomain(r));
  }
}

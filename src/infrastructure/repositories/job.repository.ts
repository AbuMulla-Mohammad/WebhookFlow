import { and, desc, eq, sql } from "drizzle-orm";
import { Job } from "../../domain/entities/job.js";
import { JobRepository } from "../../domain/repositories/job.repository.js";
import { JobStatus } from "../../domain/types/job-status.js";
import { db } from "../database/connection.js";
import { JobRow, jobs } from "../database/schema.js";

export class JobRepositoryImpl implements JobRepository {
  constructor(private readonly database: typeof db) {}

  private toDomain(row: JobRow): Job {
    return {
      ...row,
      processedAt: row.processedAt ?? undefined,
      result: (row.result as Record<string, unknown> | null) ?? undefined,
      errorMessage: row.errorMessage ?? undefined,
      status: row.status as JobStatus,
      payload: row.payload as Record<string, unknown>,
    };
  }
  async getAllJobs(limit: number = 20, offset: number = 0): Promise<Job[]> {
    const result = await this.database.query.jobs.findMany({
      orderBy: [desc(jobs.createdAt)],
      limit,
      offset,
    });
    return result.map((r) => this.toDomain(r));
  }

  async getById(id: string): Promise<Job | null> {
    const result = await this.database.query.jobs.findFirst({
      where: and(eq(jobs.id, id), eq(jobs.isDeleted, false)),
    });

    if (!result) return null;
    return this.toDomain(result);
  }

  async save(job: Job): Promise<void> {
    await this.database.insert(jobs).values({
      id: job.id,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      isDeleted: job.isDeleted,
      processedAt: job.processedAt,
      attempts: job.attempts,
      result: job.result,
      pipelineId: job.pipelineId,
      payload: job.payload,
      errorMessage: job.errorMessage,
      status: job.status,
    });
  }

  async getByStatus(
    jobStatus: JobStatus,
    limit?: number,
    offset?: number,
  ): Promise<Job[]> {
    const result = await this.database.query.jobs.findMany({
      limit,
      offset,
      where: and(eq(jobs.status, jobStatus), eq(jobs.isDeleted, false)),
      orderBy: [desc(jobs.createdAt)],
    });

    return result.map((r) => this.toDomain(r));
  }

  async updateStatus(id: string, status: JobStatus): Promise<void> {
    await this.database
      .update(jobs)
      .set({
        status,
        updatedAt: new Date(),
        processedAt:
          status === "completed" || status === "failed" ? new Date() : null,
      })
      .where(and(eq(jobs.id, id), eq(jobs.isDeleted, false)));
  }
  async markProcessing(id: string): Promise<void> {
    await this.database
      .update(jobs)
      .set({
        status: "processing",
        updatedAt: new Date(),
        processedAt: null,
        attempts: sql<number>`attempts + 1`,
      })
      .where(and(eq(jobs.id, id), eq(jobs.isDeleted, false)));
  }
  async markCompleted(
    id: string,
    result: Record<string, unknown>,
  ): Promise<void> {
    await this.database
      .update(jobs)
      .set({
        status: "completed",
        result,
        errorMessage: null,
        updatedAt: new Date(),
        processedAt: new Date(),
      })
      .where(and(eq(jobs.id, id), eq(jobs.isDeleted, false)));
  }
  async markFailed(id: string, errorMessage: string): Promise<void> {
    await this.database
      .update(jobs)
      .set({
        status: "failed",
        errorMessage,
        updatedAt: new Date(),
        processedAt: new Date(),
      })
      .where(and(eq(jobs.id, id), eq(jobs.isDeleted, false)));
  }
}

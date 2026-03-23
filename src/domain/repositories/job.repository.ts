import { Job } from "../entities/job.js";
import { JobStatus } from "../types/job-status.js";

export interface JobRepository {
  getAllJobs(limit?: number, offset?: number): Promise<Job[]>;
  getById(id: string): Promise<Job | null>;
  save(job: Job): Promise<void>;
  getByStatus(
    jobStatus: JobStatus,
    limit?: number,
    offset?: number,
  ): Promise<Job[]>;
  updateStatus(id: string, status: JobStatus): Promise<void>;
  markProcessing(id: string): Promise<void>;
  markCompleted(id: string, result: Record<string, unknown>): Promise<void>;
  markFailed(id: string, errorMessage: string): Promise<void>;
  getAllByTriggeredBy(
    userId: string,
    limit?: number,
    offset?: number,
  ): Promise<Job[]>;
  getByStatusAndTriggeredBy(
    jobStatus: JobStatus,
    userId: string,
    limit?: number,
    offset?: number,
  ): Promise<Job[]>;
}

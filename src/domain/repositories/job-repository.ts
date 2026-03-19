import { Job } from "../entities/job.js";
import { JobStatus } from "../types/job-status.js";

export interface JobRepository {
  getById(id: string): Promise<Job | null>;
  save(job: Job): Promise<void>;
  getByStatus(jobStatus: JobStatus): Promise<Job[]>;
  updateStatus(id: string, status: JobStatus): Promise<void>;
  markProcessing(id: string): Promise<void>;
  markCompleted(id: string, result: Record<string, unknown>): Promise<void>;
  markFailed(id: string, errorMessage: string): Promise<void>;
}

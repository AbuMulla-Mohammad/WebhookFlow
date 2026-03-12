import { Job } from "../entities/job.js";
import { JobStatus } from "../types/job-status.js";

export interface JobRepository {
  getById(id: string): Promise<Job | null>;
  save(job: Job): Promise<void>;
  getByStatus(jobStatus: JobStatus): Promise<Job[]>;
  updateStatus(id: string, status: JobStatus): Promise<void>;
}

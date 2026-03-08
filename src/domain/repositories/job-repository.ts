import { Job } from "../entities/job";
import { JobStatus } from "../types/job-status";

export interface JobRepository {
  getById(id: string): Promise<Job | null>;
  save(job: Job): Promise<void>;
  getByStatus(jobStatus: JobStatus): Promise<Job[]>;
  updateStatus(id: string, status: JobStatus): Promise<void>;
}

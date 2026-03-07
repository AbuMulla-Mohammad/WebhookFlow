import { JobStatus } from "../types/job-status";
import { BaseEntity } from "./base-entity";

export interface Job extends BaseEntity {
  processedAt?: Date;
  attempts: number;
  result?: Record<string, unknown>;
  pipelineId: string;
  payload: Record<string, unknown>;
  errorMessage?: string;
  status: JobStatus;
}

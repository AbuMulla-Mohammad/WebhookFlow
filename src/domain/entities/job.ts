import { JobStatus } from "../types/job-status.js";
import { BaseEntity } from "./base-entity.js";

export interface Job extends BaseEntity {
  processedAt?: Date;
  attempts: number;
  result?: Record<string, unknown>;
  pipelineId: string;
  payload: Record<string, unknown>;
  errorMessage?: string;
  status: JobStatus;
  triggeredBy?: string;
}

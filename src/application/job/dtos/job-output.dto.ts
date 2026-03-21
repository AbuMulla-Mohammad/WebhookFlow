import { JobStatus } from "../../../domain/types/job-status.js";

export interface JobOutputDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  processedAt?: Date;
  attempts: number;
  result?: Record<string, unknown>;
  pipelineId: string;
  payload: Record<string, unknown>;
  errorMessage?: string;
  status: JobStatus;
}

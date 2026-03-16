import { JobStatus } from "../../../domain/types/job-status.js";

export interface TriggerWebhookOutputDto {
  jobId: string;
  pipelineId: string;
  status: JobStatus;
  acceptedAt: Date;
}

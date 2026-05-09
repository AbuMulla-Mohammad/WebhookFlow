export interface JobQueuePort {
  publishProcessJob(jobId: string): Promise<void>;
}

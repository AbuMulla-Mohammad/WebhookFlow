import { JobRepository } from "../../../domain/repositories/job.repository.js";
import { ProcessJobUseCase } from "./process-job.use-case.js";
import { DeliverJobUseCase } from "./deliver-job.use-case.js";
import { isRetryableProcessFailure } from "../utils/failure.util.js";

export type JobOrchestratorOutcome =
  | { status: "success"; jobId: string }
  | { status: "retry"; jobId: string; reason: string; attemptNumber: number }
  | { status: "failed"; jobId: string; reason: string }
  | { status: "skipped"; jobId: string; reason?: string };

export class JobOrchestratorUseCase {
  constructor(
    private readonly processJobUseCase: ProcessJobUseCase,
    private readonly deliverJobUseCase: DeliverJobUseCase,
    private readonly jobRepository: JobRepository,
    private readonly maxRetries: number = 3,
  ) {}

  async execute(jobId: string): Promise<JobOrchestratorOutcome> {
    try {
      const processOutcome = await this.processJobUseCase.execute(jobId);

      if (processOutcome.status === "skipped_not_found") {
        return { status: "skipped", jobId, reason: "Job not found" };
      }

      if (processOutcome.status === "skipped_not_pending") {
        return {
          status: "skipped",
          jobId,
          reason: `Job not pending (current status: ${processOutcome.currentStatus})`,
        };
      }

      if (processOutcome.status === "failed") {
        const job = await this.jobRepository.getById(jobId);
        const attemptNumber = job?.attempts ?? 0;
        const isRetryable = isRetryableProcessFailure(processOutcome.reason);

        if (isRetryable && attemptNumber < this.maxRetries) {
          await this.jobRepository.updateStatus(jobId, "pending");
          return {
            status: "retry",
            jobId,
            reason: processOutcome.reason,
            attemptNumber,
          };
        }

        return { status: "failed", jobId, reason: processOutcome.reason };
      }

      // Processed successfully, now deliver
      const deliveryOutcome = await this.deliverJobUseCase.execute(jobId);

      if (deliveryOutcome.failedCount === 0) {
        return { status: "success", jobId };
      }

      // Some deliveries failed
      const job = await this.jobRepository.getById(jobId);
      const attemptNumber = job?.attempts ?? 0;
      const reason = `Delivery failed for ${deliveryOutcome.failedCount}/${deliveryOutcome.totalSubscribers} subscribers`;

      if (attemptNumber < this.maxRetries) {
        await this.jobRepository.updateStatus(jobId, "pending");
        return { status: "retry", jobId, reason, attemptNumber };
      }

      await this.jobRepository.markFailed(jobId, reason);
      return { status: "failed", jobId, reason };
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown error";
      const job = await this.jobRepository.getById(jobId);
      const attemptNumber = job?.attempts ?? 0;

      if (attemptNumber < this.maxRetries) {
        await this.jobRepository.updateStatus(jobId, "pending");
        return { status: "retry", jobId, reason, attemptNumber };
      }

      await this.jobRepository.markFailed(jobId, reason);
      return { status: "failed", jobId, reason };
    }
  }
}

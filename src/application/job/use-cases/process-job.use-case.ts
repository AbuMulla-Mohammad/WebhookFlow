import { JobRepository } from "../../../domain/repositories/job-repository.js";
import { PipelineRepository } from "../../../domain/repositories/pipeline-repository.js";
import { ActionType } from "../../../domain/types/action-type.js";

export type ProcessJobOutcome =
  | { status: "processed"; jobId: string }
  | { status: "skipped_not_found"; jobId: string }
  | { status: "skipped_not_pending"; jobId: string; currentStatus: string }
  | { status: "failed"; jobId: string; reason: string };

export class ProcessJobUseCase {
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly pipelineRepository: PipelineRepository,
  ) {}

  async execute(jobId: string): Promise<ProcessJobOutcome> {
    const job = await this.jobRepository.getById(jobId);

    if (!job) {
      return { status: "skipped_not_found", jobId };
    }

    if (job.status !== "pending") {
      return {
        status: "skipped_not_pending",
        jobId: job.id,
        currentStatus: job.status,
      };
    }

    await this.jobRepository.markProcessing(job.id);

    try {
      const pipeline = await this.pipelineRepository.getById(job.pipelineId);
      if (!pipeline) {
        const reason = "Pipeline was not found.";
        await this.jobRepository.markFailed(job.id, reason);
        return { status: "failed", jobId: job.id, reason };
      }

      const result = this.runAction(pipeline.actionType, job.payload);
      await this.jobRepository.markCompleted(job.id, result);

      return { status: "processed", jobId: job.id };
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : "Unknown processing error";

      await this.jobRepository.markFailed(job.id, reason);
      return { status: "failed", jobId: job.id, reason };
    }
  }

  private runAction(
    actionType: ActionType,
    payload: Record<string, unknown>,
  ): Record<string, unknown> {
    if (actionType === "transform-json") {
      return {
        transformed: payload,
        transformedAt: new Date().toISOString(),
      };
    }

    if (actionType === "summarize-youtube-video") {
      return {
        summary: "Summary action is not implemented yet.",
        originalPayload: payload,
      };
    }

    const unsupported: never = actionType;
    throw new Error(`Unsupported action type: ${unsupported}`);
  }
}

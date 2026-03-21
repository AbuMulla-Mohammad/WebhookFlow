import { JobRepository } from "../../../domain/repositories/job-repository.js";
import { PipelineRepository } from "../../../domain/repositories/pipeline-repository.js";
import { ActionType } from "../../../domain/types/action-type.js";
import { SamuraizerPort } from "../ports/samuraizer.port.js";

export type ProcessJobOutcome =
  | { status: "processed"; jobId: string }
  | { status: "skipped_not_found"; jobId: string }
  | { status: "skipped_not_pending"; jobId: string; currentStatus: string }
  | { status: "failed"; jobId: string; reason: string };

export class ProcessJobUseCase {
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly pipelineRepository: PipelineRepository,
    private readonly samuraizer: SamuraizerPort,
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

      const result = await this.runAction(pipeline.actionType, job.payload);
      await this.jobRepository.markCompleted(job.id, result);

      return { status: "processed", jobId: job.id };
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : "Unknown processing error";

      await this.jobRepository.markFailed(job.id, reason);
      return { status: "failed", jobId: job.id, reason };
    }
  }

  private async runAction(
    actionType: ActionType,
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    if (actionType === "transform-json") {
      const prefix = "x_";
      const transformed = Object.fromEntries(
        Object.entries(payload).map(([k, v]) => [prefix + k, v]),
      );
      return {
        action: "transform-json",
        transformed,
        transformedAt: new Date().toISOString(),
      };
    }

    if (actionType === "summarize-youtube-video") {
      const videoUrl = payload.videoUrl;
      if (typeof videoUrl !== "string" || !videoUrl.trim()) {
        throw new Error(
          "Missing or invalid payload.videoUrl for summarize action",
        );
      }
      const summaryAndTranscript =
        await this.samuraizer.summarizeAndFormatTranscriptVideo(videoUrl);
      return {
        action: "summarize-youtube-video",
        videoUrl,
        summary: summaryAndTranscript.summarySections,
        transcript: summaryAndTranscript.formattedTranscript ?? null,
        summarizedAt: new Date().toISOString(),
      };
    }

    if (actionType === "extract-payload-keys") {
      const topLevelKeys = Object.keys(payload).sort();

      return {
        action: "extract-payload-keys",
        topLevelKeys,
        topLevelCount: topLevelKeys.length,
        extractedAt: new Date().toISOString(),
      };
    }
    const unsupported: never = actionType;
    throw new Error(`Unsupported action type: ${unsupported}`);
  }
}

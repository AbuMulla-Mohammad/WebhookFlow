import { NotFoundError } from "../../../shared/errors/NotFoundError.js";
import { JobRepository } from "../../../domain/repositories/job-repository.js";
import { PipelineRepository } from "../../../domain/repositories/pipeline-repository.js";
import { TriggerWebhookOutputDto } from "../dtos/trigger-webhook-output.dto.js";
import { Job } from "../../../domain/entities/job.js";
import { randomUUID } from "node:crypto";

export class TriggerWebhookUseCase {
  constructor(
    private readonly pipelineRepository: PipelineRepository,
    private readonly jobRepository: JobRepository,
  ) {}
  async execute(
    webhookPath: string,
    payload: Record<string, unknown>,
  ): Promise<TriggerWebhookOutputDto> {
    const pipeline =
      await this.pipelineRepository.getByWebhookPath(webhookPath);

    if (!pipeline) {
      throw new NotFoundError("Workflow was not found.");
    }
    const now = new Date();
    const job: Job = {
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
      attempts: 0,
      pipelineId: pipeline.id,
      status: "pending",
      payload,
      errorMessage: undefined,
      processedAt: undefined,
      result: undefined,
    };

    await this.jobRepository.save(job);
    return {
      jobId: job.id,
      pipelineId: pipeline.id,
      acceptedAt: now,
      status: job.status,
    };
  }
}

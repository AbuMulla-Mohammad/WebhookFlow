import { PipelineRepository } from "../../../domain/repositories/pipeline.repository.js";
import { PipelineOutputDto } from "../dtos/pipeline-output.dto.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";

export class GetPipelineByWebhookPathUseCase {
  constructor(private readonly pipelineRepository: PipelineRepository) {}

  async execute(path: string): Promise<PipelineOutputDto> {
    const pipeline =
      await this.pipelineRepository.getByWebhookPathWithSubscribers(path);

    if (!pipeline) {
      throw new NotFoundError("Pipeline was not found.");
    }

    return {
      id: pipeline.id,
      name: pipeline.name,
      description: pipeline.description,
      webhookPath: pipeline.webhookPath,
      actionType: pipeline.actionType,
      createdAt: pipeline.createdAt,
      updatedAt: pipeline.updatedAt,
      subscribers: pipeline.subscribers.map((s) => ({
        targetUrl: s.targetUrl,
      })),
    };
  }
}

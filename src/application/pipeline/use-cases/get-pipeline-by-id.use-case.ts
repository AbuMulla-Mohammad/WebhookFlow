import { PipelineRepository } from "../../../domain/repositories/pipeline-repository.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";
import { PipelineOutputDto } from "../dtos/pipeline-output.dto.js";

export class GetPipelineByIdUseCase {
  constructor(private readonly pipelineRepository: PipelineRepository) {}
  async execute(pipelineId: string): Promise<PipelineOutputDto> {
    const pipeline =
      await this.pipelineRepository.getByIdWithSubscribers(pipelineId);

    if (!pipeline) {
      throw new NotFoundError("Pipeline was not found");
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

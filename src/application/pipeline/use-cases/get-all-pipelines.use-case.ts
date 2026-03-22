import { PipelineRepository } from "../../../domain/repositories/pipeline-repository";
import { PipelineOutputDto } from "../dtos/pipeline-output.dto";

export class GetAllPipelinesUseCase {
  constructor(private readonly pipelineRepository: PipelineRepository) {}

  async execute(limit: number, offset: number): Promise<PipelineOutputDto[]> {
    const pipelines = await this.pipelineRepository.getAll(limit, offset);
    return pipelines.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      webhookPath: p.webhookPath,
      actionType: p.actionType,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }
}

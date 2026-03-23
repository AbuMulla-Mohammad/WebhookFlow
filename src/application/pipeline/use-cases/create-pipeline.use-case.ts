import { PipelineRepository } from "../../../domain/repositories/pipeline.repository.js";
import { PipelineInputDto } from "../dtos/pipeline-input.dto.js";
import { PipelineOutputDto } from "../dtos/pipeline-output.dto.js";
import { Pipeline } from "../../../domain/entities/pipeline.js";
import { randomUUID } from "node:crypto";
import { ACTION_TYPES } from "../../../domain/types/action-type.js";
import { BadRequestError } from "../../../shared/errors/BadRequestError.js";
import { SubscriberRepository } from "../../../domain/repositories/subscriber.repository.js";

export class CreatePipelineUseCase {
  constructor(
    private readonly pipelineRepository: PipelineRepository,
    private readonly subscriberRepository: SubscriberRepository,
  ) {}

  async execute(input: PipelineInputDto): Promise<PipelineOutputDto> {
    if (!ACTION_TYPES.includes(input.actionType)) {
      throw new BadRequestError(`Invalid action type: ${input.actionType}`);
    }

    const existing = await this.pipelineRepository.getByWebhookPath(
      input.webhookPath,
    );
    if (existing) {
      throw new BadRequestError("Webhook path already exists");
    }

    const pipeline: Pipeline = {
      id: randomUUID(),
      description: input.description,
      name: input.name,
      webhookPath: input.webhookPath,
      actionType: input.actionType,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    };

    const dbPipeline = await this.pipelineRepository.save(pipeline);

    const subscribers = input.subscribers.map((targetUrl) => ({
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      pipelineId: dbPipeline.id,
      targetUrl,
    }));

    await this.subscriberRepository.saveMany(subscribers);

    return {
      id: dbPipeline.id,
      createdAt: dbPipeline.createdAt,
      name: dbPipeline.name,
      webhookPath: dbPipeline.webhookPath,
    };
  }
}

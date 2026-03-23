import { PipelineRepository } from "../../../domain/repositories/pipeline.repository.js";
import { SubscriberRepository } from "../../../domain/repositories/subscriber.repository.js";
import { BadRequestError } from "../../../shared/errors/BadRequestError.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";

export class RemoveSubscriberUseCase {
  constructor(
    private readonly pipelineRepository: PipelineRepository,
    private readonly subscriberRepository: SubscriberRepository,
  ) {}

  async execute(pipelineId: string, subscriberId: string): Promise<void> {
    if (!pipelineId) {
      throw new BadRequestError("pipelineId is required");
    }

    if (!subscriberId) {
      throw new BadRequestError("subscriberId is required");
    }

    const pipeline = await this.pipelineRepository.getById(pipelineId);
    if (!pipeline) {
      throw new NotFoundError("Pipeline not found");
    }

    const subscriber = await this.subscriberRepository.getById(subscriberId);
    if (!subscriber || subscriber.pipelineId !== pipelineId) {
      throw new NotFoundError("Subscriber not found");
    }

    await this.subscriberRepository.delete(subscriberId);
  }
}

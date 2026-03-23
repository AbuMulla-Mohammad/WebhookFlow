import { randomUUID } from "node:crypto";
import { PipelineRepository } from "../../../domain/repositories/pipeline.repository.js";
import { SubscriberRepository } from "../../../domain/repositories/subscriber.repository.js";
import { BadRequestError } from "../../../shared/errors/BadRequestError.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";
import { SubscriberListOutputDto } from "../dtos/subscriber-list-output.dto.js";

export class AddSubscriberUseCase {
  constructor(
    private readonly pipelineRepository: PipelineRepository,
    private readonly subscriberRepository: SubscriberRepository,
  ) {}

  async execute(
    pipelineId: string,
    targetUrl: string,
  ): Promise<SubscriberListOutputDto> {
    if (!pipelineId) {
      throw new BadRequestError("pipelineId is required");
    }

    const normalizedTargetUrl = targetUrl?.trim();
    if (!normalizedTargetUrl) {
      throw new BadRequestError("targetUrl is required");
    }

    try {
      new URL(normalizedTargetUrl);
    } catch {
      throw new BadRequestError("targetUrl must be a valid URL");
    }

    const pipeline = await this.pipelineRepository.getById(pipelineId);
    if (!pipeline) {
      throw new NotFoundError("Pipeline not found");
    }

    const existingSubscribers =
      await this.subscriberRepository.getByPipelineId(pipelineId);

    const alreadyExists = existingSubscribers.some(
      (s) => s.targetUrl === normalizedTargetUrl,
    );

    if (alreadyExists) {
      throw new BadRequestError("Subscriber already exists for this pipeline");
    }

    await this.subscriberRepository.save({
      id: randomUUID(),
      pipelineId,
      targetUrl: normalizedTargetUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    });

    return {
      targetUrl: normalizedTargetUrl,
    };
  }
}

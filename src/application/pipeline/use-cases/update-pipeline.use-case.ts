// src/application/pipeline/use-cases/update-pipeline.use-case.ts
import { PipelineRepository } from "../../../domain/repositories/pipeline-repository.js";
import { PipelineOutputDto } from "../dtos/pipeline-output.dto.js";
import { UpdatePipelineInputDto } from "../dtos/update-pipeline-input.dto.js";
import { ACTION_TYPES } from "../../../domain/types/action-type.js";
import { BadRequestError } from "../../../shared/errors/BadRequestError.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";
import { Pipeline } from "../../../domain/entities/pipeline.js";

export class UpdatePipelineUseCase {
  constructor(private readonly pipelineRepository: PipelineRepository) {}

  async execute(
    input: UpdatePipelineInputDto,
    pipelineId: string,
  ): Promise<PipelineOutputDto> {
    if (!pipelineId) {
      throw new BadRequestError("pipelineId is required");
    }

    const existing = await this.pipelineRepository.getById(pipelineId);
    if (!existing) {
      throw new NotFoundError("Pipeline not found");
    }

    if (input.actionType && !ACTION_TYPES.includes(input.actionType)) {
      throw new BadRequestError(`Invalid action type: ${input.actionType}`);
    }

    if (input.webhookPath && input.webhookPath !== existing.webhookPath) {
      const sameWebhookPath = await this.pipelineRepository.getByWebhookPath(
        input.webhookPath,
      );
      if (sameWebhookPath && sameWebhookPath.id !== pipelineId) {
        throw new BadRequestError("Webhook path already exists");
      }
    }

    const pipelineToUpdate: Pipeline = {
      ...existing,
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.webhookPath !== undefined
        ? { webhookPath: input.webhookPath }
        : {}),
      ...(input.actionType !== undefined
        ? { actionType: input.actionType }
        : {}),
      updatedAt: new Date(),
    };

    const updated = await this.pipelineRepository.update(pipelineToUpdate);

    return {
      id: updated.id,
      name: updated.name,
      webhookPath: updated.webhookPath,
      createdAt: updated.createdAt,
    };
  }
}

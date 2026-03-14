import { GetPipelineByIdUseCase } from "../../application/pipeline/use-cases/get-pipeline-by-id.use-case.js";
import { CreatePipelineUseCase } from "../../application/pipeline/use-cases/create-pipeline.use-case.js";
import { UpdatePipelineUseCase } from "../../application/pipeline/use-cases/update-pipeline.use-case.js";
import { PipelineRepositoryImpl } from "../../infrastructure/repositories/pipeline.repository.js";
import { SubscriberRepositoryImpl } from "../../infrastructure/repositories/subscriber.repository.js";
import { PipelineController } from "../http/controllers/pipeline.controller.js";

export type AppContainer = ReturnType<typeof createContainer>;

export function createContainer() {
  const repositories = {
    pipeline: new PipelineRepositoryImpl(),
    subscriber: new SubscriberRepositoryImpl(),
  };

  const useCases = {
    createPipeline: new CreatePipelineUseCase(
      repositories.pipeline,
      repositories.subscriber,
    ),
    updatePipeline: new UpdatePipelineUseCase(repositories.pipeline),
    getPipelineById: new GetPipelineByIdUseCase(repositories.pipeline),
  };

  const controllers = {
    Pipeline: new PipelineController(
      useCases.createPipeline,
      useCases.updatePipeline,
      useCases.getPipelineById,
    ),
  };

  return {
    repositories,
    useCases,
    controllers,
  };
}

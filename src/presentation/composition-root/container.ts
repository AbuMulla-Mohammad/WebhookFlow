import { GetPipelineByIdUseCase } from "../../application/pipeline/use-cases/get-pipeline-by-id.use-case.js";
import { CreatePipelineUseCase } from "../../application/pipeline/use-cases/create-pipeline.use-case.js";
import { UpdatePipelineUseCase } from "../../application/pipeline/use-cases/update-pipeline.use-case.js";
import { PipelineRepositoryImpl } from "../../infrastructure/repositories/pipeline.repository.js";
import { SubscriberRepositoryImpl } from "../../infrastructure/repositories/subscriber.repository.js";
import { PipelineController } from "../http/controllers/pipeline.controller.js";
import { GetPipelineByWebhookPathUseCase } from "../../application/pipeline/use-cases/get-pipeline-by-webhook-path.use-case.js";
import { AddSubscriberUseCase } from "../../application/pipeline/use-cases/add-subscriber.use-case.js";
import { RemoveSubscriberUseCase } from "../../application/pipeline/use-cases/remove-subscriber.use-case.js";
import { db } from "../../infrastructure/database/connection.js";
import { JobRepositoryImpl } from "../../infrastructure/repositories/job.repository.js";
import { TriggerWebhookUseCase } from "../../application/pipeline/use-cases/trigger-webhook.use-case.js";
import { WebhookController } from "../http/controllers/webhook.controller.js";
import { RabbitMQJobQueuePublisher } from "../../infrastructure/messaging/rabbitmq-job-queue.publisher.js";
import { JobController } from "../http/controllers/job.controller.js";
import { GetJobByIdUseCase } from "../../application/job/use-cases/get-job-by-id.use-case.js";
import { GetAllJobsUseCase } from "../../application/job/use-cases/get-all-jobs.use-case.js";
import { GetJobByStatusUseCase } from "../../application/job/use-cases/get-jobs-by-status.use-case.js";

export type AppContainer = ReturnType<typeof createContainer>;

export function createContainer() {
  const repositories = {
    pipeline: new PipelineRepositoryImpl(db),
    subscriber: new SubscriberRepositoryImpl(db),
    job: new JobRepositoryImpl(db),
  };

  const messaging = {
    jobQueuePublisher: new RabbitMQJobQueuePublisher(),
  };

  const useCases = {
    createPipeline: new CreatePipelineUseCase(
      repositories.pipeline,
      repositories.subscriber,
    ),
    updatePipeline: new UpdatePipelineUseCase(repositories.pipeline),
    getPipelineById: new GetPipelineByIdUseCase(repositories.pipeline),
    getPipelineByWebhookPath: new GetPipelineByWebhookPathUseCase(
      repositories.pipeline,
    ),
    addSubscriber: new AddSubscriberUseCase(
      repositories.pipeline,
      repositories.subscriber,
    ),
    removeSubscriber: new RemoveSubscriberUseCase(
      repositories.pipeline,
      repositories.subscriber,
    ),
    triggerWebhook: new TriggerWebhookUseCase(
      repositories.pipeline,
      repositories.job,
      messaging.jobQueuePublisher,
    ),
    getJobById: new GetJobByIdUseCase(repositories.job),
    GetAllJobs: new GetAllJobsUseCase(repositories.job),
    getJobsByStatus: new GetJobByStatusUseCase(repositories.job),
  };

  const controllers = {
    Pipeline: new PipelineController(
      useCases.createPipeline,
      useCases.updatePipeline,
      useCases.getPipelineById,
      useCases.getPipelineByWebhookPath,
      useCases.addSubscriber,
      useCases.removeSubscriber,
    ),
    Webhook: new WebhookController(useCases.triggerWebhook),
    Job: new JobController(
      useCases.getJobById,
      useCases.GetAllJobs,
      useCases.getJobsByStatus,
    ),
  };

  return {
    repositories,
    useCases,
    controllers,
  };
}

import amqp, { ChannelModel } from "amqplib";
import { closeDatabase, db } from "../infrastructure/database/connection.js";
import { rabbitmqConfig } from "../shared/config/rabbitmq.config.js";
import { JobRepositoryImpl } from "../infrastructure/repositories/job.repository.js";
import { PipelineRepositoryImpl } from "../infrastructure/repositories/pipeline.repository.js";
import { SubscriberRepositoryImpl } from "../infrastructure/repositories/subscriber.repository.js";
import { DeliveryAttemptRepositoryImpl } from "../infrastructure/repositories/delivery-attempt.repository.js";
import { ProcessJobUseCase } from "../application/job/use-cases/process-job.use-case.js";
import { DeliverJobUseCase } from "../application/job/use-cases/deliver-job.use-case.js";
import { handleMessage } from "./consumer/message.handler.js";

async function startWorker(): Promise<void> {
  const jobRepository = new JobRepositoryImpl(db);
  const pipelineRepository = new PipelineRepositoryImpl(db);
  const subscriberRepository = new SubscriberRepositoryImpl(db);
  const deliveryAttemptRepository = new DeliveryAttemptRepositoryImpl(db);

  const processJobUseCase = new ProcessJobUseCase(
    jobRepository,
    pipelineRepository,
  );
  const deliverJobUseCase = new DeliverJobUseCase(
    deliveryAttemptRepository,
    jobRepository,
    subscriberRepository,
  );

  const connection = await amqp.connect(rabbitmqConfig.url);
  const channel = await connection.createChannel();

  await channel.assertQueue(rabbitmqConfig.processQueue, { durable: true });

  await channel.assertQueue(rabbitmqConfig.processRetryQueue, {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": "",
      "x-dead-letter-routing-key": rabbitmqConfig.processQueue,
    },
  });

  await channel.assertQueue(rabbitmqConfig.processDlq, { durable: true });
  await channel.prefetch(rabbitmqConfig.prefetch);

  console.log(`Job worker listening on queue: ${rabbitmqConfig.processQueue}`);

  await channel.consume(rabbitmqConfig.processQueue, (message) => {
    void handleMessage(
      message,
      channel,
      jobRepository,
      processJobUseCase,
      deliverJobUseCase,
    );
  });

  registerShutdown(connection);
}

function registerShutdown(connection: ChannelModel): void {
  const shutdown = async () => {
    try {
      await connection.close();
      await closeDatabase();
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGINT", () => {
    void shutdown();
  });

  process.on("SIGTERM", () => {
    void shutdown();
  });
}

void startWorker().catch(async (error) => {
  console.error("Job worker failed to start", error);
  await closeDatabase();
  process.exit(1);
});

process.loadEnvFile();

export const rabbitmqConfig = {
  url: process.env.RABBITMQ_URL ?? "amqp://localhost:5672",
  processQueue: process.env.RABBITMQ_PROCESS_QUEUE ?? "jobs.process",
  processRetryQueue:
    process.env.RABBITMQ_PROCESS_RETRY_QUEUE ?? "jobs.process.retry",
  processDlq: process.env.RABBITMQ_PROCESS_DLQ ?? "jobs.process.dlq",
  prefetch: Number(process.env.RABBITMQ_PREFETCH ?? 5),
  maxProcessRetries: Number(process.env.RABBITMQ_MAX_PROCESS_RETRIES ?? 3),
  processRetryDelayMs: Number(
    process.env.RABBITMQ_PROCESS_RETRY_DELAY_MS ?? 5000,
  ),
};

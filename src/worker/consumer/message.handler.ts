import { Channel, ConsumeMessage } from "amqplib";
import { JobRepository } from "../../domain/repositories/job.repository.js";
import { ProcessJobUseCase } from "../../application/job/use-cases/process-job.use-case.js";
import { DeliverJobUseCase } from "../../application/job/use-cases/deliver-job.use-case.js";
import { rabbitmqConfig } from "../../shared/config/rabbitmq.config.js";
import { publishToRetryQueue } from "../messaging/retry.publisher.js";
import { publishToDlq } from "../messaging/dlq.publisher.js";
import { getRetryCount } from "../utils/retry.util.js";
import { tryParsePayload } from "../utils/payload.util.js";
import { isRetryableProcessFailure } from "../utils/failure.util.js";

export async function handleMessage(
  message: ConsumeMessage | null,
  channel: Channel,
  jobRepository: JobRepository,
  processJobUseCase: ProcessJobUseCase,
  deliverJobUseCase: DeliverJobUseCase,
): Promise<void> {
  if (!message) return;

  const retryCount = getRetryCount(message);
  const parsedPayload = tryParsePayload(message.content.toString());

  if (!parsedPayload.ok) {
    await publishToDlq(channel, message, retryCount, parsedPayload.reason);
    channel.ack(message);
    return;
  }

  const payload = parsedPayload.value;

  if (!payload.jobId) {
    await publishToDlq(channel, message, retryCount, "Missing jobId");
    channel.ack(message);
    return;
  }

  const jobId = payload.jobId;

  try {
    const processOutcome = await processJobUseCase.execute(jobId);

    if (processOutcome.status === "processed") {
      const deliveryOutcome = await deliverJobUseCase.execute(jobId);

      if (deliveryOutcome.failedCount === 0) {
        console.log("Job processed and fully delivered", {
          jobId,
          totalSubscribers: deliveryOutcome.totalSubscribers,
          successCount: deliveryOutcome.successCount,
          failedCount: deliveryOutcome.failedCount,
        });

        channel.ack(message);
        return;
      }

      const reason = `Delivery failed for ${deliveryOutcome.failedCount}/${deliveryOutcome.totalSubscribers} subscribers`;

      if (retryCount < rabbitmqConfig.maxProcessRetries) {
        await jobRepository.updateStatus(jobId, "pending");
        await publishToRetryQueue(channel, message, retryCount + 1, reason);

        console.warn("Delivery failed, retry scheduled", {
          jobId,
          totalSubscribers: deliveryOutcome.totalSubscribers,
          successCount: deliveryOutcome.successCount,
          failedCount: deliveryOutcome.failedCount,
          retryCount: retryCount + 1,
        });

        channel.ack(message);
        return;
      }

      await jobRepository.markFailed(jobId, reason);
      await publishToDlq(channel, message, retryCount, reason);

      console.error("Delivery failed, moved to DLQ", {
        jobId,
        totalSubscribers: deliveryOutcome.totalSubscribers,
        successCount: deliveryOutcome.successCount,
        failedCount: deliveryOutcome.failedCount,
        retryCount,
      });

      channel.ack(message);
      return;
    }

    if (processOutcome.status === "failed") {
      const isRetryable = isRetryableProcessFailure(processOutcome.reason);

      if (isRetryable && retryCount < rabbitmqConfig.maxProcessRetries) {
        await jobRepository.updateStatus(jobId, "pending");

        await publishToRetryQueue(
          channel,
          message,
          retryCount + 1,
          processOutcome.reason,
        );

        console.warn("Processing failed, retry scheduled", {
          jobId,
          retryCount: retryCount + 1,
          reason: processOutcome.reason,
        });

        channel.ack(message);
        return;
      }

      await publishToDlq(channel, message, retryCount, processOutcome.reason);

      console.error("Processing failed, moved to DLQ", {
        jobId,
        retryCount,
        reason: processOutcome.reason,
      });

      channel.ack(message);
      return;
    }

    console.log("Processing skipped", {
      jobId,
      status: processOutcome.status,
    });

    channel.ack(message);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown error";

    if (retryCount < rabbitmqConfig.maxProcessRetries) {
      await jobRepository.updateStatus(jobId, "pending");

      await publishToRetryQueue(channel, message, retryCount + 1, reason);

      console.warn("Worker error, retry scheduled", {
        jobId,
        retryCount: retryCount + 1,
        reason,
      });

      channel.ack(message);
      return;
    }

    await jobRepository.markFailed(jobId, reason);
    await publishToDlq(channel, message, retryCount, reason);

    console.error("Worker error, moved to DLQ", {
      jobId,
      retryCount,
      reason,
    });

    channel.ack(message);
  }
}

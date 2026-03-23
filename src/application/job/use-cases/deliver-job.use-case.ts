import { randomUUID } from "node:crypto";
import { DeliveryAttempt } from "../../../domain/entities/delivery-attempt.js";
import { DeliveryAttemptRepository } from "../../../domain/repositories/delivery-attempt.repository.js";
import { JobRepository } from "../../../domain/repositories/job.repository.js";
import { SubscriberRepository } from "../../../domain/repositories/subscriber.repository.js";
import { DeliverJobOutputDto } from "../dtos/deliver-job-output.dto.js";

export class DeliverJobUseCase {
  private readonly maxDeliveryAttempts: number;
  private readonly deliveryRetryBaseDelayMs: number;

  constructor(
    private readonly deliveryAttemptRepository: DeliveryAttemptRepository,
    private readonly jobRepository: JobRepository,
    private readonly subscriberRepository: SubscriberRepository,
  ) {
    this.maxDeliveryAttempts = Number(process.env.DELIVERY_MAX_ATTEMPTS ?? 3);
    this.deliveryRetryBaseDelayMs = Number(
      process.env.DELIVERY_RETRY_BASE_DELAY_MS ?? 1000,
    );
  }

  async execute(jobId: string): Promise<DeliverJobOutputDto> {
    const job = await this.jobRepository.getById(jobId);

    if (!job || job.status !== "completed" || !job.result) {
      return {
        jobId,
        totalSubscribers: 0,
        successCount: 0,
        failedCount: 0,
        attempts: [],
      };
    }

    const subscribers = await this.subscriberRepository.getByPipelineId(
      job.pipelineId,
    );

    const existingAttempts = await this.deliveryAttemptRepository.getByJobId(
      job.id,
    );

    const attempts: DeliverJobOutputDto["attempts"] = [];

    for (const subscriber of subscribers) {
      const previousAttemptsForSubscriber = existingAttempts.filter(
        (a) => a.subscriberId === subscriber.id,
      ).length;

      let finalStatus: "success" | "failed" = "failed";
      let finalResponseCode: number | undefined = undefined;

      for (let offset = 1; offset <= this.maxDeliveryAttempts; offset += 1) {
        const attemptNumber = previousAttemptsForSubscriber + offset;
        const now = new Date();

        console.info("Delivery attempt started", {
          jobId: job.id,
          subscriberId: subscriber.id,
          attemptNumber,
          maxAttempts: this.maxDeliveryAttempts,
        });

        try {
          const response = await this.postToSubscriber(
            subscriber.targetUrl,
            job.result,
          );

          finalStatus = response.ok ? "success" : "failed";
          finalResponseCode = response.status;

          const attempt: DeliveryAttempt = {
            id: randomUUID(),
            createdAt: now,
            updatedAt: now,
            isDeleted: false,
            jobId: job.id,
            subscriberId: subscriber.id,
            status: finalStatus,
            responseCode: response.status,
            attemptNumber,
            errorMessage: response.ok ? undefined : response.statusText,
          };

          await this.deliveryAttemptRepository.save(attempt);

          if (response.ok) {
            console.info("Delivery attempt succeeded", {
              jobId: job.id,
              subscriberId: subscriber.id,
              attemptNumber,
              responseCode: response.status,
            });
            break;
          }

          console.warn("Delivery attempt returned non-success response", {
            jobId: job.id,
            subscriberId: subscriber.id,
            attemptNumber,
            responseCode: response.status,
            statusText: response.statusText,
            willRetry: offset < this.maxDeliveryAttempts,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown delivery error";

          finalStatus = "failed";
          finalResponseCode = undefined;

          const attempt: DeliveryAttempt = {
            id: randomUUID(),
            createdAt: now,
            updatedAt: now,
            isDeleted: false,
            jobId: job.id,
            subscriberId: subscriber.id,
            status: "failed",
            attemptNumber,
            errorMessage,
          };

          await this.deliveryAttemptRepository.save(attempt);

          console.error("Delivery attempt failed with exception", {
            jobId: job.id,
            subscriberId: subscriber.id,
            attemptNumber,
            errorMessage,
            willRetry: offset < this.maxDeliveryAttempts,
          });
        }

        if (offset < this.maxDeliveryAttempts) {
          const delayMs =
            this.deliveryRetryBaseDelayMs * Math.pow(2, offset - 1);
          console.info("Delivery retry backoff", {
            jobId: job.id,
            subscriberId: subscriber.id,
            currentAttemptNumber: attemptNumber,
            nextAttemptNumber: attemptNumber + 1,
            delayMs,
          });

          await this.sleep(delayMs);
        }
      }

      if (finalStatus === "failed") {
        console.error("Delivery exhausted max attempts", {
          jobId: job.id,
          subscriberId: subscriber.id,
          maxAttempts: this.maxDeliveryAttempts,
        });
      }

      attempts.push({
        subscriberId: subscriber.id,
        status: finalStatus,
        responseCode: finalResponseCode,
      });
    }

    const successCount = attempts.filter((a) => a.status === "success").length;

    return {
      jobId,
      totalSubscribers: subscribers.length,
      successCount,
      failedCount: attempts.length - successCount,
      attempts,
    };
  }

  private async postToSubscriber(
    targetUrl: string,
    payload: Record<string, unknown>,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      return await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async sleep(ms: number): Promise<void> {
    if (!Number.isFinite(ms) || ms <= 0) return;
    await new Promise<void>((resolve) => setTimeout(resolve, ms));
  }
}

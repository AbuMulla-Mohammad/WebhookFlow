import { randomUUID } from "node:crypto";
import { DeliveryAttempt } from "../../../domain/entities/delivery-attempt.js";
import { DeliveryAttemptRepository } from "../../../domain/repositories/delivery-attempt.repository.js";
import { JobRepository } from "../../../domain/repositories/job.repository.js";
import { SubscriberRepository } from "../../../domain/repositories/subscriber.repository.js";
import { DeliverJobOutputDto } from "../dtos/deliver-job-output.dto.js";

export class DeliverJobUseCase {
  constructor(
    private readonly deliveryAttemptRepository: DeliveryAttemptRepository,
    private readonly jobRepository: JobRepository,
    private readonly subscriberRepository: SubscriberRepository,
  ) {}

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
      const previousAttempts = existingAttempts.filter(
        (a) => a.subscriberId === subscriber.id,
      );
      
      const hasSucceeded = previousAttempts.some((a) => a.status === "success");

      if (hasSucceeded) {
        attempts.push({
          subscriberId: subscriber.id,
          status: "success",
          responseCode: previousAttempts.find((a) => a.status === "success")?.responseCode,
        });
        continue;
      }

      const attemptNumber = previousAttempts.length + 1;
      const now = new Date();

      console.info("Delivery attempt started", {
        jobId: job.id,
        subscriberId: subscriber.id,
        attemptNumber,
      });

      try {
        const response = await this.postToSubscriber(
          subscriber.targetUrl,
          job.result,
        );

        const status = response.ok ? "success" : "failed";

        const attempt: DeliveryAttempt = {
          id: randomUUID(),
          createdAt: now,
          updatedAt: now,
          isDeleted: false,
          jobId: job.id,
          subscriberId: subscriber.id,
          status,
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
        } else {
          console.warn("Delivery attempt returned non-success response", {
            jobId: job.id,
            subscriberId: subscriber.id,
            attemptNumber,
            responseCode: response.status,
            statusText: response.statusText,
          });
        }

        attempts.push({
          subscriberId: subscriber.id,
          status,
          responseCode: response.status,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown delivery error";

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
        });

        attempts.push({
          subscriberId: subscriber.id,
          status: "failed",
        });
      }
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
}


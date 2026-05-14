import { Channel, ConsumeMessage } from "amqplib";
import { JobOrchestratorUseCase } from "../../application/job/use-cases/job-orchestrator.use-case.js";
import { publishToRetryQueue } from "../messaging/retry.publisher.js";
import { publishToDlq } from "../messaging/dlq.publisher.js";
import { getRetryCount } from "../utils/retry.util.js";
import { tryParsePayload } from "../utils/payload.util.js";

export async function handleMessage(
  message: ConsumeMessage | null,
  channel: Channel,
  jobOrchestrator: JobOrchestratorUseCase,
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
    const outcome = await jobOrchestrator.execute(jobId);

    switch (outcome.status) {
      case "success":
        console.log("Job processed and delivered successfully", { jobId });
        channel.ack(message);
        break;
      case "skipped":
        console.log("Job skipped", { jobId, reason: outcome.reason });
        channel.ack(message);
        break;
      case "retry":
        console.warn("Job failed, retry scheduled", {
          jobId,
          reason: outcome.reason,
          attempt: outcome.attemptNumber,
        });
        await publishToRetryQueue(
          channel,
          message,
          retryCount + 1,
          outcome.reason,
        );
        channel.ack(message);
        break;
      case "failed":
        console.error("Job failed permanently, moved to DLQ", {
          jobId,
          reason: outcome.reason,
        });
        await publishToDlq(channel, message, retryCount, outcome.reason);
        channel.ack(message);
        break;
    }
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : "Unexpected worker error";
    console.error("Unexpected worker error", { jobId, reason });
    await publishToDlq(channel, message, retryCount, reason);
    channel.ack(message);
  }
}

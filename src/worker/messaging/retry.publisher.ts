import { Channel, ConsumeMessage } from "amqplib";
import { rabbitmqConfig } from "../../shared/config/rabbitmq.config.js";

export async function publishToRetryQueue(
  channel: Channel,
  message: ConsumeMessage,
  nextRetryCount: number,
  reason: string,
): Promise<void> {
  const headers = {
    ...(message.properties.headers ?? {}),
    "x-retry-count": nextRetryCount,
    "x-last-error": reason,
  };

  channel.sendToQueue(rabbitmqConfig.processRetryQueue, message.content, {
    persistent: true,
    contentType: message.properties.contentType ?? "application/json",
    headers,
    expiration: String(rabbitmqConfig.processRetryDelayMs),
  });
}

import { Channel, ConsumeMessage } from "amqplib";
import { rabbitmqConfig } from "../../shared/config/rabbitmq.config.js";

export async function publishToDlq(
  channel: Channel,
  message: ConsumeMessage,
  retryCount: number,
  reason: string,
): Promise<void> {
  const original = message.content.toString();

  const dlqPayload = Buffer.from(
    JSON.stringify({
      reason,
      retryCount,
      failedAt: new Date().toISOString(),
      originalMessage: original,
      headers: message.properties.headers ?? {},
    }),
  );

  channel.sendToQueue(rabbitmqConfig.processDlq, dlqPayload, {
    persistent: true,
    contentType: "application/json",
  });
}

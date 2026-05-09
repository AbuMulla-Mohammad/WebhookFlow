import amqp, { Channel, ChannelModel } from "amqplib";
import { rabbitmqConfig } from "../../shared/config/rabbitmq.config.js";
import { JobQueuePort } from "../../application/ports/job-queue.port.js";

export class RabbitMQJobQueuePublisher implements JobQueuePort {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  private async ensureChannel(): Promise<Channel> {
    if (this.channel) {
      return this.channel;
    }

    this.connection = await amqp.connect(rabbitmqConfig.url);
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue(rabbitmqConfig.processQueue, {
      durable: true,
    });

    return this.channel;
  }

  async publishProcessJob(jobId: string): Promise<void> {
    const channel = await this.ensureChannel();

    const payload = Buffer.from(
      JSON.stringify({
        jobId,
        createdAt: new Date().toISOString(),
      }),
    );

    channel.sendToQueue(rabbitmqConfig.processQueue, payload, {
      persistent: true,
      contentType: "application/json",
    });
  }
}

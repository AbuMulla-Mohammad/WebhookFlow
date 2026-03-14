import { z } from "zod";

export const pipelineIdParamsSchema = z.object({
  pipelineId: z.string().uuid("pipelineId must be a valid UUID"),
});

export const webhookPathParamsSchema = z.object({
  webhookPath: z.string().trim().min(1, "webhookPath is required"),
});

export const pipelineSubscriberParamsSchema = z.object({
  pipelineId: z.string().uuid("pipelineId must be a valid UUID"),
  subscriberId: z.string().uuid("subscriberId must be a valid UUID"),
});

export type PipelineIdParams = z.infer<typeof pipelineIdParamsSchema>;
export type WebhookPathParams = z.infer<typeof webhookPathParamsSchema>;
export type PipelineSubscriberParams = z.infer<
  typeof pipelineSubscriberParamsSchema
>;

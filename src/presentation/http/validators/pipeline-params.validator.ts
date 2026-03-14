import { z } from "zod";

export const pipelineIdParamsSchema = z.object({
  pipelineId: z.string().uuid("pipelineId must be a valid UUID"),
});

export const webhookPathParamsSchema = z.object({
  webhookPath: z.string().trim().min(1, "webhookPath is required"),
});

export type PipelineIdParams = z.infer<typeof pipelineIdParamsSchema>;
export type WebhookPathParams = z.infer<typeof webhookPathParamsSchema>;

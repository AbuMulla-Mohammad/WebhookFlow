import { z } from "zod";
import { ACTION_TYPES } from "../../../domain/types/action-type.js";

export const createPipelineSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  description: z.string().trim().min(1, "description is required"),
  webhookPath: z.string().trim().min(1, "webhookPath is required"),
  actionType: z.enum(ACTION_TYPES),
  subscribers: z
    .array(z.string().url("subscriber must be a valid URL"))
    .min(1, "at least one subscriber is required")
    .transform((urls) => [...new Set(urls)]),
});

export const updatePipelineSchema = z
  .object({
    name: z.string().trim().min(1, "name cannot be empty").optional(),
    description: z
      .string()
      .trim()
      .min(1, "description cannot be empty")
      .optional(),
    webhookPath: z
      .string()
      .trim()
      .min(1, "webhookPath cannot be empty")
      .optional(),
    actionType: z.enum(ACTION_TYPES).optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: "At least one field must be provided for update",
  });

export const pipelineIdParamsSchema = z.object({
  pipelineId: z.string().uuid("pipelineId must be a valid UUID"),
});

export const webhookPathParamsSchema = z.object({
  webhookPath: z.string().trim().min(1, "webhookPath is required"),
});

export const removePipelineSubscriberParamsSchema = z.object({
  pipelineId: z.string().uuid("pipelineId must be a valid UUID"),
  subscriberId: z.string().uuid("subscriberId must be a valid UUID"),
});

export const addSubscriberSchema = z.object({
  targetUrl: z.string().trim().url("targetUrl must be a valid URL"),
});

export type WebhookPathParams = z.infer<typeof webhookPathParamsSchema>;
export type PipelineIdParams = z.infer<typeof pipelineIdParamsSchema>;
export type UpdatePipelineBody = z.infer<typeof updatePipelineSchema>;
export type CreatePipelineBody = z.infer<typeof createPipelineSchema>;
export type RemovePipelineSubscriberParams = z.infer<
  typeof removePipelineSubscriberParamsSchema
>;
export type AddSubscriberBody = z.infer<typeof addSubscriberSchema>;

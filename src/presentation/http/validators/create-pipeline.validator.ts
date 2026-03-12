import { ACTION_TYPES } from "../../../domain/types/action-type.js";
import { z } from "zod";
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

export type CreatePipelineBody = z.infer<typeof createPipelineSchema>;

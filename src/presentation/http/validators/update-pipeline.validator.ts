import { z } from "zod";
import { ACTION_TYPES } from "../../../domain/types/action-type.js";

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

export type UpdatePipelineBody = z.infer<typeof updatePipelineSchema>;

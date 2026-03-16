import { z } from "zod";

export const triggerWebhookBodySchema = z.object({}).passthrough();

export type TriggerWebhookBody = z.infer<typeof triggerWebhookBodySchema>;
